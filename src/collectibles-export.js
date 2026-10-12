let brandImage;
export async function drawBrand(ctx, x, y, width) {
  if (!brandImage) { brandImage = new Image(); brandImage.src = new URL('./assets/fandom-files-logo.png', import.meta.url).href; }
  await brandImage.decode();
  // Match the header's crop of the prepared, transparent wordmark canvas.
  ctx.drawImage(brandImage, 0, 160, brandImage.naturalWidth, 410, x, y, width, width * 410 / brandImage.naturalWidth);
}
// Original local artwork only. Shared achievement cards contain no puzzle answers.
export async function saveCanvas(canvas, name, title) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Your card could not be exported.');
  const file = new File([blob], name, { type: 'image/png' });
  if(navigator.canShare?.({files:[file]})) { await navigator.share({title,files:[file]}); return; }
  const url=URL.createObjectURL(blob),link=document.createElement('a'); link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function exportBadge(badge, date) {
  await document.fonts.ready;
  const image = new Image(); image.src = new URL(`./assets/collectibles/${badge.art}.svg`, import.meta.url).href; await image.decode();
  const canvas = document.createElement('canvas'); canvas.width=800;canvas.height=1050;
  const ctx=canvas.getContext('2d');
  const holo=ctx.createLinearGradient(0,0,800,1050);holo.addColorStop(0,'#e5fbfa');holo.addColorStop(.4,'#fce2f5');holo.addColorStop(.7,'#e4dcff');holo.addColorStop(1,'#cefbec');
  ctx.fillStyle=holo;ctx.fillRect(0,0,800,1050);ctx.fillStyle='#fff9fd';ctx.fillRect(28,28,744,994);
  ctx.strokeStyle='#b49bc7';ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.strokeRect(48,48,704,954);ctx.setLineDash([]);
  const text=(value,x,y,size,bold=false,color='#193f4a')=>{ctx.fillStyle=color;ctx.font=`${bold?'700':'400'} ${size}px Outfit, sans-serif`;ctx.fillText(value,x,y);};
  await drawBrand(ctx,70,66,520);
  text(`${badge.era.toUpperCase()} / ${badge.rarity.toUpperCase()}`,70,164,18);
  ctx.drawImage(image,200,205,400,400);
  ctx.font='700 48px Outfit, sans-serif';
  text(badge.title,70,690,Math.min(48,48*660/ctx.measureText(badge.title).width),true);
  ctx.font='400 24px Outfit, sans-serif';ctx.fillStyle='#586476';
  let line='',row=0;for(const word of badge.description.split(' ')) {const next=line?line+' '+word:word;if(ctx.measureText(next).width>660&&line){ctx.fillText(line,70,747+row*34);row++;line=word;}else line=next;}ctx.fillText(line,70,747+row*34);
  text(`FILED ${date || 'IN MY SIDEBLOG'} · YOU HAD TO BE THERE.`,70,900,18);
  text(new URL('./',location.href).host,70,954,20);
  await saveCanvas(canvas,`fandom-files-${badge.id}.png`,'My Fandom Files collectible');
}
