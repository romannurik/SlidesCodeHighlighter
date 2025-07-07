chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight") {
    const { html, bgColor } = request;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log("No text selected.");
      return;
    }

    const range = selection.getRangeAt(0);
    const newNode = document.createElement("div");
    newNode.innerHTML = html;
    newNode.style.backgroundColor = bgColor;
    
    // This is a simplified approach. Google Slides has a complex editor,
    // so a more robust solution might be needed.
    range.deleteContents();
    range.insertNode(newNode);
  }
});
