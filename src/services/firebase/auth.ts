// CIFAMobileApp/src/services/firebase/auth.ts
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
    User,
    UserCredential
  } from 'firebase/auth';
  import { doc, setDoc, getDoc } from 'firebase/firestore';
  import { auth, firestore } from './config';
  
  interface SignUpParams {
    email: string;
    password: string;
    name: string;
  }
  
  interface UserProfile {
    email: string;
    name: string;
    role: 'user' | 'admin';
    favoriteTeams: string[];
    notificationSettings: {
      matchAlerts: boolean;
      news: boolean;
      teamUpdates: boolean;
    };
    createdAt: Date;
  }
  
  /**
   * Sign up a new user with email and password
   */
  export const signUp = async ({ email, password, name }: SignUpParams): Promise<User | null> => {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });
  
      // Create user document in Firestore
      const userProfile: UserProfile = {
        email,
        name,
        role: 'user',
        favoriteTeams: [],
        notificationSettings: {
          matchAlerts: true,
          news: true,
          teamUpdates: true
        },
        createdAt: new Date()
      };
  
      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      
      return user;
    } catch (error) {
      console.error('Error signing up user:', error);
      throw error;
    }
  };
  
  /**
   * Sign in an existing user with email and password
   */
  export const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in user:', error);
      throw error;
    }
  };
  
  /**
   * Sign out the current user
   */
  export const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out user:', error);
      throw error;
    }
  };
  
  /**
   * Send password reset email to the specified email address
   */
  export const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };
  
  /**
   * Get the current authenticated user
   */
  export const getCurrentUser = (): User | null => {
    return auth.currentUser;
  };
  
  /**
   * Get user role (admin or user)
   */
  export const getUserRole = async (uid: string): Promise<string | null> => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data()?.role || 'user';
      }
      return 'user';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }
  };
  
  /**
   * Check if a user is an admin
   */
  export const isAdmin = async (uid: string): Promise<boolean> => {
    const role = await getUserRole(uid);
    return role === 'admin';
  };