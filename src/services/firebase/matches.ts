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
  deleteDoc,
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  writeBatch,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import { firestore } from './config';

// Firestore instance guard
const getFirestore = (): Firestore => {
  if (!firestore) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  return firestore;
};

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
  leagueId: string;
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
  teams: string[]; // Required array for Firestore querying
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  division?: string;
  type?: 'club' | 'national';
  colorPrimary?: string;
  colorSecondary?: string;
  venue?: string;
  foundedYear?: number;
  description?: string;
  website?: string;
  leagueId?: string;
}

export interface League {
  id: string;
  name: string;
  shortName: string;
  type: string;
  division: string;
  season?: string;
  ageGroup?: string;
  logoUrl?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  isActive?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity?: number;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Cache management for better performance
class CacheManager {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const cache = new CacheManager();

// Performance logging (only in development)
const performanceLog = (operation: string, startTime: number) => {
  if (__DEV__) {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`Slow operation: ${operation} took ${duration}ms`);
    }
  }
};

/**
 * Get matches with advanced filtering and pagination
 */
export const getMatches = async (options: {
  status?: string;
  teamId?: string;
  leagueId?: string;
  competition?: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  useCache?: boolean;
} = {}): Promise<{ matches: Match[], lastDoc: QueryDocumentSnapshot<DocumentData> | null, hasMore: boolean }> => {
  const startTime = Date.now();
  const {
    status,
    teamId,
    leagueId,
    competition,
    pageSize = 20,
    lastDoc,
    useCache = true
  } = options;

  const cacheKey = `matches_${status || 'all'}_${teamId || 'all'}_${leagueId || 'all'}_${competition || 'all'}_${pageSize}`;

  // Check cache first (only for first page)
  if (useCache && !lastDoc) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const db = getFirestore();
    
    // Build query
    let matchesQuery = query(
      collection(db, 'matches'),
      orderBy('date', 'desc')
    );

    // Apply filters
    if (status && status !== 'all') {
      matchesQuery = query(matchesQuery, where('status', '==', status));
    }

    if (teamId && teamId !== 'all') {
      matchesQuery = query(matchesQuery, where('teams', 'array-contains', teamId));
    }

    if (leagueId && leagueId !== 'all') {
      matchesQuery = query(matchesQuery, where('leagueId', '==', leagueId));
    }

    if (competition && competition !== 'all') {
      matchesQuery = query(matchesQuery, where('competition', '==', competition));
    }

    // Add pagination
    if (lastDoc) {
      matchesQuery = query(matchesQuery, startAfter(lastDoc));
    }

    matchesQuery = query(matchesQuery, limit(pageSize + 1)); // Get one extra to check if there are more

    const snapshot = await getDocs(matchesQuery);
    const matches = snapshot.docs.slice(0, pageSize).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));

    const hasMore = snapshot.docs.length > pageSize;
    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] : null;

    const result = { matches, lastDoc: newLastDoc, hasMore };

    // Cache first page results
    if (!lastDoc && useCache) {
      cache.set(cacheKey, result);
    }

    performanceLog('getMatches', startTime);
    return result;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

/**
 * Get upcoming fixtures
 */
export const getUpcomingFixtures = async (count: number = 5): Promise<Match[]> => {
  const startTime = Date.now();
  try {
    const db = getFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const fixturesQuery = query(
      collection(db, 'matches'),
      where('date', '>=', Timestamp.fromDate(today)),
      where('status', '==', 'scheduled'),
      orderBy('date'),
      limit(count)
    );
    
    const snapshot = await getDocs(fixturesQuery);
    
    const fixtures = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));

    performanceLog('getUpcomingFixtures', startTime);
    return fixtures;
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    throw error;
  }
};

/**
 * Get featured match (usually the next important match)
 */
