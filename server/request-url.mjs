// Node hosts terminate TLS at their reverse proxy. Trust the configured public
// origin only when its host matches; never trust arbitrary forwarded headers.
export function publicRequestURL(path, host = "localhost", siteURL = "") {
  let origin = `http://${host}`;
  try {
    const site = new URL(siteURL);
    if (site.protocol === "https:" && site.host.toLowerCase() === host.toLowerCase()) origin = site.origin;
  } catch { /* Local development does not require SITE_URL. */ }
  const url = new URL(path, origin);
  if (url.origin !== new URL(origin).origin) throw new Error("The request target cannot change the public origin.");
  return url;
}
