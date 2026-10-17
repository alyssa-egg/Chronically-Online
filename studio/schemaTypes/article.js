import { defineField, defineType } from "sanity";
import { archiveTopics, archiveEras } from "../../src/archive-topics.js";
const imageFields = [
  defineField({ name: "alt", title: "Describe the image (accessibility)", type: "string", validation: rule => rule.required() }),
  defineField({ name: "caption", type: "string" }),
  defineField({ name: "credit", title: "Image credit / permission", type: "string", description: "Use images you own or have permission to publish, and credit their source." }),
];
const text = (name, title = name) => defineField({ name, title, type: "string" });
export const article = defineType({
  name: "article", title: "Article", type: "document",
  groups: [{ name: "story", title: "Write", default: true }, { name: "explore", title: "Interactive extras" }, { name: "publish", title: "Publication" }],
  fields: [
    defineField({ name: "title", type: "string", group: "story", validation: rule => rule.required().max(140) }),
    defineField({ name: "subtitle", title: "Subtitle (optional)", type: "string", group: "story", validation: rule => rule.max(180) }),
    defineField({ name: "slug", type: "slug", group: "publish", options: { source: "title", maxLength: 96 }, validation: rule => rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || "Use lowercase words separated by hyphens." ) }),
    defineField({ name: "category", title: "Editorial desk", type: "string", group: "publish", options: { list: [{ title: "The Lore Files", value: "lore" }, { title: "The Culture Desk", value: "culture" }, { title: "The Moodboard Department", value: "moodboard" }, { title: "The Rabbit Hole", value: "rabbit-hole" }, { title: "The Group Chat", value: "group-chat" }] }, validation: rule => rule.required() }),
    defineField({ name: "archiveCategory", title: "Archive folder", type: "string", group: "publish", options: { list: archiveTopics.map(topic => ({ title: topic.title, value: topic.id })) }, description: "Pick the subject folder. Existing articles without this field keep a compatible default based on their editorial desk." }),
    defineField({ name: "era", title: "Internet era (optional)", type: "string", group: "publish", options: { list: archiveEras.map(era => ({ title: era.title, value: era.id })) } }),
    defineField({ name: "author", type: "string", group: "story", validation: rule => rule.required() }),
    defineField({ name: "publishedAt", title: "Publication date & time", type: "datetime", group: "publish", description: "Readers see a published article only once this time has arrived. Drafts never appear on the site.", validation: rule => rule.required() }),
    defineField({ name: "featured", title: "Feature on the cover", type: "boolean", group: "publish", initialValue: false }),
    defineField({ name: "onRadar", title: "Currently on our radar", type: "boolean", group: "publish", initialValue: false, description: "Show this published story in the small curated homepage radar. No automated trend feed." }),
    defineField({ name: "radarNote", title: "Radar note (optional)", type: "string", group: "publish", validation: rule => rule.max(180) }),
    defineField({ name: "tags", title: "Topics, eras, fandoms & artists", type: "array", of: [{ type: "string" }], options: { layout: "tags" }, group: "publish" }),
    defineField({ name: "excerpt", type: "text", rows: 3, group: "story", validation: rule => rule.required().max(320) }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true }, fields: imageFields, group: "story" }),
    defineField({ name: "body", title: "Article body", type: "array", group: "story", of: [
      { type: "block", styles: [{ title: "Paragraph", value: "normal" }, { title: "Heading", value: "h2" }, { title: "Subheading", value: "h3" }, { title: "Quote", value: "blockquote" }], marks: { decorators: [{ title: "Bold", value: "strong" }, { title: "Italic", value: "em" }, { title: "Underline", value: "underline" }], annotations: [{ name: "link", type: "object", title: "Link / source", fields: [{ name: "href", type: "url", validation: rule => rule.uri({ scheme: ["http", "https"] }) }] }] } },
      { type: "image", options: { hotspot: true }, fields: imageFields },
      { name: "annotation", title: "Editorial side note", type: "object", fields: [text("title", "Little note label"), { name: "text", title: "Your annotation", type: "text", validation: rule => rule.required() }], preview: { select: { title: "title", subtitle: "text" } } },
    ], validation: rule => rule.required().min(1) }),
    defineField({ name: "timeline", type: "array", group: "explore", description: "Clickable moments; keep the intended reading order.", of: [{ name: "moment", type: "object", fields: [text("date", "Date / era label"), text("title", "Moment"), { name: "description", type: "text" }, { name: "source", type: "url" }], preview: { select: { title: "title", subtitle: "date" } } }] }),
    defineField({ name: "moodboard", type: "array", group: "explore", description: "Readers tap each object to open its little story.", of: [{ name: "moodboardItem", type: "object", fields: [text("title", "Object / reference"), { name: "image", type: "image", fields: imageFields }, { name: "description", type: "text" }, { name: "link", title: "Song, playlist or reference link", type: "url" }], preview: { select: { title: "title", media: "image" } } }] }),
    defineField({ name: "poll", title: "A question for the group chat", type: "object", group: "explore", description: "A personal reader choice saved in their browser, without public vote totals.", fields: [text("question", "Question"), { name: "options", type: "array", of: [{ type: "string" }], validation: rule => rule.min(2).max(6).unique() }] }),
    defineField({ name: "relatedStories", title: "Go deeper: connected stories", type: "array", group: "explore", of: [{ type: "reference", to: [{ type: "article" }] }], validation: rule => rule.max(6).unique() }),
    defineField({ name: "sources", title: "Sources & context", type: "array", group: "story", of: [{ name: "source", type: "object", fields: [text("title", "Source title"), { name: "url", type: "url", validation: rule => rule.uri({ scheme: ["http", "https"] }) }, { name: "note", title: "Context / recollection / opinion", type: "text" }], preview: { select: { title: "title", subtitle: "url" } } }] }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "category", media: "coverImage" } },
});
