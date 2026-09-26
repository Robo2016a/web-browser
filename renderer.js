const { ipcRenderer } = require("electron");

const browserFrame = document.getElementById("browserFrame");
const addressBar = document.getElementById("addressBar");
const loadingBar = document.getElementById("loadingBar");
const securityIcon = document.getElementById("securityIcon");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");

const DEFAULT_URL = "https://google.com";

let history = [DEFAULT_URL];
let currentIndex = 0;
let currentUrl = DEFAULT_URL;

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
  backBtn.disabled = currentIndex <= 0;
  forwardBtn.disabled = currentIndex >= history.length - 1;
}

function showLoadingBar() {
  loadingBar.classList.add("active");
  loadingBar.style.width = "30%";

  setTimeout(() => {
    loadingBar.style.width = "80%";
  }, 500);
}

function hideLoadingBar() {
  loadingBar.style.width = "100%";
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

  // Add to history
  history = history.slice(0, currentIndex + 1);
  history.push(validUrl);
  currentIndex = history.length - 1;
  updateNavButtons();

  showLoadingBar();
  browserFrame.src = validUrl;
}

// Navigation handlers
backBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    const url = history[currentIndex];
    currentUrl = url;
    addressBar.value = url;
    updateSecurityIcon(url);
    updateNavButtons();
    showLoadingBar();
    browserFrame.src = url;
  }
});

forwardBtn.addEventListener("click", () => {
  if (currentIndex < history.length - 1) {
    currentIndex++;
    const url = history[currentIndex];
    currentUrl = url;
    addressBar.value = url;
    updateSecurityIcon(url);
    updateNavButtons();
    showLoadingBar();
    browserFrame.src = url;
  }
});

reloadBtn.addEventListener("click", () => {
  showLoadingBar();
  browserFrame.src = currentUrl;
});

// Address bar input
addressBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    navigateTo(addressBar.value);
  }
});

// Select all text on focus
addressBar.addEventListener("focus", () => {
  addressBar.select();
});

// Frame load events
browserFrame.addEventListener("load", () => {
  hideLoadingBar();
});

browserFrame.addEventListener("loadstart", () => {
  showLoadingBar();
});

// Initial setup
updateSecurityIcon(DEFAULT_URL);
updateNavButtons();
navigat=eTo(DEFAULT_URL);

console.log("Browser script loaded successfully");
