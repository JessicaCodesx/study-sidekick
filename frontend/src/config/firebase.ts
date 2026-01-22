// src/config/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from "firebase/analytics";

// Check if Firebase config is available
const hasFirebaseConfig = () => {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

// Initialize Firebase only if config is available
if (hasFirebaseConfig()) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    // Only initialize if not already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      
      // Initialize Firebase services
      auth = getAuth(app);
      db = getFirestore(app);
      
      // Initialize analytics only in browser
      if (typeof window !== 'undefined') {
        try {
          analytics = getAnalytics(app);
        } catch (analyticsError) {
          console.warn('Analytics initialization failed:', analyticsError);
        }
      }

      // Set up emulators for local development
      if (import.meta.env.DEV) {
        if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
          try {
            connectAuthEmulator(auth, 'http://localhost:9099');
            connectFirestoreEmulator(db, 'localhost', 8080);
            console.log('Firebase emulators connected');
          } catch (emulatorError) {
            console.warn('Firebase emulator connection failed:', emulatorError);
          }
        }
      }
    } else {
      // Use existing app
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      if (typeof window !== 'undefined') {
        try {
          analytics = getAnalytics(app);
        } catch (analyticsError) {
          // Analytics might already be initialized
        }
      }
    }
  } catch (error) {
    console.warn('Firebase initialization failed. App will run in offline mode:', error);
  }
} else {
  console.warn('Firebase configuration not found. App will run in offline mode.');
}

export { auth, db, analytics };
export default app;