export const getFeaturedMatch = async (): Promise<Match | null> => {
  const startTime = Date.now();
  const cacheKey = 'featured_match';
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const db = getFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First try to get a featured match that's marked as featured
    const featuredQuery = query(
      collection(db, 'matches'),
      where('featured', '==', true),
      where('date', '>=', Timestamp.fromDate(today)),
      orderBy('date'),
      limit(1)
    );
    
    const featuredSnapshot = await getDocs(featuredQuery);
    
    let featuredMatch: Match | null = null;
    
    if (!featuredSnapshot.empty) {
      const doc = featuredSnapshot.docs[0];
      featuredMatch = {
        id: doc.id,
        ...doc.data()
      } as Match;
    } else {
      // If no featured match found, just get the next scheduled match
      const upcomingMatches = await getUpcomingFixtures(1);
      featuredMatch = upcomingMatches[0] || null;
    }

    if (featuredMatch) {
      cache.set(cacheKey, featuredMatch);
    }

    performanceLog('getFeaturedMatch', startTime);
    return featuredMatch;
  } catch (error) {
    console.error('Error fetching featured match:', error);
    throw error;
  }
};

/**
 * Get recent results
 */
export const getRecentResults = async (count: number = 5): Promise<Match[]> => {
  const startTime = Date.now();
  try {
    const db = getFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const resultsQuery = query(
      collection(db, 'matches'),
      where('status', '==', 'completed'),
      where('date', '<', Timestamp.fromDate(today)),
      orderBy('date', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(resultsQuery);
    
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));

    performanceLog('getRecentResults', startTime);
    return results;
  } catch (error) {
    console.error('Error fetching recent results:', error);
    throw error;
  }
};

/**
 * Get matches for a specific team
 */
export const getTeamMatches = async (teamId: string, count: number = 10): Promise<Match[]> => {
  const startTime = Date.now();
  try {
    const db = getFirestore();
    const teamMatchesQuery = query(
      collection(db, 'matches'),
      where('teams', 'array-contains', teamId),
      orderBy('date', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(teamMatchesQuery);
    
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));

    performanceLog('getTeamMatches', startTime);
    return matches;
  } catch (error) {
    console.error('Error fetching team matches:', error);
    throw error;
  }
};

/**
 * Get matches for a specific competition
 */
export const getCompetitionMatches = async (competition: string): Promise<Match[]> => {
  const startTime = Date.now();
  try {
    const db = getFirestore();
    const competitionMatchesQuery = query(
      collection(db, 'matches'),
      where('competition', '==', competition),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(competitionMatchesQuery);
    
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));

    performanceLog('getCompetitionMatches', startTime);
    return matches;
  } catch (error) {
    console.error('Error fetching competition matches:', error);
    throw error;
  }
};

/**
 * Get a specific match by ID with caching
 */
export const getMatchById = async (matchId: string, useCache: boolean = true): Promise<Match | null> => {
  const startTime = Date.now();
  const cacheKey = `match_${matchId}`;

  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const db = getFirestore();
    const matchDoc = await getDoc(doc(db, 'matches', matchId));
    
    if (!matchDoc.exists()) {
      return null;
    }
    
    const match = {
      id: matchDoc.id,
      ...matchDoc.data()
    } as Match;

    if (useCache) {
      cache.set(cacheKey, match);
    }

    performanceLog('getMatchById', startTime);
    return match;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
};

/**
 * Get teams with caching
 */
export const getTeams = async (): Promise<Team[]> => {
  const startTime = Date.now();
  const cacheKey = 'teams_all';
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const db = getFirestore();
    const snapshot = await getDocs(
      query(collection(db, 'teams'), orderBy('name', 'asc'))
    );
    
    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team));

    cache.set(cacheKey, teams);
    performanceLog('getTeams', startTime);
    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

/**
 * Get team by ID with caching
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const startTime = Date.now();
  const cacheKey = `team_${teamId}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const db = getFirestore();
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    
    if (!teamDoc.exists()) {
      return null;
    }

    const team = {
      id: teamDoc.id,
      ...teamDoc.data()
    } as Team;

    cache.set(cacheKey, team);
    performanceLog('getTeamById', startTime);
    return team;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

/**
 * Get leagues with caching
 */
