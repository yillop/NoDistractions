import { isValidUrl, normalizeRedirect } from "/Components/URLValidator.js";

import { getFromStorage, setInStorage } from "../Components/ChromeStorage.js";
import { AutoSaveBlockList } from "../Components/AutoSaveBlockList.js";
import {
  setupInputToggle,
  downloadList,
  parseFileInput,
} from "../Components/Utilities.js";

const block_container = document.querySelector("block-container");
const clear = document.querySelector("#clear_button");

const info_section = document.querySelector("#info_section");
const info_title = document.querySelector("#info_title");
const redirect_display = document.querySelector("#redirect_display");
const new_redirect_input = document.querySelector("#new_redirect_input");
const add_redirect_btn = document.querySelector("#add_redirect_btn");
const default_btn = document.querySelector("#default_btn");
const remove_btn = document.querySelector("#remove_btn");
const exitInfo = document.querySelector("#exitInfo");
const block_search_cb_info = document.querySelector("#block_search_cb_info");
const block_result_cb_info = document.querySelector("#block_result_cb_info");

const div = document.querySelector("#blocked_sites_div");
const site_input = document.querySelector(".site_input");
const add = document.querySelector(".add_button");
const dropdown = document.querySelector("#dropdown");
const change_amount_to_upload = document.querySelector(
  "#change_amount_to_upload"
);
const file_input = document.querySelector(".file_input");
const use_upload_settings = document.querySelector("#use_upload_settings");

const choose = document.querySelector("#choose_file");
const block_search_cb_toolbar = document.querySelector(
  "#block_search_cb_toolbar"
);
const block_result_cb_toolbar = document.querySelector(
  "#block_result_cb_toolbar"
);
const redirect_input = document.querySelector(".redirect_input");

const download = document.querySelector("#download");

const notif = document.querySelector("settings-notif");

const top1000 = "../top1000.json";
let sites = [];
let current_site;
let current_config;

let defaultRedirect =
  (await getFromStorage("defRedirect")) || chrome.runtime.getURL("block.html");

fetch(chrome.runtime.getURL(top1000))
  .then((response) => response.json())
  .then((data) => {
    sites = data;
  })
  .catch((err) => console.error("Failed to load sites.json:", err));

block_search_cb_toolbar.checked = (
  await getFromStorage("default_quality_settings")
)?.["defBlockSearch"] ?? true;
block_result_cb_toolbar.checked = (
  await getFromStorage("default_quality_settings")
)?.["defBlockResults"] ?? true;

let blocked_sites = AutoSaveBlockList(
  "blocked_sites",
  (await getFromStorage("blocked_sites")) || {},
  notif
);
block_container.fill_container(blocked_sites);

choose.addEventListener("click", () => file_input.click());
setupInputToggle(
  change_amount_to_upload,
  site_input,
  choose,
  add,
  use_upload_settings
);

file_input.addEventListener("change", () => {
  if (file_input.files?.length > 0) {
    choose.textContent = file_input.files[0].name;
  } else {
    choose.textContent = "No File Chosen";
  }
});

site_input?.addEventListener("input", () => {
  const query = String(site_input?.value).toLowerCase().trim();
  dropdown.innerHTML = "";

  if (query == "") return;

  const matches = sites.filter((site) => site.toLowerCase().startsWith(query));

  matches.forEach((site) => {
    const option = document.createElement("option");
    option.value = site;
    dropdown.appendChild(option);
  });
});

add.addEventListener("click", block_input);
clear.addEventListener("click", clear_sites);

download.addEventListener("click", () =>
  downloadList("blocked_sites.json", Object.fromEntries(blocked_sites.copy()))
);

async function clear_sites() {
  if (confirm(`Clear all blocked sites? This cannot be undone.`)) {
    blocked_sites.clear();
    block_container.fill_container(blocked_sites);
    await setInStorage({ current_id: 1 });
    open_options(current_site);
  }
}

add_redirect_btn.addEventListener("click", add_redirect);
remove_btn.addEventListener("click", remove_site);
default_btn.addEventListener("click", retToDef);

info_section.addEventListener("input", (event) => {
  if (
    event.target === block_search_cb_info ||
    event.target === block_result_cb_info
  ) {
    current_config.blockSearch = block_search_cb_info.checked;
    current_config.blockResults = block_result_cb_info.checked;
    blocked_sites.set(current_site, current_config);
  }
});

exitInfo.addEventListener("click", () => {
  info_section.classList.add("hidden");
});

document.addEventListener("block-clicked", (event) =>
  open_options(event.detail.block)
);

async function getNextId() {
  let num = (await getFromStorage("current_id")) || 1;
  num += 1;
  await setInStorage({ current_id: num });
  return num;
}

