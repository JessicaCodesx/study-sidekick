# CI/CD Setup Summary

## ✅ What's Been Set Up

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy-gh-pages.yml`
- **Triggers**: Automatically runs on push to `master` or `main` branch
- **What it does**:
  1. Installs only web dependencies (skips React Native packages)
  2. Builds the frontend using Vite
  3. Deploys to GitHub Pages automatically

### One-Time Setup Required

1. **Enable GitHub Pages:**
   - Go to your repo on GitHub
   - Settings → Pages
   - Under "Source", select **"GitHub Actions"**
   - Save

2. **That's it!** The next time you push to master, it will auto-deploy.

---

## 🖥️ Desktop App Update (After Each Push)

After you push changes and GitHub Pages deploys, update your desktop app:

```bash
cd C:\study-sidekick\study-sidekick
git pull origin master
cd frontend
npm run build:web
npx electron electron.cjs
```

**Your data stays safe** - it's stored locally and won't be affected.

---

## 🔧 What Was Fixed

1. **Database imports**: Made db-mobile imports conditional so web builds don't fail
2. **Workflow dependencies**: Only installs web packages, skips React Native ones
3. **Build process**: Creates stub packages for React Native modules that aren't needed

---

## 📝 Notes

- The workflow installs web dependencies directly, avoiding the React Native packages that were causing errors
- Stub packages are created for React Native modules so imports don't fail (they won't be used since isMobile=false)
- Your desktop app data is stored in Electron's user data directory and persists between updates

---

**Ready to go!** Push to master and watch it deploy automatically! 🚀
