# Working Browser for GitHub Pages

This project is a browser-style app built with plain HTML, CSS, and JavaScript so it can be hosted on GitHub Pages.

Important note
- A real browser cannot load arbitrary websites inside an iframe on GitHub Pages because most sites block iframe embedding for security reasons.
- To make this actually work, the app uses a public proxy (`https://r.jina.ai`) to fetch public web pages and display their content inside the app instead of embedding the site directly.

What works
- Address bar navigation
- Back / forward / reload / home buttons
- Multiple tabs
- Search support
- Page content display through a proxy

What is limited
- This is not a full browser engine like Chrome or Firefox.
- Some sites may block the proxy or return content in a limited format.
- It is optimized for static hosting and real-world GitHub Pages constraints.

Run locally
```bash
python3 -m http.server 8000
```

Then visit:
```text
http://localhost:8000
```

Deploy to GitHub Pages
1. Push this repo to GitHub.
2. Open the repository Settings → Pages.
3. Select the default branch and root folder.
4. Publish the site.

Files
- `index.html` — app shell
- `styles.css` — browser layout and page styling
- `script.js` — navigation, tabs, proxy fetch logic
