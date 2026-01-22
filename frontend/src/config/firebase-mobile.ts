// Firebase configuration for React Native/Expo
import * as FirebaseCore from 'expo-firebase-app';
import * as FirebaseAuth from 'expo-firebase-auth';

// Initialize Firebase app
const app = FirebaseCore.app();

// Initialize Firebase Auth
const auth = FirebaseAuth.auth(app);

// Configure authentication
// Note: You'll need to set up Firebase in Firebase Console and add credentials
// For Expo, you can use @react-native-firebase or expo-firebase

export { auth, app };

