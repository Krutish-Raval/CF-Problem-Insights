chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    toggleTagsState: true,   // Default Setting
    toggleRatingState: true,
    toggleSortTagsState: false, 
    toggleEstimatedRatingState: true,
    tagColor: "#a3a3a3", 
    ratingColor: "#3B5998", 
    userHandle: ""
  }, () => {
    console.log("Default settings have been initialized.");
  });
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("onUpdated", tabId, changeInfo, tab);
  console.log("URL:", tab.url);
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    (tab.url.includes("https://codeforces.com/problemset/problem") ||
      tab.url.includes("https://codeforces.com/contest/"))
  ) {

    chrome.storage.local.get(
      [
        "toggleTagsState",
        "toggleRatingState",
        "userHandle",
        "toggleSortTagsState",
        "toggleEstimatedRatingState",
      ],
      (result) => {
        console.log("Result:", result);
        // https://codeforces.com/contest/2063/problem/A
        // https://codeforces.com/problemset/problem/2063/A
        let str1 = tab.url;
        let contestID = "";
        let index = "";
        if (str1[str1.length - 2] === "/")
          index = str1[str1.length - 1];
        else{
          index = str1[str1.length - 2];
          index += str1[str1.length - 1];
        }
        if (tab.url.includes("https://codeforces.com/contest/")) {
          if(index.length==1){
          contestID += str1[str1.length - 14];
          contestID += str1[str1.length - 13];
          contestID += str1[str1.length - 12];
          contestID += str1[str1.length - 11];
          }
          else{
            contestID += str1[str1.length - 15];
          contestID += str1[str1.length - 14];
          contestID += str1[str1.length - 13];
          contestID += str1[str1.length - 12];
          }
        } else {
          if(index.length==1){
          contestID += str1[str1.length - 6];
          contestID += str1[str1.length - 5];
          contestID += str1[str1.length - 4];
          contestID += str1[str1.length - 3];
          }
          else{
            contestID += str1[str1.length - 7];
          contestID += str1[str1.length - 6];
          contestID += str1[str1.length - 5];
          contestID += str1[str1.length - 4];
          }
        }
        console.log(contestID, index);
        console.log(result);
        const toggleTagsState = result.toggleTagsState || false;
        const toggleRatingState = result.toggleRatingState || false;
        const toggleSortTagsState = result.toggleSortTagsState || false;
        const toggleEstimatedRatingState =
          result.toggleEstimatedRatingState || false;
        const userHandle = result.userHandle || "";
        if (toggleTagsState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_TAGS", userHandle });
        }
        if (toggleRatingState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_RATING" });
        }
        if (toggleSortTagsState) {
          chrome.tabs.sendMessage(tabId, {
            type: "SORT_TAGS",
            userHandle,
            contestID,
            index,
          });
        }
        if (toggleEstimatedRatingState) {
          chrome.tabs.sendMessage(tabId, {
            type: "ESTIMATED_RATING",
            contestID,
            index,
          });
        }
      }
    );
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_CLIST") {
    const { contestID } = message;

    const searchUrl = `https://clist.by/problems/?search=${contestID}&resource=1`;
    fetch(searchUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        sendResponse({ success: true, html });
      })
      .catch((error) => {
        console.error("Error fetching data from clist.by:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

 
});
