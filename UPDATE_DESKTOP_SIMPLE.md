# 🖥️ How to Update Your Desktop App (Simple Guide)

## Step-by-Step Instructions

### Step 1: Open Your Terminal/Command Prompt

- **Windows**: Press `Win + R`, type `cmd` or `powershell`, press Enter
- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

---

### Step 2: Navigate to Your Project Folder

Type this command (replace with your actual path):

```bash
cd C:\study-sidekick\study-sidekick
```

Or if you're on Mac/Linux:
```bash
cd ~/study-sidekick/study-sidekick
```

**Tip**: You can also:
- Type `cd ` (with a space)
- Drag your project folder into the terminal window
- Press Enter

---

### Step 3: Pull the Latest Code from GitHub

```bash
git pull origin master
```

This downloads all the new changes you just pushed.

**What you'll see**: It will show files being updated. If it says "Already up to date", that's fine - you might already have the latest.

---

### Step 4: Go to the Frontend Folder

```bash
cd frontend
```

---

### Step 5: Rebuild the App

```bash
npm run build:web
```

**What this does**: Creates a new `dist` folder with all the updated code.

**How long**: Usually takes 10-30 seconds. You'll see a lot of text scrolling.

**When it's done**: You'll see something like "built in X seconds" or "dist/index.html" created.

---

### Step 6: Run the Updated Desktop App

```bash
npx electron electron.cjs
```

**What this does**: Opens your desktop app with all the new changes!

---

## ✅ That's It!

Your desktop app is now updated with all the latest changes. Your data is safe - everything you've saved (courses, tasks, notes) is still there.

---

## 🆘 If Something Goes Wrong

### "git pull" says "not a git repository"
- Make sure you're in the right folder
- Check you're in `C:\study-sidekick\study-sidekick` (or your actual path)

### "npm run build:web" fails
- Try: `npm install --legacy-peer-deps` first
- Then run `npm run build:web` again

### "npx electron" doesn't work
- Try: `npm install --save-dev electron --legacy-peer-deps`
- Then run `npx electron electron.cjs` again

### App opens but looks old
- Make sure you ran `npm run build:web` successfully
- Close the app completely and reopen it
- Check the `dist` folder exists and has recent files

---

## 💡 Quick Copy-Paste (All at Once)

If you want to do it all in one go, copy and paste this:

```bash
cd C:\study-sidekick\study-sidekick
git pull origin master
cd frontend
npm run build:web
npx electron electron.cjs
```

(Just change the first path to match your actual folder location)

---

## 📝 What Happens to Your Data?

**Nothing!** Your data is stored separately in:
- **Windows**: `C:\Users\YourName\AppData\Roaming\electron\` (or similar)
- **Mac**: `~/Library/Application Support/electron/`
- **Linux**: `~/.config/electron/`

Updating the app doesn't touch your data. Everything you've saved is safe.

---

## 🎯 Summary

1. `git pull origin master` - Get new code
2. `cd frontend` - Go to frontend folder  
3. `npm run build:web` - Build the app
4. `npx electron electron.cjs` - Run it!

That's all you need to do! 🎉
