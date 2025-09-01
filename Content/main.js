const SELECTORS = [
  { root: ".vt6azd:not(.g-blk)", url: ":is(.yuRUbf, .xe8e1b) a" }, // Default
  { root: ".A6K0A", url: "a.zReHs.VfSr4c" }, // Default
  { root: ".vCUuC", url: "a" }, // Images
  { root: ".sHEJob", url: "a[href^='http']" }, // Videos
  { root: "[data-news-cluster-id]", url: "a" }, // News
  { root: ".eejeod", url: "a" }, // Twitter
  { root: ".ivg-i", url: ".EZAeBe" }, // Images (desktop fallback)
  { root: ".vt6azd", url: ".xe8e1b a" }, // Videos (desktop fallback)
];

let block_list_words_m = {};
let whitelist_words_m = [];
let checkbox_settings = {};

const blocker = document.getElementById("overlay");

def_checkbox_settings = {
  block_People_also_ask: {
    id: false,
    selectors: {
      roots: ['div[jscontroller="Da4hkd"]'],
      properties: ['[class="LQCGqc"]'],
    },
  },
  block_news_tab: {
    id: false,
    selectors: {
      roots: ["g-section-with-header"],
      properties: ["[data-news-cluster-id]"],
    },
  },
  block_overview_side_tab: {
    id: false,
    selectors: {
      roots: [".jOAHU ", ".A6K0A.SjLxGf", ".A6K0A.z4oRIf"],
      properties: [
        '[jscontroller="nPaQu"]',
        '[jscontroller="Wo3n8"]',
        '[jsname="TlEBqd"]',
      ],
    },
  },
  block_overview_top_tab: {
    id: false,
    selectors: {
      roots: [".bzXtMb.M8OgIe.dRpWwb "],
      properties: ['[jscontroller="qTdDb"]'],
    },
  },
  block_people_also_search: {
    id: false,
    selectors: {
      roots: [".oIk2Cb "],
      properties: ['[class="M6HR1c PJI6ge adDDi"]'],
    },
  },
  block_shorts_tab: {
    id: false,
    selectors: {
      roots: [".Ww4FFb.vt6azd "],
      properties: ['g-scrolling-carousel[jscontroller="pgCXqb"]'],
    },
  },
  block_social_media: {
    id: false,
    selectors: {
      roots: ["g-section-with-header", ".eejeod.up9jud"],
      properties: ['[jscontroller="s0j7C"]'],
    },
  },
  block_videos_tab: {
    id: false,
    selectors: {
      roots: [".A6K0A "],
      properties: ['[jscontroller="HWk0Gf"]'],
    },
  },
};

chrome.storage.local.get("checkbox_settings", (data) => {
  checkbox_settings = data.checkbox_settings || def_checkbox_settings;
  block_odd_tabs();
});

chrome.storage.local.get(["blocked_words", "whitelisted_words"], (data) => {
  block_list_words_m = data.blocked_words || {};
  whitelist_words_m = data.whitelisted_words || [];
  block_keyword_sites();
});

let block_list = new Map();

chrome.storage.local.get("blocked_sites", (data) => {
  const blockedSites = data.blocked_sites || {};
  block_list = new Map(Object.entries(blockedSites));
  remove_unwanted_sites();
});

let wordblockdone = false;
let checkboxdone = false;
let siteblockdone = false;

function block_keyword_sites() {
  SELECTORS?.forEach(({ root, url }) => {
    const results = document.querySelectorAll(root);
    results?.forEach((el) => {
      const isBlocked = test_if_blocked(el?.textContent);
      const whitelist_match = searchInText(el?.textContent, whitelist_words_m);
      const isWhitelisted = whitelist_match?.length > 0;
      if (isBlocked && !isWhitelisted) {
        el.style.display = "none";
      }
    });
  });
  wordblockdone = true;
  checkDone();
}

function test_if_blocked(text) {
  const blocked_matches = new Set(
    searchInText(text, Object.keys(block_list_words_m))
  );

  for (const _blocked of blocked_matches) {
    let blocked = _blocked.trim().toLowerCase();
    if (!block_list_words_m?.[blocked].blockResults) {
      blocked_matches.delete(_blocked);
      continue;
    }
    const pers_wl = block_list_words_m?.[blocked].whitelist;

    const whitelist_match = searchInText(text, pers_wl);
    if (whitelist_match?.length > 0) {
      blocked_matches.delete(_blocked);
    }
  }
  return blocked_matches.size > 0;
}

function block_odd_tabs() {
  for (const check in checkbox_settings) {
    if (checkbox_settings?.[check].id) {
      for (const root of checkbox_settings?.[check].selectors.roots) {
        document.querySelectorAll(root)?.forEach((selection) => {
          for (const property of checkbox_settings?.[check].selectors
            .properties) {
            if (selection.querySelector(property)) {
              selection.style.display = "none";
            }
          }
        });
      }
    }
  }
  checkboxdone = true;
  checkDone();
}

function getRootDomain(hostname) {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
}

function remove_unwanted_sites() {
  SELECTORS?.forEach(({ root, url }) => {
    const results = document.querySelectorAll(root);
    results?.forEach((block) => {
      const links = block.querySelectorAll(url);
      for (const link of links) {
        const href = link.href?.toLowerCase();
        const domain = getRootDomain(new URL(href).hostname);
        if (
          domain &&
          block_list.has(domain) &&
          block_list.get(domain).blockResults
        ) {
          block.style.display = "none";
        }
      }
    });
  });
  siteblockdone = true;
  checkDone();
}

let overlayRemoved = false;

function checkDone() {
  if (!overlayRemoved && wordblockdone && checkboxdone && siteblockdone) {
    setTimeout(() => {
      blocker.remove();
      overlayRemoved = true;
    }, 0);
  }
}

function searchInText(text, words) {
  text = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ");
  let matches = [];
  for (let word of words) {
    word_ = String(word)
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ");
    let found = text.indexOf(word_);
    if (found === -1 || (found != 0 && text[found - 1] != " ")) continue;
    matches.push(word);
  }
  return matches;
}

const observer = new MutationObserver(() => {
  try {
    block_keyword_sites();
    block_odd_tabs();
    remove_unwanted_sites();
  } catch (error) {
    console.error("Error occurred while observing:", error);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
