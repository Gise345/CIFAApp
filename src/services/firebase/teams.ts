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
  limit as firestoreLimit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from './config';
import { Team, Player } from '../../types/team';

/**
 * Get teams with optional filtering by type and division
 */
export const getTeams = async (type?: string, division?: string, limit?: number): Promise<Team[]> => {
  try {
    console.log(`Fetching teams with type: ${type}, division: ${division}`);
    
    const teamsCollection = collection(firestore, 'teams');
    let teamsQuery;

    // Build the query based on the filters
    if (type && division) {
      console.log(`Creating query with type=${type} and division=${division}`);
      teamsQuery = query(
        teamsCollection, 
        where('type', '==', type),
        where('division', '==', division)
      );
    } else if (type) {
      console.log(`Creating query with type=${type}`);
      teamsQuery = query(
        teamsCollection, 
        where('type', '==', type)
      );
    } else if (division) {
      console.log(`Creating query with division=${division}`);
      teamsQuery = query(
        teamsCollection, 
        where('division', '==', division)
      );
    } else {
      console.log('Fetching all teams without filters');
      teamsQuery = query(teamsCollection);
    }
    
    // Apply limit if provided
    if (limit) {
      console.log(`Applying limit of ${limit} teams`);
      teamsQuery = query(teamsQuery, firestoreLimit(limit));
    }
    
    console.log('Executing Firestore query...');
    const snapshot = await getDocs(teamsQuery);
    
    console.log(`Query returned ${snapshot.docs.length} teams`);
    
    // Map and return the documents
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Team;
    });
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
    console.log(`Fetching team with ID: ${teamId}`);
    const teamDoc = await getDoc(doc(firestore, 'teams', teamId));
    
    if (!teamDoc.exists()) {
      console.log(`Team with ID ${teamId} not found`);
      return null;
    }
    
    console.log(`Team found: ${teamDoc.data().name}`);
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
    console.log(`Fetching players for team ID: ${teamId}`);
    
    const playersCollection = collection(firestore, 'players');
    let playersQuery = query(
      playersCollection,
      where('teamId', '==', teamId)
    );
    
    // Add ordering by number if available
    try {
      playersQuery = query(playersQuery, orderBy('number'));
    } catch (e) {
      console.warn('Could not order by number, using default order', e);
    }
    
    // Apply limit if provided
    if (limit) {
      playersQuery = query(playersQuery, firestoreLimit(limit));
    }
    
    const snapshot = await getDocs(playersQuery);
    console.log(`Found ${snapshot.docs.length} players for team ${teamId}`);
    
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
    console.log(`Fetching player with ID: ${playerId}`);
    const playerDoc = await getDoc(doc(firestore, 'players', playerId));
    
    if (!playerDoc.exists()) {
      console.log(`Player with ID ${playerId} not found`);
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

// Export additional functions as needed for your app