// CIFAMobileApp/src/services/firebase/leagues.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { firestore as firestoreInstance } from './config';

// Get Firestore with proper typing
const getFirestore = (): Firestore => {
  if (!firestoreInstance) {
    throw new Error('Firestore not initialized');
  }
  return firestoreInstance;
};

export interface League {
  id: string;
  name: string;
  shortName: string;
  season: string;
  type: 'mens' | 'womens' | 'boys' | 'girls';
  division: string;
  ageGroup?: string;
  logoUrl?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  teams: string[]; // Array of team IDs
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LeagueStanding {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[]; // Last 5 matches: W, L, D
  updatedAt?: Timestamp;
}

export interface MatchEvent {
  type: 'goal' | 'ownGoal' | 'penalty' | 'missedPenalty' | 'yellowCard' | 'redCard' | 'substitution';
  minute: number;
  teamId: string;
  playerId: string;
  playerName: string;
  secondPlayerId?: string; // For substitutions or assists
  secondPlayerName?: string;
}

export interface LeagueFixture {
  competition: string;
  id: string;
  leagueId: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo?: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo?: string;
  matchday: number;
  date: Timestamp;
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  stats?: {
    homeTeam: {
      shots: number;
      shotsOnTarget: number;
      possession: number;
      passes: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      offsides: number;
      corners: number;
    };
    awayTeam: {
      shots: number;
      shotsOnTarget: number;
      possession: number;
      passes: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      offsides: number;
      corners: number;
    };
  };
  events?: MatchEvent[];
  teams?: string[]; // Array containing both team IDs (for querying)
  featured?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Get all leagues
 */
export const getAllLeagues = async (): Promise<League[]> => {
  try {
    const firestore = getFirestore();
    const leaguesCollection = collection(firestore, 'leagues');
    const leaguesQuery = query(leaguesCollection, orderBy('name'));
    
    const snapshot = await getDocs(leaguesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League));
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
};

/**
 * Get active leagues
 */
export const getActiveLeagues = async (): Promise<League[]> => {
  try {
    const firestore = getFirestore();
    const leaguesCollection = collection(firestore, 'leagues');
    const leaguesQuery = query(
      leaguesCollection, 
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const snapshot = await getDocs(leaguesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League));
  } catch (error) {
    console.error('Error fetching active leagues:', error);
    throw error;
  }
};

/**
 * Get leagues by type and/or division
 */
export const getLeaguesByType = async (
  type?: 'mens' | 'womens' | 'boys' | 'girls',
  division?: string,
  ageGroup?: string
): Promise<League[]> => {
  try {
    const firestore = getFirestore();
    const leaguesCollection = collection(firestore, 'leagues');
    let leaguesQuery;
    
    if (type && division && ageGroup) {
      leaguesQuery = query(
        leaguesCollection,
        where('type', '==', type),
        where('division', '==', division),
        where('ageGroup', '==', ageGroup),
        where('isActive', '==', true)
      );
    } else if (type && division) {
      leaguesQuery = query(
        leaguesCollection,
        where('type', '==', type),
        where('division', '==', division),
        where('isActive', '==', true)
      );
    } else if (type && ageGroup) {
      leaguesQuery = query(
        leaguesCollection,
        where('type', '==', type),
        where('ageGroup', '==', ageGroup),
        where('isActive', '==', true)
      );
    } else if (division && ageGroup) {
      leaguesQuery = query(
        leaguesCollection,
        where('division', '==', division),
        where('ageGroup', '==', ageGroup),
        where('isActive', '==', true)
      );
    } else if (type) {
      leaguesQuery = query(
        leaguesCollection,
        where('type', '==', type),
        where('isActive', '==', true)
      );
    } else if (division) {
      leaguesQuery = query(
        leaguesCollection,
        where('division', '==', division),
        where('isActive', '==', true)
      );
    } else if (ageGroup) {
      leaguesQuery = query(
        leaguesCollection,
        where('ageGroup', '==', ageGroup),
        where('isActive', '==', true)
      );
    } else {
      return getActiveLeagues();
    }
    
    const snapshot = await getDocs(leaguesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League));
  } catch (error) {
    console.error('Error fetching leagues by type:', error);
    throw error;
  }
};

/**
 * Get league by ID
 */
export const getLeagueById = async (leagueId: string): Promise<League | null> => {
  try {
    const firestore = getFirestore();
    const leagueDoc = await getDoc(doc(firestore, 'leagues', leagueId));
    
    if (!leagueDoc.exists()) {
      return null;
    }
    
    return {
      id: leagueDoc.id,
      ...leagueDoc.data()
    } as League;
  } catch (error) {
    console.error('Error fetching league:', error);
    throw error;
  }
};

/**
 * Get league standings
 */
export const getLeagueStandings = async (leagueId: string): Promise<LeagueStanding[]> => {
  try {
    const firestore = getFirestore();
    const standingsCollection = collection(firestore, 'leagueStandings');
    const standingsQuery = query(
      standingsCollection,
      where('leagueId', '==', leagueId),
      orderBy('position')
    );
    
    const snapshot = await getDocs(standingsQuery);
    
    return snapshot.docs.map(doc => ({
      ...doc.data()
    } as LeagueStanding));
  } catch (error) {
    console.error('Error fetching league standings:', error);
    throw error;
  }
};

/**
 * Get fixtures by leagueId
 */
export const getFixturesByLeague = async (
  leagueId: string,
  status?: 'scheduled' | 'completed',
  limit?: number
): Promise<LeagueFixture[]> => {
  try {
    const firestore = getFirestore();
    const fixturesCollection = collection(firestore, 'matches');
    let fixturesQuery;
    
    if (status) {
      fixturesQuery = query(
        fixturesCollection,
        where('leagueId', '==', leagueId),
        where('status', '==', status),
        orderBy('date')
      );
    } else {
      fixturesQuery = query(
        fixturesCollection,
        where('leagueId', '==', leagueId),
        orderBy('date')
      );
    }
    
    // Apply limit if provided
    if (limit) {
      fixturesQuery = query(fixturesQuery, firestoreLimit(limit));
    }
    
    const snapshot = await getDocs(fixturesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeagueFixture));
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
};

/**
 * Get fixture details
 */
export const getFixtureById = async (fixtureId: string): Promise<LeagueFixture | null> => {
  try {
    const firestore = getFirestore();
    const fixtureDoc = await getDoc(doc(firestore, 'matches', fixtureId));
    
    if (!fixtureDoc.exists()) {
      return null;
    }
    
    return {
      id: fixtureDoc.id,
      ...fixtureDoc.data()
    } as LeagueFixture;
  } catch (error) {
    console.error('Error fetching fixture:', error);
    throw error;
  }
};

/**
 * Get upcoming fixtures (across all leagues)
 */
export const getUpcomingFixtures = async (limit: number = 5): Promise<LeagueFixture[]> => {
  try {
    const firestore = getFirestore();
    const now = new Date();
    const fixturesCollection = collection(firestore, 'matches');
    const fixturesQuery = query(
      fixturesCollection,
      where('date', '>=', Timestamp.fromDate(now)),
      where('status', '==', 'scheduled'),
      orderBy('date'),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(fixturesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeagueFixture));
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    throw error;
  }
};

/**
 * Get recent results (across all leagues)
 */
export const getRecentResults = async (limit: number = 5): Promise<LeagueFixture[]> => {
  try {
    const firestore = getFirestore();
    const fixturesCollection = collection(firestore, 'matches');
    const fixturesQuery = query(
      fixturesCollection,
      where('status', '==', 'completed'),
      orderBy('date', 'desc'),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(fixturesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeagueFixture));
  } catch (error) {
    console.error('Error fetching recent results:', error);
    throw error;
  }
};

/**
 * Get fixtures for a specific team
 */
export const getTeamFixtures = async (teamId: string, limit?: number): Promise<LeagueFixture[]> => {
  try {
    const firestore = getFirestore();
    const fixturesCollection = collection(firestore, 'matches');
    
    // We need to query fixtures where either home or away team ID matches
    // Using the 'teams' array field that should contain both team IDs
    const fixturesQuery = query(
      fixturesCollection,
      where('teams', 'array-contains', teamId),
      orderBy('date')
    );
    
    // Apply limit if provided
    const limitedQuery = limit ? query(fixturesQuery, firestoreLimit(limit)) : fixturesQuery;
    
    const snapshot = await getDocs(limitedQuery);
    
    // Get all fixtures and sort by date
    const fixtures = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeagueFixture));
    
    return fixtures.sort((a, b) => {
      // Convert Firestore timestamps to milliseconds for comparison
      const dateA = a.date.toMillis();
      const dateB = b.date.toMillis();
      return dateA - dateB;
    });
  } catch (error) {
    console.error('Error fetching team fixtures:', error);
    throw error;
  }
};

/**
 * Get live matches
 */
export const getLiveMatches = async (): Promise<LeagueFixture[]> => {
  try {
    const firestore = getFirestore();
    const fixturesCollection = collection(firestore, 'matches');
    const fixturesQuery = query(
      fixturesCollection,
      where('status', '==', 'live'),
      orderBy('date')
    );
    
    const snapshot = await getDocs(fixturesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeagueFixture));
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
};