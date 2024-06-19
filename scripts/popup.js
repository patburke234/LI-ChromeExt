// to find the windowId of the active tab
let windowId;
chrome.tabs.onActivated.addListener(function (activeInfo) {
  windowId = activeInfo.windowId;
});

async function loadProfileInfo() {
  const data = await chrome.storage.local.get(["loop:data"]);
  console.log(data["loop:data"]);
  const { basicProfile, connections } = JSON.parse(data["loop:data"]);
  document.getElementById("profilePic").src = basicProfile.picture;
  document.getElementById("profileFirstName").textContent =
    basicProfile.firstName;
  document.getElementById("numConnections").textContent = connections.length;
}

// Self-invocation async function
(async () => {
  loadProfileInfo();
})().catch((err) => {
  console.error(err);
  throw err;
});
