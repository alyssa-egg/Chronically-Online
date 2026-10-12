import {
  dayKey,
  dailyQuestions,
  shuffleQuestions,
  EDITION_VERSION,
} from "../src/game.js";
import { loadIssues } from "./editorial.mjs";
import { findCollection } from "./archive.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";

export const TRIAL_MS = 24 * 60 * 60 * 1000;
export const PRICE_CENTS = 500;
export function validStripeSignature(raw, header, secret, now = Date.now()) {
  if (!header || !secret) return false;
  const entries = header.split(",").map((part) => part.split("="));
  const stamp = entries.find(([key]) => key === "t")?.[1];
  if (!/^\d+$/.test(stamp || "") || Math.abs(now / 1000 - Number(stamp)) > 300)
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${stamp}.${raw}`)
    .digest();
  return entries
    .filter(([key]) => key === "v1")
    .some(([, value]) => {
      if (!/^[a-f0-9]{64}$/i.test(value || "")) return false;
      return timingSafeEqual(expected, Buffer.from(value, "hex"));
    });
}
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function trialActive(startedAt, now = Date.now()) {
  const start = Date.parse(startedAt);
  return Number.isFinite(start) && start <= now && now < start + TRIAL_MS;
}
export function receiptIsValid(session, userId, priceId) {
  const items = session?.line_items?.data;
  const charge = session?.payment_intent?.latest_charge;
  return (
    session?.client_reference_id === userId &&
    session?.metadata?.user_id === userId &&
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    session.currency === "usd" &&
    session.amount_total === PRICE_CENTS &&
    Array.isArray(items) &&
    items.length === 1 &&
    items[0].quantity === 1 &&
    items[0].price?.id === priceId &&
    items[0].price?.unit_amount === PRICE_CENTS &&
    items[0].price?.currency === "usd" &&
    charge?.paid === true &&
    charge.refunded !== true &&
    charge.amount_refunded === 0
  );
}
export async function handlePremiumRequest(
  request,
  env = process.env,
  options = {},
) {
  const fetcher = options.fetch || fetch;
  const now = options.now ?? Date.now();
  const url = new URL(request.url);
  const response = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  try {
    if (
      !["/api/premium", "/api/era", "/api/archive", "/api/stripe-webhook"].includes(
        url.pathname,
      )
    )
      return response({ error: "Not found" }, 404);
    if (!["GET", "POST"].includes(request.method))
      return response({ error: "Method not allowed" }, 405);
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== url.origin
    )
      throw new ApiError(403, "Open membership from the The Fandom Files website.");
    const configured = Boolean(
      env.SUPABASE_URL &&
      env.SUPABASE_ANON_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const checkoutReady =
      configured &&
      Boolean(
        env.STRIPE_SECRET_KEY &&
        env.STRIPE_PUBLISHABLE_KEY &&
        env.STRIPE_PRICE_ID &&
        env.SITE_URL &&
        env.STRIPE_WEBHOOK_SECRET,
      );
    const action =
      url.pathname === "/api/era"
        ? "questions"
        : url.pathname === "/api/archive" ? "archive" : url.searchParams.get("action") || "status";
    if (action === "config")
      return response({
        configured,
        checkoutReady,
        publishableKey: env.STRIPE_PUBLISHABLE_KEY || null,
        priceCents: PRICE_CENTS,
        trialHours: 24,
      });
    const collection = action === "archive" ? findCollection(url.searchParams.get("id")) : null;
    if (action === "archive") {
      if (request.method !== "GET") throw new ApiError(405, "Use GET for archive files.");
      if (!collection) throw new ApiError(404, "That archive folder was not found.");
      if (collection.free) return response({ collection });
    }
    if (!configured)
      throw new ApiError(
        503,
        "Era membership is being connected. The daily quiz and Anonymous Ask are free to play.",
      );
    const base = new URL(env.SUPABASE_URL);
    if (base.protocol !== "https:" || base.username || base.password)
      throw new ApiError(503, "Membership is temporarily unavailable.");
    const provider = async (
      endpoint,
      { method = "GET", body, service = false, token, prefer } = {},
    ) => {
      const key = service
        ? env.SUPABASE_SERVICE_ROLE_KEY
        : env.SUPABASE_ANON_KEY;
      const result = await fetcher(new URL(endpoint, base), {
        method,
        headers: {
          apikey: key,
          Authorization: `Bearer ${token || key}`,
          "Content-Type": "application/json",
          ...(prefer ? { Prefer: prefer } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!result.ok) {
        if (
          [401, 403].includes(result.status) &&
          endpoint.startsWith("/auth/v1/user")
        )
          throw new ApiError(401, "Sign in again to open your eras.");
        if (result.status === 429)
          throw new ApiError(429, "Please wait a moment before trying again.");
        if (endpoint.includes("/verify") || endpoint.includes("/token"))
          throw new ApiError(
            400,
            "That sign-in code has expired or is incorrect. Request a new one.",
          );
        throw new ApiError(
          503,
          "Membership is temporarily unavailable. Please try again shortly.",
        );
      }
      return result.status === 204 ? null : result.json();
    };
    const stripe = async (endpoint, body) => {
      if (!checkoutReady)
        throw new ApiError(
          503,
          "The $5 era purchase is being connected. Your free games remain available.",
        );
      const result = await fetcher(`https://api.stripe.com/v1/${endpoint}`, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Stripe-Version":
            "2026-03-25.dahlia; custom_checkout_payment_form_preview=v1",
          ...(body
            ? { "Content-Type": "application/x-www-form-urlencoded" }
            : {}),
        },
        ...(body ? { body: new URLSearchParams(body).toString() } : {}),
      });
      if (!result.ok)
        throw new ApiError(
          503,
          "Checkout is temporarily unavailable. Please try again shortly.",
        );
      return result.json();
    };
    const receipt = (id) =>
      stripe(
        `checkout/sessions/${encodeURIComponent(id)}?expand%5B%5D=line_items&expand%5B%5D=payment_intent.latest_charge`,
      );
    if (url.pathname === "/api/stripe-webhook") {
      if (request.method !== "POST")
        throw new ApiError(405, "Use POST for payment events.");
      const raw = await request.text();
      if (Buffer.byteLength(raw) > 131072)
        throw new ApiError(413, "Request is too large.");
      if (
        !validStripeSignature(
          raw,
          request.headers.get("stripe-signature"),
          env.STRIPE_WEBHOOK_SECRET,
          now,
        )
      )
        throw new ApiError(400, "Invalid payment event signature.");
      let event;
      try {
        event = JSON.parse(raw);
      } catch {
        throw new ApiError(400, "Invalid payment event.");
      }
      if (event.type !== "checkout.session.completed")
        return response({ received: true });
      const id = event.data?.object?.id;
      if (
        typeof id !== "string" ||
        !/^cs_[a-zA-Z0-9_]+$/.test(id) ||
        id.length > 255
      )
        throw new ApiError(400, "Invalid purchase reference.");
      const session = await receipt(id);
      const userId = session.metadata?.user_id;
      if (
        !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
          userId || "",
        ) ||
        !receiptIsValid(session, userId, env.STRIPE_PRICE_ID)
      )
        throw new ApiError(400, "Payment could not be verified.");
      const existing = (
        await provider(
          `/rest/v1/deep_cut_memberships?user_id=eq.${encodeURIComponent(userId)}&select=*`,
          { service: true },
        )
      )[0];
      await provider("/rest/v1/deep_cut_memberships", {
        method: "POST",
        service: true,
        body: {
          user_id: userId,
          stripe_session_id: session.id,
          trial_started_at:
            existing?.trial_started_at || new Date(now).toISOString(),
        },
        prefer: "resolution=merge-duplicates,return=representation",
      });
      return response({ received: true });
    }
    const readBody = async () => {
      if (request.method !== "POST")
        throw new ApiError(405, "Use a POST request for this action.");
      const text = await request.text();
      if (text.length > 4096) throw new ApiError(413, "Request is too large.");
      try {
        const body = JSON.parse(text);
        if (!body || typeof body !== "object" || Array.isArray(body))
          throw new Error();
        return body;
      } catch {
        throw new ApiError(400, "Invalid request.");
      }
    };
    const emailBody = async () => {
      const body = await readBody();
      if (
        typeof body.email !== "string" ||
        body.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
      )
        throw new ApiError(400, "Enter a valid email address.");
      body.email = body.email.trim().toLowerCase();
      return body;
    };
    if (action === "auth-start") {
      const body = await emailBody();
      const redirect = env.SITE_URL
        ? `?redirect_to=${encodeURIComponent(env.SITE_URL)}`
        : "";
      await provider(`/auth/v1/otp${redirect}`, {
        method: "POST",
        body: { email: body.email, create_user: true },
      });
      return response({ sent: true });
    }
    if (action === "auth-verify") {
      const body = await emailBody();
      if (typeof body.code !== "string" || !/^\d{6,8}$/.test(body.code))
        throw new ApiError(400, "Enter the sign-in code from your email.");
      const session = await provider("/auth/v1/verify", {
        method: "POST",
        body: { email: body.email, token: body.code, type: "email" },
      });
      return response({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        email: session.user?.email,
      });
    }
    if (action === "auth-refresh") {
      const body = await readBody();
      if (
        typeof body.refresh_token !== "string" ||
        !body.refresh_token ||
        body.refresh_token.length > 1024
      )
        throw new ApiError(400, "Sign in again.");
      const session = await provider(
        "/auth/v1/token?grant_type=refresh_token",
        { method: "POST", body: { refresh_token: body.refresh_token } },
      );
      return response({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        email: session.user?.email,
      });
    }
    const token = request.headers
      .get("authorization")
      ?.match(/^Bearer (.+)$/)?.[1];
    if (!token)
      throw new ApiError(
        401,
        "Sign in to start your free era day or restore your purchase.",
      );
    const user = await provider("/auth/v1/user", { token });
    if (
      !/^[a-f0-9-]{36}$/i.test(user?.id || "") ||
      !user.email ||
      !user.email_confirmed_at
    )
      throw new ApiError(401, "Confirm your email to open your eras.");
    const endpoint = `/rest/v1/deep_cut_memberships?user_id=eq.${encodeURIComponent(user.id)}&select=*`;
    const readMember = async () =>
      (await provider(endpoint, { service: true }))[0] || null;
    let member = await readMember();
    if (action === "auth-logout") {
      await readBody();
      await provider("/auth/v1/logout?scope=local", {
        method: "POST",
        token,
        body: {},
      });
      return response({ signedOut: true });
    }
    const paid = async () =>
      member?.stripe_session_id && !(member.stripe_session_id.startsWith("cs_test_") && env.STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_"))
        ? receiptIsValid(
            await receipt(member.stripe_session_id),
            user.id,
            env.STRIPE_PRICE_ID,
          )
        : false;
    const state = async () => {
      const purchased = await paid();
      const trial = trialActive(member?.trial_started_at, now);
      return {
        purchased,
        trialActive: trial,
        canPlay: purchased || trial,
        trialStarted: Boolean(member?.trial_started_at),
        trialEndsAt: member?.trial_started_at
          ? new Date(
              Date.parse(member.trial_started_at) + TRIAL_MS,
            ).toISOString()
          : null,
        checkoutReady,
        priceCents: PRICE_CENTS,
        email: user.email,
      };
    };
    if (action === "archive") {
      if (!(await state()).canPlay) throw new ApiError(402, "Your free era day is finished. All three eras are $5 once.");
      return response({ collection });
    }
    if (action === "status") return response(await state());
    if (action === "start-trial") {
      await readBody();
      if (!member) {
        await provider("/rest/v1/deep_cut_memberships", {
          method: "POST",
          service: true,
          body: {
            user_id: user.id,
            trial_started_at: new Date(now).toISOString(),
          },
          prefer: "resolution=ignore-duplicates,return=representation",
        });
        member = await readMember();
      }
      if (!member)
        throw new ApiError(
          503,
          "Your era day could not be started. Please try again.",
        );
      return response(await state());
    }
    if (action === "checkout") {
      await readBody();
      if (await paid()) return response({ alreadyPurchased: true });
      const price = await stripe(
        `prices/${encodeURIComponent(env.STRIPE_PRICE_ID || "")}`,
      );
      if (
        !price.active ||
        price.unit_amount !== PRICE_CENTS ||
        price.currency !== "usd" ||
        price.recurring
      )
        throw new ApiError(
          503,
          "The one-time $5 price is being set up. Please try again later.",
        );
      const site = new URL(env.SITE_URL);
      if (
        site.protocol !== "https:" ||
        site.username ||
        site.password ||
        site.search ||
        site.hash
      )
        throw new ApiError(503, "Checkout is being connected.");
      const session = await stripe("checkout/sessions", {
        ui_mode: "form",
        mode: "payment",
        billing_address_collection: "auto",
        "phone_number_collection[enabled]": "false",
        "automatic_tax[enabled]": "false",
        submit_type: "auto",
        integration_identifier: "custom_embedded_web_0001",
        "line_items[0][price]": env.STRIPE_PRICE_ID,
        "line_items[0][quantity]": "1",
        client_reference_id: user.id,
        "metadata[user_id]": user.id,
      });
      if (!session.client_secret || !session.id)
        throw new ApiError(503, "Checkout could not be opened.");
      return response({
        client_secret: session.client_secret,
        session_id: session.id,
      });
    }
    if (action === "verify") {
      const body = await readBody();
      if (
        typeof body.session_id !== "string" ||
        !/^cs_[a-zA-Z0-9_]+$/.test(body.session_id) ||
        body.session_id.length > 255
      )
        throw new ApiError(400, "Invalid purchase reference.");
      const session = await receipt(body.session_id);
      if (!receiptIsValid(session, user.id, env.STRIPE_PRICE_ID))
        throw new ApiError(
          403,
          "This completed purchase could not be verified for your account.",
        );
      const saved = {
        user_id: user.id,
        stripe_session_id: session.id,
        trial_started_at:
          member?.trial_started_at || new Date(now).toISOString(),
      };
      await provider("/rest/v1/deep_cut_memberships", {
        method: "POST",
        service: true,
        body: saved,
        prefer: "resolution=merge-duplicates,return=representation",
      });
      member = await readMember();
      return response(await state());
    }
    if (action === "questions") {
      if (request.method !== "GET")
        throw new ApiError(405, "Use GET for questions.");
      const mode = url.searchParams.get("mode"),
        date = url.searchParams.get("date");
      if (!["tumblr", "youtube", "modern"].includes(mode))
        throw new ApiError(400, "Choose an internet era.");
      if (date !== dayKey(new Date(now)))
        throw new ApiError(400, "Open today's era issue.");
      const access = await state();
      if (!access.canPlay)
        throw new ApiError(
          402,
          "Your free era day is finished. All three eras are $5 once.",
        );
      const issues = options.issues || (await loadIssues());
      const issue = issues[date]?.status === "approved" ? issues[date] : null;
      const questions = issue
        ? shuffleQuestions(issue.games[mode], date)
        : dailyQuestions(date, mode);
      return response({
        date,
        mode,
        version: issue ? `${issue.id}-r${issue.revision}` : EDITION_VERSION,
        theme: issue?.theme || null,
        questions,
      });
    }
    throw new ApiError(404, "Not found");
  } catch (error) {
    return response(
      {
        error:
          error instanceof ApiError
            ? error.message
            : "Membership is temporarily unavailable. Please try again.",
      },
      error instanceof ApiError ? error.status : 503,
    );
  }
}
