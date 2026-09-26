const DEFAULT_URL = "https://www.google.com/";
const webview = document.getElementById("browserView");
const addressBar = document.getElementById("addressBar");
const securityIcon = document.getElementById("securityIcon");
const loadingBar = document.getElementById("loadingBar");
const clearBtn = document.getElementById("clearBtn");
const accountPanel = document.getElementById("accountPanel");

function normalizeUrl(input) {
  const value = (input || "").trim();
  if (!value) return DEFAULT_URL;
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) return value;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?([/?#].*)?$/i.test(value)) return `http://${value}`;
  if (/^(www\.)?[^\s/]+\.[^\s/]+/i.test(value)) return `https://${value}`;
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function updateAddress(url) {
  if (!url || url === "about:blank") return;
  addressBar.value = url;
  clearBtn.hidden = addressBar.value.length === 0;
  try {
    securityIcon.textContent = new URL(url).protocol === "https:" ? "🔒" : "🔓";
  } catch {
    securityIcon.textContent = "🌐";
  }
}

function updateButtons() {
  document.getElementById("backBtn").disabled = !webview.canGoBack();
  document.getElementById("forwardBtn").disabled = !webview.canGoForward();
}

function navigate(input) {
  const url = normalizeUrl(input);
  updateAddress(url);
  webview.loadURL(url);
}

function beginLoading() {
  loadingBar.classList.add("active");
}
function endLoading() {
  loadingBar.classList.remove("active");
  loadingBar.style.width = "100%";
  setTimeout(() => { loadingBar.style.width = "0"; }, 200);
  updateButtons();
}

document.getElementById("backBtn").addEventListener("click", () => { if (webview.canGoBack()) webview.goBack(); });
document.getElementById("forwardBtn").addEventListener("click", () => { if (webview.canGoForward()) webview.goForward(); });
document.getElementById("reloadBtn").addEventListener("click", () => webview.reload());

addressBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    navigate(addressBar.value);
    addressBar.blur();
  }
});
addressBar.addEventListener("focus", () => addressBar.select());
addressBar.addEventListener("input", () => { clearBtn.hidden = addressBar.value.length === 0; });
clearBtn.addEventListener("click", () => { addressBar.value = ""; addressBar.focus(); });

document.getElementById("accountBtn").addEventListener("click", (event) => {
  event.stopPropagation();
  accountPanel.hidden = !accountPanel.hidden;
});
document.getElementById("openAccountsBtn").addEventListener("click", () => {
  accountPanel.hidden = true;
  navigate("https://accounts.google.com/AccountChooser");
});
document.addEventListener("click", (event) => {
  if (!accountPanel.contains(event.target) && event.target.id !== "accountBtn") accountPanel.hidden = true;
});

document.getElementById("menuBtn").addEventListener("click", () => {
  accountPanel.hidden = false;
});

webview.addEventListener("did-start-loading", beginLoading);
webview.addEventListener("did-stop-loading", () => {
  endLoading();
  updateAddress(webview.getURL());
});
webview.addEventListener("did-navigate", () => { updateAddress(webview.getURL()); updateButtons(); });
webview.addEventListener("did-navigate-in-page", () => { updateAddress(webview.getURL()); updateButtons(); });
webview.addEventListener("did-fail-load", (_event) => endLoading());

window.addEventListener("keydown", (event) => {
  const mod = event.ctrlKey || event.metaKey;
  if (!mod) return;
  if (event.key.toLowerCase() === "l") { event.preventDefault(); addressBar.focus(); }
  if (event.key.toLowerCase() === "r") { event.preventDefault(); webview.reload(); }
  if (event.key === "ArrowLeft" && webview.canGoBack()) { event.preventDefault(); webview.goBack(); }
  if (event.key === "ArrowRight" && webview.canGoForward()) { event.preventDefault(); webview.goForward(); }
});

updateAddress(DEFAULT_URL);
updateButtons();
