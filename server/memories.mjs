import { randomUUID, createHash } from 'node:crypto';
import { discoveryEra } from '../src/era-discoveries.js';

const endpoint = 'https://rjg4g3cl.api.sanity.io/v2025-02-19/data/';
const recent = new Map();
// Best-effort per-instance throttling; no client address is stored in Sanity.
export function allowMemorySubmission(clientId, now = Date.now()) {
  for (const [key, until] of recent) if (until <= now) recent.delete(key);
  const key = createHash('sha256').update(clientId || 'unknown-client').digest('hex');
  if (recent.has(key) || recent.size >= 5000) return false;
  recent.set(key, now + 60000);
  return true;
}

export async function handleMemoriesRequest(request, env = process.env, { fetcher = fetch, clientId = '', allowSubmission = allowMemorySubmission } = {}) {
  const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
  const url = new URL(request.url);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  try {
    if (request.method === 'GET') {
      const era = url.searchParams.get('era') || '', offset = Number(url.searchParams.get('offset') || 0);
      if ((era && !discoveryEra(era)) || !Number.isInteger(offset) || offset < 0 || offset > 1000) return json({ error: 'Choose a valid era and page.' }, 400);
      const query = new URL(endpoint + 'query/production');
      query.searchParams.set('perspective', 'published');
      query.searchParams.set('query', `*[_type == "eraMemory" && !(_id in path("drafts.**")) && (!defined($era) || eraId == $era)] | order(submittedAt desc, _id asc) [$start...$end]{"id":_id,eraId,displayName,memory,submittedAt}`);
      query.searchParams.set('$era', JSON.stringify(era || null));
      query.searchParams.set('$start', String(offset)); query.searchParams.set('$end', String(offset + 21));
      const response = await fetcher(query, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error();
      const { result } = await response.json();
      if (!Array.isArray(result)) throw new Error();
      // Only these approved public fields are ever returned to readers.
      const memories = result.slice(0, 20).map(item => ({ id: item.id, eraId: item.eraId, displayName: item.displayName, memory: item.memory, submittedAt: item.submittedAt }));
      return json({ memories, hasMore: result.length > 20 && offset < 1000, submissionsEnabled: Boolean(env.SANITY_EDITOR_TOKEN) });
    }
    if (request.headers.get('origin') !== url.origin || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Send your memory from the Fandom Files website.' }, 403);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ error: 'Send a JSON memory.' }, 415);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 4096) return json({ error: 'That memory is too long.' }, 413);
    let body; try { body = JSON.parse(raw); } catch { return json({ error: 'Your memory could not be read.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Your memory could not be read.' }, 400);
    if (body.website) return json({ error: 'Your memory could not be sent.' }, 400);
    const memory = typeof body.memory === 'string' ? body.memory.trim() : '', displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    if (!discoveryEra(body.eraId) || memory.length < 10 || memory.length > 600 || displayName.length > 40 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(memory + displayName)) return json({ error: 'Choose an era, write 10–600 characters, and keep your nickname under 41 characters.' }, 400);
    if (!env.SANITY_EDITOR_TOKEN) return json({ error: 'The memory inbox is not open yet. Please come back soon.' }, 503);
    if (!allowSubmission(clientId)) return json({ error: 'Give the inbox a minute before sending another memory.' }, 429, { 'Retry-After': '60' });
    const doc = { _id: `drafts.era-memory-${randomUUID()}`, _type: 'eraMemory', eraId: body.eraId, memory, displayName: displayName || 'anonymous mutual', submittedAt: new Date().toISOString() };
    const response = await fetcher(endpoint + 'mutate/production', { method: 'POST', headers: { Authorization: `Bearer ${env.SANITY_EDITOR_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ mutations: [{ create: doc }] }), signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error();
    return json({ message: 'Memory sent! It will appear after we review and publish it.' }, 201);
  } catch { return json({ error: 'The memory inbox could not connect. Please try again shortly.' }, 503); }
}
