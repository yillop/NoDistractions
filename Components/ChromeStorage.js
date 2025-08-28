export function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => resolve(data[key]));
  });
}

export  function setInStorage(obj) {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, resolve);
  });
}
