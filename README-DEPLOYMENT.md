# 🚀 Deployment & Update Guide

## GitHub Pages Auto-Deployment

Your app is now set up with **automatic deployment** to GitHub Pages!

### ✅ Setup (One-Time)

1. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Click **Settings** → **Pages**
   - Under **Source**, select **"GitHub Actions"**
   - Save

2. **That's it!** Every time you push to `master` or `main`, it will:
   - Build the frontend
   - Deploy to GitHub Pages
   - Your site will be live at: `https://yourusername.github.io/study-sidekick/`

### 🔄 Manual Trigger

You can also manually trigger deployment:
- Go to **Actions** tab
- Select **"Deploy to GitHub Pages"**
- Click **"Run workflow"**

---

## 💻 Desktop App Update

### Quick Update (After GitHub Deployment)

```bash
# 1. Pull latest code
git pull origin master

# 2. Go to frontend folder
cd frontend

# 3. Rebuild
npm run build:web

# 4. Run updated app
npx electron electron.cjs
```

**Your data is safe!** It's stored locally and won't be affected by updates.

### First Time Desktop Setup

If you haven't set up Electron yet:

```bash
cd frontend
npm install --legacy-peer-deps
npm install --save-dev electron --legacy-peer-deps
npm run build:web
npx electron electron.cjs
```

### Create a Desktop Shortcut

**Windows:**
1. After running `npm run build:web`, create a batch file:
   ```batch
   @echo off
   cd /d "C:\path\to\study-sidekick\frontend"
   npx electron electron.cjs
   ```
2. Save as `StudySidekick.bat`
3. Right-click → Create shortcut
4. Pin to taskbar/desktop

**Mac:**
1. Create an Automator app that runs:
   ```bash
   cd /path/to/study-sidekick/frontend
   npx electron electron.cjs
   ```
2. Save as an application

**Linux:**
Create a `.desktop` file:
```ini
[Desktop Entry]
Name=StudySidekick
Exec=/usr/bin/npx electron /path/to/study-sidekick/frontend/electron.cjs
Icon=/path/to/study-sidekick/frontend/assets/icon.png
Type=Application
```

---

## 📝 Notes

- **GitHub Pages** = Web version (always up-to-date automatically)
- **Desktop App** = Electron wrapper (needs manual rebuild)
- **Your Data** = Stored locally, safe from updates
- **No Account Needed** = Everything is local storage

---

## 🆘 Troubleshooting

### Build Fails on GitHub Actions

Check that:
- `frontend/package.json` has `build:web` script
- Vite and React dependencies are installed
- The workflow file is in `.github/workflows/`

### Desktop App Won't Open

1. Make sure you built first: `npm run build:web`
2. Check Electron is installed: `npx electron --version`
3. Try: `npm install --save-dev electron --legacy-peer-deps`

### Can't Find Updated Features

1. Make sure you pulled latest: `git pull origin master`
2. Rebuild: `npm run build:web`
3. Restart Electron

---

## 🎯 Recommended Workflow

1. **Make changes** to your code
2. **Test locally**: `npm run dev` (web) or `npm run desktop` (desktop)
3. **Commit and push**: `git push origin master`
4. **GitHub Pages** updates automatically
5. **Desktop app**: Run `git pull && npm run build:web && npx electron electron.cjs`

---

**Happy coding! 🎉**
