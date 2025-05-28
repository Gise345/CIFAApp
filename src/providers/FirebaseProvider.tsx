// src/providers/FirebaseProvider.tsx - Updated with Auth Persistence
import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { auth, firestore, checkFirestoreConnection } from '../services/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseAuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Check Firebase connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkFirestoreConnection();
        if (!connected) {
          setConnectionError('Unable to connect to Firebase. Please check your internet connection.');
        }
        setConnectionChecked(true);
      } catch (error) {
        console.error('Error checking Firebase connection:', error);
        setConnectionError('Error initializing Firebase. Please restart the app.');
        setConnectionChecked(true);
      }
    };

    checkConnection();
  }, []);

  // Set up auth state listener with persistence
  useEffect(() => {
    if (!connectionChecked) return;
    if (!auth) return;

    // Load cached user data on app start
    const loadCachedUser = async () => {
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          console.log('Loading cached user data');
          // Don't set user from cache, let Firebase auth handle it
          // This is just to show we're loading from cache
        }
      } catch (error) {
        console.error('Error loading cached user:', error);
      }
    };

    loadCachedUser();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      
      try {
        if (user) {
          // Cache user data
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          };
          
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          console.log('User data cached successfully');
        } else {
          // Clear cached user data on sign out
          await AsyncStorage.removeItem('userData');
          console.log('User data cache cleared');
        }
        
        setUser(user);
        setInitializing(false);
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setUser(user);
        setInitializing(false);
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [connectionChecked]);

  if (!connectionChecked || initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.text}>
          {!connectionChecked ? 'Connecting to Firebase...' : 'Checking authentication...'}
        </Text>
      </View>
    );
  }

  if (connectionError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{connectionError}</Text>
      </View>
    );
  }

  return (
    <FirebaseAuthContext.Provider value={{ user, loading: initializing }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    padding: 20,
  },
});

export default FirebaseProvider;