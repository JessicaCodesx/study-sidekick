# StudySidekick iOS Setup Guide

This guide will help you convert StudySidekick from an Electron desktop app to a free, ad-free iOS app using Expo and React Native.

## Overview

The iOS version of StudySidekick maintains all functionality from the desktop version while being optimized for mobile devices.

## Key Changes for iOS

### 1. Database Layer
- **Desktop**: Uses IndexedDB (`idb` library)
- **iOS**: Uses SQLite (`expo-sqlite`)
- **File**: `frontend/src/lib/db-mobile.ts`

### 2. Navigation
- **Desktop**: React Router with HashRouter
- **iOS**: React Navigation with Drawer Navigator
- **Files**: `frontend/src/navigation/AppNavigator.tsx`, `frontend/src/navigation/CustomDrawer.tsx`

### 3. UI Components
- **Desktop**: HTML/CSS/Tailwind components
- **iOS**: React Native + React Native Paper
- **Tooling**: React Native components, gesture handlers

### 4. Configuration
- **Desktop**: Vite + Electron
- **iOS**: Expo configuration
- **Files**: `app.json`, `babel.config.js`, `App.tsx`

## Setup Instructions

### 1. Prerequisites

Install the following:
```bash
# Install Node.js (v16+)
# Visit https://nodejs.org/

# Install Expo CLI
npm install -g expo-cli

# Install iOS Simulator (comes with Xcode)
# For Xcode, visit https://developer.apple.com/xcode/
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment

1. Copy the template:
```bash
cp app.json.template app.json
```

2. Update `app.json` with your backend API URL:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend-url.com/api"
    }
  }
}
```

3. Configure Firebase for mobile in `src/config/firebase-mobile.ts`

### 4. Run the App

For iOS Simulator:
```bash
npm run ios
```

Or start Expo development server:
```bash
npm start
# Then press 'i' for iOS simulator
```

## Project Structure

```
frontend/
├── App.tsx                    # Main app entry (updated for mobile)
├── src/
│   ├── navigation/           # NEW: React Navigation setup
│   │   ├── AppNavigator.tsx  # Main navigator
│   │   └── CustomDrawer.tsx  # Drawer component
│   ├── lib/
│   │   ├── db-mobile.ts      # NEW: SQLite implementation
│   │   ├── db-web.ts         # Original IndexedDB
│   │   ├── platform.ts       # Platform detection
│   │   └── db.ts             # Platform-specific exports
│   ├── config/
│   │   ├── firebase-mobile.ts # NEW: Firebase for mobile
│   │   └── apiConfig-mobile.ts # NEW: API config for mobile
│   ├── components/           # TODO: Convert to React Native
│   ├── pages/               # TODO: Convert to React Native
│   └── context/             # Updated for mobile
├── babel.config.js          # NEW: Expo babel config
├── app.json                  # NEW: Expo configuration
└── package.json             # Updated with Expo deps
```

## Migration Checklist

### ✅ Completed
- [x] Set up Expo project structure
- [x] Created SQLite database layer (`db-mobile.ts`)
- [x] Set up React Navigation with Drawer
- [x] Updated package.json with Expo dependencies
- [x] Created app.json configuration
- [x] Created mobile Firebase config
- [x] Created mobile API config
- [x] Set up babel.config.js
- [x] Created platform detection utilities
- [x] Created main App.tsx entry point

### 🔄 In Progress
- [ ] Convert all page components to React Native
- [ ] Convert all component files to React Native Paper
- [ ] Adapt API service layer for mobile
- [ ] Update Context providers for mobile
- [ ] Add iOS icons and splash screens

### 📋 TODO
- [ ] Test sync functionality on mobile
- [ ] Optimize UI for mobile screens
- [ ] Add mobile-specific features (notifications, haptics)
- [ ] Test offline functionality
- [ ] Build iOS app bundle
- [ ] Submit to App Store

## Converting Components

### From HTML/Tailwind to React Native

**Before (HTML):**
```tsx
<button className="bg-purple-600 text-white px-4 py-2 rounded">
  Click Me
</button>
```

**After (React Native):**
```tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Click Me</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
```

### Common Component Replacements

| Desktop | iOS | Notes |
|---------|-----|-------|
| `<div>` | `<View>` | Container |
| `<button>` | `<TouchableOpacity>` | Pressable buttons |
| `<input>` | `<TextInput>` | Text input |
| `<img>` | `<Image>` | Images |
| `onClick` | `onPress` | Event handler |
| CSS classes | `StyleSheet.create()` | Styling |

## Database Migration

The SQLite database (`db-mobile.ts`) is fully compatible with the existing data structure. The migration happens automatically based on platform detection in `lib/db.ts`.

Key differences:
- SQLite uses SQL queries instead of IndexedDB transactions
- Tags are stored as JSON strings in SQLite
- Array fields need special handling

## Running the Development Server

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android
npm run android

# Run on web (for testing)
npm run web
```

## Building for Production

### Using Expo Application Services (EAS)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Build for iOS:
```bash
eas build --platform ios
```

3. Build for both platforms:
```bash
eas build --platform all
```

### Manual Build

1. Eject from Expo:
```bash
expo eject
```

2. Open in Xcode:
```bash
cd ios
open StudySidekick.xcworkspace
```

3. Build and archive in Xcode

## Testing

Run tests:
```bash
npm test
```

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Build Issues
```bash
cd ios
rm -rf Pods
pod install
cd ..
```

### Firebase Issues
- Check that `app.json` has correct Firebase configuration
- Verify environment variables are set correctly
- For iOS, ensure GoogleService-Info.plist is in the ios folder

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## Next Steps

1. **Convert Remaining Components**: Update all page and component files to use React Native
2. **Add Icons & Splash**: Create app icons and splash screens for iOS
3. **Test Offline Sync**: Verify that offline functionality works on mobile
4. **Optimize Performance**: Profile the app and optimize for mobile
5. **Submit to App Store**: Prepare App Store listing and submit

## Support

For issues or questions, please refer to:
- StudySidekick GitHub repository
- Expo community forums
- React Native community

