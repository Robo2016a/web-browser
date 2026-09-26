const DEFAULT_URL = "https://google.com";
const browserView = document.getElementById("browserView");
const addressBar = document.getElementById("addressBar");
const loadingBar = document.getElementById("loadingBar");
const securityIcon = document.getElementById("securityIcon");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");
const accountBtn = document.getElementById("accountBtn");
const menuBtn = document.getElementById("menuBtn");
const accountPanel = document.getElementById("accountPanel");
const accountList = document.getElementById("accountList");
const closeAccountPanel = document.getElementById("closeAccountPanel");
const addAccountBtn = document.getElementById("addAccountBtn");

let history = [DEFAULT_URL];
let currentIndex = 0;
let currentUrl = DEFAULT_URL;
let accounts = [{ email: "user@gmail.com", name: "User", initial: "U" }];
let currentAccount = accounts[0];
let loadingTimeout;

function normalizeUrl(input) {
  const trimmed = (input || "").trim();

  if (!trimmed) return DEFAULT_URL;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^ftp:\/\//i.test(trimmed)) return trimmed;
  if (/^file:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}($|\/)/i.test(trimmed)) return `https://${trimmed}`;

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
  loadingBar.style.width = "35%";

  clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(() => {
    if (loadingBar.classList.contains("active")) {
      loadingBar.style.width = "75%";
    }
  }, 500);
}

function hideLoadingBar() {
  clearTimeout(loadingTimeout);
  loadingBar.style.width = "100%";
  setTimeout(() => {
    loadingBar.classList.remove("active");
    loadingBar.style.width = "0%";
  }, 300);
}

function navigateTo(url, addToHistory = true) {
  const validUrl = normalizeUrl(url);
  currentUrl = validUrl;
  addressBar.value = validUrl;
  updateSecurityIcon(validUrl);

  if (addToHistory) {
    history = history.slice(0, currentIndex + 1);
    if (history[history.length - 1] !== validUrl) {
      history.push(validUrl);
      currentIndex = history.length - 1;
    }
  }

  updateNavButtons();
  showLoadingBar();
  browserView.loadURL(validUrl);
}

function renderAccounts() {
  const addBtn = accountList.querySelector(".add-account");
  accountList.innerHTML = "";

  accounts.forEach((account) => {
    const item = document.createElement("button");
    item.className = "account-item";
    if (account === currentAccount) {
      item.style.backgroundColor = "#f1f3f4";
    }

    const avatar = document.createElement("div");
    avatar.className = "account-avatar";
    avatar.textContent = account.initial;
    avatar.style.background = `linear-gradient(135deg, hsl(${Math.random() * 360}, 70%, 60%), hsl(${Math.random() * 360}, 70%, 60%))`;

    const info = document.createElement("div");
    info.className = "account-info";

    const email = document.createElement("div");
    email.className = "account-email";
    email.textContent = account.email;

    const name = document.createElement("div");
    name.className = "account-name";
    name.textContent = account.name;

    info.appendChild(email);
    info.appendChild(name);

    item.appendChild(avatar);
    item.appendChild(info);

    item.addEventListener("click", () => {
      currentAccount = account;
      renderAccounts();
      accountBtn.style.opacity = "1";
    });

    accountList.appendChild(item);
  });

  accountList.appendChild(addBtn);
}

function toggleAccountPanel() {
  accountPanel.classList.toggle("hidden");
  if (!accountPanel.classList.contains("hidden")) {
    renderAccounts();
  }
}

backBtn.addEventListener("click", () => {
  if (browserView.canGoBack()) {
    browserView.goBack();
  }
});

forwardBtn.addEventListener("click", () => {
  if (browserView.canGoForward()) {
    browserView.goForward();
  }
});

reloadBtn.addEventListener("click", () => {
  showLoadingBar();
  browserView.reload();
});

accountBtn.addEventListener("click", toggleAccountPanel);
closeAccountPanel.addEventListener("click", () => {
  accountPanel.classList.add("hidden");
});

addAccountBtn.addEventListener("click", () => {
  const email = prompt("Enter Google email:");
  if (email && email.includes("@")) {
    const initial = email.charAt(0).toUpperCase();
    const newAccount = {
      email,
      name: email.split("@")[0],
      initial,
    };
    accounts.push(newAccount);
    currentAccount = newAccount;
    renderAccounts();
  }
});

addressBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    navigateTo(addressBar.value, true);
    accountPanel.classList.add("hidden");
  }
});

addressBar.addEventListener("focus", () => {
  addressBar.select();
});

document.addEventListener("click", (event) => {
  if (!accountPanel.contains(event.target) && !accountBtn.contains(event.target)) {
    accountPanel.classList.add("hidden");
  }
});

browserView.addEventListener("did-start-loading", () => {
  showLoadingBar();
  updateNavButtons();
});

browserView.addEventListener("did-stop-loading", () => {
  hideLoadingBar();
  updateNavButtons();

  try {
    const url = browserView.getURL();
    if (url && url !== "about:blank") {
      currentUrl = url;
      addressBar.value = url;
      updateSecurityIcon(url);
    }
  } catch (error) {
    console.error("Error getting URL:", error);
  }
});

browserView.addEventListener("did-fail-load", () => {
  hideLoadingBar();
  updateNavButtons();
});

browserView.addEventListener("did-navigate", () => {
  try {
    const url = browserView.getURL();
    if (url && url !== "about:blank") {
      currentUrl = url;
      addressBar.value = url;
      updateSecurityIcon(url);
    }
  } catch (error) {
    console.error("Error in did-navigate:", error);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === "r") {
      event.preventDefault();
      reloadBtn.click();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      backBtn.click();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      forwardBtn.click();
    }
    if (event.key === "l") {
      event.preventDefault();
      addressBar.focus();
    }
  }
});

updateSecurityIcon(DEFAULT_URL);
addressBar.value = DEFAULT_URL;
updateNavButtons();
renderAccounts();
navigateTo(DEFAULT_URL, false);

console.log("Browser ready");
