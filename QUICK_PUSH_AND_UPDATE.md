# 🚀 Quick Guide: Push to GitHub Pages & Update Desktop

## Part 1: Push to GitHub (Auto-Deploys to GitHub Pages)

### Step 1: Open Terminal/PowerShell
- **Windows**: Press `Win + R`, type `powershell`, press Enter
- Or right-click in your project folder → "Open in Terminal"

### Step 2: Navigate to Your Project
```powershell
cd C:\study-sidekick\study-sidekick
```

### Step 3: Check What Changed
```powershell
git status
```
You should see all the files you've modified.

### Step 4: Add All Changes
```powershell
git add .
```

### Step 5: Commit Your Changes
```powershell
git commit -m "Enhanced UI with animations, transitions, and micro-interactions"
```

### Step 6: Push to GitHub
```powershell
git push origin master
```

**That's it!** GitHub Actions will automatically:
- Build your frontend
- Deploy to GitHub Pages
- Your site will be live in 1-2 minutes at: `https://yourusername.github.io/study-sidekick/`

You can watch the deployment progress:
- Go to your GitHub repo
- Click the **"Actions"** tab
- You'll see "Deploy to GitHub Pages" running
- Wait for the green checkmark ✅

---

## Part 2: Update Your Desktop App

### Step 1: Pull Latest Code
In the same terminal (still in your project folder):
```powershell
git pull origin master
```
This downloads all the new changes you just pushed.

### Step 2: Go to Frontend Folder
```powershell
cd frontend
```

### Step 3: Install/Update Dependencies (if needed)
```powershell
npm install --legacy-peer-deps
```
*(Only needed if package.json changed - you can skip if it says "up to date")*

### Step 4: Rebuild the App
```powershell
npm run build:web
```
This creates a new `dist` folder with all your updated code.

**Wait for it to finish** - you'll see "built in X seconds" when done.

### Step 5: Run the Updated Desktop App
```powershell
npx electron electron.cjs
```

**🎉 Done!** Your desktop app is now running with all the latest changes!

---

## 🎯 Quick Copy-Paste (All at Once)

If you want to do everything in one go:

```powershell
# Navigate to project
cd C:\study-sidekick\study-sidekick

# Push to GitHub
git add .
git commit -m "Enhanced UI with animations and transitions"
git push origin master

# Wait 1-2 minutes for GitHub Pages to deploy, then:

# Update desktop app
git pull origin master
cd frontend
npm run build:web
npx electron electron.cjs
```

---

## ✅ What Happens to Your Data?

**Nothing!** Your data is completely safe:
- All your courses, tasks, notes, flashcards are stored locally
- They're in IndexedDB (browser) or Electron's user data folder
- Updating the app doesn't touch your data
- Everything you've saved will still be there

---

## 🆘 Troubleshooting

### "git push" fails
- Make sure you're logged into GitHub: `git config --global user.name "Your Name"`
- Check you have write access to the repo

### "npm run build:web" fails
- Try: `npm install --legacy-peer-deps` first
- Then run `npm run build:web` again

### "npx electron" doesn't work
- Make sure Electron is installed: `npm install --save-dev electron --legacy-peer-deps`
- Then run `npx electron electron.cjs` again

### Desktop app looks old
- Make sure you ran `npm run build:web` successfully
- Close the app completely and reopen it
- Check the `dist` folder exists and has recent files

---

## 📝 Summary

**GitHub Pages (Web):**
1. `git add .`
2. `git commit -m "message"`
3. `git push origin master`
4. ✅ Auto-deploys in 1-2 minutes

**Desktop App:**
1. `git pull origin master`
2. `cd frontend`
3. `npm run build:web`
4. `npx electron electron.cjs`
5. ✅ Updated!

---

**You're all set!** 🎉
