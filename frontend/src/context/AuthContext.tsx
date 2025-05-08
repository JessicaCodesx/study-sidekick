import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  UserCredential, 
  AuthCredential 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { handleUserSignIn } from '../lib/userProfile';
import { initDB } from '../lib/db';


// Define the shape of our auth context
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>; 
  signIn: (email: string, password: string) => Promise<UserCredential>; 
  signInWithGoogle: () => Promise<UserCredential>; 
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set up listener for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Initialize database with user ID
        await initDB(user.uid);
        
        // Create or update user profile
        await handleUserSignIn(user);
      }
      
      setIsLoading(false);
    });
    
    // Clean up the listener on unmount
    return unsubscribe;
  }, []);
  
  // Sign up with email/password
  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  
  // Sign out
  const logOut = async () => {
    return signOut(auth);
  };
  
  // Reset password
  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };
  
  const value = {
    currentUser,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    resetPassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}