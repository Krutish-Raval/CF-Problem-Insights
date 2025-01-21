(() => {
    let currentProblem = "";

    // Utility function to convert color to RGB
    const normalizeColor = (color) => {
        const tempElement = document.createElement("div");
        tempElement.style.color = color;
        document.body.appendChild(tempElement);
        const computedColor = window.getComputedStyle(tempElement).color;
        document.body.removeChild(tempElement);
        return computedColor;
    };

    const hidingTags = (tagColor) => {
        console.log(window.localStorage.getItem("toggleState"));
        const tagElements = document.querySelectorAll(
            "div.roundbox.borderTopRound.borderBottomRound"
        );
        // Filter out unintended elements like menus
        const filteredTagElements = Array.from(tagElements).filter((tag) =>
            tag.querySelector("span.tag-box") // Ensure it contains span elements with class 'tag-box'
        );

        const normalizedTagColor = normalizeColor(tagColor); // Convert tagColor to RGB

        filteredTagElements.forEach((tag, index) => {
            const uniqueClass = `tag-${index}`;
            tag.classList.add(uniqueClass);
            const tagBox = tag.querySelector("span.tag-box");
            if (tagBox && tagBox.getAttribute("title") === "Difficulty") {
                return;
            }
            tag.style.backgroundColor = normalizedTagColor;
            tag.style.userSelect = "none"; // Disable text selection
            tag.style.color = normalizedTagColor;
            const OriginalTitle = tagBox ? tagBox.getAttribute("title") : null; // Capture the original title

            if (tagBox) {
                tagBox.removeAttribute("title");
            }

            // Add click event listener
            tag.addEventListener("click", () => {
                const currentBgColor = window.getComputedStyle(tag).backgroundColor;

                if (currentBgColor === normalizedTagColor) {
                    // Reset to original state
                    tag.style.backgroundColor = ""; 
                    tag.style.userSelect = ""; 
                    tag.style.color = "black"; 
                    if (tagBox && OriginalTitle) {
                        tagBox.setAttribute("title", OriginalTitle);
                    }
                } else {
                    // Set background back to tagColor
                    tag.style.backgroundColor = normalizedTagColor;
                    tag.style.userSelect = "none";
                    tag.style.color = normalizedTagColor;
                    if (tagBox) {
                        tagBox.removeAttribute("title");
                    }
                }
            });
        });
    };

    const hidingRating = (ratingColor) => {
        const normalizedRatingColor = normalizeColor(ratingColor); // Convert ratingColor to RGB
        const difficultyTags = document.querySelector("span.tag-box[title='Difficulty']");
        if (difficultyTags) {
            const parent = difficultyTags.closest("div.roundbox.borderTopRound.borderBottomRound"); // Get the parent container
            if (parent) {
                parent.style.backgroundColor = normalizedRatingColor; 
                parent.style.userSelect = "none"; // Disable text selection
                parent.style.color = normalizedRatingColor;

                parent.addEventListener("click", () => {
                    const currentBgColor = window.getComputedStyle(parent).backgroundColor;

                    if (currentBgColor === normalizedRatingColor) {
                        // Restore original state
                        parent.style.backgroundColor = ""; 
                        parent.style.userSelect = ""; 
                        parent.style.color = "black";
                    } else {
                        // Hide again
                        parent.style.backgroundColor = normalizedRatingColor; 
                        parent.style.userSelect = "none"; 
                        parent.style.color = normalizedRatingColor;
                    }
                });
            }
        }
    };

    chrome.runtime.onMessage.addListener((obj) => {
        const { type } = obj;

        chrome.storage.local.get(["tagColor", "ratingColor"], (result) => {
            const tagColor = result.tagColor || "black";
            const ratingColor = result.ratingColor || "brown";

            if (type === "HIDE_TAGS") {
                hidingTags(tagColor);
            } else if (type === "HIDE_RATING") {
                hidingRating(ratingColor);
            }
        });
    });
})();
