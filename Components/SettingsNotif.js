class SettingsNotif extends HTMLElement {
  constructor() {
    super();
    this.block_selected = "";
    this.settings = {
      block_loaded: "Blocks Loaded!",
      block_settings_saved: "Settings saved for " + this.block_selected,
      block_removed: this.block_selected + " removed!",
      block_cleared: "All blocks removed!",
      block_error: "Something went wrong!",
    };

    this.shadow = this.attachShadow({ mode: "open" });

    this.shadow.innerHTML = `
    <style>
    :host {
        opacity: 0;
  transition: none;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 16px;
        pointer-events: none;
        }

    :host(.show) {
        opacity: 1;
          transition: opacity 1s ease;

        }
    </style>
          <span id="notifText"></span>

    `;
    this.textEl = this.shadow.querySelector("#notifText");
  }

  set_text(text_set, selected_set = "") {
    this.block_selected = selected_set;
    this.set_dynamic_settings();
    this.textEl.textContent = this.settings[text_set];
    this.classList.add("show");
    setTimeout(() => {
      this.classList.remove("show");
    }, 2000);
  }

  set_dynamic_settings() {
    this.settings["block_settings_saved"] =
      "Settings saved for " + this.block_selected;
    this.settings["block_removed"] = this.block_selected + " removed!";
  }
}

customElements.define("settings-notif", SettingsNotif);
