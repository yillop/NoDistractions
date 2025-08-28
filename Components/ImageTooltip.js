class ImageTooltip extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("span");
    const trigger = document.createElement("span");
    trigger.textContent = "\u{1F6C8}";

    const tooltip = document.createElement("div");
    tooltip.setAttribute("class", "tooltip");

    const img = document.createElement("img");
    img.src = this.getAttribute("src") || "";
    img.alt = this.getAttribute("alt") || "Tooltip image";
    tooltip.appendChild(img);

    const style = document.createElement("style");
    style.textContent = `
      :host {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }
      .tooltip {
        visibility: hidden;
        position: absolute;
        top: 120%;
        left: 50%;
        transform: translateX(-50%);
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 10;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .tooltip img {
        max-width: 300px;
        height: auto;
        display: block;
      }
      :host(:hover) .tooltip {
        visibility: visible;
        opacity: 1;
      }
    `;

    wrapper.appendChild(trigger);
    wrapper.appendChild(tooltip);
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }
}

customElements.define("image-tooltip", ImageTooltip);