async function block_input() {
  try {
    let sites;
    let blocked_sites_temp = blocked_sites.copy();
    if (add.dataset.multiple == "true") {
      const file = file_input.files[0];
      if (!file) return;
      block_container.loading();
      try {
        sites = JSON.parse(await file.text());
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Invalid file format. Please upload a valid JSON file.");
        block_container.fill_container();
        return;
      }
    } else {
      if (site_input.value.trim() == "") return;
      sites = {
        [String(site_input.value).trim()]: {
          redirect: String(redirect_input.value).trim() || "Default",
          blockSearch: block_search_cb_toolbar.checked,
          blockResults: block_result_cb_toolbar.checked,
        },
      };
      site_input.value = "";
    }
    if (
      !sites ||
      Object.keys(sites).length <= 0 ||
      blocked_sites.size + Object.keys(sites).length > 30000
    )
      return;
    if (
      redirect_input.value != "Default" &&
      normalizeRedirect(redirect_input.value, defaultRedirect) == "invalid"
    ) {
      alert("Invalid redirect. Block Not Added");
      return;
    }
    if (typeof sites !== "object" || sites === null || Array.isArray(sites)) {
      console.error("Invalid words format:", sites);
      alert("Invalid words format. Block Not Added");
      block_container.fill_container();
      return;
    }
    for (const [block, config] of Object.entries(sites)) {
      if (blocked_sites_temp.size + Object.keys(sites).length > 5000) {
        alert("Blocked sites limit reached (5000). Please remove some sites before adding new ones.");
        block_container.fill_container();
        return;
      }
      config.ruleId = await getNextId();
      if (use_upload_settings.checked) {
        config.redirect = String(redirect_input.value).trim() || "Default";
        config.blockSearch = block_search_cb_toolbar.checked;
        config.blockResults = block_result_cb_toolbar.checked;
      }
      sites[block] = config;
      if (
        !block ||
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
      ) {
        console.error("Invalid block configuration:", block, config);
        alert("Invalid block configuration. Block Not Added");
        block_container.fill_container();
        return;
      }
      if (
        !config.hasOwnProperty("blockSearch") ||
        typeof config.blockSearch !== "boolean"
      ) {
        console.error(
          `Missing or Incorrect "blockSearch" property for block: ${block}`
        );
        alert(
          `Missing or Incorrect 'blockSearch' property for ${block}. Block Not Added`
        );
        block_container.fill_container();
        return;
      }
      if (
        !config.hasOwnProperty("blockResults") ||
        typeof config.blockResults !== "boolean"
      ) {
        console.error(
          `Missing or Incorrect "blockResults" property for block: ${block}`
        );
        alert(
          `Missing or Incorrect 'blockResults' property for ${block}. Block Not Added`
        );
        block_container.fill_container();
        return;
      }
      if (
        !config.hasOwnProperty("redirect") ||
        typeof config.redirect !== "string" ||
        normalizeRedirect(config.redirect, defaultRedirect) == "invalid"
      ) {
        console.error(
          `Missing or Incorrect "redirect" property for block: ${block}`
        );
        alert(
          `Missing or Incorrect 'redirect' property for ${block}. Block Not Added`
        );
        block_container.fill_container();
        return;
      }
    }

    blocked_sites_temp = new Map([
      ...blocked_sites_temp,
      ...Object.entries(sites),
    ]);
    blocked_sites = new AutoSaveBlockList(
      "blocked_sites",
      Object.fromEntries(blocked_sites_temp),
      notif
    );
    block_container.fill_container(blocked_sites);
    open_options(current_site);
  } catch (e) {
    console.error("Error blocking sites:", e);
    notif.set_text("block_error");
  }
}

function open_options(site) {
  if (!info_section.classList.contains("hidden") && current_site == site) {
    info_section.classList.add("hidden");
    current_site = null;
    return;
  }
  refresh_options(site);
}

function refresh_options(site) {
  current_config = blocked_sites.get(site);
  if (!current_config) return;

  current_site = site;
  info_section.classList.remove("hidden");
  info_title.textContent = `Editing: ${site}`;

  block_search_cb_info.checked = current_config.blockSearch;
  block_result_cb_info.checked = current_config.blockResults;

  redirect_display.innerHTML = "";
  const li = document.createElement("li");
  if (current_config.redirect == "Default") {
    li.textContent = "Default: " + defaultRedirect;
  } else {
    li.textContent = current_config.redirect;
  }
  redirect_display.appendChild(li);
}

function retToDef() {
  current_config.redirect = "Default";
  blocked_sites.set(current_site, current_config);
  refresh_options(current_site);
}

function add_redirect() {
  const term = normalizeRedirect(String(new_redirect_input.value).trim());
  if (!term || term == "invalid" || !current_site) {
    alert("Invalid redirect. Block Not Updated");
    return;
  }
  current_config.redirect = term;
  new_redirect_input.value = "";
  blocked_sites.set(current_site, current_config);
  refresh_options(current_site);
}

async function remove_site() {
  if (confirm(`Remove "${current_site}" completely?`)) {
    blocked_sites.delete(current_site);
    await setInStorage({ blocked_sites: Object.fromEntries(blocked_sites) });
    document
      .querySelector(`#blocked_sites button[data-site="${current_site}"]`)
      ?.remove();
    info_section.classList.add("hidden");
    current_site = null;
    block_container.fill_container(blocked_sites);
  }
}
