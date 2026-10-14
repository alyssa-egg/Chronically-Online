import { drawBrand, saveCanvas } from "./collectibles-export.js";
import { featuredBadge } from "./badges.js";
import { pinnedReceipts, stickers } from "./sideblog.js";
export async function exportSideblog(state) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  const colors = { paper: ["#F8F4EC", "#0B0B0F"], fandom: ["#fff0f8", "#743455"], video: ["#f1ecff", "#52366e"], current: ["#dff9f5", "#115c5a"], midnight: ["#233644", "#eefaff"] };
  const [background, ink] = colors[state.theme] || colors.paper;
  ctx.fillStyle = background; ctx.fillRect(0, 0, 1200, 1500);
  ctx.strokeStyle = state.theme === "midnight" ? "#ffffff14" : "#72b8c122";
  for (let x = 0; x < 1200; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1500); ctx.stroke(); }
  for (let y = 0; y < 1500; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke(); }
  const write = (text, x, y, size, color = ink, bold = false) => { ctx.fillStyle = color; ctx.font = `${bold ? "700" : "400"} ${size}px 'DM Sans', sans-serif`; ctx.fillText(text, x, y); };
  const wrap = (text, x, y, width, maxLines = 3) => {
    const words = String(text).split(/\s+/); let line = "", count = 0;
    for (const word of words) {
      const next = line ? line + " " + word : word;
      if (ctx.measureText(next).width > width && line) { ctx.fillText(line, x, y + count * 29); line = word; if (++count >= maxLines) return; } else line = next;
    }
    if (count < maxLines) ctx.fillText(line, x, y + count * 29);
  };
  await drawBrand(ctx,65,32,730,ink);
  write("YOUR SIDEBLOG / YOU HAD TO BE THERE.", 65, 157, 18);
  const badge = featuredBadge(state);
  const name = state.name || "my little sideblog";
  ctx.font = "700 48px 'DM Sans', sans-serif";
  write(name, 65, 248, Math.min(48, 48 * (badge ? 790 : 1070) / ctx.measureText(name).width), ink, true);
  write(`${state.receipts.length} receipt${state.receipts.length === 1 ? "" : "s"} · ${state.stamps.length} stamp${state.stamps.length === 1 ? "" : "s"} · ${state.chapters.length} chapter${state.chapters.length === 1 ? "" : "s"}`, 65, 296, 23);
  const cursor = new Image(); cursor.src = new URL("./assets/pixel-cursor.png", import.meta.url).href;
  await cursor.decode();
  state.decorations.forEach((id, index) => {
    if (id === "cursor") ctx.drawImage(cursor, 65 + index * 90, 325, 30, 40);
    else write(stickers.find(sticker => sticker.id === id)?.label || "", 65 + index * 90, 365, 42, "#b52c7b");
  });
  if (badge) {
    const art = new Image(); art.src = new URL(`./assets/collectibles/${badge.art}.svg`, import.meta.url).href; await art.decode();
    ctx.drawImage(art, 890, 195, 90, 90);
    ctx.font = "700 18px 'DM Sans', sans-serif"; ctx.fillStyle = ink;
    wrap(badge.title, 890, 315, 240, 2);
  }
  const receipts = pinnedReceipts(state);
  receipts.forEach((receipt, i) => {
    const x = 65 + (i % 2) * 550, y = 422 + Math.floor(i / 2) * 265;
    ctx.fillStyle = "#fffaf3"; ctx.fillRect(x, y, 515, 238);
    ctx.strokeStyle = "#0B0B0F"; ctx.strokeRect(x, y, 515, 238);
    write("RECOVERED RECEIPT", x + 24, y + 34, 15, "#0B0B0F");
    ctx.font = "700 29px 'DM Sans', sans-serif"; ctx.fillStyle = "#0B0B0F"; wrap(receipt.title, x + 24, y + 81, 463, 2);
    ctx.font = "400 19px 'DM Sans', sans-serif"; ctx.fillStyle = "#605a62"; wrap(receipt.explanation || "A little piece of your internet history.", x + 24, y + 155, 463, 2);
  });
  if (!receipts.length) write("your future lore goes here. ♡", 65, 520, 32);
  state.stamps.slice(-4).forEach((stamp, index) => write(`✧ ${stamp.title.slice(0, 42)}`, 65 + (index % 2) * 550, 1240 + Math.floor(index / 2) * 30, 18));
  write("a little archive of a very online life.", 65, 1340, 34, ink, true);
  write(`${new URL("./", location.href).host} · made with The Fandom Files`, 65, 1410, 22);
  await saveCanvas(canvas, "my-fandom-files-sideblog.png", "My Fandom Files sideblog");
}
