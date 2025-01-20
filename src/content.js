(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentProblem = "";
    let currentVideoBookmarks = [];
    console.log("12");
    const hidingTags = () => {
        const tagElements = document.querySelectorAll(
            "div.roundbox.borderTopRound.borderBottomRound"
        );
        // Iterate over each tag element and change its text color to black

        tagElements.forEach((tag) => {
            tag.style.backgroundColor = "black";
        });
        const upper = document.querySelectorAll(
            "div.menu-box.roundbox.borderTopRound.borderBottomRound"
        );
        // Iterate over each tag element and change its text color to black

        upper.forEach((menu) => {
            menu.style.backgroundColor = "";
        });
        
        const hideTitle = document.querySelectorAll("span.tag-box");
        hideTitle.forEach((hide) => {
            hide.removeAttribute("title");
        });
    };
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, problemId } = obj;

        if (type === "NEW") {
            currentProblem = problemId;
            hidingTags();
        }
    });
})();
