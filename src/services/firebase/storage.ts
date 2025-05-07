// src/services/firebase/storage.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a team logo to Firebase Storage
 */
export const uploadTeamLogo = async (teamId: string, imageUri: string): Promise<string> => {
  try {
    console.log(`Uploading team logo for team ID: ${teamId}`);
    
    // Make sure storage is initialized
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    // Create a reference to the team logo path
    const storageRef = ref(storage, `teams/${teamId}/logo.jpg`);
    
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    console.log(`Uploading blob of size: ${blob.size}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, blob);
    console.log(`Upload complete: ${snapshot.metadata.fullPath}`);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`Download URL: ${downloadURL}`);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading team logo:', error);
    throw error;
  }
};

/**
 * Upload a player photo to Firebase Storage
 */
export const uploadPlayerPhoto = async (playerId: string, imageUri: string): Promise<string> => {
  try {
    console.log(`Uploading player photo for player ID: ${playerId}`);
    
    // Make sure storage is initialized
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    // Create a reference to the player photo path
    const storageRef = ref(storage, `players/${playerId}/photo.jpg`);
    
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    console.log(`Uploading blob of size: ${blob.size}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, blob);
    console.log(`Upload complete: ${snapshot.metadata.fullPath}`);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`Download URL: ${downloadURL}`);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading player photo:', error);
    throw error;
  }
};