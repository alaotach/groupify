async function update() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "addToGroup",
    title: "Add tab to a group",
    contexts: ["page"]
  });

  const data = await chrome.storage.local.get("groups");
  const groups = data.groups || {};
  if (!Array.isArray(groups)) {
    Object.entries(groups).forEach(([id, group]) => {
      chrome.contextMenus.create({
        id: `group-${id}`,
        parentId: "addToGroup",
        title: group.name,
        contexts: ["page"]
      });
    });
  }

  chrome.contextMenus.create({
    id: "selectorOpen",
    parentId: "addToGroup",
    title: "Add to new group...",
    contexts: ["page"]
  });
}

chrome.runtime.onInstalled.addListener(update);
chrome.runtime.onStartup.addListener(update);
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.groups) {
        update();
    }
});

let lastSel = [];
chrome.tabs.onHighlighted.addListener(async () => {
    const tabs = await chrome.tabs.query({ highlighted: true, currentWindow: true });
    if (tabs.length > 1) {
        lastSel = tabs;
    } else if (tabs.length === 1 && lastSel.length > 0) {
        const sel = lastSel.find(t => t.id === tabs[0].id);
        if (!sel) {
            lastSel = [];
        }
    }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "selectorOpen" || info.menuItemId === "addToGroup") {
    let tabs = await chrome.tabs.query({ highlighted: true, currentWindow: true });
    
    if (tabs.length === 1 && lastSel.length > 1) {
        const wasInSelection = lastSel.find(t => t.id === tabs[0].id);
        if (wasInSelection) {
            tabs = lastSel;
        }
    }

    const tabData = tabs.map(t => ({ url: t.url, title: t.title }));
    await chrome.storage.local.set({ tempTabs: tabData });
    chrome.windows.create({
      url: "selector.html",
      type: "popup",
      width: 350,
      height: 500
    });
  }
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "addToGroup") {
    const tabs = await chrome.tabs.query({ highlighted: true, currentWindow: true });
    const tabData = tabs.map(t => ({ url: t.url, title: t.title }));
    await chrome.storage.local.set({ tempTabs: tabData });
    chrome.windows.create({
        url: "selector.html",
        type: "popup",
        width: 350,
        height: 500
    });
  } else if (command === "saveWindow") {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabData = tabs.map(t => ({ url: t.url, title: t.title }));
    await chrome.storage.local.set({ tempWindowTabs: tabData });
    chrome.windows.create({
        url: "save_window.html",
        type: "popup",
        width: 350,
        height: 500
    });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.menuItemId.startsWith("group-")) return;
    const groupId = info.menuItemId.replace("group-", "");
    const data = await chrome.storage.local.get("groups");
    const groups = data.groups || {};
    if (!groups[groupId]) return;
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        highlighted: true
    });
    tabs.forEach(t => {
        const exists = groups[groupId].tabs.some(x => x.url === t.url);
        if (!exists) {
        groups[groupId].tabs.push({
            url: t.url,
            title: t.title
        });
        }
    });
    await chrome.storage.local.set({ groups });
});