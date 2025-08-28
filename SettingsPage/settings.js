import { isValidUrl, normalizeRedirect } from "../Components/URLValidator.js";
import { getFromStorage, setInStorage } from "../Components/ChromeStorage.js";

const currRedirect = document.getElementById("currRedirect");
const inputNewRedirect = document.getElementById("inputNewRedirect");
const chngDefaultRedirect = document.getElementById("chngDefaultRedirect");
const retToOrigRedirect = document.getElementById("retToOrigRedirect");

const add_whitelist_btn = document.getElementById("add_whitelist_btn");
const whitelist_adder = document.getElementById("whitelist_adder");
const whitelisted_words = document.getElementById("whitelisted_words");
const clearBtn = document.getElementById("clearBtn");
const site_block_search_default = document.getElementById(
  "site_block_search_default"
);
const site_block_result_default = document.getElementById(
  "site_block_result_default"
);
const general_settings_page = document.getElementById("general_settings_page");

const allCheckboxes = document.querySelectorAll(
  "#general_settings_page input[type='checkbox']"
);
const notif = document.querySelector("settings-notif");

let block_list = new Map();
let whitelist = new Set();
let checkbox_settings = {};
let default_quality_settings = {};

chrome.storage.local.get("blocked_sites", async (data) => {
  const blockedSites = data.blocked_sites || {};

  block_list = new Map(Object.entries(blockedSites));
});
chrome.storage.local.get("whitelisted_words", async (data) => {
  whitelist = new Set(data.whitelisted_words) || new Set();
  for (const word of whitelist) {
    add_word_to_ui_w(word);
  }
});
chrome.storage.local.get("checkbox_settings", async (data) => {
  checkbox_settings = data.checkbox_settings || {};
  set_checkboxes();
});
chrome.storage.local.get("default_quality_settings", async (data) => {
  default_quality_settings = data.default_quality_settings || {
    defBlockSearch: true,
    defBlockResults: true,
  };
  set_default_quality();
});

let defaultRedirect = chrome.runtime.getURL("block.html");

chrome.storage.local.get("defRedirect", async (data) => {
  defaultRedirect = data.defRedirect || chrome.runtime.getURL("block.html");
  currRedirect.textContent = "Current Default Redirect: " + defaultRedirect;
});

clearBtn.addEventListener("click", () => {
  whitelist = new Set();
  for (const child of whitelisted_words.querySelectorAll("button")) {
    child.remove();
  }
});

retToOrigRedirect.addEventListener("click", () => {
  let newRedirect = chrome.runtime.getURL("block.html");
  if (!newRedirect) return;
  currRedirect.textContent = "Current Default Redirect: " + newRedirect;
  defaultRedirect = newRedirect;
  inputNewRedirect.value = "";
  save(true);
});

function set_default_quality() {
  site_block_search_default.checked =
    default_quality_settings["defBlockSearch"];
  site_block_result_default.checked =
    default_quality_settings["defBlockResults"];
}

chngDefaultRedirect.addEventListener("click", chngRedirect);

function chngRedirect() {
  let newRedirect = normalizeRedirect(inputNewRedirect.value.trim(), defaultRedirect);
  if (!newRedirect) return;
  if (newRedirect == defaultRedirect){
    alert("Invalid redirect. Reverted to prior default.")
  }
  currRedirect.textContent = "Current Default Redirect: " + newRedirect;
  defaultRedirect = newRedirect;
  inputNewRedirect.value = "";
  save(true);
}

add_whitelist_btn.addEventListener("click", () => {
  let input = whitelist_adder.value.trim();
  if (!input || whitelist?.has(input)) return;
  whitelist.add(input);
  add_word_to_ui_w(input);
  whitelist_adder.value = "";
  save();
});

function add_word_to_ui_w(word) {
  let button = document.createElement("button");
  button.textContent = word;
  button.addEventListener("dblclick", () => {
    if (confirm(`Remove "${word}" completely?`)) {
      whitelist.delete(word);
      button.remove();
      save();
    }
  });
  whitelisted_words.appendChild(button);
}

async function save(redirect_changed = false) {
  save_checkboxes();
  await setInStorage({
    defRedirect: defaultRedirect,
    whitelisted_words: Array.from(whitelist),
    checkbox_settings: checkbox_settings,
    default_quality_settings: {
      defBlockSearch: site_block_search_default.checked,
      defBlockResults: site_block_result_default.checked,
    },
  });
  notif.set_text("block_settings_saved", "all")
}

function save_checkboxes() {
  let checkboxes = Array.from(allCheckboxes);
  for (const check of checkboxes) {
    checkbox_settings[check.id] = {
      id: check.checked,
      selectors: JSON.parse(check.dataset.selectors),
    };
  }
}

function set_checkboxes() {
  let checkboxes = Array.from(allCheckboxes);
  for (const check of checkboxes) {
    check.checked = checkbox_settings[check.id].id;
  }
}

general_settings_page.addEventListener("input", (event) => {
  for (const check of allCheckboxes) {
    if (event.target == check) {
      save();
      break;
    }
  }
});

document.addEventListener("input", (event) => {
  if (
    event.target == site_block_search_default ||
    event.target == site_block_result_default
  ) {
    save();
  }
});
