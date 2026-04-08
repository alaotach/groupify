document.getElementById("saveBtn").addEventListener("click", async () => {
    const name = document.getElementById("windowGroupName").value;
    if (name) {
        const { groups, tempWindowTabs } = await chrome.storage.local.get(["groups", "tempWindowTabs"]);
        let newGroups = groups;
        if (!newGroups || Array.isArray(newGroups)) newGroups = {};
        
        const id = Date.now().toString();
        newGroups[id] = { name, tabs: tempWindowTabs || [] };
        
        await chrome.storage.local.set({ groups: newGroups });
        window.close();
    } else {
        document.getElementById("windowGroupName").focus();
    }
});

document.getElementById("windowGroupName").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("saveBtn").click();
    }
});