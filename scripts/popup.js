let panelVisible = false;

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleLoopPanel") {
    console.log("Received message from content.js");
    togglePanel();
  }
});

function togglePanel() {
  panelVisible = !panelVisible;
  // Show or hide the side panel based on the panelVisible variable
  // You can use JavaScript to manipulate the DOM and show/hide the panel

  console.log("Panel visibility toggled");
}
