// src/services/firebase/teams.ts
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
  Firestore
} from 'firebase/firestore';
import { firestore, storage } from './config';
import { uploadTeamLogo } from './storage';
import { Team, Player } from '../../types/team';
import { getTeamFixtures as getFixturesForTeam } from './leagues';

/**
 * Get teams with optional filtering by type and division
 */
export const getTeams = async (type?: string, division?: string, limit?: number): Promise<Team[]> => {
  try {
    // Make sure Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return [];
    }

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
    return []; // Return empty array instead of throwing to prevent UI errors
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
    // Make sure Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return null;
    }

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
    return null; // Return null instead of throwing to prevent UI errors
  }
};

/**
 * Get players for a specific team
 */
export const getTeamPlayers = async (teamId: string, limit?: number): Promise<Player[]> => {
  try {
    // Make sure Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return [];
    }

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
    return []; // Return empty array instead of throwing to prevent UI errors
  }
};

/**
 * Get a player by ID
 */
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    // Make sure Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return null;
    }

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
    return null; // Return null instead of throwing to prevent UI errors
  }
};

/**
 * Get all data related to a team including league, standings, players, and fixtures
 */
export const getTeamWithRelatedData = async (teamId: string) => {
  try {
    // Make sure Firestore is initialized
    if (!firestore) {
      console.error('Firestore not initialized');
      return null;
    }

    console.log(`Fetching all data for team ID: ${teamId}`);
    
    // First get the team
    const team = await getTeamById(teamId);
    
    if (!team) {
      console.log(`Team with ID ${teamId} not found`);
      return null;
    }
    
    // Get related data in parallel for better performance
    const [players, fixtures] = await Promise.all([
      getTeamPlayers(teamId),
      getFixturesForTeam(teamId)
    ]);
    
    // Get league if there's a leagueId
    let league = null;
    if (team.leagueId) {
      try {
        const leagueDoc = await getDoc(doc(firestore, 'leagues', team.leagueId));
        if (leagueDoc.exists()) {
          league = {
            id: leagueDoc.id,
            ...leagueDoc.data()
          };
        }
      } catch (e) {
        console.warn(`Error fetching league for team ${teamId}:`, e);
      }
    }
    
    // Get team standings if we have a league
    let standings = null;
    if (team.leagueId) {
      try {
        const standingsQuery = query(
          collection(firestore, 'leagueStandings'),
          where('teamId', '==', teamId),
          where('leagueId', '==', team.leagueId)
        );
        
        const standingsSnapshot = await getDocs(standingsQuery);
        if (!standingsSnapshot.empty) {
          standings = {
            id: standingsSnapshot.docs[0].id,
            ...standingsSnapshot.docs[0].data()
          };
        }
      } catch (e) {
        console.warn(`Error fetching standings for team ${teamId}:`, e);
      }
    }
    
    return {
      team,
      players,
      fixtures,
      league,
      standings
    };
  } catch (error) {
    console.error(`Error fetching team data for ${teamId}:`, error);
    return null; // Return null instead of throwing to prevent UI errors
  }
};

/**
 * Update team logo
 */
export const updateTeamLogo = async (teamId: string, imageUri: string): Promise<void> => {
  try {
    // Make sure Firestore is initialized
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    // Upload the image to Firebase Storage
    const logoUrl = await uploadTeamLogo(teamId, imageUri);
    
    // Update the team document in Firestore
    const teamRef = doc(firestore, 'teams', teamId);
    await updateDoc(teamRef, {
      logo: logoUrl,
      // You might want to update both fields if you're using both in your app
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('Error updating team logo:', error);
    throw error;
  }
};

/**
 * Update an existing team
 */
export const updateTeam = async (teamId: string, teamData: Partial<Team>): Promise<void> => {
  try {
    // Make sure Firestore is initialized
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    console.log(`Updating team with ID: ${teamId}`);
    
    // Reference to the team document
    const teamRef = doc(firestore, 'teams', teamId);
    
    // Update the team data
    await updateDoc(teamRef, {
      ...teamData,
      updatedAt: new Date()
    });
    
    console.log(`Team ${teamId} updated successfully`);
  } catch (error) {
    console.error(`Error updating team ${teamId}:`, error);
    throw error;
  }
};