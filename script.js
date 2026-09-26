const defaultHomeUrl = "https://example.com";

const state = {
  tabs: [],
  activeTabId: null,
  nextTabId: 1,
};

const tabBar = document.getElementById("tabBar");
const addressBar = document.getElementById("addressBar");
const browserFrame = document.getElementById("browserFrame");
const frameOverlay = document.getElementById("frameOverlay");
const siteLock = document.getElementById("siteLock");

function createTab(url = defaultHomeUrl) {
  const id = state.nextTabId++;
  const tab = {
    id,
    title: getTabTitle(url),
    url,
    history: [url],
    historyIndex: 0,
  };

  state.tabs.push(tab);
  state.activeTabId = id;
  renderTabs();
  loadUrl(url, false);
}

function getTabTitle(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    return hostname || "New tab";
  } catch {
    return "New tab";
  }
}

function getActiveTab() {
  return state.tabs.find((tab) => tab.id === state.activeTabId) || state.tabs[0];
}

function renderTabs() {
  tabBar.innerHTML = "";

  state.tabs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = `tab ${tab.id === state.activeTabId ? "active" : ""}`;
    btn.type = "button";

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = tab.title;

    const close = document.createElement("button");
    close.className = "close-tab";
    close.type = "button";
    close.textContent = "×";
    close.title = "Close tab";
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });

    btn.appendChild(title);
    btn.appendChild(close);
    btn.addEventListener("click", () => {
      state.activeTabId = tab.id;
      const active = getActiveTab();
      addressBar.value = active.url;
      renderTabs();
      loadUrl(active.url, false);
    });

    tabBar.appendChild(btn);
  });

  const addTabButton = document.createElement("button");
  addTabButton.type = "button";
  addTabButton.className = "icon-btn";
  addTabButton.textContent = "+";
  addTabButton.title = "New tab";
  addTabButton.style.background = "rgba(0,0,0,0.08)";
  addTabButton.style.color = "#1d2430";
  addTabButton.addEventListener("click", () => createTab(defaultHomeUrl));
  tabBar.appendChild(addTabButton);
}

function closeTab(tabId) {
  if (state.tabs.length === 1) {
    createTab(defaultHomeUrl);
    return;
  }

  const index = state.tabs.findIndex((tab) => tab.id === tabId);
  if (index === -1) return;

  const [removed] = state.tabs.splice(index, 1);

  if (removed.id === state.activeTabId) {
    state.activeTabId = state.tabs[Math.max(0, index - 1)].id;
  }

  renderTabs();
  const active = getActiveTab();
  addressBar.value = active.url;
  loadUrl(active.url, false);
}

