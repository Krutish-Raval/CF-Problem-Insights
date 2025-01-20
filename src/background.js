chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // console.log("Hi");
    if (
        changeInfo.status === "complete" && // Ensures the tab is fully loaded
        tab.url && (tab.url.includes("https://codeforces.com/problemset/problem") || tab.url.includes("https://codeforces.com/contest/") )
    ) {
        try {
            // Extract the problem ID from the URL
            const url = new URL(tab.url);
            const pathParts = url.pathname.split('problem/');
            console.log(url);
            console.log(pathParts);
            const problemId = pathParts[pathParts.length - 1]; // Last part of the path
            console.log("Problem ID:", problemId);

            // Send a message to content.js
            chrome.tabs.sendMessage(tabId, {
                type: "NEW",
                problemId: problemId,
            });
        } catch (error) {
            console.error("Error processing the URL:", error);
        }
    }
});
