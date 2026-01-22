# StudySidekick iOS App

This is the iOS version of StudySidekick built with React Native and Expo.

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- iOS Simulator (comes with Xcode) or physical iOS device
- Expo CLI: `npm install -g expo-cli`

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Configure environment:
   - Copy `app.json.template` to `app.json`
   - Update the `apiUrl` in `app.json` with your backend API URL

3. Start the development server:
```bash
npm start
# or
expo start
```

4. Run on iOS Simulator:
```bash
npm run ios
# or
expo run:ios
```

## Development

- **Start development server**: `npm start`
- **Run on iOS Simulator**: `npm run ios`
- **Run on Android**: `npm run android`
- **Run on Web**: `npm run web`

## Building for Production

To create a production build for iOS:

```bash
npm run build:ios
```

Or use EAS Build (recommended for App Store deployment):

```bash
eas build --platform ios
```

## Project Structure

```
frontend/
├── App.tsx                 # Main app entry point
├── src/
│   ├── components/         # React Native components
│   ├── context/            # React Context providers
│   ├── lib/                # Utilities and database
│   ├── navigation/         # React Navigation setup
│   ├── pages/              # Screen components
│   └── config/             # Configuration files
├── assets/                  # Images, fonts, etc.
├── babel.config.js          # Babel configuration
├── app.json                 # Expo configuration
└── package.json            # Dependencies
```

## Key Features

- **Offline-First**: All data stored locally using SQLite
- **Cross-Platform**: Works on iOS, Android, and Web
- **Firebase Auth**: Secure authentication
- **Expo**: Easy development and deployment
- **React Navigation**: Native navigation experience
- **TypeScript**: Type-safe development

## Differences from Desktop Version

1. **Database**: Uses SQLite instead of IndexedDB
2. **Navigation**: Uses React Navigation instead of React Router
3. **UI Components**: Uses React Native Paper for mobile-optimized components
4. **Routing**: Drawer navigation instead of sidebar

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npm start -- --clear`
2. **iOS build issues**: Clean derived data and rebuild
3. **Firebase errors**: Check environment variables in `app.json`

## Deployment

For App Store deployment, you'll need:

1. Apple Developer Account
2. EAS Build setup
3. App Store Connect configuration

See [Expo's deployment guide](https://docs.expo.dev/distribution/introduction/) for detailed instructions.

