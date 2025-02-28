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
    
    const filteredTagElements = Array.from(tagElements).filter(
      (tag) => tag.querySelector("span.tag-box") 
    );

    const normalizedTagColor = normalizeColor(tagColor); // Convert tagColor to RGB

    filteredTagElements.forEach((tag, index) => {
      const uniqueClass = `tag-${index}`;
      tag.classList.add(uniqueClass);
      const tagBox = tag.querySelector("span.tag-box");
      if (tagBox && tagBox.getAttribute("title") === "Difficulty") {
        return;
      }
      tag.style.cursor = "pointer"; 
      const originalBackgroundColor =
        window.getComputedStyle(tag).backgroundColor;
      tag.style.backgroundColor = normalizedTagColor;
      tag.style.userSelect = "none";
      tag.style.color = normalizedTagColor;

      if (tagBox) {
        tagBox.removeAttribute("title");
      }
      tag.addEventListener("click", () => {
        const currentBgColor = window.getComputedStyle(tag).backgroundColor;
        if (currentBgColor === normalizedTagColor) {
          tag.style.backgroundColor = originalBackgroundColor;
          tag.style.userSelect = "";
          tag.style.color = "black";
        } else {
          tag.style.backgroundColor = normalizedTagColor;
          tag.style.userSelect = "none";
          tag.style.color = normalizedTagColor;
        }
      });
    });
  };

  const sortTags = async (userHandle) => {
    console.log("User Handle:", userHandle);
    
    const apiUrl = `https://codeforces.com/api/user.status?handle=${userHandle}`;
    // console.log("API URL:", apiUrl);
    try {
      // console.log("Fetching data from Codeforces API...");
      const response = await fetch(apiUrl);
      const data = await response.json();
      // console.log("Data:", data);
      if (data.status !== "OK") {
        console.error("Failed to fetch data from Codeforces API.");
        return;
      }

      const submissions = data.result;
      const tagCount = {};
      // console.log("Submissions:", submissions);
      // Count occurrences of each tag in solved problems
      const uniqueId = new Set();
      submissions.forEach((submission) => {
        if (submission.verdict === "OK" && submission.problem.tags) {
          const problemId = `${submission.problem.contestId}${submission.problem.index}`;
          // console.log(uniqueId.has(problemId));
          if (!uniqueId.has(problemId)) {
            uniqueId.add(problemId);

            submission.problem.tags.forEach((tag) => {
              tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
          }
        }
      });
      // console.log("Tag Count:", tagCount);

      const tagElements = document.querySelectorAll("span.tag-box");
      const tagDataOnPage = Array.from(tagElements).map((tagElement) => {
        const tagText = tagElement.textContent.trim();
        return {
          element: tagElement,
          tag: tagText,
          count: tagCount[tagText] || 0,
        };
      });

      // console.log("Tag Data on Page Before Sorting:", tagDataOnPage);
      const sortedTags = tagDataOnPage.sort((a, b) => b.count - a.count);
      let i = 0;
      tagElements.forEach((tagElement) => {
        if (tagElement.getAttribute("title") !== "Difficulty") {
          tagElement.textContent = `${sortedTags[i].tag} (${sortedTags[i].count})`;
        } else {
          tagElement.textContent = `${sortedTags[i].tag}`;
        }
        i++;
      });
    } catch (error) {
      console.error("Error fetching data from Codeforces API:", error);
    }
  };
  const hidingRating = (ratingColor) => {
    const normalizedRatingColor = normalizeColor(ratingColor); // Convert ratingColor to RGB
    const difficultyTags = document.querySelector(
      "span.tag-box[title='Difficulty']"
    );
    if (difficultyTags) {
      const parent = difficultyTags.closest(
        "div.roundbox.borderTopRound.borderBottomRound"
      ); // Get the parent container
      if (parent) {
        const originalBackgroundColor =
          window.getComputedStyle(parent).backgroundColor;
        parent.style.backgroundColor = normalizedRatingColor;
        parent.style.userSelect = "none";
        parent.style.color = normalizedRatingColor;
        parent.style.cursor = "pointer"; 
        parent.addEventListener("click", () => {
          const currentBgColor =
            window.getComputedStyle(parent).backgroundColor;
          if (currentBgColor === normalizedRatingColor) {
            parent.style.backgroundColor = originalBackgroundColor;
            parent.style.userSelect = "";
            parent.style.color = "black";
          } 
          else {
            parent.style.backgroundColor = normalizedRatingColor;
            parent.style.userSelect = "none";
            parent.style.color = normalizedRatingColor;
          }
        });
      }
    }
  };

  const fetchRatingFromClist = (contestID, index) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "FETCH_CLIST", contestID },
        (response) => {
          if (response.success) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.html, "text/html");
            const rows = doc.querySelectorAll("span.coder-color");
            const ratings = Array.from(rows).map((row) =>
              row.textContent.trim()
            );
            let len = ratings.length;
            const indexCol = [];
            let rate = null;
            const col = doc.querySelectorAll("span.nowrap");
            let i = 0;
            col.forEach((row) => {
              const link = row.querySelectorAll("a");
              link.forEach((row1) => {
                let temp = row1.getAttribute("href");
                if (temp.includes(index)) {
                  rate = ratings[i];
                }
              });
              i++;
            });
            console.log("Rating:", rate);
            resolve(rate);
          } else {
            reject(response.error);
          }
        }
      );
    });
  };

  const estimatedRatingFunc = async (contestID, index) => {
    try {
      const ratings = await fetchRatingFromClist(contestID, index);
      // if (ratings != null) {
      // const problemIndex = index.charCodeAt(0) - 65;
      const estimatedRating = ratings || "N/A";
      console.log(
        `Estimated Rating for problem ${contestID}${index}: ${estimatedRating}`
      );

      const tagsContainer = document.querySelector(
        "div.roundbox.sidebox.sidebar-menu.borderToxRound"
      );

      if (tagsContainer) {
        let ratingDiv = tagsContainer.previousElementSibling; 

        if (
          !ratingDiv ||
          !ratingDiv.classList.contains("estimated-rating-container")
        ) {
          ratingDiv = document.createElement("div");
          ratingDiv.classList.add("estimated-rating-container", "caption");
          ratingDiv.style.border = "1px solid #ccc";
          ratingDiv.style.padding = "2px";
          ratingDiv.style.marginBottom = "20px";
          ratingDiv.style.display = "flex";
          ratingDiv.style.alignItems = "center";
          ratingDiv.style.justifyContent = "start";
          ratingDiv.style.backgroundColor = "white";
          ratingDiv.style.borderRadius = "5px";
          tagsContainer.parentNode?.insertBefore(ratingDiv, tagsContainer);
        }

        /**
          verdana,arial,sans-serif
          color: #3B5998;
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.2em 0;
          position: relative; 
         */

        const toggleButton = document.createElement("button");
        toggleButton.innerHTML =
          "→ <span class='rating-text'>Estimated Rating</span>";
        toggleButton.style.backgroundColor = "#fff";
        toggleButton.style.color = "#3B5998";
        toggleButton.style.border = "1px";
        toggleButton.style.borderColor = "black";
        toggleButton.style.borderRadius = "4px";
        toggleButton.style.padding = "10px 0px 10px 6px";
        toggleButton.style.cursor = "pointer";
        toggleButton.style.fontFamily = "verdana,arial,sans-serif";
        toggleButton.style.fontSize = "1.5rem";
        toggleButton.style.fontWeight = "bold";
        toggleButton.style.transition = "background-color 0.3s";
        toggleButton.addEventListener("mouseover", () => {
          const ratingText = toggleButton.querySelector(".rating-text");
          ratingText.style.textDecoration = "underline";
        });
        toggleButton.addEventListener("mouseout", () => {
          const ratingText = toggleButton.querySelector(".rating-text");
          ratingText.style.textDecoration = "none";
        });

        const ratingTextContainer = document.createElement("div");
        ratingTextContainer.style.marginLeft = "10px";
        ratingTextContainer.style.overflow = "hidden";
        ratingTextContainer.style.transition = "max-width 0.3s ease-out";
        ratingTextContainer.style.maxWidth = "0";
        ratingTextContainer.style.whiteSpace = "nowrap";
        
        const ratingText = document.createElement("span");
        ratingText.textContent = `: ${estimatedRating}`;
        ratingText.style.color = "#3b5998";
        ratingText.style.fontFamily = "verdana,arial,sans-serif";
        ratingText.style.fontWeight = "bold";
        ratingText.style.fontSize = "1.5rem";
        ratingText.style.margin = "0px 0px 0px -2px";
        
        ratingTextContainer.appendChild(ratingText);

        toggleButton.addEventListener("click", () => {
          const isHidden = ratingTextContainer.style.maxWidth === "0px";
          ratingTextContainer.style.maxWidth = isHidden ? "150px" : "0px";
        });

        ratingDiv.innerHTML = "";
        ratingDiv.appendChild(toggleButton);
        ratingDiv.appendChild(ratingTextContainer);
        const clistNote = document.createElement("a");
        clistNote.textContent = "CLIST RATING";

        // Styling the note
        clistNote.style.position = "absolute"; // Position relative to the parent container
        clistNote.style.bottom = "5px"; // Position 5px from the bottom
        clistNote.style.right = "10px"; // Position 10px from the right
        clistNote.style.color = "#777"; // Subtle gray color for text
        clistNote.style.fontSize = "0.8rem"; // Small font size
        clistNote.style.fontFamily = "verdana, arial, sans-serif"; // Less bold font family
        clistNote.style.fontWeight = "normal"; // Reduce boldness
        clistNote.style.textDecoration = "none"; // Remove underlining
        clistNote.style.pointerEvents = "auto"; // Allow interaction with the link
        clistNote.href = `https://clist.by/problems/?search=${contestID}&resource=1`; // Corrected URL
        clistNote.target = "_blank"; // Open in a new tab
        clistNote.cursor ="pointer";
        clistNote.style.marginTop = "15px";
        
        ratingDiv.style.position = "relative";


        ratingDiv.appendChild(clistNote);
      }

      // else {
      //   console.warn(`No ratings found for problem ${contestID}${index}`);
      // }
    } catch (error) {
      console.error("Error in estimatedRating:", error);
    }
  };

  chrome.runtime.onMessage.addListener((obj) => {
    const { type, userHandle, contestID, index } = obj;
    chrome.storage.local.get(["tagColor", "ratingColor"], (result) => {
      const tagColor = result.tagColor || "black";
      const ratingColor = result.ratingColor || "brown";
      if (type === "HIDE_TAGS") {
        hidingTags(tagColor, userHandle);
      } else if (type === "HIDE_RATING") {
        hidingRating(ratingColor);
      } else if (type === "SORT_TAGS") {
        sortTags(userHandle);
      } else if (type === "ESTIMATED_RATING") {
        console.log("Contest ID:", contestID, "Index:", index); 
        estimatedRatingFunc(contestID, index);
      }
    });
  });
})();
