# Web Browser for GitHub Pages

This project is a lightweight browser-style app built with plain HTML, CSS, and JavaScript so it can be deployed to GitHub Pages without any backend.

Features
- Address bar with URL navigation
- Back / forward / reload / home controls
- Multiple tabs
- Search fallback for text queries
- HTTPS/HTTP lock indicator
- GitHub Pages friendly static deployment

How to run locally
1. Open `index.html` in a browser, or
2. Serve the directory with a local static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

How to deploy to GitHub Pages
1. Push this repository to GitHub.
2. In the repository settings, enable GitHub Pages.
3. Choose the root branch (`main`) and the root folder (`/`).
4. Your site will be published at:

`https://<your-username>.github.io/web-browser/`

Notes
- Some sites block being embedded in an iframe for security reasons. That is normal browser behavior and not a defect in this app.
- This is a browser shell rather than a full browser engine, which is the most practical approach for a static GitHub Pages project.

File structure
- `index.html` — main app shell
- `styles.css` — browser styling
- `script.js` — navigation logic and tab system
