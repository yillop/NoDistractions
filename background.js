import { isValidUrl, normalizeRedirect } from "/Components/URLValidator.js";

let defaultRedirect = chrome.runtime.getURL("block.html");
chrome.storage.local.get("defRedirect", async (data) => {
  defaultRedirect = data.defRedirect || chrome.runtime.getURL("block.html");
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get("blocked_sites", (data) => {
    updateDynamicRulesFromSites(data.blocked_sites || {});
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.blocked_sites) {
      const newSites = changes.blocked_sites.newValue || {};
      updateDynamicRulesFromSites(newSites);
    } else if (changes.defRedirect) {
      defaultRedirect =
        changes.defRedirect.newValue || chrome.runtime.getURL("block.html");
      chrome.storage.local.get("blocked_sites", (data) => {
        updateDynamicRulesFromSites(data.blocked_sites || {});
      });
    }
  }
});

async function updateDynamicRulesFromSites(sitesObj) {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const ids = rules.map((r) => r.id);
    if (ids.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ids,
      });
    }
    const rulesToAdd = Object.entries(sitesObj)
      .filter(([site, params]) => params.blockSearch)
      .map(([site, params]) => ({
        id: params.ruleId,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            url: normalizeRedirect(params.redirect, defaultRedirect),
          },
        },
        condition: {
          urlFilter: `||${site}^`,
          resourceTypes: ["main_frame"],
        },
      }));

    if (rulesToAdd?.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rulesToAdd,
      });
    }
  } catch (e) {
    console.error("Error updating dynamic rules:", e);
  }
}
