# Quick Start: iOS App Development

This is a quick guide to get StudySidekick running as an iOS app.

## What's Been Done ✅

1. **Expo Project Setup**: Configured `package.json`, `app.json`, `babel.config.js`
2. **Database Layer**: Created SQLite implementation (`src/lib/db-mobile.ts`)
3. **Navigation**: Set up React Navigation with drawer (`src/navigation/`)
4. **Configuration**: Created mobile Firebase and API configs
5. **Entry Point**: Created `App.tsx` for React Native

## What Needs To Be Done 🔄

### Critical Path:
1. **Convert Components**: All files in `src/components/` need React Native versions
2. **Convert Pages**: All files in `src/pages/` need React Native versions  
3. **Update Context Providers**: `src/context/` files need mobile adaptations
4. **Add Assets**: Icons and splash screens in `assets/` folder
5. **Test & Debug**: Run on iOS simulator and fix issues

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API URL
Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:5000/api"
    }
  }
}
```

### 3. Run on iOS
```bash
npm start
# Press 'i' for iOS simulator
```

## Component Conversion Guide

### Example: Converting a Simple Button

**Original (Web):**
```tsx
// components/common/Button.tsx
import { Button } from 'react-dom';

export default function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
```

**Mobile Version:**
```tsx
// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Button({ onPress, children, style }) {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

## Priority List

### Phase 1: Core Functionality (Must Have)
- [ ] Dashboard page (`src/pages/Dashboard-mobile.tsx`)
- [ ] Courses page (create mobile version)
- [ ] Auth screens (SignIn, SignUp, Landing)
- [ ] Navigation working properly
- [ ] Database operations working

### Phase 2: Full Features (Should Have)
- [ ] Notes page and editor
- [ ] Flashcards page with flip animation
- [ ] Calendar/Tasks page
- [ ] Academic Records page
- [ ] Settings page

### Phase 3: Polish (Nice to Have)
- [ ] Add icons and splash screens
- [ ] Smooth animations
- [ ] Haptic feedback
- [ ] Push notifications
- [ ] iPad optimization

## File Structure You Need to Create

```
frontend/src/
├── components/
│   ├── common/        # Convert these to RN components
│   ├── courses/       # Convert these
│   ├── dashboard/     # Convert these
│   ├── flashcards/    # Convert these
│   ├── notes/         # Convert these
│   └── auth/          # Convert these
├── pages/             # Mobile versions of pages
├── navigation/        # ✅ Already done
├── lib/               # ✅ Already done
├── config/            # ✅ Already done
└── context/           # ⚠️ Needs updates for mobile
```

## Testing Checklist

Before submission:
- [ ] App launches without errors
- [ ] Auth flow works (sign in/sign up)
- [ ] Can create/edit courses
- [ ] Can add notes
- [ ] Can create flashcards
- [ ] Tasks appear correctly
- [ ] Offline mode works
- [ ] Sync with backend works

## Common Issues & Solutions

### Issue: "Metro bundler cache"
**Solution:** `npm start -- --reset-cache`

### Issue: "Module not found"
**Solution:** `rm -rf node_modules && npm install`

### Issue: "Firebase not working"
**Solution:** Check `app.json` config and environment variables

### Issue: "Navigation not working"
**Solution:** Verify React Navigation is installed: `npm install @react-navigation/native`

## Resources

- Expo docs: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/

## Getting Help

1. Check `IOS_SETUP.md` for detailed migration guide
2. Review Expo documentation
3. Check React Native Paper component library
4. Look at example apps in Expo documentation

