const PROJECT = "rjg4g3cl", DATASET = "production", API_VERSION = "2025-02-19";
import { archiveTopics, archiveEras } from "../src/archive-topics.js";
const topic = `coalesce(archiveCategory, select(category == "culture" => "music-lore", category == "moodboard" => "style-files", category == "rabbit-hole" => "internet-mysteries", category == "group-chat" => "creator-culture", "fandom-years"))`;
const projection = `_id, title, "slug": slug.current, author, publishedAt, category, "archiveCategory": ${topic}, era, subtitle, tags, excerpt, featured, onRadar, radarNote, coverImage`;
const visible = `_type == "article" && !(_id in path("drafts.**")) && defined(slug.current) && publishedAt <= $now`;
export async function handleArticleRequest(request, { fetcher = fetch, now = new Date() } = {}) {
  const url = new URL(request.url);
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  if (!["GET", "HEAD"].includes(request.method)) return json({ error: "Method not allowed." }, 405);
  const slug = url.searchParams.get("slug");
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json({ error: "Invalid story address." }, 400);
  const category = url.searchParams.get("category") || "", era = url.searchParams.get("era") || "", desk = url.searchParams.get("desk") || "";
  const page = Number(url.searchParams.get("page") || 0), term = (url.searchParams.get("q") || "").trim();
  if ((category && !archiveTopics.some(value => value.id === category)) || (era && !archiveEras.some(value => value.id === era)) || (desk && !["lore", "culture", "moodboard", "rabbit-hole", "group-chat"].includes(desk)) || !Number.isSafeInteger(page) || page < 0 || page > 100000 || term.length > 100)
    return json({ error: "Invalid archive filter." }, 400);
  const filter = `${visible}${url.searchParams.get("radar") === "1" ? " && onRadar == true" : ""}${category ? ` && ${topic} == $category` : ""}${era ? " && era in $eras" : ""}${desk ? " && category == $desk" : ""}${term ? " && (title match $search || excerpt match $search || subtitle match $search || tags[] match $search || pt::text(body) match $search)" : ""}`;
  const order = url.searchParams.get("sort") === "recent" ? "publishedAt desc, _id asc" : "featured desc, publishedAt desc, _id asc";
  const query = slug
    ? `*[${visible} && slug.current == $slug][0]{${projection}, body, timeline, moodboard, poll, sources, "related": relatedStories[]->[${visible}]{${projection}}}`
    : `{"articles": *[${filter}] | order(${order})[${page * 24}...${(page + 1) * 24}]{${projection}}, "total": count(*[${filter}])}`;
  const endpoint = new URL(`https://${PROJECT}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("perspective", "published");
  endpoint.searchParams.set("$now", JSON.stringify(new Date(now).toISOString()));
  if (slug) endpoint.searchParams.set("$slug", JSON.stringify(slug));
  if (category) endpoint.searchParams.set("$category", JSON.stringify(category));
  if (era) { endpoint.searchParams.set("$era", JSON.stringify(era)); endpoint.searchParams.set("$eras", JSON.stringify(era === "2017-2020" ? [era, "2017-2019"] : era === "2021-now" ? [era, "2020-now"] : [era])); }
  if (desk) endpoint.searchParams.set("$desk", JSON.stringify(desk));
  if (term) endpoint.searchParams.set("$search", JSON.stringify(term.replace(/[\[\]*?!]/g, "").split(/\s+/).filter(Boolean).map(word => `*${word}*`)));
  try {
    const response = await fetcher(endpoint, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Article provider unavailable");
    const data = await response.json();
    if (slug && !data.result) return json({ error: "This story is not published." }, 404);
    if (!slug && (!Array.isArray(data.result?.articles) || !Number.isInteger(data.result.total))) throw new Error("Invalid article response");
    return json(slug ? { article: data.result } : { ...data.result, page, nextPage: (page + 1) * 24 < data.result.total ? page + 1 : null });
  } catch { return json({ error: "The editorial archive is taking a little longer to load. Please try again." }, 503); }
}
