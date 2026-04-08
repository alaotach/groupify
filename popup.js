const alert = document.createElement("div");
alert.className = "alert";
alert.style.display = "none";
document.body.appendChild(alert);

const COLORS = ['ic-0','ic-1','ic-2','ic-3','ic-4','ic-5'];

function getColorClass(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

const groupNameInput = document.getElementById("groupName");
if (groupNameInput) {
    groupNameInput.addEventListener("keypress", (e) => {      
        if (e.key === "Enter") {
            const btn = document.getElementById("createGroup");
            if (btn) btn.click();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "/" && (!document.activeElement || document.activeElement.tagName !== "INPUT")) {
        e.preventDefault();
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.focus();
        return;
    }
    
    if (document.activeElement && document.activeElement.tagName !== "INPUT" && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const groupNameInput = document.getElementById("groupName");
        if (groupNameInput) groupNameInput.focus();
    }
});

const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll("#groups > div");
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


const createGroupBtn = document.getElementById("createGroup");
if (createGroupBtn) {
    createGroupBtn.addEventListener("click", async () => {  
        const name = document.getElementById("groupName").value.trim();
        if (name) {
            const d = await chrome.storage.local.get("groups");
            let groups = d.groups;
            if (!groups || Array.isArray(groups)) groups = {};
            if (Object.values(groups).some(g => g.name === name)) {
                alert.style.display = "block";
                alert.textContent = "A group with that name already exists.";
                setTimeout(() => {
                    alert.textContent = "";
                    alert.style.display = "none";
                }, 5000);
                return;
            }
            const id = Date.now().toString();
            groups[id] = { name, tabs: [] };
            await chrome.storage.local.set({ groups });
            document.getElementById('groupName').value = '';
            loadGroups();
        }
    });
}

const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
    saveBtn.addEventListener("click", async () => {      
        const name = document.getElementById("groupName").value.trim();
        if (name) {
            const d = await chrome.storage.local.get("groups");
            let groups = d.groups;
            if (!groups || Array.isArray(groups)) groups = {};
            if (Object.values(groups).some(g => g.name === name)) {
                alert.style.display = "block";
                alert.textContent = "A group with that name already exists.";
                setTimeout(() => {
                    alert.textContent = "";
                    alert.style.display = "none";
                }, 5000);
                return;
            }
            const tabs = await chrome.tabs.query({ currentWindow: true });
            const tabData = tabs.map(t => ({ url: t.url, title: t.title }));        
            const id = Date.now().toString();
            groups[id] = { name, tabs: tabData };
            await chrome.storage.local.set({ groups });
            document.getElementById('groupName').value = '';
            loadGroups();
        } else {
            alert.style.display = "block";
            alert.textContent = "Please enter a group name first.";
            setTimeout(() => {
                alert.textContent = "";
                alert.style.display = "none";
            }, 5000);
        }
    });
}

async function loadGroups() {
  const { groups } = await chrome.storage.local.get("groups");
  const cunt = document.getElementById("groups");
  if (!cunt) return;
  cunt.innerHTML = "";
  const groupCountEl = document.getElementById("groupCount");
  
  if (!groups || Array.isArray(groups) || Object.keys(groups).length === 0) {
    if (groupCountEl) groupCountEl.textContent = "0 Groups";
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No groups yet. Create one below.";
    cunt.appendChild(emptyState);
    return;
  }
  
  const entries = Object.entries(groups);
  if (groupCountEl) groupCountEl.textContent = `${entries.length} Group${entries.length !== 1 ? 's' : ''}`;

  entries.forEach(([id, group]) => {
    const cuntin = document.createElement("div");

    const div = document.createElement("div");
    div.className = "groupItems";
    
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

    const btn = document.createElement("button");
    btn.className = "group-btn";
    btn.appendChild(left);
    btn.onclick = () => {
      const urls = group.tabs.map(t => t.url);
      if (urls.length > 0) {
        chrome.windows.create({ url: urls });
      } else {
        alert.style.display = "block";
        alert.textContent = "No tabs in this group.";
        setTimeout(() => {
                alert.textContent = "";
                alert.style.display = "none";
            }, 5000);
            return;
      }
    };

    const actions = document.createElement('div');
    actions.className = 'group-actions';

    const eyeBtn = document.createElement('button');
    eyeBtn.className = 'icon-btn';
    eyeBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/>
    </svg>`;

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn del";
    delBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`;
    
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      await deleteGroup(id);
      loadGroups();
    };
    
    actions.appendChild(eyeBtn);
    actions.appendChild(delBtn);

    const tabsDiv = document.createElement("div");
    tabsDiv.className = "tabs-list";
    tabsDiv.style.display = "none";
    tabsDiv.style.marginBottom = "5px";
    if (group.tabs.length > 0) {
        group.tabs.forEach(t => {
            const tabs = document.createElement("div");
            tabs.textContent = "\u2022 " + (t.title || t.url);
            Object.assign(tabs.style, {
                fontSize: "12px",
                marginLeft: "10px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            });
            tabsDiv.appendChild(tabs);
        });
    } else {
        const noTabs = document.createElement("div");
        noTabs.textContent = "No tabs in this group.";
        noTabs.style.fontSize = "12px";
        noTabs.style.marginLeft = "10px";
        noTabs.style.color = "gray";
        tabsDiv.appendChild(noTabs);
    }

    btn.oncontextmenu = (e) => {
        e.preventDefault();
        tabsDiv.style.display = tabsDiv.style.display === "none" ? "block" : "none";
    };
    
    eyeBtn.onclick = (e) => {
        e.stopPropagation();
        tabsDiv.style.display = tabsDiv.style.display === "none" ? "block" : "none";
    };

    div.appendChild(btn);
    div.appendChild(actions);
    cuntin.appendChild(div);
    cuntin.appendChild(tabsDiv);
    cunt.appendChild(cuntin);
  });
}

async function showTabsList(id) {
    
}

async function deleteGroup(id) {
    const {groups} = await chrome.storage.local.get("groups");
    delete groups[id];
    await chrome.storage.local.set({ groups });
};

loadGroups();
