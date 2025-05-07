// src/services/firebase/players.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit as firestoreLimit,
  Firestore,
  DocumentData
} from 'firebase/firestore';
import { firestore } from './config';
import { uploadPlayerPhoto } from './storage';
import { Player } from '../../types/team';

/**
 * Fetch a player by ID
 */
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    // Check if Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return null;
    }

    // Get player document
    const playerDoc = await getDoc(doc(firestore, 'players', playerId));
    
    if (!playerDoc.exists()) {
      return null;
    }
    
    // Return player data
    return {
      id: playerDoc.id,
      ...playerDoc.data(),
    } as Player;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

/**
 * Get all players
 */
export const getAllPlayers = async (limit?: number): Promise<Player[]> => {
  try {
    // Check if Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return [];
    }

    const playersCollection = collection(firestore, 'players');
    let playersQuery = query(playersCollection, orderBy('name'));
    
    if (limit) {
      playersQuery = query(playersQuery, firestoreLimit(limit));
    }
    
    const snapshot = await getDocs(playersQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Player));
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

/**
 * Get players by team
 */
export const getPlayersByTeam = async (teamId: string): Promise<Player[]> => {
  try {
    // Check if Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return [];
    }

    const playersCollection = collection(firestore, 'players');
    const playersQuery = query(
      playersCollection,
      where('teamId', '==', teamId),
      orderBy('number')
    );
    
    const snapshot = await getDocs(playersQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Player));
  } catch (error) {
    console.error('Error fetching team players:', error);
    throw error;
  }
};

/**
 * Create a new player
 */
export const createPlayer = async (player: Omit<Player, 'id'>): Promise<string> => {
  try {
    // Check if Firestore is initialized
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }

    const playersCollection = collection(firestore, 'players');
    const docRef = await addDoc(playersCollection, {
      ...player,
      createdAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

/**
 * Update a player
 */
export const updatePlayer = async (playerId: string, playerData: Partial<Player>): Promise<void> => {
  try {
    // Check if Firestore is initialized
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }

    const playerRef = doc(firestore, 'players', playerId);
    
    await updateDoc(playerRef, {
      ...playerData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

/**
 * Delete a player
 */
export const deletePlayer = async (playerId: string): Promise<void> => {
  try {
    // Check if Firestore is initialized
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }

    const playerRef = doc(firestore, 'players', playerId);
    await deleteDoc(playerRef);
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
};

/**
 * Update player photo
 */
export const updatePlayerPhoto = async (playerId: string, imageUri: string): Promise<void> => {
  try {
    // Check if Firestore is initialized
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    // Upload photo to Firebase Storage
    const photoUrl = await uploadPlayerPhoto(playerId, imageUri);
    
    // Update player document with photo URL
    const playerRef = doc(firestore, 'players', playerId);
    await updateDoc(playerRef, {
      photoUrl: photoUrl,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating player photo:', error);
    throw error;
  }
};