async function loadGroups() {
  const d = await chrome.storage.local.get(["groups", "tempTabs"]);
  let groups = d.groups;
  if (!groups || Array.isArray(groups)) groups = {};
  const tempTabs = d.tempTabs || [];
  const cunt = document.getElementById("groups");
  cunt.innerHTML = "";
  Object.entries(groups).forEach(([id, group]) => {
    const btn = document.createElement("button");
    btn.textContent = group.name;
    btn.className = "group-btn";
    btn.onclick = async () => {
      tempTabs.forEach(t => {
        const e = group.tabs.some(x => x.url === t.url);
        if (!e) {
          group.tabs.push(t);
        }
      });
      await chrome.storage.local.set({ groups });
      window.close();
    };
    cunt.appendChild(btn);
  });
}

document.getElementById("createeee").addEventListener("click", async () => {
    const name = document.getElementById("newName").value;
    if (name) {
        const d = await chrome.storage.local.get(["groups", "tempTabs"]);
        let groups = d.groups;
        if (!groups || Array.isArray(groups)) groups = {};
        const tempTabs = d.tempTabs || [];
        const id = Date.now().toString();
        groups[id] = { name, tabs: tempTabs };
        await chrome.storage.local.set({ groups });
        window.close();
    }
});

document.getElementById("newName").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("createeee").click();
    }
});

loadGroups();