import { getFromStorage, setInStorage } from "../Components/ChromeStorage.js";
import { AutoSaveBlockList } from "../Components/AutoSaveBlockList.js";
import {
  setupInputToggle,
  downloadList,
  parseFileInput,
} from "../Components/Utilities.js";

const block_container = document.querySelector("block-container");
let whitelist_tb = [];

const word_input = document.querySelector("#word_input");
const add = document.querySelector(".add_button");
const change_amount_to_upload = document.querySelector(
  "#change_amount_to_upload"
);
const file_input = document.querySelector(".file_input");
const choose = document.querySelector("#choose_file");
const block_search_cb_toolbar = document.querySelector(
  "#block_search_cb_toolbar"
);
const block_result_cb_toolbar = document.querySelector(
  "#block_result_cb_toolbar"
);
const clear_b = document.querySelector("#clear_button_b");
const use_upload_settings = document.querySelector("#use_upload_settings");

const info_section = document.querySelector("#info_section");
const info_title = document.querySelector("#info_title");
const block_search_cb = document.querySelector("#block_search_cb");
const block_result_cb = document.querySelector("#block_result_cb");
const whitelist_display = document.querySelector("#whitelist_display");
const new_whitelist_input = document.querySelector("#new_whitelist_input");
const add_whitelist_btn = document.querySelector("#add_whitelist_btn");
const remove_btn = document.querySelector("#remove_btn");

const download = document.querySelector("#download");
const notif = document.querySelector("settings-notif");

const whitelist_input_tb = document.querySelector(".whitelist_input_tb");
const add_whitelist_btn_tb = document.getElementById("add_whitelist_btn_tb");
const whitelist_display_tb = document.getElementById("whitelist_display_tb");


let current_word = null;
let current_config = null;


block_search_cb_toolbar.checked = (
  await getFromStorage("default_quality_settings")
)?.["defBlockSearch"] ?? true;
block_result_cb_toolbar.checked = (
  await getFromStorage("default_quality_settings")
)?.["defBlockResults"] ?? true;

let blocked_words = AutoSaveBlockList(
  "blocked_words",
  (await getFromStorage("blocked_words")) || {},
  notif
);
block_container.fill_container(blocked_words);


download.addEventListener("click", () =>
  downloadList("blocked_words.json", Object.fromEntries(blocked_words.copy()))
);

choose.addEventListener("click", () => file_input.click());

setupInputToggle(
  change_amount_to_upload,
  word_input,
  choose,
  add,
  use_upload_settings
);

file_input.addEventListener("change", () => {
  choose.textContent =
    file_input.files.length > 0 ? file_input.files[0].name : "No File Chosen";
});

add.addEventListener("click", block_input);

clear_b.addEventListener("click", clear_blocked_words);

add_whitelist_btn.addEventListener("click", () => {
  const term = String(new_whitelist_input.value).trim();
  if (!term || !current_word) return;
  if (!current_config.whitelist.includes(term)) {
    current_config.whitelist.push(term);
    new_whitelist_input.value = "";
    refresh_options(current_word);
  }
  blocked_words.set(current_word, current_config);
});

remove_btn.addEventListener("click", () => {
  if (confirm(`Remove "${current_word}" completely?`)) {
    blocked_words.delete(current_word);
    document
      .querySelector(`#blocked_words button[data-word="${current_word}"]`)
      ?.remove();
    info_section.classList.add("hidden");
    current_word = null;
    block_container.fill_container(blocked_words);
  }
});

info_section.addEventListener("input", (event) => {
  if (event.target == block_search_cb || event.target == block_result_cb) {
    current_config.blockSearch = block_search_cb.checked;
    current_config.blockResults = block_result_cb.checked;
    blocked_words.set(current_word, current_config);
  }
});

document.addEventListener("block-clicked", (event) =>
  open_options(event.detail.block)
);

