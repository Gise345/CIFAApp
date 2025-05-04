// CIFAMobileApp/src/services/firebase/matches.ts
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    orderBy, 
    limit, 
    Timestamp 
  } from 'firebase/firestore';
  import { firestore } from './config';
  
  export interface MatchEvent {
    type: 'goal' | 'ownGoal' | 'yellowCard' | 'redCard' | 'substitution' | 'penalty';
    minute: number;
    playerId: string;
    playerName: string;
    teamId: string;
    assistPlayerId?: string;
    assistPlayerName?: string;
    substitutionPlayerId?: string;
    substitutionPlayerName?: string;
  }
  
  export interface LineupPlayer {
    playerId: string;
    name: string;
    number: number;
    position: string;
    isCaptain?: boolean;
  }
  
  export interface Match {
    id: string;
    homeTeamId: string;
    homeTeamName: string;
    homeTeamLogo?: string;
    awayTeamId: string;
    awayTeamName: string;
    awayTeamLogo?: string;
    date: Timestamp;
    time: string;
    venue: string;
    competition: string;
    status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
    homeScore?: number;
    awayScore?: number;
    events?: MatchEvent[];
    homeLineup?: LineupPlayer[];
    awayLineup?: LineupPlayer[];
    homeSubs?: LineupPlayer[];
    awaySubs?: LineupPlayer[];
    possession?: {
      home: number;
      away: number;
    };
    shots?: {
      home: number;
      away: number;
    };
    shotsOnTarget?: {
      home: number;
      away: number;
    };
    corners?: {
      home: number;
      away: number;
    };
    fouls?: {
      home: number;
      away: number;
    };
    featured?: boolean;
    // Add a teams array for Firestore querying
    teams?: string[];
  }
  
  /**
   * Get upcoming fixtures
   */
  export const getUpcomingFixtures = async (count: number = 5): Promise<Match[]> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const fixturesQuery = query(
        collection(firestore, 'matches'),
        where('date', '>=', Timestamp.fromDate(today)),
        where('status', '==', 'scheduled'),
        orderBy('date'),
        limit(count)
      );
      
      const snapshot = await getDocs(fixturesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Match));
    } catch (error) {
      console.error('Error fetching upcoming fixtures:', error);
      throw error;
    }
  };
  
  /**
   * Get featured match (usually the next important match)
   */
  export const getFeaturedMatch = async (): Promise<Match | null> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // First try to get a featured match that's marked as featured
      const featuredQuery = query(
        collection(firestore, 'matches'),
        where('featured', '==', true),
        where('date', '>=', Timestamp.fromDate(today)),
        orderBy('date'),
        limit(1)
      );
      
      const featuredSnapshot = await getDocs(featuredQuery);
      
      if (!featuredSnapshot.empty) {
        const doc = featuredSnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Match;
      }
      
      // If no featured match found, just get the next scheduled match
      return (await getUpcomingFixtures(1))[0] || null;
    } catch (error) {
      console.error('Error fetching featured match:', error);
      throw error;
    }
  };
  
  /**
   * Get recent results
   */
  export const getRecentResults = async (count: number = 5): Promise<Match[]> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resultsQuery = query(
        collection(firestore, 'matches'),
        where('status', '==', 'completed'),
        where('date', '<', Timestamp.fromDate(today)),
        orderBy('date', 'desc'),
        limit(count)
      );
      
      const snapshot = await getDocs(resultsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Match));
    } catch (error) {
      console.error('Error fetching recent results:', error);
      throw error;
    }
  };
  
  /**
   * Get matches for a specific team
   */
  export const getTeamMatches = async (teamId: string, count: number = 10): Promise<Match[]> => {
    try {
      const teamMatchesQuery = query(
        collection(firestore, 'matches'),
        where('teams', 'array-contains', teamId),
        orderBy('date', 'desc'),
        limit(count)
      );
      
      const snapshot = await getDocs(teamMatchesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Match));
    } catch (error) {
      console.error('Error fetching team matches:', error);
      throw error;
    }
  };
  
  /**
   * Get matches for a specific competition
   */
  export const getCompetitionMatches = async (competition: string): Promise<Match[]> => {
    try {
      const competitionMatchesQuery = query(
        collection(firestore, 'matches'),
        where('competition', '==', competition),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(competitionMatchesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Match));
    } catch (error) {
      console.error('Error fetching competition matches:', error);
      throw error;
    }
  };
  
  /**
   * Get a specific match by ID
   */
  export const getMatchById = async (matchId: string): Promise<Match | null> => {
    try {
      const matchDoc = await getDoc(doc(firestore, 'matches', matchId));
      
      if (!matchDoc.exists()) {
        return null;
      }
      
      return {
        id: matchDoc.id,
        ...matchDoc.data()
      } as Match;
    } catch (error) {
      console.error('Error fetching match:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Create a new match
   */
  export const createMatch = async (match: Omit<Match, 'id'>): Promise<string> => {
    try {
      // Create an array containing both teams for easy querying
      const teamsArray = [match.homeTeamId, match.awayTeamId];
      
      const matchData = {
        ...match,
        teams: teamsArray,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(firestore, 'matches'), matchData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Update match details
   */
  export const updateMatch = async (matchId: string, matchData: Partial<Match>): Promise<void> => {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      
      // If team IDs are being updated, also update the teams array
      let updateData = { ...matchData };
      if (matchData.homeTeamId || matchData.awayTeamId) {
        // First get the current match data
        const currentMatch = await getMatchById(matchId);
        if (currentMatch) {
          const homeTeamId = matchData.homeTeamId || currentMatch.homeTeamId;
          const awayTeamId = matchData.awayTeamId || currentMatch.awayTeamId;
          updateData = {
            ...updateData,
            teams: [homeTeamId, awayTeamId]
          };
        }
      }
      
      await updateDoc(matchRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Update match score and status
   */
  export const updateMatchScore = async (
    matchId: string, 
    homeScore: number, 
    awayScore: number, 
    status: 'live' | 'completed' = 'live'
  ): Promise<void> => {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      
      await updateDoc(matchRef, {
        homeScore,
        awayScore,
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating match score:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Add a match event (goal, card, etc.)
   */
  export const addMatchEvent = async (matchId: string, event: MatchEvent): Promise<void> => {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }
      
      const matchData = matchDoc.data();
      const events = matchData.events || [];
      
      events.push(event);
      
      await updateDoc(matchRef, {
        events,
        updatedAt: new Date()
      });
      
      // If this is a goal event, also update the score
      if (event.type === 'goal' || event.type === 'penalty') {
        const match = await getMatchById(matchId);
        if (match) {
          if (event.teamId === match.homeTeamId) {
            await updateMatchScore(matchId, (match.homeScore || 0) + 1, match.awayScore || 0);
          } else if (event.teamId === match.awayTeamId) {
            await updateMatchScore(matchId, match.homeScore || 0, (match.awayScore || 0) + 1);
          }
        }
      } else if (event.type === 'ownGoal') {
        // Own goal counts for the opposite team
        const match = await getMatchById(matchId);
        if (match) {
          if (event.teamId === match.homeTeamId) {
            await updateMatchScore(matchId, match.homeScore || 0, (match.awayScore || 0) + 1);
          } else if (event.teamId === match.awayTeamId) {
            await updateMatchScore(matchId, (match.homeScore || 0) + 1, match.awayScore || 0);
          }
        }
      }
    } catch (error) {
      console.error('Error adding match event:', error);
      throw error;
    }
  };