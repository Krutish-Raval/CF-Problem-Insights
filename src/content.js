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

    const hidingTags = (tagColor, userHandle) => {

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
            const originalBackgroundColor = window.getComputedStyle(tag).backgroundColor;
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
                    tag.style.backgroundColor = originalBackgroundColor;
                    tag.style.userSelect = "";
                    tag.style.color = "black";
                    // if (tagBox && OriginalTitle) {
                    //     tagBox.setAttribute("title", OriginalTitle);
                    // }
                } else {
                    // Set background back to tagColor
                    tag.style.backgroundColor = normalizedTagColor;
                    tag.style.userSelect = "none";
                    tag.style.color = normalizedTagColor;
                    // if (tagBox) {
                    //     tagBox.removeAttribute("title");
                    // }
                }
            });
        });

    };

    const sortTags = async (userHandle) => {
        console.log("User Handle:", userHandle);
        const apiUrl = `https://codeforces.com/api/user.status?handle=${userHandle}&from=1&count=50000`;
        console.log("API URL:", apiUrl);
        try {
            console.log("Fetching data from Codeforces API...");
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log("Data:", data);
            if (data.status !== "OK") {
                console.error("Failed to fetch data from Codeforces API.");
                return;
            }

            const submissions = data.result;
            const tagCount = {};
            console.log("Submissions:", submissions);
            // Count occurrences of each tag in solved problems
            submissions.forEach((submission) => {
                if (submission.verdict === "OK" && submission.problem.tags) {
                    submission.problem.tags.forEach((tag) => {
                        tagCount[tag] = (tagCount[tag] || 0) + 1;
                    });
                }
            });

            // Collect tags visible on the page
            const tagElements = document.querySelectorAll("span.tag-box");
            const tagDataOnPage = Array.from(tagElements).map((tagElement) => {
                const tagText = tagElement.textContent.trim();
                return {
                    element: tagElement,
                    tag: tagText,
                    count: tagCount[tagText] || 0, // Use count from API or default to 0
                };
            });

            console.log("Tag Data on Page Before Sorting:", tagDataOnPage);

            // Sort the tags by count in descending order
            const sortedTags = tagDataOnPage.sort((a, b) => b.count - a.count);
            let i = 0;
            tagElements.forEach((tagElement) => {
                tagElement.textContent = `${sortedTags[i].tag} (${sortedTags[i].count})`;
                i++;
            });
        }
        catch (error) {
            console.error("Error fetching data from Codeforces API:", error);
        }
    };
    const hidingRating = (ratingColor) => {
        const normalizedRatingColor = normalizeColor(ratingColor); // Convert ratingColor to RGB
        const difficultyTags = document.querySelector("span.tag-box[title='Difficulty']");
        if (difficultyTags) {
            const parent = difficultyTags.closest("div.roundbox.borderTopRound.borderBottomRound"); // Get the parent container
            if (parent) {
                const originalBackgroundColor = window.getComputedStyle(parent).backgroundColor;
                parent.style.backgroundColor = normalizedRatingColor;
                parent.style.userSelect = "none"; // Disable text selection
                parent.style.color = normalizedRatingColor;

                parent.addEventListener("click", () => {
                    const currentBgColor = window.getComputedStyle(parent).backgroundColor;

                    if (currentBgColor === normalizedRatingColor) {
                        // Restore original state
                        parent.style.backgroundColor = originalBackgroundColor;
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
        const { type, userHandle } = obj;

        chrome.storage.local.get(["tagColor", "ratingColor"], (result) => {
            const tagColor = result.tagColor || "black";
            const ratingColor = result.ratingColor || "brown";

            if (type === "HIDE_TAGS") {
                hidingTags(tagColor, userHandle);
            } else if (type === "HIDE_RATING") {
                hidingRating(ratingColor);
            }
            else if (type === "SORT_TAGS") {
                sortTags(userHandle); // Call sortTags function
            }

        });
    });
})();
