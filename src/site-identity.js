// Original Sanity asset URLs intentionally omit resize, crop and format transforms.
export function originalImageURL(image) {
  const ref = image?.asset?._ref;
  const match = typeof ref === 'string' && ref.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(jpg|jpeg|png|webp|gif|avif)$/);
  return match ? `https://cdn.sanity.io/images/rjg4g3cl/production/${match[1]}-${match[2]}.${match[3]}` : null;
}
let request;
export function publishedEraAssets() {
  if (!request) request = fetch('/api/era-pages').then(async response => {
    if (!response.ok) throw new Error('Era images unavailable');
    const data = await response.json();
    if (!Array.isArray(data.eras)) throw new Error('Invalid era data');
    return data;
  }).catch(error => { request = null; throw error; });
  return request;
}
export function logoPlacement(image) {
  const dimensions = image?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  const width = Number(dimensions?.[1]), height = Number(dimensions?.[2]);
  // Place the supplied 1919×644 canvas within a normal layout viewport.
  // The original image bytes and pixel artwork remain unchanged.
  return width === 1919 && height === 644 ? { x: 380, y: 160, width: 1050, height: 180, naturalWidth: width, naturalHeight: height } : { x: 0, y: 0, width: width || 1, height: height || 1, naturalWidth: width || 1, naturalHeight: height || 1 };
}
export async function mountOriginalLogo() {
  try {
    const { identity } = await publishedEraAssets(), url = originalImageURL(identity?.logo);
    if (!url) return;
    const box = logoPlacement(identity.logo);
    document.querySelectorAll('.brand-logo').forEach(svg => {
      svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
      svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
      const image = svg.querySelector('image');
      image.setAttribute('href', url); image.setAttribute('width', box.naturalWidth); image.setAttribute('height', box.naturalHeight);
    });
  } catch { /* Keep the existing wordmark available if the CMS is offline. */ }
}
