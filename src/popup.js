document.addEventListener("DOMContentLoaded", () => {
  const toggleTags = document.getElementById("toggle-tags");
  const toggleRating = document.getElementById("toggle-rating");
  const tagColorPicker = document.getElementById("tag-color-picker");
  const ratingColorPicker = document.getElementById("rating-color-picker");
  const saveButton = document.getElementById("save-button");
  const tagColorPreview = document.getElementById("tag-color-preview");
  const ratingColorPreview = document.getElementById("rating-color-preview");
  const userHandleInput = document.getElementById("user-handle");
  const saveUserHandleButton = document.getElementById("save-user-handle");
  const toggleSortTags = document.getElementById("toggle-sort-tags");

  chrome.storage.local.get(["toggleSortTagsState"], (result) => {
    toggleSortTags.checked = result.toggleSortTagsState || false;
  });
  // Load saved states and colors
  chrome.storage.local.get(["toggleTagsState", "toggleRatingState", "tagColor", "ratingColor"], (result) => {
    toggleTags.checked = result.toggleTagsState || false;
    toggleRating.checked = result.toggleRatingState || false;
    tagColorPicker.value = result.tagColor || "#ced4da";
    ratingColorPicker.value = result.ratingColor || "#1e90ff";
    // Update the color previews
    tagColorPreview.style.backgroundColor = tagColorPicker.value;
    ratingColorPreview.style.backgroundColor = ratingColorPicker.value;
  });
  chrome.storage.local.get("userHandle", (result) => {
    userHandleInput.value = result.userHandle || "";
  });
  saveUserHandleButton.addEventListener("click", async () => {
    const userHandle = userHandleInput.value.trim(); // Get the value of the user handle
    const apiUrl=`https://codeforces.com/api/user.info?handles=${userHandle}&checkHistoricHandles=false`;
    const response = await fetch(apiUrl);
    const ifUserHandleExist=await response.json();

    if (ifUserHandleExist.status==="OK") {
      chrome.storage.local.set({ userHandle }, () => {
        alert("User handle saved successfully!");
      });
    } else {
      alert("Please enter a valid user handle.");
    }
  });
  // Update preview color on selection
  const updatePreviewColor = (picker, preview) => {
    preview.style.backgroundColor = picker.value;
  };

  tagColorPicker.addEventListener("change", () => updatePreviewColor(tagColorPicker, tagColorPreview));
  ratingColorPicker.addEventListener("change", () => updatePreviewColor(ratingColorPicker, ratingColorPreview));
  toggleSortTags.addEventListener("change", () => {
    saveToggleStateAndReload("toggleSortTagsState", toggleSortTags.checked);
  });

  // Save button logic
  saveButton.addEventListener("click", () => {
    const tagColor = tagColorPicker.value;
    const ratingColor = ratingColorPicker.value;

    chrome.storage.local.set({ tagColor, ratingColor }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });

  // Save toggle state and reload the active tab
  const saveToggleStateAndReload = (key, state) => {
    chrome.storage.local.set({ [key]: state }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  };

  // Add event listeners for toggles
  toggleTags.addEventListener("change", () => {
    saveToggleStateAndReload("toggleTagsState", toggleTags.checked);
  });

  toggleRating.addEventListener("change", () => {
    saveToggleStateAndReload("toggleRatingState", toggleRating.checked);
  });
});

