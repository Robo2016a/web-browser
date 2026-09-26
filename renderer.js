const DEFAULT_URL = "https://www.google.com/";
const webview = document.getElementById("browserView");
const addressBar = document.getElementById("addressBar");
const securityIcon = document.getElementById("securityIcon");
const loadingBar = document.getElementById("loadingBar");
const clearBtn = document.getElementById("clearBtn");
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
  clearBtn.hidden = addressBar.value.length === 0;
  try {
    const protocol = new URL(url).protocol;
    securityIcon.textContent = protocol === "https:" ? "🔒" : "🔓";
  } catch {
    securityIcon.textContent = "🌐";
  }
}

function updateButtons() {
  backBtn.disabled = !webview.canGoBack();
  forwardBtn.disabled = !webview.canGoForward();
}

function navigate(input) {
  const url = normalizeUrl(input);
  updateAddress(url);
  webview.loadURL(url);
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
  if (webview.canGoBack()) webview.goBack();
});

forwardBtn.addEventListener("click", () => {
  if (webview.canGoForward()) webview.goForward();
});

reloadBtn.addEventListener("click", () => {
  webview.reload();
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

addressBar.addEventListener("input", () => {
  clearBtn.hidden = addressBar.value.length === 0;
});

clearBtn.addEventListener("click", () => {
  addressBar.value = "";
  addressBar.focus();
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
webview.addEventListener("did-start-loading", beginLoading);
webview.addEventListener("did-stop-loading", () => {
  endLoading();
  updateAddress(webview.getURL());
});
webview.addEventListener("did-navigate", () => {
  updateAddress(webview.getURL());
  updateButtons();
});
webview.addEventListener("did-navigate-in-page", () => {
  updateAddress(webview.getURL());
  updateButtons();
});
webview.addEventListener("did-fail-load", () => {
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
    webview.reload();
  }
  if (event.key === "ArrowLeft" && webview.canGoBack()) {
    event.preventDefault();
    webview.goBack();
  }
  if (event.key === "ArrowRight" && webview.canGoForward()) {
    event.preventDefault();
    webview.goForward();
  }
});

// Wait for webview to be ready, then load Google
webview.addEventListener("dom-ready", () => {
  console.log("Webview ready");
  navigate(DEFAULT_URL);
});

// Initial address bar update
updateAddress(DEFAULT_URL);
updateButtons();
