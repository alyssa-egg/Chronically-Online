export const desks = [
  { id: "lore", name: "The Lore Files", description: "Internet history & fandom deep dives" },
  { id: "culture", name: "The Culture Desk", description: "Music, fashion, beauty & creator culture" },
  { id: "moodboard", name: "The Moodboard Department", description: "Objects, images & the aesthetics we remember" },
  { id: "rabbit-hole", name: "The Rabbit Hole", description: "Follow one obsession into the next" },
  { id: "group-chat", name: "The Group Chat", description: "Opinions, memories & questions for the mutuals" },
];
export const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export function safeLink(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function imageURL(image, width = 1000) {
  const ref = image?.asset?._ref;
  const match = typeof ref === "string" && ref.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(jpg|jpeg|png|webp|gif|avif)$/);
  if (!match) return null;
  return `https://cdn.sanity.io/images/rjg4g3cl/production/${match[1]}-${match[2]}.${match[3]}?w=${width}&fit=max&auto=format`;
}
export const storyURL = slug => `/stories/${encodeURIComponent(slug)}/`;
export function storySlug(pathname) {
  const match = pathname.match(/^\/stories\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  return match?.[1] || null;
}
export function renderImage(image, className = "", width = 1000) {
  const url = imageURL(image, width);
  if (!url) return "";
  return `<figure class="${escapeHTML(className)}"><img src="${escapeHTML(url)}" alt="${escapeHTML(image.alt)}" loading="lazy" decoding="async">${image.caption || image.credit ? `<figcaption>${escapeHTML(image.caption)}${image.credit ? ` <span>— ${escapeHTML(image.credit)}</span>` : ""}</figcaption>` : ""}</figure>`;
}
function spans(block) {
  const defs = new Map((block.markDefs || []).map(mark => [mark._key, mark]));
  return (block.children || []).map(span => {
    if (span._type !== "span") return "";
    let text = escapeHTML(span.text).replace(/\n/g, "<br>");
    for (const mark of span.marks || []) {
      if (mark === "strong") text = `<strong>${text}</strong>`;
      else if (mark === "em") text = `<em>${text}</em>`;
      else if (mark === "underline") text = `<u>${text}</u>`;
      else {
        const href = safeLink(defs.get(mark)?.href);
        if (href) text = `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    }
    return text;
  }).join("");
}
export function renderBody(blocks = []) {
  let html = "", listType = null;
  const closeList = () => { if (listType) html += `</${listType}>`; listType = null; };
  for (const block of Array.isArray(blocks) ? blocks : []) {
    if (block._type === "image") { closeList(); html += renderImage(block, "story-inline-image"); continue; }
    if (block._type !== "block") continue;
    const list = block.listItem === "bullet" ? "ul" : block.listItem === "number" ? "ol" : null;
    if (list) {
      if (list !== listType) { closeList(); html += `<${list}>`; listType = list; }
      html += `<li>${spans(block)}</li>`;
    } else {
      closeList();
      const tag = ["h2", "h3", "blockquote"].includes(block.style) ? block.style : "p";
      html += `<${tag}>${spans(block)}</${tag}>`;
    }
  }
  closeList(); return html;
}
