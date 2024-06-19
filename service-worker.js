// to find the windowId of the active tab
let windowId;
let tabId;
chrome.tabs.onActivated.addListener(function (activeInfo) {
  windowId = activeInfo.windowId;
  tabId = activeInfo.tabId;
});

function getLocalStorage() {
  return JSON.stringify(localStorage["loop:data"]);
}

// to receive messages from popup script
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === "toggleLoopPanel") {
      chrome.storage.local
        .set({
          "loop:data": message.profileData,
        })
        .then(() => console.log("Data saved"));

      chrome.sidePanel.open({ windowId, tabId });
    }
  })();
});
