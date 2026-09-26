# Local browser

This is a **local Electron app**, not a GitHub Pages app. The web page area uses Electron's Chromium-backed `<webview>`, so sites render as complete pages instead of being put in a restricted iframe.

## Start it

From the repository folder—the folder containing `package.json`—run:

```bash
npm install
npm start
```

To restart it, close the window, press `Ctrl+C` in the terminal, then run `npm start` again.

## Google accounts

The app always opens `https://www.google.com/`. Click the blue account dot and choose **Open Google account chooser** to sign in or switch Google accounts. The persistent `persist:browser` Electron session keeps cookies and sign-ins between launches on this computer.

The account panel does not ask for or store passwords. Google handles authentication inside its own page.

## Why this fixes the missing page

The previous implementation used an iframe. Many sites restrict iframe embedding, and an iframe is not a browser tab. This version uses Electron's `webview` with its own Chromium renderer and navigation history.
