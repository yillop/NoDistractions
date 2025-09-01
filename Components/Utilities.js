export function parseFileInput(file) {
  try {
    if (!file) return [];
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result.split(/\r?\n/).filter(Boolean));
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  } catch (error) {
    console.error("Error parsing file:", error);
    return [];
  }
}

export function downloadList(filename, keys) {
  const text = JSON.stringify(keys, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function setupInputToggle(toggleEl, textInput, fileBtn, addBtn, use_upload_settings) {
  toggleEl.addEventListener("input", () => {
    if (toggleEl.checked) {
      textInput.classList.add("hidden");
      fileBtn.classList.remove("hidden");
      addBtn.dataset.multiple = "true";
      use_upload_settings.classList.remove("hidden");
    } else {
      textInput.classList.remove("hidden");
      fileBtn.classList.add("hidden");
      addBtn.dataset.multiple = "false";
      use_upload_settings.classList.add("hidden");
    }
  });
}
