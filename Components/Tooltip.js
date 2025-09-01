    class Tooltip extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });

        const span = document.createElement("span");
        span.textContent = "\u{1F6C8}";
        span.style.cursor = "help";

        const title = this.getAttribute("title");
        if (title) span.setAttribute("title", title);

        shadow.appendChild(span);
      }
    }

    customElements.define("info-tooltip", Tooltip);