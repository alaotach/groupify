const COLORS = ['ic-0','ic-1','ic-2','ic-3','ic-4','ic-5'];

function getColorClass(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

const alertBox = document.createElement("div");
alertBox.className = "alert";
alertBox.style.display = "none";
document.body.insertBefore(alertBox, document.body.firstChild);

async function loadGroups() {
  const d = await chrome.storage.local.get(["groups", "tempTabs"]);
  let groups = d.groups;
  if (!groups || Array.isArray(groups)) groups = {};
  const tempTabs = d.tempTabs || [];
  
  const sub = document.getElementById("tabCount");
  if (sub) sub.textContent = `${tempTabs.length} Tab${tempTabs.length !== 1 ? 's' : ''} Selected`;

  const cunt = document.getElementById("groups");
  if (!cunt) return;
  cunt.innerHTML = "";

  const entries = Object.entries(groups);
  if (entries.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.textContent = "No groups yet. Create one below.";
      cunt.appendChild(emptyState);
      return;
  }
  
  entries.forEach(([id, group]) => {
    const div = document.createElement("div");
    div.className = "groupItems";

    const btn = document.createElement("button");
    btn.className = "group-btn";
    
    const icon = document.createElement('div');
    icon.className = `group-icon ${getColorClass(group.name)}`;
    icon.textContent = group.name.charAt(0).toUpperCase();

    const info = document.createElement('div');
    info.className = 'group-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'group-name';
    nameEl.textContent = group.name;

    const countEl = document.createElement('div');
    countEl.className = 'group-count';
    const cnt = group.tabs ? group.tabs.length : 0;
    countEl.textContent = `${cnt} tab${cnt !== 1 ? 's' : ''}`;

    info.appendChild(nameEl);
    info.appendChild(countEl);

    const left = document.createElement('div');
    left.className = 'group-left';
    left.appendChild(icon);
    left.appendChild(info);
    
    btn.appendChild(left);
    div.appendChild(btn);
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
    cunt.appendChild(div);
  });
}

const createBtn = document.getElementById("createeee");
if (createBtn) {
    createBtn.addEventListener("click", async () => {    
        const nameInput = document.getElementById("newName");
        const name = nameInput ? nameInput.value.trim() : "";
        if (name) {
            const d = await chrome.storage.local.get(["groups", "tempTabs"]);       
            let groups = d.groups;
            if (!groups || Array.isArray(groups)) groups = {};

            if (Object.values(groups).some(g => g.name === name)) {
                alertBox.style.display = "block";
                alertBox.textContent = "A group with that name already exists.";    
                setTimeout(() => {
                    alertBox.textContent = "";
                    alertBox.style.display = "none";
                }, 2500);
                return;
            }

            const tempTabs = d.tempTabs || [];
            const id = Date.now().toString();
            groups[id] = { name, tabs: tempTabs };
            await chrome.storage.local.set({ groups });
            window.close();
        }
    });
}

const newNameInput = document.getElementById("newName");
if (newNameInput) {
    newNameInput.addEventListener("keypress", (e) => {        
        if (e.key === "Enter") {
            const btn = document.getElementById("createeee");
            if (btn) btn.click();
        }
    });
}

const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll("#groups > .groupItems, #groups > .empty-state");
        items.forEach(item => {
            if (item.classList.contains("empty-state")) {
                item.style.display = query ? "none" : "";
                return;
            }
            const nameEl = item.querySelector(".group-name");
            if (nameEl) {
                if (nameEl.textContent.toLowerCase().includes(query)) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            }
        });
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "/" && (!document.activeElement || document.activeElement.tagName !== "INPUT")) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
        return;
    }
    
    if (document.activeElement && document.activeElement.tagName !== "INPUT" && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const newNameInput = document.getElementById("newName");
        if (newNameInput) newNameInput.focus();
    }
});

loadGroups();