async function block_input() {
  try {
    let words;
    let blocked_words_temp = blocked_words.copy();
    if (add.dataset.multiple == "true") {
      const file = file_input.files[0];
      if (!file) return;
      block_container.loading();
      try {
        words = JSON.parse(await file.text());
      } catch (error) {
        console.error("Error parsing JSON:", error);
        block_container.fill_container();
        return;
      }
    } else {
      if (word_input?.value.trim() == "") return;
      words = {
        [String(word_input.value).trim()]: {
          blockSearch: block_search_cb_toolbar.checked,
          blockResults: block_result_cb_toolbar.checked,
          whitelist: whitelist_tb,
        },
      };
      word_input.value = "";
    }
    if (typeof words !== "object" || words === null || Array.isArray(words)) {
      console.error("Invalid words format:", words);
      alert("Invalid words format. Block Not Added");
      block_container.fill_container();
      return;
    }
    for (const [block, config] of Object.entries(words)) {
      if (use_upload_settings.checked) {
        config.blockSearch = block_search_cb_toolbar.checked;
        config.blockResults = block_result_cb_toolbar.checked;
        config.whitelist = whitelist_tb;
        blocked_words_temp[block] = config;
      }
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
        !config.hasOwnProperty("whitelist") ||
        !Array.isArray(config.whitelist)
      ) {
        console.error(
          `Missing or Incorrect "whitelist" property for block: ${block}`
        );
        alert(
          `Missing or Incorrect 'whitelist' property for ${block}. Block Not Added`
        );
        block_container.fill_container();
        return;
      }
    }
    blocked_words_temp = new Map([
      ...blocked_words_temp,
      ...Object.entries(words),
    ]);
    blocked_words = new AutoSaveBlockList(
      "blocked_words",
      Object.fromEntries(blocked_words_temp),
      notif
    );
    block_container.fill_container(blocked_words);
    open_options(current_word);
  } catch (e) {
    console.error("Error blocking sites:", e);
    notif.set_text("block_error");
  }
}

function clear_blocked_words() {
  if (confirm(`Clear all blocked words? This cannot be undone.`)) {
    blocked_words.clear();
    block_container.fill_container(blocked_words);
    open_options(current_word);
  }
}

function open_options(word) {
  if (!info_section.classList.contains("hidden") && current_word == word) {
    info_section.classList.add("hidden");
    current_word = null;
    return;
  }
  refresh_options(word);
}

function refresh_options(word) {
  current_config = blocked_words.get(word);
  if (!current_config) return;

  current_word = word;
  info_section.classList.remove("hidden");
  info_title.textContent = `Editing: ${word}`;
  block_search_cb.checked = current_config.blockSearch;
  block_result_cb.checked = current_config.blockResults;

  whitelist_display.innerHTML = "";
  current_config.whitelist.forEach((term) => {
    const li = document.createElement("li");
    li.textContent = term;

    const rm = document.createElement("button");
    rm.textContent = "X";
    rm.addEventListener("click", () => {
      current_config.whitelist = current_config.whitelist.filter(
        (w) => w !== term
      );
      blocked_words.set(current_word, current_config);
      refresh_options(word);
    });

    li.appendChild(rm);
    whitelist_display.appendChild(li);
  });
}

add_whitelist_btn_tb.addEventListener("click", () => {
  const term = String(whitelist_input_tb.value).trim();
  if (!term) return;
  if (!whitelist_tb.includes(term)) {
    whitelist_tb.push(term);
    whitelist_input_tb.value = "";
    load_whitelist();
  }
});

function load_whitelist() {
  whitelist_display_tb.innerHTML = "";
  whitelist_tb.forEach((term) => {
    const button = document.createElement("button");
    button.textContent = term;

    button.addEventListener("dblclick", () => {
      whitelist_tb = whitelist_tb.filter((w) => w !== term);
      load_whitelist();
    });

    whitelist_display_tb.appendChild(button);
  });
}