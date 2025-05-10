// src/utils/firestoreDebug.ts
import { 
    collection, 
    query, 
    getDocs, 
    getDoc, 
    doc, 
    limit as firestoreLimit 
  } from 'firebase/firestore';
  import { firestore } from '../services/firebase/config';
  
  /**
   * Debug utility to test Firestore connection and log results
   */
  export const testFirestoreConnection = async (): Promise<boolean> => {
    console.log('Testing Firestore connection...');
    
    if (!firestore) {
      console.error('❌ Firestore instance is not initialized');
      return false;
    }
    
    console.log('✓ Firestore instance is initialized');
    
    try {
      // Try to get a single document from teams collection
      const teamsRef = collection(firestore, 'teams');
      const q = query(teamsRef, firestoreLimit(1));
      
      console.log('Attempting to fetch a single team document...');
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('✓ Query executed successfully but returned no documents');
        return true;
      }
      
      console.log(`✓ Query executed successfully and returned ${snapshot.docs.length} document(s)`);
      
      // Log details of the document for debugging
      snapshot.docs.forEach(docSnapshot => {
        console.log(`Document ID: ${docSnapshot.id}`);
        console.log('Document data:', docSnapshot.data());
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error testing Firestore connection:', error);
      return false;
    }
  };
  
  /**
   * Test if a specific collection exists and log its contents
   */
  export const testCollection = async (collectionName: string): Promise<boolean> => {
    console.log(`Testing collection: ${collectionName}`);
    
    if (!firestore) {
      console.error('❌ Firestore instance is not initialized');
      return false;
    }
    
    try {
      const collectionRef = collection(firestore, collectionName);
      const q = query(collectionRef, firestoreLimit(10));
      
      console.log(`Attempting to fetch documents from ${collectionName}...`);
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`✓ Collection ${collectionName} exists but contains no documents`);
        return true;
      }
      
      console.log(`✓ Collection ${collectionName} exists and contains ${snapshot.docs.length} document(s)`);
      
      // Log the first few documents
      console.log('First few documents:');
      snapshot.docs.forEach((docSnapshot, index) => {
        console.log(`Document ${index + 1} - ID: ${docSnapshot.id}`);
        console.log('Data:', JSON.stringify(docSnapshot.data(), null, 2));
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Error testing collection ${collectionName}:`, error);
      return false;
    }
  };
  
  /**
   * Test if a specific document exists
   */
  export const testDocument = async (collectionName: string, documentId: string): Promise<boolean> => {
    console.log(`Testing document: ${collectionName}/${documentId}`);
    
    if (!firestore) {
      console.error('❌ Firestore instance is not initialized');
      return false;
    }
    
    try {
      const docRef = doc(firestore, collectionName, documentId);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        console.log(`✓ Document ${collectionName}/${documentId} does not exist`);
        return false;
      }
      
      console.log(`✓ Document ${collectionName}/${documentId} exists`);
      console.log('Document data:', JSON.stringify(docSnapshot.data(), null, 2));
      
      return true;
    } catch (error) {
      console.error(`❌ Error testing document ${collectionName}/${documentId}:`, error);
      return false;
    }
  };
  
  /**
   * Get a list of collections in the database
   * Note: This is only possible in the Firebase console or with Admin SDK.
   * This function will always return an empty array in client apps.
   */
  export const listCollections = async (): Promise<void> => {
    console.log('Attempting to list collections (Note: This operation is not supported in client SDKs)');
    
    if (!firestore) {
      console.error('❌ Firestore instance is not initialized');
      return;
    }
    
    console.log('Collections to try:', [
      'teams',
      'players',
      'matches',
      'leagues',
      'leagueStandings',
      'users',
      'news',
      'settings',
      'notifications'
    ]);
    
    console.log('You can check if these collections exist by calling testCollection() for each one.');
  };