export const getLeagues = async (): Promise<League[]> => {
  const startTime = Date.now();
  const cacheKey = 'leagues_all';
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const db = getFirestore();
    const snapshot = await getDocs(
      query(collection(db, 'leagues'), orderBy('name', 'asc'))
    );
    
    const leagues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League));

    cache.set(cacheKey, leagues);
    performanceLog('getLeagues', startTime);
    return leagues;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
};

/**
 * Get venues (with fallback to predefined list)
 */
export const getVenues = async (): Promise<Venue[]> => {
  const startTime = Date.now();
  const cacheKey = 'venues_all';
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const db = getFirestore();
    const snapshot = await getDocs(
      query(collection(db, 'venues'), orderBy('name', 'asc'))
    );
    
    let venues: Venue[];
    
    if (snapshot.empty) {
      // Fallback to predefined venues for Cayman Islands
      venues = [
        { 
          id: 'truman_bodden', 
          name: 'Truman Bodden Sports Complex', 
          location: 'George Town',
          capacity: 3000,
          address: 'Stadium Way, George Town, Grand Cayman'
        },
        { 
          id: 'cayman_islands_fc', 
          name: 'Cayman Islands FC Stadium', 
          location: 'West Bay',
          capacity: 2000,
          address: 'West Bay Road, West Bay, Grand Cayman'
        },
        { 
          id: 'john_gray_gym', 
          name: 'John Gray High School', 
          location: 'George Town',
          capacity: 1000,
          address: 'Walkers Road, George Town, Grand Cayman'
        },
        { 
          id: 'ed_bush_sports', 
          name: 'Ed Bush Sports Complex', 
          location: 'Bodden Town',
          capacity: 1500,
          address: 'Bodden Town Road, Bodden Town, Grand Cayman'
        },
        { 
          id: 'cayman_brac', 
          name: 'Cayman Brac Sports Complex', 
          location: 'Cayman Brac',
          capacity: 800,
          address: 'West End, Cayman Brac'
        },
        {
          id: 'little_cayman',
          name: 'Little Cayman Sports Ground',
          location: 'Little Cayman',
          capacity: 500,
          address: 'Blossom Village, Little Cayman'
        },
        {
          id: 'frank_sound',
          name: 'Frank Sound Playing Field',
          location: 'Frank Sound',
          capacity: 600,
          address: 'Frank Sound Road, Frank Sound, Grand Cayman'
        }
      ];
    } else {
      venues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Venue));
    }

    cache.set(cacheKey, venues);
    performanceLog('getVenues', startTime);
    return venues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    // Return fallback venues on error
    return [
      { id: 'truman_bodden', name: 'Truman Bodden Sports Complex', location: 'George Town' },
      { id: 'cayman_islands_fc', name: 'Cayman Islands FC Stadium', location: 'West Bay' },
      { id: 'john_gray_gym', name: 'John Gray High School', location: 'George Town' },
      { id: 'ed_bush_sports', name: 'Ed Bush Sports Complex', location: 'Bodden Town' },
      { id: 'cayman_brac', name: 'Cayman Brac Sports Complex', location: 'Cayman Brac' },
    ];
  }
};

/**
 * Admin function: Create a new match with validation
 */
