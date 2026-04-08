chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    "id": "addToGroup",
    "title": "Add tab to a group",
    "contexts": ["page", "tab"]
    });
});