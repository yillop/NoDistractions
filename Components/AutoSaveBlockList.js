import { getFromStorage, setInStorage } from "/Components/ChromeStorage.js";

export function AutoSaveBlockList(storageKey, block_list = {}, notif) {
  const map = new Map(Object.entries(block_list));
  setInStorage({ [storageKey]: Object.fromEntries(map) });
  notif.set_text("block_loaded")
  return new Proxy(map, {
    get(target, prop) {
      if (prop == "copy") {
        return function () {
          return target;
        };
      }
      if (prop == "set") {
        return function (key, value) {
          target.set(key, value);
          setInStorage({ [storageKey]: Object.fromEntries(target) });
          notif.set_text("block_settings_saved", key)

          return true;
        };
      }
      if (prop == "delete") {
        return function (key) {
          target.delete(key);
          setInStorage({ [storageKey]: Object.fromEntries(target) });
          notif.set_text("block_removed", key)

          return true;
        };
      }
      if (prop == "clear") {
        return function () {
          target.clear();
          setInStorage({ [storageKey]: {} });
          notif.set_text("block_cleared")
          return true;
        };
      }
      return target[prop].bind ? target[prop].bind(target) : target[prop];
    },
  });
}
