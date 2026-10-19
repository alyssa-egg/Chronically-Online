import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { eraPage, siteIdentity, archiveNowPlaying } from "./schemaTypes/eraPage.js";
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
  schema: { types: [article, eraPage, siteIdentity, archiveNowPlaying] },
  document: {
    productionUrl: async (_, { document }) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://fandomfiles.netlify.app";
      return document.slug?.current
        ? `${origin}/stories/${encodeURIComponent(document.slug.current)}/`
        : `${origin}/`;
    },
  },
});
