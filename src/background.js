chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.url &&
      (tab.url.includes("https://codeforces.com/problemset/problem") ||
        tab.url.includes("https://codeforces.com/contest/"))
    ) {
      chrome.storage.local.get(["toggleTagsState", "toggleRatingState"], (result) => {
        const toggleTagsState = result.toggleTagsState || false;
        const toggleRatingState = result.toggleRatingState || false;
  
        if (toggleTagsState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_TAGS" });
        }
  
        if (toggleRatingState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_RATING" });
        }
      });
    }
  });
  