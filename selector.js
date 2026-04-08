async function loadGroups() {
  const d = await chrome.storage.local.get(["groups", "tempTab"]);
  let groups = d.groups;
  if (!groups || Array.isArray(groups)) groups = {};
  const tempTab = d.tempTab;
  const cunt = document.getElementById("groups");
  cunt.innerHTML = "";
  Object.entries(groups).forEach(([id, group]) => {
    const btn = document.createElement("button");
    btn.textContent = group.name;
    btn.onclick = async () => {
      group.tabs.push(tempTab);
      await chrome.storage.local.set({ groups });
      window.close();
    };
    cunt.appendChild(btn);
  });
}

loadGroups();