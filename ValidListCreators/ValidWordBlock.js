import { getFromStorage, setInStorage } from "../Components/ChromeStorage.js";

let whitelist = [];
const file_input = document.querySelector(".file_input");

const choose = document.querySelector("#choose_file");
const block_search_cb_toolbar = document.querySelector(
  "#block_search_cb_toolbar"
);
const block_result_cb_toolbar = document.querySelector(
  "#block_result_cb_toolbar"
);
const uploadButton = document.getElementById("uploadButton");

choose.addEventListener("click", () => file_input.click());

file_input.addEventListener("change", () => {
  choose.textContent =
    file_input.files.length > 0 ? file_input.files[0].name : "No File Chosen";
});

const whitelist_input = document.querySelector(".whitelist_input");
const add_whitelist_btn = document.getElementById("add_whitelist_btn");
const whitelist_display = document.getElementById("whitelist_display");

add_whitelist_btn.addEventListener("click", () => {
  const term = whitelist_input.value.trim();
  if (!term) return;
  if (!whitelist.includes(term)) {
    whitelist.push(term);
    whitelist_input.value = "";
    load_whitelist()
  }
});

function load_whitelist() {
  whitelist_display.innerHTML = "";
  whitelist.forEach((term) => {
    const button = document.createElement("button");
    button.textContent = term;

    button.addEventListener("dblclick", () => {
      whitelist = whitelist.filter((w) => w !== term);
      load_whitelist();
    });

    whitelist_display.appendChild(button);
  });
}

uploadButton.addEventListener("click", function (event) {

    const file = file_input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const domains = text.split(/\r?\n/).filter((line) => line.trim() !== "");

      const obj = {};
      for (const domain of domains) {
        obj[domain] = {
          blockSearch: block_search_cb_toolbar.checked,
          blockResults: block_result_cb_toolbar.checked,
          whitelist: whitelist,
        };
      }

      const jsonString = JSON.stringify(obj, null, 2);
      console.log(jsonString);

      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "valid_blocked_words.json";
      a.click();
      URL.revokeObjectURL(url);
    };

    reader.readAsText(file);
  });
