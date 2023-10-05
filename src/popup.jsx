const inputElement = document.getElementById("text");
const outputElement = document.getElementById("output");
const toggleSwitch = document.getElementById("toggleSwitch");
const toggleStatus = document.getElementById("toggleStatus");
const tweetDebug = document.getElementById("tweetDebug");

toggleSwitch.addEventListener("change", (event) => {
  if (event.target.checked) {
    toggleStatus.textContent = "sus the vibe";

    chrome.runtime.sendMessage({ action: "startAnalysis" });
  } else {
    toggleStatus.textContent = "let it slide";

    chrome.runtime.sendMessage({ action: "stopAnalysis" });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let toggleSwitch = document.getElementById("toggleSwitch");

  chrome.storage.sync.get("isColorizingEnabled", function (data) {
    toggleSwitch.checked = data.isColorizingEnabled || false;

    if (toggleSwitch.checked) {
      toggleStatus.textContent = "sus the vibe";
    } else {
      toggleStatus.textContent = "let it slide";
    }
  });

  toggleSwitch.addEventListener("change", function () {
    chrome.storage.sync.set({ isColorizingEnabled: toggleSwitch.checked });
  });
});
