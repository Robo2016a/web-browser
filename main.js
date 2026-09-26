const { app, BrowserWindow, Menu, session } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.webContents.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Disable menu
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  // Allow popups for Google login
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("web-contents-created", (event, contents) => {
  // Block new windows from opening outside the app
  contents.setWindowOpenHandler(({ url }) => {
    if (
      url.startsWith("https://") ||
      url.startsWith("http://") ||
      url.startsWith("about:")
    ) {
      return { action: "allow" };
    }
    return { action: "deny" };
  });
});
