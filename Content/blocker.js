let block_list_words;
let whitelist_words

let defaultRedirect = chrome.runtime.getURL("block.html");

chrome.storage.local.get(
  ["blocked_words", "whitelisted_words", "defRedirect"],
  async (data) => {
    block_list_words = data.blocked_words || {};
    whitelist_words = data.whitelisted_words || [];
    defaultRedirect = data.defRedirect || chrome.runtime.getURL("block.html");
    block_keywords();
  }
);

function block_keywords() {
  const params = new URLSearchParams(window.location.search);
  const unsplit_query = params.get("q");
  if (!unsplit_query) {
    return;
  }
  const isBlocked = test_if_blocked(unsplit_query);
  const whitelist_match = searchInText(unsplit_query, whitelist_words);
  const isWhitelisted = whitelist_match ? whitelist_match.length > 0 : false;
  if (isBlocked && !isWhitelisted) {
    window.location.href = defaultRedirect;
  }
}

function test_if_blocked(text) {
  const blocked_matches = new Set(
    searchInText(text, Object.keys(block_list_words))
  );

  for (const _blocked of blocked_matches) {
    let blocked = _blocked.trim().toLowerCase();
    if (!block_list_words[blocked].blockSearch) {
      blocked_matches.delete(_blocked);
      continue;
    }
    const pers_wl = block_list_words[blocked].whitelist;

    const whitelist_match = searchInText(text, pers_wl);
    if (whitelist_match && whitelist_match.length > 0) {
      blocked_matches.delete(_blocked);
    }
  }
  return blocked_matches.size > 0;
}

const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.textContent = "Loading";


overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.backgroundColor = "black";
overlay.style.color = "white";
overlay.style.display = "flex";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.fontSize = "2rem";
overlay.style.zIndex = "999999";
document.documentElement.appendChild(overlay);


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
