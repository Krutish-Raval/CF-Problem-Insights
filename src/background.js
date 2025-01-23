chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.url &&
      (tab.url.includes("https://codeforces.com/problemset/problem") ||
        tab.url.includes("https://codeforces.com/contest/"))
    ) {
      chrome.storage.local.get(["toggleTagsState", "toggleRatingState", "userHandle","toggleSortTagsState","toggleEstimatedRatingState"], (result) => {
        // https://codeforces.com/contest/2063/problem/A
        // https://codeforces.com/problemset/problem/2063/A
        let str1=tab.url;
        let contestID="";
        let index=str1[str1.length-1];
        if(tab.url.includes("https://codeforces.com/contest/")){
            contestID+=(str1[str1.length-14]);
            contestID+=(str1[str1.length-13]);
            contestID+=(str1[str1.length-12]);
            contestID+=(str1[str1.length-11]);
        }
        else{
            contestID+=(str1[str1.length-6]);
            contestID+=(str1[str1.length-5]); 
            contestID+=(str1[str1.length-4]);
            contestID+=(str1[str1.length-3]);
        }
        console.log(contestID,index);
        const toggleTagsState = result.toggleTagsState || false;
        const toggleRatingState = result.toggleRatingState || false;
        const toggleSortTagsState = result.toggleSortTagsState || false;  
        const toggleEstimatedRatingState = result.toggleEstimatedRatingState || false;
        const userHandle=result.userHandle || "";
        if (toggleTagsState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_TAGS",userHandle });
        }
        if (toggleRatingState) {
          chrome.tabs.sendMessage(tabId, { type: "HIDE_RATING" });
        }
        if (toggleSortTagsState) {
          chrome.tabs.sendMessage(tabId, { type: "SORT_TAGS", userHandle,contestID,index });
        }
        if (toggleEstimatedRatingState) {
          chrome.tabs.sendMessage(tabId, { type: "ESTIMATED_RATING" ,contestID,index});
        }
      });
    }
  });
  
  

