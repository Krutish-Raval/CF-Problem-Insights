chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.url &&
      (tab.url.includes("https://codeforces.com/problemset/problem") ||
        tab.url.includes("https://codeforces.com/contest/"))
    ) {
      chrome.storage.local.get(["toggleTagsState", "toggleRatingState", "userHandle","toggleSortTagsState"], (result) => {
        const toggleTagsState = result.toggleTagsState || false;
        const toggleRatingState = result.toggleRatingState || false;
        const toggleSortTagsState = result.toggleSortTagsState || false;  
        const userHandle=result.userHandle;
        if (toggleTagsState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_TAGS",userHandle });
        }
  
        if (toggleRatingState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_RATING" });
        }
        if (toggleSortTagsState) {
          chrome.tabs.sendMessage(tabId, { type: "SORT_TAGS", userHandle });
      }
      });
    }
  });
  
