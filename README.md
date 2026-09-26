# Browser

A Chrome-like browser built with Electron.

## Installation

1. Install Node.js from https://nodejs.org (LTS version recommended)

2. Clone or download this repository and navigate to it:
   ```bash
   git clone https://github.com/Robo2016a/web-browser.git
   cd web-browser
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Browser

Start the browser with:
```bash
npm start
```

The browser window will open and start at Google.com.

## Features

- Clean, intuitive Chrome-like interface
- Back, forward, and reload navigation buttons
- Address bar with security indicators
- Loading bar animation
- Supports both URLs and search queries
- HTTPS/HTTP security lock indicator
- Responsive design

## Usage

- Type a URL or search term in the address bar and press Enter
- Use the back/forward buttons to navigate
- Click the reload button to refresh the page
- The browser always starts at Google.com

## Troubleshooting

**"Cannot find module" error:**
- Delete `node_modules` folder
- Run `npm install` again

**Blank window:**
- Make sure you're in the correct directory
- Check that `index.html` exists in the same folder as `main.js`

**"Webview not available" error:**
- This is a known Electron issue. Update Electron: `npm install electron@latest`
