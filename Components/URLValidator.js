const valid_protocols = ["https:", "chrome-extension:"];


export function isValidUrl(url) {
  try {
    const u = new URL(url);
    return valid_protocols.includes(u.protocol) && u.hostname.length>0;
  } catch (e) {
    return false;
  }
}

export function normalizeRedirect(redirect, defaultRedirect) {
  if (!redirect) return;
  if (redirect == "Default") {
    return defaultRedirect;
  }
  let url = redirect.startsWith("https://") ? redirect : "https://" + redirect;
  return isValidUrl(url)?url:defaultRedirect
}
