import { arrowIcon, starIcon } from "./design-symbols.js";
import { archiveTopics, archiveURL } from "./archive-topics.js";
export function magazineCover() {
  return `<section class="archive-cover" aria-labelledby="cover-title">
    <div class="cover-colophon"><span>FANDOM FILES / THE INTERNET CULTURE ISSUE</span><span>READ · EXPLORE · KEEP <span aria-hidden="true">&lt;3</span></span></div>
    <div class="cover-headline"><span class="cover-sticker">your old dashboard called.</span><h1 id="cover-title">YOU HAD<br>TO BE<br><em>THERE.</em></h1><p>Fandoms, internet lore, cultural obsessions, and the moments that permanently altered our brain chemistry.</p><a class="archive-enter" href="/archive/" data-topic="">ENTER THE ARCHIVE <span aria-hidden="true">&lt;3 ${arrowIcon}</span></a></div>
    <div class="cover-collage" aria-hidden="true">
      <div class="collage-window"><div class="collage-window-bar"><span>my_saved_internet.zip</span><span>− □ ×</span></div><div class="collage-window-body"><span class="collage-loading">RECOVERING YOUR INTERNET HISTORY…</span><div class="collage-loading-bar"><i></i></div><span>we kept the receipts. <b>&lt;3</b></span></div></div>
      <div class="collage-camera"><span>DIGITAL MEMORIES</span><div class="camera-face"><i class="camera-flash"></i><span class="camera-lens"><i></i></span><span class="camera-label">FF<br>2013</span></div><small>flash on. feelings everywhere.</small></div>
      <div class="collage-cd"><span>my very<br>specific mix</span><i></i><small>DO NOT SKIP TRACK 03</small></div>
      <div class="collage-photo-strip"><div><b>&lt;3</b><span>your first fan account</span></div><div><b>${starIcon}</b><span>late-night lore</span></div><small>saved to camera roll / forever</small></div>
      <div class="collage-player"><div><span>now playing</span><strong>the fandom years</strong><span>♡ ━━━━━━━ 03:13</span></div><i>◁ &nbsp; ❚❚ &nbsp; ▷</i></div>
      <div class="collage-ticket"><span>ADMIT ONE</span><strong>YOU HAD TO<br>BE THERE.</strong><small>FAN ACCOUNT / LIFETIME MEMBER</small></div>
      <span class="collage-note">file under:<br><u>permanently online</u> <span class="note-arrow">${arrowIcon}</span></span><span class="collage-star">${starIcon}</span><img class="collage-cursor" src="/src/assets/pixel-cursor.png" alt="" width="67" height="90">
    </div><span class="cover-margin-note">a personal archive of a very online life.</span>
  </section>`;
}
const tickerText = "MUSIC ✳︎ INTERNET LORE ✳︎ FANDOMS ✳︎ FASHION ✳︎ BEAUTY ✳︎ CREATOR CULTURE ✳︎ ";
export function cultureTicker() {
  return `<div class="culture-ticker"><p class="sr-only">Music, internet lore, fandoms, fashion, beauty, and creator culture.</p><div class="ticker-track" aria-hidden="true"><span>${tickerText}</span><span>${tickerText}</span></div><button class="ticker-toggle" type="button" aria-pressed="false" aria-label="Pause culture ticker">Ⅱ</button></div>`;
}
export function archiveFolders() {
  return `<section class="topic-section" aria-labelledby="topics-title"><div class="file-section-heading"><span class="file-label">DIRECTORY / 05 FOLDERS</span><h2 id="topics-title">ENTER <em>THE ARCHIVE.</em></h2><p>Pick an obsession. Follow the little connections.</p></div><div class="topic-folders">${archiveTopics.map(topic => `<a href="${archiveURL(topic.id)}" data-topic="${topic.id}" class="topic-folder topic-${topic.id}"><span class="folder-tab">FILE ${topic.number}</span><div class="folder-surface"><span class="folder-icon" aria-hidden="true">${topic.id === "style-files" ? starIcon : topic.icon}</span><span class="folder-label">${topic.label}</span><h3>${topic.title}</h3><p>${topic.description}</p><span class="folder-open">OPEN FOLDER <span aria-hidden="true">${arrowIcon}</span></span></div></a>`).join("")}</div></section>`;
}