export const createMatch = async (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const startTime = Date.now();
  
  try {
    const db = getFirestore();
    
    // Validate required fields
    if (!matchData.homeTeamId || !matchData.awayTeamId) {
      throw new Error('Home and away teams are required');
    }
    
    if (matchData.homeTeamId === matchData.awayTeamId) {
      throw new Error('Home and away teams cannot be the same');
    }

    const now = new Date();
    const newMatchData = {
      ...matchData,
      teams: [matchData.homeTeamId, matchData.awayTeamId],
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'matches'), newMatchData);
    
    // Clear relevant caches
    cache.clear();
    
    performanceLog('createMatch', startTime);
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
  const startTime = Date.now();
  
  try {
    const db = getFirestore();
    const matchRef = doc(db, 'matches', matchId);
    
    // If team IDs are being updated, also update the teams array
    let updateData = { ...matchData };
    if (matchData.homeTeamId || matchData.awayTeamId) {
      // First get the current match data
      const currentMatch = await getMatchById(matchId, false);
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

    // Clear relevant caches
    cache.delete(`match_${matchId}`);
    cache.clear(); // Clear all match list caches
    
    performanceLog('updateMatch', startTime);
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
};

/**
 * Admin function: Delete match
 */
export const deleteMatch = async (matchId: string): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'matches', matchId));
    
    // Clear relevant caches
    cache.delete(`match_${matchId}`);
    cache.clear();
    
    performanceLog('deleteMatch', startTime);
  } catch (error) {
    console.error('Error deleting match:', error);
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
  const startTime = Date.now();
  
  try {
    const db = getFirestore();
    const matchRef = doc(db, 'matches', matchId);
    
    await updateDoc(matchRef, {
      homeScore,
      awayScore,
      status,
      updatedAt: new Date()
    });

    // Clear relevant caches
    cache.delete(`match_${matchId}`);
    cache.clear();
    
    performanceLog('updateMatchScore', startTime);
  } catch (error) {
    console.error('Error updating match score:', error);
    throw error;
  }
};

/**
 * Admin function: Add a match event (goal, card, etc.)
 */
export const addMatchEvent = async (matchId: string, event: MatchEvent): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const db = getFirestore();
    const matchRef = doc(db, 'matches', matchId);
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
      const match = await getMatchById(matchId, false);
      if (match) {
        if (event.teamId === match.homeTeamId) {
          await updateMatchScore(matchId, (match.homeScore || 0) + 1, match.awayScore || 0);
        } else if (event.teamId === match.awayTeamId) {
          await updateMatchScore(matchId, match.homeScore || 0, (match.awayScore || 0) + 1);
        }
      }
    } else if (event.type === 'ownGoal') {
      // Own goal counts for the opposite team
      const match = await getMatchById(matchId, false);
      if (match) {
        if (event.teamId === match.homeTeamId) {
          await updateMatchScore(matchId, match.homeScore || 0, (match.awayScore || 0) + 1);
        } else if (event.teamId === match.awayTeamId) {
          await updateMatchScore(matchId, (match.homeScore || 0) + 1, match.awayScore || 0);
        }
      }
    }

    performanceLog('addMatchEvent', startTime);
  } catch (error) {
    console.error('Error adding match event:', error);
    throw error;
  }
};

/**
 * Batch update multiple matches (for bulk operations)
 */
export const batchUpdateMatches = async (updates: Array<{ id: string; data: Partial<Match> }>): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const db = getFirestore();
    const batch = writeBatch(db);
    const now = new Date();

    updates.forEach(({ id, data }) => {
      const matchRef = doc(db, 'matches', id);
      batch.update(matchRef, { ...data, updatedAt: now });
    });

    await batch.commit();
    
    // Clear all caches after batch update
    cache.clear();
    
    performanceLog('batchUpdateMatches', startTime);
  } catch (error) {
    console.error('Error batch updating matches:', error);
    throw error;
  }
};

/**
 * Subscribe to live match updates
 */
export const subscribeLiveMatches = (callback: (matches: Match[]) => void): (() => void) => {
  const db = getFirestore();
  const liveMatchesQuery = query(
    collection(db, 'matches'),
    where('status', '==', 'live'),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    liveMatchesQuery,
    (snapshot) => {
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Match));
      callback(matches);
    },
    (error) => {
      console.error('Error in live matches subscription:', error);
    }
  );
};

/**
 * Clear all caches
 */
export const clearCache = (): void => {
  cache.clear();
};

/**
 * Get cache statistics (development only)
 */
export const getCacheStats = () => {
  if (__DEV__) {
    return {
      size: cache['cache'].size,
      keys: Array.from(cache['cache'].keys())
    };
  }
  return null;
};