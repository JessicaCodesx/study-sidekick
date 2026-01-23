// src/context/AuthContext.tsx
// Simplified no-op auth context for local-only app
import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  currentUser: null;
  userProfile: null;
  isLoading: false;
  error: null;
  signUp: (email: string, password: string) => Promise<never>;
  signIn: (email: string, password: string) => Promise<never>;
  signInWithGoogle: () => Promise<never>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isLoading: false,
  error: null,
  signUp: async () => { throw new Error('Authentication not available in local-only mode'); },
  signIn: async () => { throw new Error('Authentication not available in local-only mode'); },
  signInWithGoogle: async () => { throw new Error('Authentication not available in local-only mode'); },
  logOut: async () => {},
  resetPassword: async () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // No-op provider - app runs in local-only mode without authentication
  const value: AuthContextType = {
    currentUser: null,
    userProfile: null,
    isLoading: false,
    error: null,
    signUp: async () => { throw new Error('Authentication not available in local-only mode'); },
    signIn: async () => { throw new Error('Authentication not available in local-only mode'); },
    signInWithGoogle: async () => { throw new Error('Authentication not available in local-only mode'); },
    logOut: async () => {},
    resetPassword: async () => {}
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};