# Real Browser

This is a real browser-style app built with Electron, not a static GitHub Pages page.

Why this is different
- GitHub Pages is static-only and cannot host a real browser.
- A browser needs a desktop runtime or a server/backend to load pages directly.
- This app works by using Electron's embedded browser engine, so it can load websites normally.

How to run
1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

This will open a real browser window that loads websites directly.

Important note
- GitHub Pages is not suitable for a real browser because it cannot run a browser engine or backend logic.
- If you want this app hosted online, you would need a real web server or a desktop packaging solution, not GitHub Pages.

Files
- `main.js` — Electron app entry point
- `index.html` — browser UI
- `styles.css` — styling
- `script.js` — browser navigation logic
