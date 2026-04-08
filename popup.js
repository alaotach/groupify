document.getElementById("createGroup").addEventListener("click", async () => {
    const name = document.getElementById("groupName").value;
    if (name) {
        const d = await chrome.storage.local.get("groups");
        let groups = d.groups;
        if (!groups || Array.isArray(groups)) groups = {};
        const id = Date.now().toString();
        groups[id] = { name, tabs: [] };
        await chrome.storage.local.set({ groups });
        location.reload();
    }
});

async function loadGroups() {
  const { groups } = await chrome.storage.local.get("groups");
  const cunt = document.getElementById("groups");
  cunt.innerHTML = "";
  if (!groups || Array.isArray(groups)) return;
  Object.entries(groups).forEach(([id, group]) => {
    const div = document.createElement("div");
    div.className = "groupItems";

    const btn = document.createElement("button");
    btn.className = "group-btn";
    btn.textContent = group.name;
    btn.onclick = () => {
      const urls = group.tabs.map(t => t.url);
      if (urls.length > 0) {
        chrome.windows.create({ url: urls });
      } else {
        alert("No tabs in this group.");
      }
    };

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "X";
    delBtn.onclick = async () => {
      await deleteGroup(id);
      location.reload();
    };
    div.appendChild(btn);
    div.appendChild(delBtn);
    cunt.appendChild(div);
  });
}

async function deleteGroup(id) {
    const {groups} = await chrome.storage.local.get("groups");
    delete groups[id];
    await chrome.storage.local.set({ groups });
};

loadGroups();