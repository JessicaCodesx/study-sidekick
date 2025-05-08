import { User as FirebaseUser } from 'firebase/auth';
import { getUserSettings, saveUserSettings } from './db';
import { User } from './types';

// Create or update a user profile when signing in
export async function handleUserSignIn(firebaseUser: FirebaseUser): Promise<User> {
  try {
    // Try to get existing user settings
    let userSettings = await getUserSettings();
    
    // If user doesn't exist, create a new one
    if (!userSettings) {
      userSettings = {
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
        avatar: firebaseUser.photoURL || undefined,
        theme: 'system',
        studyStreak: 0,
        userId: firebaseUser.uid // Add Firebase UID
      };
    } else {
      // Update with latest Firebase user info if available
      if (firebaseUser.displayName && !userSettings.displayName) {
        userSettings.displayName = firebaseUser.displayName;
      }
      
      if (firebaseUser.photoURL && !userSettings.avatar) {
        userSettings.avatar = firebaseUser.photoURL;
      }
      
      // Always ensure the userId is set/updated
      userSettings.userId = firebaseUser.uid;
    }
    
    // Save the user settings
    await saveUserSettings(userSettings);
    
    return userSettings;
  } catch (error) {
    console.error('Error handling user sign in:', error);
    
    // Return a default user if something goes wrong
    return {
      displayName: firebaseUser.displayName || 'Student',
      theme: 'system',
      studyStreak: 0,
      userId: firebaseUser.uid
    };
  }
}

// Get user initials for display
export function getUserInitials(user: User | null): string {
  if (!user || !user.displayName) return 'S';
  
  const nameParts = user.displayName.split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
}

// Check if user has performed an activity today to maintain streak
export function checkStudyStreak(user: User | null): boolean {
  if (!user || !user.lastStudyDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudyDate = new Date(user.lastStudyDate);
  lastStudyDate.setHours(0, 0, 0, 0);
  
  return today.getTime() === lastStudyDate.getTime();
}

// Update user's study streak
export async function updateStudyStreak(user: User): Promise<User> {
  if (!user) throw new Error('User is required to update study streak');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If last study date is undefined or not today
  if (!user.lastStudyDate) {
    // First time studying
    user.studyStreak = 1;
    user.lastStudyDate = today.getTime();
  } else {
    const lastStudyDate = new Date(user.lastStudyDate);
    lastStudyDate.setHours(0, 0, 0, 0);
    
    if (today.getTime() === lastStudyDate.getTime()) {
      // Already studied today, just return current user
      return user;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastStudyDate.getTime() === yesterday.getTime()) {
      // Studied yesterday, increment streak
      user.studyStreak += 1;
    } else {
      // Streak broken, reset to 1
      user.studyStreak = 1;
    }
    
    user.lastStudyDate = today.getTime();
  }
  
  // Save updated user
  await saveUserSettings(user);
  
  return user;
}