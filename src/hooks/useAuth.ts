// src/hooks/useAuth.ts
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
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

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

export const useAuth = (): UseAuthReturn => {
  const { user, loading: contextLoading } = useContext(FirebaseAuthContext);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Check if user is admin when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAuthUser(null);
        return;
      }

      try {
        // Map User to AuthUser
        setAuthUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        // Check if user is admin
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    };

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
      await firebaseSignOut(auth);
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign out'));
      setLoading(false);
      throw error;
    }
  }, []);

  return {
    user,
    authUser,
    loading: loading || contextLoading,
    error,
    isAdmin,
    signIn,
    signUp,
    signOut
  };
};