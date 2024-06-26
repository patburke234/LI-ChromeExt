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
  async () => {
    if (message.action === "newData") {
      chrome.storage.local
        .set({
          "loop:data": message.profileData,
        })
        .then(() => console.log("Data saved to local storage"))
        .catch((err) => console.log(err));

      const payload = JSON.parse(message.profileData);

      //TODO: Handle use case where we've saved it since last update?
      fetch(
        "https://9rsyra6emj.execute-api.us-east-2.amazonaws.com/default/extension-sync",
        {
          method: "POST",
          headers: {
            "x-api-key": "N9aEEDvjmPaMWtqfM9DfWahlNufZNam83ctwRW1Q",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: payload.basicProfile.publicIdentifier,
            ...payload,
          }),
        }
      )
        .then(() => console.log("Data sent to backend API"))
        .catch((err) => console.log(err));
    }
  };
});

// to receive messages from popup script
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === "toggleLoopPanel") {
      chrome.storage.local
        .set({
          "loop:data": message.profileData,
        })
        .then(() => console.log("Data saved to local storage"))
        .catch((err) => console.log(err));

      chrome.sidePanel.open({ windowId, tabId });
    }
  })();
});
