// src/services/firebase/storage.ts - Enhanced
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from './config';

/**
 * Get a download URL for a team logo
 * @param teamId Team ID
 * @param teamName Team name (used for the filename)
 * @returns Promise resolving to download URL
 */
export const getTeamLogoURL = async (teamId: string, teamName: string): Promise<string | null> => {
  if (!teamId || !teamName || !storage) {
    return null;
  }
  
  try {
    // Try multiple filename formats to find the logo
    const formats = [
      // Based on your Firebase data, try these formats in order
      `Team Logos/${teamName.trim().replace(/\s+/g, '')}-logo.jpeg`,
      `Team Logos/${teamName.trim().replace(/\s+/g, '')}-logo.png`,
      `Team Logos/${teamName.trim().replace(/\s+/g, '')}-logo.svg`,
      `Team Logos/${teamId.split('-')[0]}-logo.jpeg`,
      `Team Logos/${teamId.split('-')[0]}-logo.png`,
      `Team Logos/${teamId.split('-')[0]}-logo.svg`,
      `Team Logos/${teamName.trim().split(' ')[0]}-logo.jpeg`, // For teams like "Academy Sports Club"
      `Team Logos/${teamName.trim().split(' ')[0]}-logo.png`,
      `Team Logos/${teamName.trim().split(' ')[0]}-logo.svg`
    ];
    
    // Try each format until we find a match
    for (const format of formats) {
      try {
        const logoRef = ref(storage, format);
        const url = await getDownloadURL(logoRef);
        return url;
      } catch (e) {
        // Continue to the next format if this one fails
        continue;
      }
    }
    
    // If no formats match, return null
    return null;
  } catch (error) {
    console.warn(`Team logo not found for team: ${teamName}`, error);
    return null;
  }
};

/**
 * For cases where you need a direct URL without using getDownloadURL
 * Note: This should be a fallback only, prefer using getTeamLogoURL when possible
 * @param teamName Team name for the filename
 * @returns Direct URL string to the logo
 */
export const getDirectTeamLogoURL = (teamName: string): string => {
  if (!teamName) return '';
  
  // Based on common pattern in your Firebase data
  const formattedName = teamName.trim().replace(/\s+/g, '');
  
  // Try the most common format first (PNG)
  return `https://firebasestorage.googleapis.com/v0/b/cifa-mobile-app.firebasestorage.app/o/Team%20Logos%2F${encodeURIComponent(formattedName)}-logo.png?alt=media`;
};

/**
 * Upload a team logo to Firebase Storage
 * @param teamId Team ID
 * @param imageUri Uri of the image to upload
 * @returns Promise resolving to the download URL
 */
export const uploadTeamLogo = async (teamId: string, teamName: string, imageUri: string): Promise<string> => {
  try {
    console.log(`Uploading team logo for team ID: ${teamId}`);
    
    // Make sure storage is initialized
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    // Format the filename based on the common pattern in your data
    const formattedName = teamName.trim().replace(/\s+/g, '');
    
    // Create a reference to the team logo path using your actual storage pattern
    const storageRef = ref(storage, `Team Logos/${formattedName}-logo.png`);
    
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
 * Get a download URL for a player photo
 * @param playerId Player ID
 * @param playerName Player name (for filename if needed)
 * @returns Promise resolving to download URL
 */
export const getPlayerPhotoURL = async (playerId: string, playerName: string): Promise<string | null> => {
  if (!playerId || !storage) {
    return null;
  }
  
  try {
    // Try first with player ID
    try {
      const photoRef = ref(storage, `players/${playerId}/photo.jpg`);
      const url = await getDownloadURL(photoRef);
      return url;
    } catch (idError) {
      // If not found by ID, try with name
      const formattedName = playerName.replace(/\s+/g, '_');
      const photoRefByName = ref(storage, `Player Photos/${formattedName}.jpg`);
      const url = await getDownloadURL(photoRefByName);
      return url;
    }
  } catch (error) {
    console.warn(`Player photo not found for player: ${playerName}`, error);
    return null;
  }
};

/**
 * Upload a player photo to Firebase Storage
 * @param playerId Player ID
 * @param imageUri URI of the image to upload
 * @returns Promise resolving to the download URL
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

/**
 * Get a download URL for a news article image
 * @param newsId News article ID
 * @param index Optional index for multiple images
 * @returns Promise resolving to download URL
 */
export const getNewsImageURL = async (newsId: string, index: number = 0): Promise<string | null> => {
  if (!newsId || !storage) {
    return null;
  }
  
  try {
    // Adjust the path based on your actual storage structure for news images
    const imageRef = ref(storage, `News Images/${newsId}_${index}.jpg`);
    
    // Get the download URL
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.warn(`News image not found for news ID: ${newsId}, index: ${index}`, error);
    return null;
  }
};