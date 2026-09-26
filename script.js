const defaultHomeUrl = "https://example.com";

const state = {
  tabs: [],
  activeTabId: null,
  nextTabId: 1,
};

const tabBar = document.getElementById("tabBar");
const addressBar = document.getElementById("addressBar");
const pageView = document.getElementById("pageView");
const loadingIndicator = document.getElementById("loadingIndicator");
const siteLock = document.getElementById("siteLock");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  const value = (rawValue || "").trim();

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

function applySecurityIndicator(url) {
  try {
    const parsed = new URL(url);
    siteLock.textContent = parsed.protocol === "https:" ? "🔒" : "🔓";
  } catch {
    siteLock.textContent = "🔒";
  }
}

function proxyUrlFor(url) {
  const clean = url.replace(/^https?:\/\//i, "");
  return `https://r.jina.ai/http://${clean}`;
}

function renderMarkdownContent(markdownText) {
  const lines = markdownText.split(/\n/);
  let html = "";
  let inList = false;

  const flushList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    if (!line.trim()) {
      flushList();
      html += "<br />";
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      flushList();
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#{1,6}\s*/, "");
      html += `<h${level}>${escapeHtml(text)}</h${level}>`;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushList();
      html += `<blockquote>${escapeHtml(line.replace(/^>\s?/, ""))}</blockquote>`;
      continue;
    }

    if (/^```/.test(line)) {
      flushList();
      const codeBlock = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeBlock.push(lines[i]);
        i++;
      }
      html += `<pre>${escapeHtml(codeBlock.join("\n"))}</pre>`;
      continue;
    }

    flushList();
    html += `<p>${escapeHtml(line)}</p>`;
  }

  flushList();
  return `<article class="page-card">${html || "<p>No content.</p>"}</article>`;
}

function renderError(message) {
  pageView.innerHTML = `
    <div class="empty-state">
      <div class="empty-card">
        <h1>Unable to load this page</h1>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

async function fetchPage(url) {
  const proxy = proxyUrlFor(url);
  loadingIndicator.classList.remove("hidden");

  try {
    const response = await fetch(proxy, {
      headers: {
        Accept: "text/plain, text/markdown, text/html;q=0.9, */*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Remote fetch failed with status ${response.status}.`);
    }

    const text = await response.text();
    const content = text.trim();

    if (!content) {
      throw new Error("The page is empty or blocked by the remote host.");
    }

    pageView.innerHTML = renderMarkdownContent(content);
  } catch (error) {
    renderError(
      `${error.message}. This usually happens when the site blocks browser requests or the proxy cannot access it.`
    );
  } finally {
    loadingIndicator.classList.add("hidden");
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
  applySecurityIndicator(validUrl);

  if (shouldPushHistory) {
    const last = activeTab.history[activeTab.historyIndex];
    if (last !== validUrl) {
      activeTab.history = activeTab.history.slice(0, activeTab.historyIndex + 1);
      activeTab.history.push(validUrl);
      activeTab.historyIndex = activeTab.history.length - 1;
    }
  }

  renderTabs();
  fetchPage(validUrl);
}

function goToInput() {
  const current = getActiveTab();
  if (!current) return;
  loadUrl(addressBar.value, true);
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
  applySecurityIndicator(targetUrl);
  renderTabs();
  fetchPage(targetUrl);
}

function refreshPage() {
  const current = getActiveTab();
  if (!current) return;
  fetchPage(current.url);
}

function showHomeScreen() {
  pageView.innerHTML = `
    <div class="empty-state">
      <div class="empty-card">
        <h1>Welcome</h1>
        <p>
          This is a static browser app built for GitHub Pages.
          Enter a website or search term above to browse through a proxy-backed content view.
        </p>
      </div>
    </div>
  `;
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
    if (activeTab) {
      loadUrl(defaultHomeUrl, true);
    }
  });
}

function init() {
  state.tabs = [];
  state.nextTabId = 1;
  createTab(defaultHomeUrl);
  setupEventListeners();
  showHomeScreen();
}

init();
