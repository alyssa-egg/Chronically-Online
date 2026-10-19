// Read-only public CMS content. No editor token is needed or sent.
export async function handleEraPagesRequest(request, { fetcher = fetch } = {}) {
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  const endpoint = new URL('https://rjg4g3cl.api.sanity.io/v2025-02-19/data/query/production');
  endpoint.searchParams.set('perspective', 'published');
  endpoint.searchParams.set('query', '{"eras": *[_type == "eraPage" && !(_id in path("drafts.**"))] | order(_updatedAt desc){eraId, introduction, collage, discoveries[]{id,title,kind,dateLabel,text,source,image,x,y}}, "identity": *[_type == "siteIdentity" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0]{logo}, "nowPlaying": *[_type == "archiveNowPlaying" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0]{song,artist,link,coverImage,note}}');
  try {
    const response = await fetcher(endpoint, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error();
    const { result } = await response.json();
    if (!Array.isArray(result?.eras)) throw new Error();
    return json(result);
  } catch { return json({ error: 'The era images could not load. The written archive is still available.' }, 503); }
}
