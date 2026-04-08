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
    btn.onclick = async () => {
      group.tabs.push(...tempTabs);
      await chrome.storage.local.set({ groups });
      window.close();
    };
    cunt.appendChild(btn);
  });
}

loadGroups();