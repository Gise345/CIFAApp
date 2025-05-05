// src/utils/firestoreDuplicator.ts
import { firestore } from '../services/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  setDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

/**
 * Duplicates a Firestore document from one location to another
 * 
 * @param sourcePath Path to the source document (e.g., 'teams/teamId')
 * @param destinationCollection Destination collection (e.g., 'teams')
 * @param newDocId Optional specific ID for the new document. If not provided, Firestore will auto-generate one.
 * @param fieldsToModify Optional object containing fields to modify in the duplicated document
 * @returns The ID of the newly created document
 */
export const duplicateDocument = async (
  sourcePath: string,
  destinationCollection: string,
  newDocId?: string,
  fieldsToModify?: Record<string, any>
): Promise<string> => {
  try {
    // Parse the source path to get collection and document ID
    const pathParts = sourcePath.split('/');
    if (pathParts.length !== 2) {
      throw new Error("Source path must be in format 'collection/documentId'");
    }
    
    // Get the source document
    const sourceDocRef = doc(firestore, sourcePath);
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
    
    let newDocumentId: string;
    
    // Create the new document
    if (newDocId) {
      // Use specific ID
      const newDocRef = doc(firestore, destinationCollection, newDocId);
      await setDoc(newDocRef, newData);
      newDocumentId = newDocId;
    } else {
      // Let Firestore generate an ID
      const collectionRef = collection(firestore, destinationCollection);
      const newDocRef = await addDoc(collectionRef, newData);
      newDocumentId = newDocRef.id;
    }
    
    console.log(`Document duplicated successfully: ${newDocumentId}`);
    return newDocumentId;
  } catch (error) {
    console.error('Error duplicating document:', error);
    throw error;
  }
};

/**
 * Duplicates multiple documents that match a query
 * 
 * @param sourceCollection Source collection name
 * @param destinationCollection Destination collection name
 * @param whereConditions Array of where conditions to filter source documents
 * @param fieldsToModify Optional object containing fields to modify in all duplicated documents
 * @returns Array of IDs of the newly created documents
 */
export const duplicateMultipleDocuments = async (
  sourceCollection: string,
  destinationCollection: string,
  whereConditions?: [fieldPath: string, opStr: string, value: any][],
  fieldsToModify?: Record<string, any>
): Promise<string[]> => {
  try {
    // Build the query
    let docsQuery = collection(firestore, sourceCollection);
    
    if (whereConditions && whereConditions.length > 0) {
      // Apply where conditions to the query
      const q = query(
        docsQuery,
        ...whereConditions.map(condition => where(condition[0], condition[1] as any, condition[2]))
      );
      const querySnapshot = await getDocs(q);
      
      // Duplicate each document
      const newDocIds: string[] = [];
      const promises = querySnapshot.docs.map(async (doc) => {
        const sourcePath = `${sourceCollection}/${doc.id}`;
        const newId = await duplicateDocument(
          sourcePath,
          destinationCollection,
          undefined, // Let Firestore generate IDs
          fieldsToModify
        );
        newDocIds.push(newId);
      });
      
      await Promise.all(promises);
      return newDocIds;
    } else {
      // If no conditions, get all documents from the collection
      const querySnapshot = await getDocs(docsQuery);
      
      // Duplicate each document
      const newDocIds: string[] = [];
      const promises = querySnapshot.docs.map(async (doc) => {
        const sourcePath = `${sourceCollection}/${doc.id}`;
        const newId = await duplicateDocument(
          sourcePath,
          destinationCollection,
          undefined, // Let Firestore generate IDs
          fieldsToModify
        );
        newDocIds.push(newId);
      });
      
      await Promise.all(promises);
      return newDocIds;
    }
  } catch (error) {
    console.error('Error duplicating multiple documents:', error);
    throw error;
  }
};

export default {
  duplicateDocument,
  duplicateMultipleDocuments
};