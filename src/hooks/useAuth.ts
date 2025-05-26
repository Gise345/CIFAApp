// src/hooks/useAuth.ts - Fixed for better admin detection
import { useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../services/firebase/config';
import { FirebaseAuthContext } from '../providers/FirebaseProvider';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface UseAuthReturn {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean | null; // null means not yet determined
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
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

export const useAuth = (): UseAuthReturn => {
  const { user, loading: contextLoading } = useContext(FirebaseAuthContext);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [adminCheckCompleted, setAdminCheckCompleted] = useState<boolean>(false);

  // Check if user is admin when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(null);
        setAuthUser(null);
        setAdminCheckCompleted(true);
        return;
      }

      try {
        console.log('Checking admin status for user:', user.email);
        
        // Map User to AuthUser
        setAuthUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        if (!firestore) {
          console.log('Firestore not available, defaulting to non-admin');
          setIsAdmin(false);
          setAdminCheckCompleted(true);
          return;
        }
        
        // Check if user is admin
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;
          const adminStatus = userRole === 'admin';
          
          console.log('User role from Firestore:', userRole);
          console.log('Is admin:', adminStatus);
          
          setIsAdmin(adminStatus);
        } else {
          console.log('User document does not exist, defaulting to non-admin');
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setAdminCheckCompleted(true);
      }
    };

    setAdminCheckCompleted(false);
    checkAdminStatus();
  }, [user]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth) {
        throw new Error('Auth instance is not initialized');
      }
      
      console.log('Signing in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
      
      setLoading(false);
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign in'));
      setLoading(false);
      throw error;
    }
  }, []);

  // Sign up with email, password, and name
  const signUp = useCallback(async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user in Firebase Auth
      if (!auth) {
        throw new Error('Auth instance is not initialized');
      }
      
      if (!firestore) {
        throw new Error('Firestore is not initialized');
      }
      
      console.log('Creating user account:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });
      
      // Create user document in Firestore
      const userProfile: UserProfile = {
        email,
        name,
        role: 'user', // Default role
        favoriteTeams: [],
        notificationSettings: {
          matchAlerts: true,
          news: true,
          teamUpdates: true
        },
        createdAt: new Date()
      };
      
      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      console.log('User profile created in Firestore');
      
      setLoading(false);
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign up'));
      setLoading(false);
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (!auth) {
        throw new Error('Auth instance is not initialized');
      }
      
      console.log('Signing out user');
      await firebaseSignOut(auth);
      
      // Reset admin status
      setIsAdmin(null);
      setAuthUser(null);
      setAdminCheckCompleted(false);
      
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign out'));
      setLoading(false);
      throw error;
    }
  }, []);

  // Return loading true if context is loading OR if we haven't completed admin check
  const overallLoading = contextLoading || loading || (user && !adminCheckCompleted);

  return {
    user,
    authUser,
    loading: !!overallLoading,
    error,
    isAdmin: adminCheckCompleted ? (isAdmin ?? false) : null,
    signIn,
    signUp,
    signOut
  };
};