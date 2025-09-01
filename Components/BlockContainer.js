class BlockContainer extends HTMLElement {
  constructor() {
    super();
    this.numToShow = parseInt(this.getAttribute("num-to-show")) || 50;
    this.get;
    this.pageNum = 0;
    this.currFilter = "";
    this.currBlocked;
    const shadow = this.attachShadow({ mode: "open" });

    this.id = "block_container";
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          border: 2px solid #ccc;
          border-radius: 8px;
          padding: 10px;
          background: #f9f9f9;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        #blocked {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        #blocked button {
        }
        .pagination {
          display: flex;
          gap: 5px;
        }
          button {
  padding: 8px 12px;
          background: #f1f1f1;
  border: 1px solid #444;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover {
  background: #a7a7a7ff;
}

button.danger {
  background: #f28b82;
  border-color: #c62828;
}

button.danger:hover {
  background: #e57373;
}

.hidden {
  display: none !important;
}

          
        
      </style>

      <div class="toolbar">
        <input type="text" id="search_bar" placeholder="Search blocked..." />
        <p id="tagline"></p>
        <div class="pagination">
          <button id="prev">Prev</button>
          <button id="next">Next</button>
        </div>
      </div>

      <div id="blocked"></div>
    `;

    this.search_bar = shadow.querySelector("#search_bar");
    this.tagline = shadow.querySelector("#tagline");
    this.prev = shadow.querySelector("#prev");
    this.next = shadow.querySelector("#next");
    this.blocked = shadow.querySelector("#blocked");

    this.next.addEventListener("click", this.nextButtons.bind(this));
    this.prev.addEventListener("click", this.prevButtons.bind(this));
    this.search_bar.addEventListener("input", () => {
      this.pageNum = 0;
      this.currFilter = this.search_bar.value.toLowerCase();
      this.fill_container();
    });
    this.blocked.addEventListener("click", (event) => {
      if (event.target.matches("button[data-block]")) {
        const block = event.target.dataset.block;
        this.dispatchEvent(
          new CustomEvent("block-clicked", {
            detail: { block },
            bubbles: true,
          })
        );
      }
    });
  }

  fill_container(blocked_items = this.currBlocked, filter = this.currFilter) {
    clearInterval(this.intervalID);
    this.currBlocked = blocked_items;
    this.blocked.innerHTML = "";
    let buttons = Array.from(blocked_items.entries());

    if (filter != "") {
      buttons = buttons.filter(([item, params]) =>
        item.toLowerCase().includes(filter.toLowerCase())
      );
    }
    this.maxPages = Math.ceil(buttons.length / this.numToShow);
    let start = this.numToShow * this.pageNum;
    let end = Math.min(start + this.numToShow, buttons.length);
    if (start < 0) start = 0;

    if (buttons.length == 0) {
      this.tagline.textContent = "No Results";
    } else {
      this.tagline.textContent =
        "Showing " + (start + 1) + " through " + end + " of " + buttons.length;
    }

    for (let i = start; i < end; i++) {
      const [block, params] = buttons[i];
      this.add_block_to_ui(block, params);
    }
  }

  add_block_to_ui(block, params) {
    const new_block = document.createElement("button");
    new_block.dataset.block = block;
    new_block.textContent = block;
    for (const key in params) {
      new_block.dataset[key] = params[key];
    }
    this.blocked.appendChild(new_block);
  }

  nextButtons() {
    if (this.pageNum >= this.maxPages - 1) this.pageNum = 0;
    else this.pageNum++;
    this.fill_container();
  }

  prevButtons() {
    if (this.pageNum <= 0) this.pageNum = this.maxPages - 1;
    else this.pageNum--;
    this.fill_container();
  }

  loading() {
     let dotCount = 0;
    this.intervalID = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      this.tagline.textContent = "Adding Blocks" + ".".repeat(dotCount);
    }, 500);
  }
}

customElements.define("block-container", BlockContainer);
