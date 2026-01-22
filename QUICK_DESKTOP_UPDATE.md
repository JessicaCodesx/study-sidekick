# Quick Desktop App Update Guide

## 🚀 Fastest Way to Update Your Desktop App

After the GitHub Pages deployment completes, here's the quickest way to update your desktop app:

### Method 1: Quick Update (Recommended)

```bash
# 1. Pull latest changes
git pull origin master

# 2. Navigate to frontend
cd frontend

# 3. Rebuild
npm run build:web

# 4. Run the updated app
npx electron electron.cjs
```

That's it! Your data is safe because it's stored locally.

---

### Method 2: If You Don't Have Git Set Up

1. **Download the latest from GitHub:**
   - Go to your repository
   - Click "Code" → "Download ZIP"
   - Extract it

2. **Or use the GitHub Pages version:**
   - Just visit: `https://yourusername.github.io/study-sidekick/`
   - It's automatically updated!

---

## 📦 First Time Desktop Setup

If you haven't set up the desktop app yet:

```bash
cd frontend
npm install --legacy-peer-deps
npm install --save-dev electron --legacy-peer-deps
npm run build:web
npx electron electron.cjs
```

---

## 💡 Pro Tip

Create a shortcut/alias to make updates even faster:

**Windows (PowerShell):**
```powershell
# Add to your PowerShell profile
function Update-StudySidekick {
    cd frontend
    git pull origin master
    npm run build:web
    npx electron electron.cjs
}
```

**Mac/Linux (Bash):**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias update-studysidekick='cd frontend && git pull origin master && npm run build:web && npx electron electron.cjs'
```

Then just run: `update-studysidekick`

---

## ✅ Your Data is Safe!

- All data is stored in **local storage** (IndexedDB)
- Updating the app **doesn't delete your data**
- Your courses, tasks, notes, and flashcards are all preserved
- The data is stored in the Electron app's user data directory

---

## 🔄 Auto-Update (Future Enhancement)

For automatic updates, you could:
1. Set up a scheduled task to pull and rebuild
2. Use electron-updater for automatic updates
3. Or just use the web version at GitHub Pages (always up-to-date!)
