import { defineField, defineType } from 'sanity';
import { discoveryEras } from '../../src/era-discoveries.js';
const originalImage = name => defineField({ name, type: 'image', options: { hotspot: false }, description: 'Upload the original PNG/JPG. The reader uses the original asset URL without AI processing, filters, or generated replacements.', fields: [{ name: 'alt', title: 'Accessible image description', type: 'string', validation: r => r.required() }, { name: 'credit', title: 'Image credit', type: 'string' }] });
export const eraPage = defineType({ name: 'eraPage', title: 'Era collage & discoveries', type: 'document', fields: [
  defineField({ name: 'eraId', title: 'Era', type: 'string', options: { list: discoveryEras.map(era => ({ title: `${era.title} / ${era.years}`, value: era.id })) }, validation: r => r.required() }),
  originalImage('collage'),
  defineField({ name: 'introduction', type: 'text', rows: 3, description: 'Optional. Leave blank to use the existing introduction.' }),
  defineField({ name: 'discoveries', title: 'Clickable lore pins (optional)', type: 'array', description: 'Leave empty to keep the four starter discoveries. Positions are percentages across and down the full collage.', validation: r => r.max(12), of: [{ type: 'object', name: 'discovery', fields: [
    { name: 'id', title: 'Stable ID, e.g. coffee-vlogs', type: 'string', validation: r => r.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) },
    { name: 'title', type: 'string', validation: r => r.required() }, { name: 'kind', title: 'Small category label', type: 'string' },
    { name: 'dateLabel', title: 'Date or era label (optional)', type: 'string' },
    originalImage('image'),
    { name: 'text', title: 'Short piece of lore', type: 'text', validation: r => r.required().max(1000) },
    { name: 'source', type: 'url', validation: r => r.uri({ scheme: ['https', 'http'] }) },
    { name: 'x', title: 'Pin position across (%)', type: 'number', validation: r => r.required().min(3).max(97) },
    { name: 'y', title: 'Pin position down (%)', type: 'number', validation: r => r.required().min(3).max(97) },
  ], preview: { select: { title: 'title', subtitle: 'kind' } } }] }),
], preview: { select: { title: 'eraId', media: 'collage' } } });
export const siteIdentity = defineType({ name: 'siteIdentity', title: 'Original site logo', type: 'document', fields: [originalImage('logo')], preview: { prepare: () => ({ title: 'Fandom Files · original logo' }) } });

export const archiveNowPlaying = defineType({ name: 'archiveNowPlaying', title: 'Now Playing · editor’s music pick', type: 'document', fields: [
  defineField({ name: 'song', title: 'Song title', type: 'string', validation: r => r.required().max(140) }),
  defineField({ name: 'artist', title: 'Artist', type: 'string', validation: r => r.required().max(140) }),
  defineField({ name: 'link', title: 'Link to the original music service', type: 'url', description: 'A Spotify, Apple Music, YouTube or artist link. This opens the service; no audio is uploaded or autoplayed.', validation: r => r.required().uri({ scheme: ['https', 'http'] }) }),
  originalImage('coverImage'),
  defineField({ name: 'note', title: 'A song, a memory, a whole era', type: 'text', rows: 2, validation: r => r.max(240) }),
], preview: { select: { title: 'song', subtitle: 'artist', media: 'coverImage' } } });
