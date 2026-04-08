const alert = document.createElement("div");
alert.className = "alert";
document.body.appendChild(alert);

setTimeout(() => {
    alert.textContent = "";
}, 5000);

document.getElementById("groupName").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("createGroup").click();
    }
});

document.addEventListener("keydown", (e) => {
    if (!document.getElementById("groupName").matches(":focus")) {
        document.getElementById("groupName").focus();
    }
});


document.getElementById("createGroup").addEventListener("click", async () => {
    const name = document.getElementById("groupName").value;
    if (name) {
        const d = await chrome.storage.local.get("groups");
        let groups = d.groups;
        if (!groups || Array.isArray(groups)) groups = {};
        if (Object.values(groups).some(g => g.name === name)) {
            alert.style.display = "block";
            alert.textContent = "A group with that name already exists.";
            setInterval(() => {
                alert.textContent = "";
                alert.style.display = "none";
            }, 5000);
            return;
        }
        const id = Date.now().toString();
        groups[id] = { name, tabs: [] };
        await chrome.storage.local.set({ groups });
        location.reload();
    }
});

document.getElementById("saveBtn").addEventListener("click", async () => {
    const name = document.getElementById("groupName").value;
    if (name) {
        const d = await chrome.storage.local.get("groups");
        let groups = d.groups;
        if (!groups || Array.isArray(groups)) groups = {};
        if (Object.values(groups).some(g => g.name === name)) {
            alert.style.display = "block";
            alert.textContent = "A group with that name already exists.";
            setInterval(() => {
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
        location.reload();
    } else {
        alert.style.display = "block";
        alert.textContent = "Please enter a group name first.";
        setInterval(() => {
            alert.textContent = "";
            alert.style.display = "none";
        }, 5000);
    }
});

async function loadGroups() {
  const { groups } = await chrome.storage.local.get("groups");
  const cunt = document.getElementById("groups");
  cunt.innerHTML = "";
  if (!groups || Array.isArray(groups)) return;
  Object.entries(groups).forEach(([id, group]) => {
    const cuntin = document.createElement("div");

    const div = document.createElement("div");
    div.className = "groupItems";

    const btn = document.createElement("button");
    btn.className = "group-btn";
    btn.textContent = `${group.name} (${group.tabs ? group.tabs.length : 0})`;
    btn.onclick = () => {
      const urls = group.tabs.map(t => t.url);
      if (urls.length > 0) {
        chrome.windows.create({ url: urls });
      } else {
        alert.style.display = "block";
        alert.textContent = "No tabs in this group.";
        setInterval(() => {
                alert.textContent = "";
                alert.style.display = "none";
            }, 5000);
            return;
      }
    };

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

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "X";
    delBtn.onclick = async () => {
      await deleteGroup(id);
      location.reload();
    };
    div.appendChild(btn);
    div.appendChild(delBtn);
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