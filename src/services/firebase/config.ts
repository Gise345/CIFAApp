// CIFAMobileApp/src/services/firebase/config.ts
import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, limit, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import Constants from 'expo-constants';

// Initialize Firebase - use your actual Firebase config here
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId ?? process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent multiple initializations)
let firebaseApp;
try {
  firebaseApp = getApp();
} catch (error) {
  firebaseApp = initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Note: Messaging only works on web and native platforms with proper setup
let messaging;
try {
  messaging = getMessaging(firebaseApp);
} catch (error) {
  console.log('Firebase messaging is not available on this platform');
}

// Function to help check connection status
const checkFirestoreConnection = async () => {
  try {
    // Try to access a test collection to check connection
    const testCollectionRef = collection(firestore, 'test_collection');
    const q = query(testCollectionRef, limit(1));
    const querySnapshot = await getDocs(q);
    
    console.log('Firestore connection successful');
    return true;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return false;
  }
};

export { auth, firestore, storage, messaging, firebaseApp, checkFirestoreConnection };