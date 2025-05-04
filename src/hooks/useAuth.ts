// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../services/firebase/config';

type AuthUser = User | null;

interface UseAuthReturn {
  user: AuthUser;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        try {
          if (firebaseUser) {
            setUser(firebaseUser);
            
            // Check if user is admin
            const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setIsAdmin(userData.role === 'admin');
            } else {
              setIsAdmin(false);
            }
          } else {
            setUser(null);
            setIsAdmin(false);
          }
          setError(null);
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError(err instanceof Error ? err : new Error('Authentication error'));
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return { user, loading, error, isAdmin };
};