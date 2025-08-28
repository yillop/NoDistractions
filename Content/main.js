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

chrome.storage.local.get("checkbox_settings", async (data) => {
  checkbox_settings = data.checkbox_settings || {};
  block_odd_tabs();
});

chrome.storage.local.get(
  ["blocked_words", "whitelisted_words"],
  async (data) => {
    block_list_words_m = data.blocked_words || {};
    whitelist_words_m = data.whitelisted_words || [];
    block_keyword_sites();
  }
);

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
  SELECTORS.forEach(({ root, url }) => {
    const results = document.querySelectorAll(root);
    console.log(results);
    results.forEach((el) => {
      const isBlocked = test_if_blocked(el.textContent);
      const whitelist_match = searchInText(el.textContent, whitelist_words_m);
      const isWhitelisted = whitelist_match
        ? whitelist_match.length > 0
        : false;
      if (isBlocked && !isWhitelisted) {
        el.remove();
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
    if (!block_list_words_m[blocked].blockResults) {
      blocked_matches.delete(_blocked);
      continue;
    }
    const pers_wl = block_list_words_m[blocked].whitelist;

    const whitelist_match = searchInText(text, pers_wl);
    if (whitelist_match && whitelist_match.length > 0) {
      blocked_matches.delete(_blocked);
    }
  }
  return blocked_matches.size > 0;
}

function block_odd_tabs() {
  for (const check in checkbox_settings) {
    if (checkbox_settings[check].id) {
      for (const root of checkbox_settings[check].selectors.roots) {
        document.querySelectorAll(root).forEach((selection) => {
          for (const property of checkbox_settings[check].selectors
            .properties) {
            if (selection.querySelector(property)) {
              selection.remove();
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
  if (parts.length <= 2) return hostname; // already root domain
  return parts.slice(-2).join(".");
}

function remove_unwanted_sites() {
  SELECTORS.forEach(({ root, url }) => {
    const results = document.querySelectorAll(root);
    results.forEach((block) => {
      const links = block.querySelectorAll(url);
      for (const link of links) {
        const href = link.href?.toLowerCase();
        const domain = getRootDomain(new URL(href).hostname);
        if (
          domain &&
          block_list.has(domain) &&
          block_list.get(domain).blockResults
        ) {
          block.remove();
        }
      }
    });
  });
  siteblockdone = true;
  checkDone();
}

function checkDone() {
  if (!blocker) return;
  if (wordblockdone && checkboxdone && siteblockdone) {
    blocker.remove();
  }
}

function searchInText(text, words) {
  let matches = [];
  for (const word of words) {
    let splitText = text.split(/(\W+)/);
    let match = splitText.find(
      (t) =>
        t.toLowerCase() === word.toLowerCase() ||
        t.toLowerCase().startsWith(word.toLowerCase())
    );
    if (match) {
      matches.push(word);
    }
  }
  return matches;
}
