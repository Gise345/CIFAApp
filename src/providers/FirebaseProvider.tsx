// src/providers/FirebaseProvider.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { auth, firestore, checkFirestoreConnection } from '../services/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

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

  // Set up auth state listener
  useEffect(() => {
    if (!connectionChecked) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInitializing(false);
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
        <Text style={styles.text}>Initializing app...</Text>
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