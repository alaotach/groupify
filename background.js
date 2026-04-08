chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    "id": "addToGroup",
    "title": "Add tab to a group",
    "contexts": ["page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToGroup") {
    await chrome.storage.local.set({
      tempTab: {
        url: tab.url,
        title: tab.title
      }
    });
    chrome.windows.create({
      url: "selector.html",
      type: "popup",
      width: 300,
      height: 400
    });
  }
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "addToGroup") {
    await chrome.storage.local.set({
        tempTab: {
            url: tab.url,
            title: tab.title
        }
    });
    chrome.windows.create({
        url: "selector.html",
        type: "popup",
        width: 300,
        height: 400
    })
  }
});