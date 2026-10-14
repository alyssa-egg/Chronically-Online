import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { article } from "./schemaTypes/article.js";
import { ArticlePreview } from "./ArticlePreview.js";

export default defineConfig({
  name: "fandom-files",
  title: "The Fandom Files · Editorial",
  projectId: "rjg4g3cl",
  dataset: "production",
  // The CLI mounts the Studio at /admin; this is the workspace within it.
  basePath: "/",
  plugins: [structureTool({ defaultDocumentNode: (S, { schemaType }) => schemaType === "article" ? S.document().views([S.view.form().title("Write"), S.view.component(ArticlePreview).title("Preview")]) : S.document() })],
  schema: { types: [article] },
  document: {
    productionUrl: async (_, { document }) => document.slug?.current
      ? `https://fandomfiles.netlify.app/stories/${encodeURIComponent(document.slug.current)}/`
      : "https://fandomfiles.netlify.app/",
  },
});
