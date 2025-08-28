export async function parseFileInput(file) {
  if (!file) return [];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result.split(/\r?\n/).filter(Boolean));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
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

export function setupInputToggle(toggleEl, textInput, fileBtn, addBtn) {
  toggleEl.addEventListener("input", () => {
    if (toggleEl.checked) {
      textInput.classList.add("hidden");
      fileBtn.classList.remove("hidden");
      addBtn.dataset.multiple = "true";
    } else {
      textInput.classList.remove("hidden");
      fileBtn.classList.add("hidden");
      addBtn.dataset.multiple = "false";
    }
  });
}
