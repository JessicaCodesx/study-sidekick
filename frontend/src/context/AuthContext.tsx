// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { handleUserSignIn } from '../lib/userProfile';
import userService from '../services/userService';
import { User } from '../lib/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isLoading: true,
  error: null,
  signUp: async () => { throw new Error('Not implemented'); },
  signIn: async () => { throw new Error('Not implemented'); },
  signInWithGoogle: async () => { throw new Error('Not implemented'); },
  logOut: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); }
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    // If Firebase auth is not available, skip authentication
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user profile from backend
          const profile = await userService.getUserProfile();
          setUserProfile(profile);
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          
          // If there's no profile on the backend, create one from Firebase info
          try {
            const defaultProfile = await handleUserSignIn(user);
            setUserProfile(defaultProfile);
          } catch (profileError) {
            console.error('Error creating user profile:', profileError);
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up
  const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) {
      const errorMsg = 'Firebase authentication is not available. Please configure Firebase environment variables.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in
  const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) {
      const errorMsg = 'Firebase authentication is not available. Please configure Firebase environment variables.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    if (!auth) {
      const errorMsg = 'Firebase authentication is not available. Please configure Firebase environment variables.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Log out
  const logOut = async (): Promise<void> => {
    if (!auth) {
      return; // No-op if auth is not available
    }
    setError(null);
    try {
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) {
      const errorMsg = 'Firebase authentication is not available. Please configure Firebase environment variables.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};