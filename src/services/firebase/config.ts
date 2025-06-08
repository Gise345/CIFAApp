// src/services/firebase/config.ts - Updated with Auth Persistence
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth } from 'firebase/auth';
import { getFirestore, Firestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Firebase configuration safely
const getFirebaseConfig = () => {
  try {
    // Try expo-constants first
    if (Constants.expoConfig?.extra) {
      return {
        apiKey: Constants.expoConfig.extra.firebaseApiKey,
        authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
        projectId: Constants.expoConfig.extra.firebaseProjectId,
        storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
        messagingSenderId: Constants.expoConfig.extra.firebaseMessagingSenderId,
        appId: Constants.expoConfig.extra.firebaseAppId,
        measurementId: Constants.expoConfig.extra.firebaseMeasurementId,
      };
    }
    
    // If that fails, try environment variables
    if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
      return {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      };
    }
    
    console.warn('Could not find Firebase config in any of the expected locations');
    return null;
  } catch (error) {
    console.error('Error reading Firebase config:', error);
    return null;
  }
};

// Initialize Firebase safely
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let storage: FirebaseStorage | undefined;

try {
  // Get the config
  const firebaseConfig = getFirebaseConfig();
  
  if (!firebaseConfig) {
    console.error('Failed to get Firebase config');
  } else {
    // Initialize Firebase
    if (getApps().length === 0) {
      console.log('Initializing new Firebase app');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Reusing existing Firebase app');
      app = getApp();
    }
    
    // Initialize Firebase services
    if (app) {
      try {
        // Initialize Auth with persistence - Firebase v9+ automatically uses AsyncStorage for React Native
        auth = initializeAuth(app, {
          // In Firebase v9+, React Native auth automatically persists to AsyncStorage
          // No need to explicitly set persistence
        });
        console.log('Firebase Auth initialized with automatic persistence');
      } catch (e) {
        // If initializeAuth fails (already initialized), use getAuth
        try {
          auth = getAuth(app);
          console.log('Using existing Firebase Auth instance');
        } catch (authError) {
          console.error('Error getting Firebase Auth:', authError);
        }
      }
      
      try {
        firestore = getFirestore(app);
      } catch (e) {
        console.error('Error initializing Firestore:', e);
      }
      
      try {
        storage = getStorage(app);
      } catch (e) {
        console.error('Error initializing Firebase Storage:', e);
      }
    }
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Function to check if Firestore connection is working
export const checkFirestoreConnection = async (): Promise<boolean> => {
  if (!firestore) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    // Try to fetch a single document from any collection with a limit
    const teamsQuery = query(
      collection(firestore, 'teams'),
      limit(1)
    );
    
    await getDocs(teamsQuery);
    return true;
  } catch (error) {
    console.error('Error checking Firestore connection:', error);
    return false;
  }
};

export { app, auth, firestore, storage };