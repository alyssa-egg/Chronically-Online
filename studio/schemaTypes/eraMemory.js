import { defineField, defineType } from 'sanity';
import { discoveryEras } from '../../src/era-discoveries.js';

export const eraMemory = defineType({
  name: 'eraMemory', title: 'Era memories · review & publish', type: 'document',
  description: 'Reader submissions arrive as private drafts. Review the text and nickname, then Publish to show it publicly. Unpublish removes it from the wall; delete unwanted drafts.',
  fields: [
    defineField({ name: 'eraId', title: 'Era', type: 'string', options: { list: discoveryEras.map(era => ({ title: `${era.title} / ${era.years}`, value: era.id })) }, validation: r => r.required() }),
    defineField({ name: 'displayName', title: 'Public nickname', type: 'string', description: 'Shown on the wall. Remove private information before publishing.', validation: r => r.required().max(40) }),
    defineField({ name: 'memory', title: 'Memory', type: 'text', rows: 6, validation: r => r.required().min(10).max(600) }),
    defineField({ name: 'submittedAt', title: 'Submitted', type: 'datetime', readOnly: true, initialValue: () => new Date().toISOString(), validation: r => r.required() }),
  ],
  orderings: [{ title: 'Newest submissions', name: 'newest', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: { select: { title: 'memory', name: 'displayName', era: 'eraId' }, prepare: ({ title, name, era }) => ({ title, subtitle: `${name || 'anonymous mutual'} · ${discoveryEras.find(item => item.id === era)?.title || era}` }) },
});
