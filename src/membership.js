let visitSession = null;
export class MembershipError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
function session() {
  if (visitSession) return visitSession;
  try {
    return JSON.parse(localStorage.getItem("deep-cut-auth")) || visitSession;
  } catch {
    return visitSession;
  }
}
function keepSession(value) {
  if (
    !value?.access_token ||
    !value?.refresh_token ||
    !Number.isFinite(value.expires_in)
  )
    throw new MembershipError("Sign in again to open your eras.", 401);
  visitSession = { ...value, expiresAt: Date.now() + value.expires_in * 1000 };
  try {
    localStorage.setItem("deep-cut-auth", JSON.stringify(visitSession));
  } catch {
    /* sign-in lasts for this visit */
  }
}
export const signedIn = () => Boolean(session()?.access_token);
export const syncSessionFromStorage = () => {
  visitSession = null;
};
export function forgetSession() {
  visitSession = null;
  try {
    localStorage.removeItem("deep-cut-auth");
  } catch {
    /* unavailable */
  }
}
async function raw(action, { body, token, path = "premium" } = {}) {
  const result = await fetch(`/api/${path}?${action}`, {
    method: body ? "POST" : "GET",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  }).catch(() => {
    throw new MembershipError(
      "Era membership is temporarily unavailable. Please try again shortly.",
      503,
    );
  });
  const data = await result
    .json()
    .catch(() => ({ error: "Era membership has not been connected yet." }));
  if (!result.ok) {
    if (
      result.status === 401 ||
      (action === "action=auth-refresh" && result.status === 400)
    )
      forgetSession();
    throw new MembershipError(
      data.error || "Please try again shortly.",
      result.status,
    );
  }
  return data;
}
async function accessToken() {
  let current = session();
  if (!current?.access_token)
    throw new MembershipError("Sign in to open your eras.", 401);
  if (
    !Number.isFinite(current.expiresAt) ||
    current.expiresAt <= Date.now() + 30000
  ) {
    const refreshed = await raw("action=auth-refresh", {
      body: { refresh_token: current.refresh_token },
    });
    keepSession(refreshed);
    current = session();
  }
  return current.access_token;
}
export const membershipConfig = () => raw("action=config");
export const sendCode = (email) =>
  raw("action=auth-start", { body: { email } });
export async function verifyCode(email, code) {
  keepSession(await raw("action=auth-verify", { body: { email, code } }));
  return memberStatus();
}
export async function memberStatus() {
  return raw("action=status", { token: await accessToken() });
}
export async function startTrial() {
  return raw("action=start-trial", { body: {}, token: await accessToken() });
}
export async function startCheckout() {
  return raw("action=checkout", { body: {}, token: await accessToken() });
}
export async function verifyPurchase(id) {
  return raw("action=verify", {
    body: { session_id: id },
    token: await accessToken(),
  });
}
export async function eraQuestions(mode, date) {
  return raw(
    `mode=${encodeURIComponent(mode)}&date=${encodeURIComponent(date)}`,
    { path: "era", token: await accessToken() },
  );
}
export async function signOut() {
  try {
    if (signedIn())
      await raw("action=auth-logout", { body: {}, token: await accessToken() });
  } catch {
    /* still clear this browser */
  }
  forgetSession();
}
