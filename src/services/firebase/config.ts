// CIFAMobileApp/src/services/firebase/config.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore, collection, getDocs, limit } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the Firebase configuration from Expo Constants
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

// Initialize Firebase only if it hasn't been initialized already
let app;
let auth;

if (getApps().length === 0) {
  // No Firebase app initialized yet, so initialize a new one
  console.log('Initializing new Firebase app');
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with AsyncStorage persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    console.warn('Error initializing auth with persistence:', error);
    // Fall back to default auth if persistence setup fails
    auth = getAuth(app);
  }
} else {
  // Firebase app already initialized, get the existing one
  console.log('Reusing existing Firebase app');
  app = getApp();
  auth = getAuth(app);
}

// Get Firestore and Storage instances
const firestore = getFirestore(app);
const storage = getStorage(app);

// Function to check if Firestore connection is working
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch a single document from any collection
    const querySnapshot = await getDocs(collection(firestore, 'teams')); 
    return true;
  } catch (error) {
    console.error('Error checking Firestore connection:', error);
    return false;
  }
};

export { auth, firestore, storage };
export default app;