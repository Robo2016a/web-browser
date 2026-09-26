const { ipcRenderer } = require("electron");

const browserView = document.getElementById("browserView");
const addressBar = document.getElementById("addressBar");
const loadingBar = document.getElementById("loadingBar");
const securityIcon = document.getElementById("securityIcon");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");
const settingsBtn = document.getElementById("settingsBtn");

const DEFAULT_URL = "https://google.com";

let currentUrl = DEFAULT_URL;
let isLoading = false;
let loadingTimeout;

function normalizeUrl(input) {
  const trimmed = (input || "").trim();

  if (!trimmed) return DEFAULT_URL;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^ftp:\/\//i.test(trimmed)) return trimmed;
  if (/^file:\/\//i.test(trimmed)) return trimmed;

  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}($|\/)/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

function updateSecurityIcon(url) {
  try {
    const parsed = new URL(url);
    securityIcon.textContent = parsed.protocol === "https:" ? "🔒" : "🔓";
  } catch {
    securityIcon.textContent = "🔒";
  }
}

function updateNavButtons() {
  try {
    backBtn.disabled = !browserView.canGoBack();
    forwardBtn.disabled = !browserView.canGoForward();
  } catch {
    backBtn.disabled = true;
    forwardBtn.disabled = true;
  }
}

function showLoadingBar() {
  loadingBar.classList.add("active");
  loadingBar.style.width = "30%";

  clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(() => {
    loadingBar.style.width = "80%";
  }, 500);
}

function hideLoadingBar() {
  loadingBar.style.width = "100%";
  clearTimeout(loadingTimeout);
  setTimeout(() => {
    loadingBar.classList.remove("active");
    loadingBar.style.width = "0%";
  }, 200);
}

function navigateTo(url) {
  const validUrl = normalizeUrl(url);
  currentUrl = validUrl;
  addressBar.value = validUrl;
  updateSecurityIcon(validUrl);
  browserView.loadURL(validUrl);
}

// Navigation handlers
backBtn.addEventListener("click", () => {
  try {
    if (browserView.canGoBack()) browserView.goBack();
  } catch (e) {
    console.error("Back navigation failed:", e);
  }
});

forwardBtn.addEventListener("click", () => {
  try {
    if (browserView.canGoForward()) browserView.goForward();
  } catch (e) {
    console.error("Forward navigation failed:", e);
  }
});

reloadBtn.addEventListener("click", () => {
  try {
    browserView.reload();
  } catch (e) {
    console.error("Reload failed:", e);
  }
});

settingsBtn.addEventListener("click", () => {
  console.log("Settings clicked");
});

// Address bar input
addressBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    navigateTo(addressBar.value);
  }
});

// Webview events
browserView.addEventListener("did-start-loading", () => {
  isLoading = true;
  showLoadingBar();
  updateNavButtons();
});

browserView.addEventListener("did-stop-loading", () => {
  isLoading = false;
  hideLoadingBar();
  updateNavButtons();
  
  try {
    const url = browserView.getURL();
    if (url && url !== "about:blank") {
      currentUrl = url;
      addressBar.value = url;
      updateSecurityIcon(url);
    }
  } catch (e) {
    console.error("Error getting URL:", e);
  }
});

browserView.addEventListener("did-fail-load", () => {
  isLoading = false;
  hideLoadingBar();
  updateNavButtons();
});

browserView.addEventListener("did-navigate", (event) => {
  try {
    const url = browserView.getURL();
    if (url && url !== "about:blank") {
      currentUrl = url;
      addressBar.value = url;
      updateSecurityIcon(url);
    }
  } catch (e) {
    console.error("Error in did-navigate:", e);
  }
});

// Select all text on focus
addressBar.addEventListener("focus", () => {
  addressBar.select();
});

// Initial setup
updateSecurityIcon(DEFAULT_URL);
updateNavButtons();

console.log("Browser script loaded successfully");
