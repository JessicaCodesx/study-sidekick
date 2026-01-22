# Deployment Guide

## GitHub Pages Auto-Deployment

The app is automatically deployed to GitHub Pages whenever you push changes to the `master` or `main` branch.

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **The workflow will automatically:**
   - Build the frontend when you push to master/main
   - Deploy to GitHub Pages
   - Your site will be available at: `https://yourusername.github.io/study-sidekick/`

3. **Manual Deployment:**
   - You can also manually trigger deployment by going to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

### Build Configuration

The build is configured in `frontend/vite.config.ts`:
- Base path: `/study-sidekick/` (for GitHub Pages)
- Output directory: `frontend/dist`

---

## Desktop App Download & Update

### How to Download/Update the Desktop Version

The desktop app is essentially the web version packaged with Electron. Here's how to build and update it:

#### Step 1: Build the Web Version

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Build the web version:**
   ```bash
   npm run build:web
   ```
   This creates the `dist` folder with all the built files.

#### Step 2: Set Up Electron (First Time Only)

1. **Install Electron:**
   ```bash
   npm install --save-dev electron --legacy-peer-deps
   ```

2. **Verify Electron is working:**
   ```bash
   npx electron electron.cjs
   ```
   This should open the desktop app window.

#### Step 3: Package the Desktop App (Optional - For Distribution)

If you want to create an installable desktop app:

1. **Install electron-builder:**
   ```bash
   npm install --save-dev electron-builder --legacy-peer-deps
   ```

2. **Add build script to package.json:**
   ```json
   "build:electron": "electron-builder",
   "build:desktop": "npm run build:web && npm run build:electron"
   ```

3. **Create electron-builder config** (create `electron-builder.json`):
   ```json
   {
     "appId": "com.studysidekick.app",
     "productName": "StudySidekick",
     "directories": {
       "output": "release"
     },
     "files": [
       "dist/**/*",
       "electron.cjs",
       "package.json"
     ],
     "win": {
       "target": "nsis",
       "icon": "assets/icon.ico"
     },
     "mac": {
       "target": "dmg",
       "icon": "assets/icon.png"
     },
     "linux": {
       "target": "AppImage",
       "icon": "assets/icon.png"
     }
   }
   ```

4. **Build:**
   ```bash
   npm run build:desktop
   ```

### Quick Update Process (After GitHub Pages Deployment)

Since your data is stored locally, updating is simple:

1. **Pull latest changes:**
   ```bash
   git pull origin master
   ```

2. **Rebuild:**
   ```bash
   cd frontend
   npm run build:web
   ```

3. **Run Electron:**
   ```bash
   npx electron electron.cjs
   ```

**Your local data will persist** because it's stored in IndexedDB/localStorage, which is separate from the app files.

### Current Desktop App Setup

The desktop app uses Electron (`frontend/electron.cjs`) and loads the built web app from the `dist` folder.

**To run the desktop app:**
```bash
cd frontend
npm run build:web
npx electron electron.cjs
```

**Note:** The desktop app is essentially a wrapper around the web version. All your data is stored locally in the Electron app's user data directory, so it persists between updates.

---

## Notes

- The GitHub Pages deployment only includes the web version
- The desktop app needs to be built separately using Electron
- All data is stored locally, so updating won't affect your data
- Make sure to backup your data before major updates (though it's stored locally, so it should persist)
