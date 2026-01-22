# Running StudySidekick with Expo Go

## Quick Start

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Then scan the QR code with Expo Go app on your phone!

---

## What You'll See

After scanning the QR code and the app loads, you'll see:
- A simple loading screen (this is just a placeholder)
- The app is ready to use

---

## Download Expo Go

### iOS
Download from App Store: https://apps.apple.com/app/expo-go/id982107779

### Android
Download from Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## Troubleshooting

### "No usable data found" error
This happens because the main App.tsx is too complex. For now, we have a simplified version that will work.

### Connection issues
1. Make sure phone and computer are on **same Wi-Fi network**
2. Try "Use LAN address" in Expo Dev Tools
3. Restart the server: `npm start`

### Scanning doesn't work
1. Open Expo Go app first
2. Then scan the QR code from terminal
3. Or manually enter the URL shown in terminal

---

## Current Status

The app is still being set up for Expo Go compatibility. The simplified App.tsx will load successfully, and we're working on getting the full app working.

Check back soon for updates!

---

## Alternative: Use Simulator

Instead of Expo Go on your phone, use the simulator:

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android
```

This is often more reliable than Expo Go for development!

