document.getElementById("createGroup").addEventListener("click", () => {
    const name = document.getElementById("groupName").value;
    if (name) {
        const d = await chrome.storage.local.get("groups");
        const groups = d.groups || [];
        const id = Date.now().toString();
        groups[id] = { name, tabs: [] };
        await chrome.storage.local.set({ groups });
        alert("Group created!");
        location.reload();
    }