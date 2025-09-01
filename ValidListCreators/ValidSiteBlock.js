import { getFromStorage, setInStorage } from "../Components/ChromeStorage.js";

const file_input = document.querySelector(".file_input");

const choose = document.querySelector("#choose_file");
const block_search_cb_toolbar = document.querySelector(
  "#block_search_cb_toolbar"
);
const block_result_cb_toolbar = document.querySelector(
  "#block_result_cb_toolbar"
);
const redirect_input = document.querySelector(".redirect_input");
const uploadButton = document.getElementById("uploadButton");
choose.addEventListener("click", () => file_input.click());

file_input.addEventListener("change", () => {
  choose.textContent =
    file_input.files.length > 0 ? file_input.files[0].name : "No File Chosen";
});

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
          redirect: redirect_input.value || "Default",
          blockSearch: block_search_cb_toolbar.checked,
          blockResults: block_result_cb_toolbar.checked,
        };
      }

      const jsonString = JSON.stringify(obj, null, 2);
      console.log(jsonString);

      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "valid_blocked_sites.json";
      a.click();
      URL.revokeObjectURL(url);
    };

    reader.readAsText(file);
  });
