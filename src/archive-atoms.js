import { escapeHTML as e } from './article-content.js';
const pixels = {
  star: 'M10 2h4v6h6v4h-4v4h-4v6H8v-6H4v-4H0V8h6V2h4Z',
  heart: 'M2 4h6v2h4V4h6v2h2v8h-2v2h-2v2h-2v2h-4v-2H8v-2H6v-2H4V6H2Z',
  folder: 'M2 5h7v3h11v12H2V5Zm2 5v8h14v-8H4Z',
  music: 'M8 3h12v13h-2v2h-4v-4h4V7h-8v12H8v2H4v-4h4V3Z',
  bookmark: 'M5 2h14v20h-4v-2h-2v-2h-2v2H9v2H5V2Zm3 3v12h2v-2h4v2h2V5H8Z',
  arrow: 'M8 3h13v13h-3V9l-3 3-3 3-3 3-3 3-3-3 3-3 3-3 3-3 3-3H8V3Z',
  camera: 'M7 3h10v3h5v15H2V6h5V3Zm2 6v2H7v6h2v2h6v-2h2v-6h-2V9H9Zm2 3h2v4h-2v-4Z',
  stamp: 'M3 3h18v4h-2v3h2v4h-2v3h2v4H3v-4h2v-3H3v-4h2V7H3V3Zm5 5v8h8V8H8Z',
  mail: 'M2 5h20v15H2V5Zm3 3v2h3v3h3v2h2v-2h3v-3h3V8h-3v2h-3v2h-2v-2H8V8H5Z',
  search: 'M4 2h10v2h3v11h-2v2h3v3h3v3h-4v-3h-3v-3H4v-2H2V4h2V2Zm2 4v7h7V6H6Z',
  close: 'M3 3h4v4h4v4h2V7h4V3h4v4h-4v4h-4v2h4v4h4v4h-4v-4h-4v-4h-2v4H7v4H3v-4h4v-4h4v-2H7V7H3V3Z',
};
export function pixelIcon(name) {
  return `<svg class="pixel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${pixels[name] || pixels.star}"/></svg>`;
}
export const fileStamp = (label, extra = '') => `<span class="file-stamp ${e(extra)}">${pixelIcon('stamp')}${e(label)}</span>`;
export function archiveWindow(title, content, extra = '') {
  return `<div class="archive-window ${e(extra)}"><div class="archive-window-bar"><span>${e(title)}</span><span aria-hidden="true">− □ ×</span></div><div class="archive-window-content">${content}</div></div>`;
}
export function archiveFileCard({ id, number, title, kind, body }) {
  return `<details class="archive-file-card" id="discovery-${e(id)}"><summary><span class="discovery-number">${number}</span><span><small>${e(kind || 'from the archive')}</small><strong>${e(title)}</strong></span>${pixelIcon('folder')}</summary><div class="discovery-copy">${body}</div></details>`;
}
export function createFileWindow() {
  const dialog = document.createElement('dialog'); dialog.className = 'archive-file-window'; dialog.id = 'archive-file-window'; dialog.setAttribute('aria-labelledby', 'archive-file-window-title');
  document.body.append(dialog);
  function close() { dialog.close(); }
  function open({ title, subtitle, body, era = 'fandom-years' }) {
    dialog.dataset.era = era;
    dialog.innerHTML = `<div class="archive-window-bar"><span>${pixelIcon('folder')} recovered_file.txt</span><button class="file-window-close" type="button" aria-label="Close this file">${pixelIcon('close')}</button></div><div class="file-window-content"><span class="file-label">${e(subtitle)}</span><h2 id="archive-file-window-title">${e(title)}</h2>${body}</div>`;
    dialog.querySelector('.file-window-close').onclick = close;
    if (!dialog.open) dialog.showModal(); dialog.querySelector('.file-window-close').focus();
    return dialog;
  }
  return { open, close };
}
