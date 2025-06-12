
import { useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
  adminStatus: boolean;
  initialized: boolean; // Add this field
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface UserProfile {
  email: string;
  name: string;
  role: 'user' | 'admin';
  isAdmin?: boolean;
  isActive?: boolean;
  favoriteTeams: string[];
  notificationSettings: {
    matchAlerts: boolean;
    news: boolean;
    teamUpdates: boolean;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export const useAuth = (): UseAuthReturn => {
  const { user, loading: contextLoading } = useContext(FirebaseAuthContext);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminStatus, setAdminStatus] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [userDocListener, setUserDocListener] = useState<(() => void) | null>(null);

  // Check if user is admin when user changes
  useEffect(() => {
    const setupAdminCheck = async () => {
      console.log('🔍 useAuth: Starting admin check setup');
      
      // Clean up previous listener
      if (userDocListener) {
        console.log('🧹 useAuth: Cleaning up previous listener');
        userDocListener();
        setUserDocListener(null);
      }

      if (!user) {
        console.log('❌ useAuth: No user, resetting admin status');
        setIsAdmin(false);
        setAdminStatus(false);
        setAuthUser(null);
        setInitialized(true);
        return;
      }

      try {
        console.log('👤 useAuth: Setting up admin check for user:', user.email, 'UID:', user.uid);
        
        // Map User to AuthUser
        const mappedUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        setAuthUser(mappedUser);
        
        if (!firestore) {
          console.log('🚫 useAuth: Firestore not available, defaulting to non-admin');
          setIsAdmin(false);
          setAdminStatus(false);
          setInitialized(true);
          return;
        }
        
        // Set up real-time listener for user document
        const userDocRef = doc(firestore, 'users', user.uid);
        console.log('📄 useAuth: Setting up listener for user document');
        
        const unsubscribe = onSnapshot(
          userDocRef,
          (docSnapshot) => {
            console.log('📄 useAuth: User document listener triggered');
            
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data() as UserProfile;
              
              // Multiple admin checks for maximum compatibility
              const isRoleAdmin = userData.role === 'admin';
              const isAdminFlag = userData.isAdmin === true;
              const adminCheck = isRoleAdmin || isAdminFlag;
              
              console.log('✅ useAuth: User data analysis:', {
                email: userData.email,
                role: userData.role,
                isAdmin: userData.isAdmin,
                isActive: userData.isActive,
                isRoleAdmin,
                isAdminFlag,
                finalAdminStatus: adminCheck
              });
              
              setIsAdmin(adminCheck);
              setAdminStatus(adminCheck);
              setInitialized(true);
              
              console.log(`🎯 useAuth: Admin status set to: ${adminCheck}`);
            } else {
              console.log('❌ useAuth: User document does not exist, defaulting to non-admin');
              setIsAdmin(false);
              setAdminStatus(false);
              setInitialized(true);
            }
          },
          (error) => {
            console.error('🚨 useAuth: Error listening to user document:', error);
            setIsAdmin(false);
            setAdminStatus(false);
            setInitialized(true);
          }
        );
        
        setUserDocListener(() => unsubscribe);
        
      } catch (err) {
        console.error('🚨 useAuth: Error setting up admin check:', err);
        setIsAdmin(false);
        setAdminStatus(false);
        setInitialized(true);
      }
    };

    setupAdminCheck();

    // Cleanup on unmount
    return () => {
      if (userDocListener) {
        console.log('🧹 useAuth: Cleaning up on unmount');
        userDocListener();
      }
    };
  }, [user]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth) {
        throw new Error('Auth instance is not initialized');
      }
      
      console.log('🔐 useAuth: Signing in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
      
      setLoading(false);
    } catch (error) {
      console.error('🚨 useAuth: Error signing in:', error);
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
      
      if (!auth) {
        throw new Error('Auth instance is not initialized');
      }
      
      if (!firestore) {
        throw new Error('Firestore is not initialized');
      }
      
      console.log('📝 useAuth: Creating user account:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: name
      });
      
      const userProfile: UserProfile = {
        email,
        name,
        role: 'user',
        isAdmin: false,
        isActive: true,
        favoriteTeams: [],
        notificationSettings: {
          matchAlerts: true,
          news: true,
          teamUpdates: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      console.log('✅ useAuth: User profile created in Firestore');
      
      setLoading(false);
    } catch (error) {
      console.error('🚨 useAuth: Error signing up:', error);
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
      
      console.log('👋 useAuth: Signing out user');
      
      if (userDocListener) {
        userDocListener();
        setUserDocListener(null);
      }
      
      await firebaseSignOut(auth);
      
      setIsAdmin(false);
      setAdminStatus(false);
      setAuthUser(null);
      setInitialized(false);
      
      setLoading(false);
    } catch (error) {
      console.error('🚨 useAuth: Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign out'));
      setLoading(false);
      throw error;
    }
  }, [userDocListener]);

  const overallLoading = contextLoading || loading || !initialized;

  // Detailed state logging
  useEffect(() => {
    console.log('📊 useAuth: Complete state update:', {
      hasUser: !!user,
      userEmail: user?.email,
      isAdmin,
      adminStatus,
      loading: overallLoading,
      initialized,
      contextLoading,
      authLoading: loading
    });
  }, [user, isAdmin, adminStatus, overallLoading, initialized, contextLoading, loading]);

  return {
    user,
    authUser,
    loading: !!overallLoading,
    error,
    isAdmin,
    adminStatus,
    initialized,
    signIn,
    signUp,
    signOut
  };
};

// STEP 3: Enhanced admin check hook for components
export const useAdminCheck = () => {
  const { isAdmin, adminStatus, loading, initialized } = useAuth();
  
  const hasAdminAccess = () => {
    if (!initialized || loading) {
      console.log('🚫 useAdminCheck: Not initialized or loading, denying access');
      return false;
    }
    
    const hasAccess = isAdmin === true || adminStatus === true;
    console.log('🔍 useAdminCheck: Access check result:', {
      hasAccess,
      isAdmin,
      adminStatus,
      initialized,
      loading
    });
    
    return hasAccess;
  };
  
  return {
    hasAdminAccess,
    isCheckingAdmin: !initialized || loading,
    isAdmin,
    adminStatus,
    initialized
  };
};