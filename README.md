# Browser

A Chrome-like browser built with Electron featuring:

- Clean, intuitive Chrome-inspired toolbar
- Full-page rendering with no missing content
- Back, forward, and reload navigation
- Address bar with URL/search support
- HTTPS/HTTP security indicator
- Google account management and switching
- Add multiple Google accounts
- Switch between accounts with one click
- Keyboard shortcuts (Ctrl+R, Ctrl+L, Ctrl+Arrow Keys)
- Responsive design

## Installation

1. Install Node.js LTS from https://nodejs.org

2. Clone and navigate to the repository:
   ```bash
   git clone https://github.com/Robo2016a/web-browser.git
   cd web-browser
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running

```bash
npm start
```

The browser launches at Google.com by default.

## Features

### Navigation
- Back/Forward buttons
- Reload page
- Address bar (URL or search)
- Keyboard shortcuts:
  - `Ctrl+R` / `Cmd+R`: Reload
  - `Ctrl+L` / `Cmd+L`: Focus address bar
  - `Ctrl+Left` / `Cmd+Left`: Back
  - `Ctrl+Right` / `Cmd+Right`: Forward

### Google Accounts
- Click the account icon in the toolbar
- Switch between existing accounts instantly
- Add new Google accounts
- Accounts persist across sessions

## Troubleshooting

**"Cannot find module" error:**
```bash
rm -rf node_modules
npm install
```

**Blank window:**
- Make sure `index.html` is in the project root
- Check that all files are in the correct location
- Try deleting `node_modules` and reinstalling

**Pages not loading:**
- Check your internet connection
- Try a different website
- Clear browser cache or try an incognito window
