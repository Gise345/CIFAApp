// scripts/duplicateDocument.js
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection,
  getDocs,
  query,
  where
} = require('firebase/firestore');
const readline = require('readline');
const dotenv = require('dotenv');
const { 
    getAuth, 
    signInWithEmailAndPassword 
  } = require('firebase/auth');
  

// Load environment variables
dotenv.config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Add this authentication function
async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    try {
      // Replace with your admin email and password
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      
      if (!email || !password) {
        throw new Error('Admin credentials not found in environment variables');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Successfully authenticated as admin');
      return userCredential.user;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw error;
    }
  }

// Create readline interface for command-line interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Duplicates a Firestore document from one location to another
 */
async function duplicateDocument(sourcePath, destinationCollection, newDocId, fieldsToModify) {
  try {
    // Parse the source path to get collection and document ID
    const pathParts = sourcePath.split('/');
    if (pathParts.length !== 2) {
      throw new Error("Source path must be in format 'collection/documentId'");
    }
    
    // Get the source document
    const sourceDocRef = doc(db, sourcePath);
    const sourceSnapshot = await getDoc(sourceDocRef);
    
    if (!sourceSnapshot.exists()) {
      throw new Error(`Source document at path ${sourcePath} does not exist`);
    }
    
    // Get the source data
    const sourceData = sourceSnapshot.data();
    
    // Prepare the data for the new document by merging with fieldsToModify if provided
    const newData = {
      ...sourceData,
      ...(fieldsToModify || {}),
      // Add any metadata fields you want to set for the duplicated document
      duplicatedFrom: sourcePath,
      duplicatedAt: new Date()
    };
    
    let newDocumentId;
    
    // Create the new document
    if (newDocId) {
      // Use specific ID
      const newDocRef = doc(db, destinationCollection, newDocId);
      await setDoc(newDocRef, newData);
      newDocumentId = newDocId;
    } else {
      // Let Firestore generate an ID
      const collectionRef = collection(db, destinationCollection);
      const newDocRef = await addDoc(collectionRef, newData);
      newDocumentId = newDocRef.id;
    }
    
    console.log(`Document duplicated successfully! New ID: ${newDocumentId}`);
    return newDocumentId;
  } catch (error) {
    console.error('Error duplicating document:', error);
    throw error;
  }
}

/**
 * Duplicates multiple documents that match a query
 */
async function duplicateMultipleDocuments(sourceCollection, destinationCollection, whereConditions, fieldsToModify) {
  try {
    // Build the query
    let q = collection(db, sourceCollection);
    
    if (whereConditions && whereConditions.length > 0) {
      // Apply where conditions to the query
      q = query(
        q,
        ...whereConditions.map(condition => where(condition.field, condition.operator, condition.value))
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No documents found in ${sourceCollection} that match the query.`);
      return [];
    }
    
    console.log(`Found ${querySnapshot.size} documents to duplicate.`);
    
    // Duplicate each document
    const newDocIds = [];
    for (const document of querySnapshot.docs) {
      const sourcePath = `${sourceCollection}/${document.id}`;
      
      const newId = await duplicateDocument(
        sourcePath,
        destinationCollection,
        undefined, // Let Firestore generate IDs
        fieldsToModify
      );
      
      newDocIds.push(newId);
    }
    
    return newDocIds;
  } catch (error) {
    console.error('Error duplicating multiple documents:', error);
    throw error;
  }
}

/**
 * Prompts for a single document duplication
 */
async function promptSingleDuplication() {
  rl.question('Enter source path (e.g., "teams/teamId"): ', (sourcePath) => {
    rl.question('Enter destination collection: ', (destinationCollection) => {
      rl.question('Enter custom ID for new document (leave blank for auto-generated): ', (newDocId) => {
        rl.question('Enter fields to modify in JSON format (leave blank for none): ', async (fieldsString) => {
          try {
            const fieldsToModify = fieldsString ? JSON.parse(fieldsString) : null;
            
            await duplicateDocument(
              sourcePath,
              destinationCollection,
              newDocId || undefined,
              fieldsToModify
            );
            
            askToContinue();
          } catch (error) {
            console.error('Error during duplication:', error.message);
            askToContinue();
          }
        });
      });
    });
  });
}

/**
 * Prompts for multiple document duplication
 */
async function promptMultipleDuplication() {
  rl.question('Enter source collection: ', (sourceCollection) => {
    rl.question('Enter destination collection: ', (destinationCollection) => {
      rl.question('Do you want to add query conditions? (y/n): ', async (addConditions) => {
        let whereConditions = [];
        
        if (addConditions.toLowerCase() === 'y') {
          promptForCondition();
        } else {
          promptForFieldModifications();
        }
        
        function promptForCondition() {
          rl.question('Enter field path: ', (field) => {
            rl.question('Enter operator (==, >, <, >=, <=, array-contains, array-contains-any, in, not-in): ', (operator) => {
              rl.question('Enter value (use JSON format for complex values): ', (valueStr) => {
                let value;
                try {
                  value = JSON.parse(valueStr);
                } catch (e) {
                  // If not valid JSON, use the string as is
                  value = valueStr;
                }
                
                whereConditions.push({ field, operator, value });
                
                rl.question('Add another condition? (y/n): ', (another) => {
                  if (another.toLowerCase() === 'y') {
                    promptForCondition();
                  } else {
                    promptForFieldModifications();
                  }
                });
              });
            });
          });
        }
        
        function promptForFieldModifications() {
          rl.question('Enter fields to modify in JSON format (leave blank for none): ', async (fieldsString) => {
            try {
              const fieldsToModify = fieldsString ? JSON.parse(fieldsString) : null;
              
              console.log('Starting duplication...');
              await duplicateMultipleDocuments(
                sourceCollection,
                destinationCollection,
                whereConditions.length > 0 ? whereConditions : undefined,
                fieldsToModify
              );
              
              askToContinue();
            } catch (error) {
              console.error('Error during duplication:', error.message);
              askToContinue();
            }
          });
        }
      });
    });
  });
}

/**
 * Ask if the user wants to continue
 */
function askToContinue() {
  rl.question('Do you want to perform another operation? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      showMainMenu();
    } else {
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
    }
  });
}

/**
 * Show the main menu
 */
function showMainMenu() {
  console.log('\n===== Firestore Document Duplicator =====');
  console.log('1. Duplicate a single document');
  console.log('2. Duplicate multiple documents');
  console.log('3. Exit');
  
  rl.question('Enter your choice (1-3): ', (choice) => {
    switch (choice) {
      case '1':
        promptSingleDuplication();
        break;
      case '2':
        promptMultipleDuplication();
        break;
      case '3':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid choice. Please try again.');
        showMainMenu();
        break;
    }
  });
}

// Start the program
console.log('Connecting to Firebase...');
showMainMenu();

authenticateAsAdmin()
  .then(() => {
    showMainMenu();
  })
  .catch((error) => {
    console.error('Failed to authenticate. Cannot proceed with document duplication.');
    process.exit(1);
  });