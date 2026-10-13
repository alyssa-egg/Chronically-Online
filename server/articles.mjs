const PROJECT = "rjg4g3cl", DATASET = "production", API_VERSION = "2025-02-19";
const projection = `_id, title, "slug": slug.current, author, publishedAt, category, tags, excerpt, featured, coverImage`;
const visible = `_type == "article" && !(_id in path("drafts.**")) && defined(slug.current) && publishedAt <= $now`;
export async function handleArticleRequest(request, { fetcher = fetch, now = new Date() } = {}) {
  const url = new URL(request.url);
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  if (!["GET", "HEAD"].includes(request.method)) return json({ error: "Method not allowed." }, 405);
  const slug = url.searchParams.get("slug");
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json({ error: "Invalid story address." }, 400);
  const query = slug
    ? `*[${visible} && slug.current == $slug][0]{${projection}, body, timeline, moodboard, poll, sources, "related": relatedStories[]->[${visible}]{${projection}}}`
    : `*[${visible}] | order(featured desc, publishedAt desc)[0...100]{${projection}}`;
  const endpoint = new URL(`https://${PROJECT}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("perspective", "published");
  endpoint.searchParams.set("$now", JSON.stringify(new Date(now).toISOString()));
  if (slug) endpoint.searchParams.set("$slug", JSON.stringify(slug));
  try {
    const response = await fetcher(endpoint, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Article provider unavailable");
    const data = await response.json();
    if (slug && !data.result) return json({ error: "This story is not published." }, 404);
    if (!slug && !Array.isArray(data.result)) throw new Error("Invalid article response");
    return json(slug ? { article: data.result } : { articles: data.result });
  } catch { return json({ error: "The editorial archive is taking a little longer to load. Please try again." }, 503); }
}
