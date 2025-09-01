import { isValidUrl, normalizeRedirect } from "../Components/URLValidator.js";
import { getFromStorage, setInStorage } from "../Components/ChromeStorage.js";

const currRedirect = document.getElementById("currRedirect");
const inputNewRedirect = document.getElementById("inputNewRedirect");
const chngDefaultRedirect = document.getElementById("chngDefaultRedirect");
const retToOrigRedirect = document.getElementById("retToOrigRedirect");
const chngToMatch = document.getElementById("chngToMatch");

const currRedirect_word = document.getElementById("currRedirect_word");
const inputNewRedirect_word = document.getElementById("inputNewRedirect_word");
const chngDefaultRedirect_word = document.getElementById("chngDefaultRedirect_word");
const retToOrigRedirect_word = document.getElementById("retToOrigRedirect_word");
const chngToMatch_words = document.getElementById("chngToMatch_words");

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

chrome.storage.local.get("blocked_sites", (data) => {
  const blockedSites = data.blocked_sites || {};
  block_list = new Map(Object.entries(blockedSites));
});
chrome.storage.local.get("whitelisted_words", (data) => {
  whitelist = new Set(data.whitelisted_words || []);
  for (const word of whitelist) {
    add_word_to_ui_w(word);
  }
});
chrome.storage.local.get("checkbox_settings", (data) => {
  let def_check_settings = {}
  for (const check of allCheckboxes) {
    def_check_settings[check.id] = {id: false, selectors: JSON.parse(check.dataset.selectors)};
  }
  checkbox_settings = data.checkbox_settings || def_check_settings;
  set_checkboxes();
});
chrome.storage.local.get("default_quality_settings", (data) => {
  default_quality_settings = data.default_quality_settings || {
    defBlockSearch: true,
    defBlockResults: true,
  };
  set_default_quality();
});

let defaultRedirect = chrome.runtime.getURL("block.html");

chrome.storage.local.get("defRedirect", (data) => {
  defaultRedirect = data.defRedirect || chrome.runtime.getURL("block.html");
  currRedirect.textContent = "Current Default Redirect for Sites: " + defaultRedirect;
});

let defaultRedirect_word = chrome.runtime.getURL("block.html");

chrome.storage.local.get("defRedirect_word", (data) => {
  defaultRedirect_word = data.defRedirect_word || chrome.runtime.getURL("block.html");
  currRedirect_word.textContent = "Current Redirect for Words: " + defaultRedirect_word;
});

clearBtn.addEventListener("click", () => {
  whitelist = new Set();
  for (const child of whitelisted_words.querySelectorAll("button")) {
    child.remove();
  }
  save()
});

retToOrigRedirect.addEventListener("click", () => {
  let newRedirect = chrome.runtime.getURL("block.html");
  if (!newRedirect) {
    alert("Error retrieving original block page.");
    return;
  }
  currRedirect.textContent = "Current Default Redirect: " + newRedirect;
  defaultRedirect = newRedirect;
  inputNewRedirect.value = "";
  save(true);
});

retToOrigRedirect_word.addEventListener("click", () => {
  let newRedirect = chrome.runtime.getURL("block.html");
  if (!newRedirect) {
    alert("Error retrieving original block page.");
    return;
  }
  currRedirect_word.textContent = "Current Redirect for Words: " + newRedirect;
  defaultRedirect_word = newRedirect;
  inputNewRedirect_word.value = "";
  save(true);
});

chngToMatch.addEventListener("click", () => {
  if (!defaultRedirect_word) {
    alert("Error retrieving redirect for words.");
    return;
  }
  inputNewRedirect.value = defaultRedirect_word;
  chngDefaultRedirect.click();
})

chngToMatch_words.addEventListener("click", () => {
    if (!defaultRedirect) {
    alert("Error retrieving redirect for sites.");
    return;
  }
  inputNewRedirect_word.value = defaultRedirect;
  chngDefaultRedirect_word.click();
})

function set_default_quality() {
  site_block_search_default.checked =
    default_quality_settings["defBlockSearch"];
  site_block_result_default.checked =
    default_quality_settings["defBlockResults"];
}

chngDefaultRedirect.addEventListener("click", ()=>{
  let newRedirect = normalizeRedirect(inputNewRedirect.value.trim(), defaultRedirect);
  if (!newRedirect || newRedirect == "invalid"){
    alert("Invalid redirect. Reverted to prior default.")
    return;
  }
  currRedirect.textContent = "Current Default Redirect for Sites: " + newRedirect;
  defaultRedirect = newRedirect;
  inputNewRedirect.value = "";
  save(true);
});

chngDefaultRedirect_word.addEventListener("click", ()=>{
  let newRedirect_word = normalizeRedirect(inputNewRedirect_word.value.trim(), defaultRedirect_word);
  if (!newRedirect_word || newRedirect_word == "invalid"){
    alert("Invalid redirect. Reverted to prior default.")
    return;
  }
  currRedirect_word.textContent = "Current Redirect for Words: " + newRedirect_word;
  defaultRedirect_word = newRedirect_word;
  inputNewRedirect_word.value = "";
  save(true);
});

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
    defRedirect_word: defaultRedirect_word,
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
  console.log(JSON.stringify(checkbox_settings, null, 2));
}

function set_checkboxes() {
  let checkboxes = Array.from(allCheckboxes);
  for (const check of checkboxes) {
    check.checked = checkbox_settings[check.id]?.id ? true : false;
  }
  save();
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