function normalizeUrl(rawValue) {
  const value = rawValue.trim();

  if (!value) {
    return defaultHomeUrl;
  }

  if (/^about:/i.test(value)) {
    return value;
  }

  if (/^(https?:)?\/\//i.test(value)) {
    return value.includes("://") ? value : `https://${value}`;
  }

  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function updateSecurityIndicator(url) {
  try {
    const parsed = new URL(url);
    siteLock.textContent = parsed.protocol === "https:" ? "🔒" : "🔓";
  } catch {
    siteLock.textContent = "🔒";
  }
}

function loadUrl(url, shouldPushHistory = true) {
  const validUrl = normalizeUrl(url);
  const activeTab = getActiveTab();

  if (!activeTab) {
    return;
  }

  activeTab.url = validUrl;
  activeTab.title = getTabTitle(validUrl);
  addressBar.value = validUrl;
  updateSecurityIndicator(validUrl);

  if (shouldPushHistory) {
    const last = activeTab.history[activeTab.historyIndex];
    if (last !== validUrl) {
      activeTab.history = activeTab.history.slice(0, activeTab.historyIndex + 1);
      activeTab.history.push(validUrl);
      activeTab.historyIndex = activeTab.history.length - 1;
    }
  }

  renderTabs();

  try {
    browserFrame.src = validUrl;
    frameOverlay.classList.add("hidden");
  } catch {
    frameOverlay.classList.remove("hidden");
  }

  const isAbout = /^about:/i.test(validUrl);
  if (isAbout) {
    browserFrame.srcdoc = `<html><body style="font-family:Segoe UI, sans-serif; display:grid; place-items:center; height:100vh; background:#f5f7fb; color:#1d2430;"><div style="padding:2rem; max-width:600px; text-align:center"><h1>Browser shell</h1><p>This is a lightweight browser UI built for static hosting.</p><p>Use the address bar to browse websites or search the web.</p></div></body></html>`;
  }
}

function goToInput() {
  const current = getActiveTab();
  if (!current) return;
  const nextUrl = addressBar.value;
  loadUrl(nextUrl, true);
}

function navigateHistory(direction) {
  const tab = getActiveTab();
  if (!tab || tab.history.length <= 1) return;

  const nextIndex = tab.historyIndex + direction;
  if (nextIndex < 0 || nextIndex >= tab.history.length) return;

  tab.historyIndex = nextIndex;
  const targetUrl = tab.history[nextIndex];
  tab.url = targetUrl;
  tab.title = getTabTitle(targetUrl);
  addressBar.value = targetUrl;
  updateSecurityIndicator(targetUrl);
  renderTabs();
  browserFrame.src = targetUrl;
  frameOverlay.classList.add("hidden");
}

function refreshPage() {
  const current = getActiveTab();
  if (!current) return;
  browserFrame.src = current.url;
}

function setHomePage() {
  const current = getActiveTab();
  if (!current) return;
  current.homeUrl = defaultHomeUrl;
  const homePage = document.createElement("div");
  homePage.style.display = "grid";
  homePage.style.placeItems = "center";
  homePage.style.height = "100%";
  homePage.style.fontFamily = "Segoe UI, sans-serif";
  homePage.innerHTML = `
    <div style="max-width: 720px; text-align: center; padding: 2rem;">
      <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Welcome</h1>
      <p style="font-size: 1.05rem; color: #5d6470; line-height: 1.6;">
        This is a lightweight browser shell designed to run on GitHub Pages.
      </p>
      <p style="font-size: 1rem; color: #5d6470; line-height: 1.6;">
        Enter a URL or search term above to begin.
      </p>
    </div>
  `;
  browserFrame.srcdoc = homePage.innerHTML;
  frameOverlay.classList.add("hidden");
}

function setupEventListeners() {
  document.getElementById("goBtn").addEventListener("click", goToInput);

  addressBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      goToInput();
    }
  });

  document.getElementById("backBtn").addEventListener("click", () => navigateHistory(-1));
  document.getElementById("forwardBtn").addEventListener("click", () => navigateHistory(1));
  document.getElementById("reloadBtn").addEventListener("click", refreshPage);
  document.getElementById("homeBtn").addEventListener("click", () => {
    const activeTab = getActiveTab();
    const homeUrl = activeTab?.homeUrl || defaultHomeUrl;
    loadUrl(homeUrl, true);
  });

  document.getElementById("closeOverlayBtn").addEventListener("click", () => {
    frameOverlay.classList.add("hidden");
  });

  browserFrame.addEventListener("load", () => {
    try {
      const frameLocation = browserFrame.contentWindow.location.href;
      const activeTab = getActiveTab();
      if (!activeTab) return;

      const maybeUrl = frameLocation.startsWith("about:blank") ? activeTab.url : frameLocation;
      activeTab.url = maybeUrl;
      activeTab.title = getTabTitle(maybeUrl);
      addressBar.value = maybeUrl;
      updateSecurityIndicator(maybeUrl);
      renderTabs();
    } catch {
      frameOverlay.classList.remove("hidden");
    }
  });
}

function init() {
  const initial = defaultHomeUrl;
  state.tabs = [];
  state.nextTabId = 1;
  createTab(initial);
  setupEventListeners();
  renderTabs();
}

init();
