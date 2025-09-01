const valid_protocols = ["https:", "chrome-extension:"];

let default_red;
chrome.storage.local.get("defRedirect", (data) => {
  default_red = data.defRedirect || chrome.runtime.getURL("block.html");
});

export function isValidUrl(url) {
  try {
    const u = new URL(url);
    return valid_protocols.includes(u.protocol) && u.hostname.length > 0;
  } catch (e) {
    return false;
  }
}

export function normalizeRedirect(redirect, defaultRedirect = default_red) {
  if (!redirect) return;
  if (redirect == "Default") {
    return defaultRedirect;
  }
  let url =
    redirect.startsWith("https://") ||
    redirect.startsWith("chrome-extension://")
      ? redirect
      : "https://" + redirect;

  return isValidUrl(url) ? url : "invalid";
}
