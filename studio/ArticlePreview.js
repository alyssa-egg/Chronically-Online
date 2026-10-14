import { createElement, useMemo } from "react";
import { articleLayout } from "../src/article-layout.js";

export function ArticlePreview({ document }) {
  const article = document.displayed || {};
  const page = useMemo(() => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${window.location.origin}/"><link rel="stylesheet" href="/src/style.css"><link rel="stylesheet" href="/src/redesign.css"><title>Fandom Files · Editor preview</title></head><body class="editor-preview"><main>${articleLayout(article, { preview: true })}</main></body></html>`, [article]);
  return createElement("iframe", {
    title: "Preview your article with the Fandom Files reader design",
    srcDoc: page,
    sandbox: "allow-same-origin allow-popups allow-popups-to-escape-sandbox",
    style: { width: "100%", height: "100%", minHeight: "650px", border: 0, display: "block" },
  });
}
