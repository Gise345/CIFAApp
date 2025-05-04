// CIFAMobileApp/src/services/firebase/teams.ts
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
  limit as firestoreLimit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from './config';
import { Team, Player } from '../../types/team';

/**
 * Get teams with optional filtering by type and division
 */
export const getTeams = async (type?: string, division?: string, limit?: number): Promise<Team[]> => {
  try {
    const teamsCollection = collection(firestore, 'teams');
    let teamsQuery;
    
    if (type && division) {
      teamsQuery = query(
        teamsCollection, 
        where('type', '==', type),
        where('division', '==', division),
        orderBy('name')
      );
    } else if (type) {
      teamsQuery = query(
        teamsCollection, 
        where('type', '==', type),
        orderBy('name')
      );
    } else if (division) {
      teamsQuery = query(
        teamsCollection, 
        where('division', '==', division),
        orderBy('name')
      );
    } else {
      teamsQuery = query(teamsCollection, orderBy('name'));
    }
    
    // Apply limit if provided
    if (limit) {
      teamsQuery = query(teamsQuery, firestoreLimit(limit));
    }
    
    const snapshot = await getDocs(teamsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team));
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

/**
 * Get national teams (type = 'national')
 */
export const getNationalTeams = async (): Promise<Team[]> => {
  return getTeams('national');
};

/**
 * Get a team by ID
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    const teamDoc = await getDoc(doc(firestore, 'teams', teamId));
    
    if (!teamDoc.exists()) {
      return null;
    }
    
    return {
      id: teamDoc.id,
      ...teamDoc.data()
    } as Team;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

/**
 * Get players for a specific team
 */
export const getTeamPlayers = async (teamId: string, limit?: number): Promise<Player[]> => {
  try {
    const playersCollection = collection(firestore, 'players');
    let playersQuery = query(
      playersCollection,
      where('teamId', '==', teamId),
      orderBy('number')
    );
    
    // Apply limit if provided
    if (limit) {
      playersQuery = query(playersQuery, firestoreLimit(limit));
    }
    
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
 * Get a player by ID
 */
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    const playerDoc = await getDoc(doc(firestore, 'players', playerId));
    
    if (!playerDoc.exists()) {
      return null;
    }
    
    return {
      id: playerDoc.id,
      ...playerDoc.data()
    } as Player;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

// Admin functions for team management - these require admin privileges

/**
 * Admin function: Create a new team
 */
export const createTeam = async (team: Omit<Team, 'id'>, logoFile?: Blob): Promise<string> => {
  try {
    let logoUrl = team.logo;
    
    // If a logo file is provided, upload it to storage
    if (logoFile) {
      const storageRef = ref(storage, `team-logos/${Date.now()}-${team.shortName}`);
      await uploadBytes(storageRef, logoFile);
      logoUrl = await getDownloadURL(storageRef);
    }
    
    const teamData = {
      ...team,
      logo: logoUrl,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(firestore, 'teams'), teamData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

/**
 * Admin function: Update an existing team
 */
export const updateTeam = async (teamId: string, teamData: Partial<Team>, logoFile?: Blob): Promise<void> => {
  try {
    const teamRef = doc(firestore, 'teams', teamId);
    let updateData = { ...teamData };
    
    // If a logo file is provided, upload it to storage
    if (logoFile) {
      const storageRef = ref(storage, `team-logos/${Date.now()}-${teamData.shortName || 'team'}`);
      await uploadBytes(storageRef, logoFile);
      const logoUrl = await getDownloadURL(storageRef);
      updateData.logo = logoUrl;
    }
    
    await updateDoc(teamRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

/**
 * Admin function: Delete a team
 * Note: In a real app, you might want to check for related data first
 */
export const deleteTeam = async (teamId: string): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, 'teams', teamId));
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

/**
 * Admin function: Create a new player
 */
export const createPlayer = async (player: Omit<Player, 'id'>, photoFile?: Blob): Promise<string> => {
  try {
    let photoUrl = player.photoUrl;
    
    // If a photo file is provided, upload it to storage
    if (photoFile) {
      const storageRef = ref(storage, `player-photos/${Date.now()}-${player.name.replace(/\s+/g, '-').toLowerCase()}`);
      await uploadBytes(storageRef, photoFile);
      photoUrl = await getDownloadURL(storageRef);
    }
    
    const playerData = {
      ...player,
      photoUrl: photoUrl,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(firestore, 'players'), playerData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

/**
 * Admin function: Update an existing player
 */
export const updatePlayer = async (playerId: string, playerData: Partial<Player>, photoFile?: Blob): Promise<void> => {
  try {
    const playerRef = doc(firestore, 'players', playerId);
    let updateData = { ...playerData };
    
    // If a photo file is provided, upload it to storage
    if (photoFile) {
      const storageRef = ref(storage, `player-photos/${Date.now()}-${playerData.name?.replace(/\s+/g, '-').toLowerCase() || 'player'}`);
      await uploadBytes(storageRef, photoFile);
      const photoUrl = await getDownloadURL(storageRef);
      updateData.photoUrl = photoUrl;
    }
    
    await updateDoc(playerRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

/**
 * Admin function: Delete a player
 */
export const deletePlayer = async (playerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, 'players', playerId));
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
};