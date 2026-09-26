const DEFAULT_URL = "https://www.google.com/";
const browserView = document.getElementById("browserView");
const addressBar = document.getElementById("addressBar");
const securityIcon = document.getElementById("securityIcon");
const loadingBar = document.getElementById("loadingBar");
const accountPanel = document.getElementById("accountPanel");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");

function normalizeUrl(input) {
  const value = (input || "").trim();
  if (!value) return DEFAULT_URL;
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) return value;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?([/?#].*)?$/i.test(value))
    return `http://${value}`;
  if (/^(www\.)?[^\s/$.]+\.[^\s/$]+/i.test(value)) return `https://${value}`;
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function updateAddress(url) {
  if (!url || url === "about:blank") return;
  addressBar.value = url;
  try {
    const protocol = new URL(url).protocol;
    securityIcon.textContent = protocol === "https:" ? "🔒" : "🔓";
  } catch {
    securityIcon.textContent = "🌐";
  }
}

function updateButtons() {
  try {
    backBtn.disabled = !browserView.canGoBack();
    forwardBtn.disabled = !browserView.canGoForward();
  } catch (error) {
    backBtn.disabled = true;
    forwardBtn.disabled = true;
  }
}

function navigate(input) {
  const url = normalizeUrl(input);
  updateAddress(url);
  browserView.loadURL(url);
}

function beginLoading() {
  loadingBar.classList.add("active");
  loadingBar.style.width = "35%";
}

function endLoading() {
  loadingBar.style.width = "100%";
  setTimeout(() => {
    loadingBar.classList.remove("active");
    loadingBar.style.width = "0";
  }, 300);
  updateButtons();
}

// Navigation handlers
backBtn.addEventListener("click", () => {
  if (browserView.canGoBack()) browserView.goBack();
});

forwardBtn.addEventListener("click", () => {
  if (browserView.canGoForward()) browserView.goForward();
});

reloadBtn.addEventListener("click", () => {
  browserView.reload();
});

// Address bar handlers
addressBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    navigate(addressBar.value);
    addressBar.blur();
  }
});

addressBar.addEventListener("focus", () => {
  addressBar.select();
});

// Account panel handlers
document.getElementById("accountBtn").addEventListener("click", (event) => {
  event.stopPropagation();
  accountPanel.hidden = !accountPanel.hidden;
});

document.getElementById("openAccountsBtn").addEventListener("click", () => {
  accountPanel.hidden = true;
  navigate("https://accounts.google.com/AccountChooser");
});

document.addEventListener("click", (event) => {
  if (
    !accountPanel.contains(event.target) &&
    event.target.id !== "accountBtn"
  ) {
    accountPanel.hidden = true;
  }
});

document.getElementById("menuBtn").addEventListener("click", () => {
  accountPanel.hidden = !accountPanel.hidden;
});

// Webview event handlers
browserView.addEventListener("did-start-loading", beginLoading);
browserView.addEventListener("did-stop-loading", () => {
  endLoading();
  updateAddress(browserView.getURL());
});
browserView.addEventListener("did-navigate", () => {
  updateAddress(browserView.getURL());
  updateButtons();
});
browserView.addEventListener("did-navigate-in-page", () => {
  updateAddress(browserView.getURL());
  updateButtons();
});
browserView.addEventListener("did-fail-load", () => {
  endLoading();
});

// Keyboard shortcuts
window.addEventListener("keydown", (event) => {
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const mod = isMac ? event.metaKey : event.ctrlKey;

  if (!mod) return;

  if (event.key.toLowerCase() === "l") {
    event.preventDefault();
    addressBar.focus();
  }
  if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    browserView.reload();
  }
  if (event.key === "ArrowLeft" && browserView.canGoBack()) {
    event.preventDefault();
    browserView.goBack();
  }
  if (event.key === "ArrowRight" && browserView.canGoForward()) {
    event.preventDefault();
    browserView.goForward();
  }
});

// Wait for webview to be ready, then load Google
browserView.addEventListener("dom-ready", () => {
  console.log("Webview ready");
  navigate(DEFAULT_URL);
});

// Initial address bar update
updateAddress(DEFAULT_URL);
updateButtons();
