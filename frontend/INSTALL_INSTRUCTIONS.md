# Installation Instructions

## Quick Install

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Then press **'i'** for iOS simulator or **'a'** for Android.

---

## If You Get Errors

### Dependency Conflicts

The app uses `--legacy-peer-deps` to resolve version conflicts. This is normal and safe.

### Alternative Install

```bash
npm install --force
```

### Clean Install

```bash
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps
```

---

## Running the App

```bash
# Start Expo
npm start

# Or directly for iOS
npm run ios

# Or for Android
npm run android
```

---

## What You Need

- Node.js (v16+)
- Expo CLI (installed with npm)
- iOS Simulator (comes with Xcode)
- Or Android Studio for Android

---

## Common Issues

### "Metro bundler error"
```bash
npm start -- --reset-cache
```

### "iOS simulator not opening"
```bash
# Open simulator first
open -a Simulator
# Then run npm start
```

### "Module not found"
```bash
npm install --legacy-peer-deps
```

---

## Success! ✅

Once running, you'll see:
- Dashboard with welcome message
- All 7 pages in drawer navigation
- Working create/edit/delete for all features
- Beautiful UI with animations
- All data stored locally

**Enjoy your app!** 🎉

