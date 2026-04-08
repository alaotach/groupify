const alert = document.createElement("div");
alert.className = "alert";
alert.style.display = "none";
document.body.insertBefore(alert, document.body.firstChild);

document.getElementById("saveBtn").addEventListener("click", async () => {
    const name = document.getElementById("windowGroupName").value.trim();
    if (name) {
        const { groups, tempWindowTabs } = await chrome.storage.local.get(["groups", "tempWindowTabs"]);
        let newGroups = groups;
        if (!newGroups || Array.isArray(newGroups)) newGroups = {};
        
        if (Object.values(newGroups).some(g => g.name === name)) {
            alert.style.display = "block";
            alert.textContent = "A group with that name already exists.";
            setTimeout(() => {
                alert.textContent = "";
                alert.style.display = "none";
            }, 5000);
            return;
        }

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

async function init() {
  const { tempWindowTabs } = await chrome.storage.local.get(["tempWindowTabs"]);
  const sub = document.getElementById("tabCount");
  const cnt = tempWindowTabs ? tempWindowTabs.length : 0;
  if (sub) sub.textContent = `${cnt} Window Tab${cnt !== 1 ? 's' : ''}`;
}

init();