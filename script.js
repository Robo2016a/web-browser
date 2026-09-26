const browserView = document.getElementById("browserView");
const addressBar = document.getElementById("addressBar");
const loadingIndicator = document.getElementById("loadingIndicator");
const siteLock = document.getElementById("siteLock");

const HOME_URL = "https://example.com";

function normalizeUrl(raw) {
  const value = (raw || "").trim();

  if (!value) return HOME_URL;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^\w+:\/\//i.test(value)) return value;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`;
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

function loadUrl(rawUrl) {
  const url = normalizeUrl(rawUrl);
  addressBar.value = url;
  updateSecurityIndicator(url);
  browserView.loadURL(url);
}

function handleGo() {
  loadUrl(addressBar.value);
}

function handleHome() {
  loadUrl(HOME_URL);
}

browserView.addEventListener("did-start-loading", () => {
  loadingIndicator.classList.remove("hidden");
});

browserView.addEventListener("did-stop-loading", () => {
  loadingIndicator.classList.add("hidden");
  const url = browserView.getURL();
  addressBar.value = url;
  updateSecurityIndicator(url);
});

browserView.addEventListener("did-fail-load", () => {
  loadingIndicator.classList.add("hidden");
});

document.getElementById("goBtn").addEventListener("click", handleGo);

document.getElementById("backBtn").addEventListener("click", () => browserView.goBack());
document.getElementById("forwardBtn").addEventListener("click", () => browserView.goForward());
document.getElementById("reloadBtn").addEventListener("click", () => browserView.reload());
document.getElementById("homeBtn").addEventListener("click", handleHome);

addressBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleGo();
  }
});

updateSecurityIndicator(HOME_URL);
addressBar.value = HOME_URL;
