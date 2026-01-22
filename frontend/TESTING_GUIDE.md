# Testing Guide - Fix "No Usable Data" Error

## The Issue

The "No usable data found" error when scanning QR code means the Expo configuration has issues.

## Quick Fix

The app.json has been simplified to remove missing asset references. Now try:

```bash
cd frontend
npm start
```

Then scan the QR code again.

---

## Alternative: Use Development Build

Instead of scanning QR code, use a development build:

### iOS Simulator (Recommended):
```bash
npm run ios
```

This will open the iOS simulator directly.

### Android Emulator:
```bash
npm run android
```

---

## If Still Getting Errors

### 1. Reset Expo:
```bash
npm start -- --clear
```

### 2. Use Expo Go Alternative:
Download "Expo Go" app from App Store / Play Store, then scan the QR code.

### 3. Check Connection:
Make sure your phone and computer are on the same Wi-Fi network.

---

## Best Approach: Run in Simulator

Instead of using QR code on physical device, use the simulator:

```bash
# For iOS (Mac only)
npm run ios

# For Android
npm run android
```

This is the most reliable way to test without QR code issues!

---

## Troubleshooting

**"Metro bundler" errors:**
```bash
npm start -- --reset-cache
```

**"Module not found" errors:**
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

**Simulator not opening:**
Make sure Xcode is installed (for iOS) or Android Studio (for Android).

---

## Success!

Once running, you should see:
- Welcome screen
- Drawer navigation
- All 7 pages working
- Create/edit/delete functionality

**Happy testing!** 🎉

