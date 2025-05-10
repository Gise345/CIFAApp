// CIFAMobileApp/src/services/firebase/stats.ts
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
  QuerySnapshot,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import { firestore as firestoreInstance } from './config';
import { Team } from '../../types/team';
import { LeagueFixture } from './leagues';
import { getTeamById } from './teams';

// Helper function to get a safe firestore instance
const getFirestore = (): Firestore => {
  if (!firestoreInstance) {
    throw new Error('Firestore not initialized');
  }
  return firestoreInstance;
};

export interface PlayerAward {
  id: string;
  playerId: string;
  teamId: string;
  leagueId: string;
  awardType: 'playerOfMonth' | 'playerOfYear' | 'goldenBoot' | 'goldenGlove';
  month?: string;
  year: number;
  season: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    cleanSheets?: number;
    [key: string]: any; // Allow for other stats
  };
}

export interface TopScorer {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  goals: number;
  assists: number;
  position: number;
  leagueId: string;
  season: string;
  gamesPlayed: number;
}

export interface TeamStats {
  id: string;
  teamId: string;
  teamName: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  winPercentage: number;
  form: string[];
  leagueId: string;
  season: string;
  lastUpdated: Timestamp;
  position?: number; // Add position property which may not always be available
  points?: number; // Add points property which may not always be available
}

export interface LeagueStanding {
  id?: string;
  teamId: string;
  teamName: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[];
  leagueId: string;
  season: string;
  lastUpdated?: Timestamp;
}

export interface TeamComparison {
  teamA: TeamStats;
  teamB: TeamStats;
  headToHead: {
    matches: number;
    teamAWins: number;
    teamBWins: number;
    draws: number;
    teamAGoals: number;
    teamBGoals: number;
  };
  comparisonStats: Array<{
    label: string;
    teamA: number | string;
    teamB: number | string;
    winner?: 'A' | 'B' | 'tie';
    higher: 'better' | 'worse'; // Whether higher number is better or worse
  }>;
}

/**
 * Get top scorers for a league or competition
 */
export const getTopScorers = async (
  categoryId: string,
  limit: number = 10
): Promise<TopScorer[]> => {
  try {
    // Get a safe firestore instance
    const firestore = getFirestore();

    const scorersCollection = collection(firestore, 'topScorers');
    const scorersQuery = query(
      scorersCollection,
      where('leagueId', '==', categoryId),
      orderBy('goals', 'desc'),
      orderBy('assists', 'desc'),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(scorersQuery);
    
    // Map the data and add position numbers
    let position = 1;
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        position: position++
      } as TopScorer;
    });
  } catch (error) {
    console.error('Error fetching top scorers:', error);
    throw error;
  }
};

/**
 * Get team statistics from Firestore or calculate them
 */
export const getTeamStats = async (teamId: string, leagueId?: string): Promise<TeamStats | null> => {
  try {
    // Get a safe firestore instance
    const firestore = getFirestore();

    console.log(`Fetching stats for team: ${teamId}, league: ${leagueId || 'any'}`);

    const statsCollection = collection(firestore, 'teamStats');
    let statsQuery;
    
    // If leagueId is provided, look for specific league stats
    if (leagueId) {
      statsQuery = query(
        statsCollection,
        where('teamId', '==', teamId),
        where('leagueId', '==', leagueId)
      );
    } else {
      // Otherwise, get the most recent stats
      statsQuery = query(
        statsCollection,
        where('teamId', '==', teamId),
        orderBy('lastUpdated', 'desc'),
        firestoreLimit(1)
      );
    }
    
    const snapshot = await getDocs(statsQuery);
    
    if (snapshot.empty) {
      console.log(`No stats found for team: ${teamId}`);
      
      // Try to get stats from standings instead
      const standingsCollection = collection(firestore, 'leagueStandings');
      let standingsQuery;
      
      if (leagueId) {
        standingsQuery = query(
          standingsCollection,
          where('teamId', '==', teamId),
          where('leagueId', '==', leagueId)
        );
      } else {
        standingsQuery = query(
          standingsCollection,
          where('teamId', '==', teamId),
          orderBy('lastUpdated', 'desc'),
          firestoreLimit(1)
        );
      }
      
      const standingsSnapshot = await getDocs(standingsQuery);
      
      if (!standingsSnapshot.empty) {
        console.log(`Found standings for team: ${teamId}`);
        const standingData = standingsSnapshot.docs[0].data();
        const teamInfo = await getTeamById(teamId);
        
        // Convert standings to stats format
        return {
          id: standingsSnapshot.docs[0].id,
          teamId: teamId,
          teamName: teamInfo?.name || standingData.teamName || 'Unknown Team',
          matches: standingData.played || 0,
          wins: standingData.won || 0,
          draws: standingData.drawn || 0,
          losses: standingData.lost || 0,
          goalsFor: standingData.goalsFor || 0,
          goalsAgainst: standingData.goalsAgainst || 0,
          goalDifference: standingData.goalDifference || 0,
          cleanSheets: 0, // Not available in standings
          winPercentage: standingData.played > 0 ? Math.round((standingData.won / standingData.played) * 100) : 0,
          form: standingData.form || [],
          leagueId: standingData.leagueId || '',
          season: standingData.season || '',
          lastUpdated: standingData.lastUpdated || Timestamp.now(),
          position: standingData.position,
          points: standingData.points
        } as TeamStats;
      }
      
      return null;
    }
    
    // Return the first document (most recent if no leagueId specified)
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as TeamStats;
  } catch (error) {
    console.error('Error fetching team stats:', error);
    throw error;
  }
};

/**
 * Calculate team stats from match fixtures
 * This can be used as a fallback if no stats document exists in Firestore
 */
export const calculateTeamStats = async (teamId: string, fixtures: LeagueFixture[]): Promise<Partial<TeamStats>> => {
  try {
    // Filter to only completed matches involving this team
    const teamFixtures = fixtures.filter(
      fixture => 
        (fixture.homeTeamId === teamId || fixture.awayTeamId === teamId) && 
        fixture.status === 'completed'
    );
    
    if (teamFixtures.length === 0) {
      return {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        cleanSheets: 0,
        winPercentage: 0,
        form: []
      };
    }
    
    let matches = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let cleanSheets = 0;
    const form: string[] = [];
    
    // Process each fixture
    teamFixtures.forEach(fixture => {
      matches++;
      
      // Check if team is home or away
      const isHome = fixture.homeTeamId === teamId;
      const teamScore = isHome ? fixture.homeScore || 0 : fixture.awayScore || 0;
      const opponentScore = isHome ? fixture.awayScore || 0 : fixture.homeScore || 0;
      
      // Update goals
      goalsFor += teamScore;
      goalsAgainst += opponentScore;
      
      // Update results
      if (teamScore > opponentScore) {
        wins++;
        form.unshift('W');
      } else if (teamScore === opponentScore) {
        draws++;
        form.unshift('D');
      } else {
        losses++;
        form.unshift('L');
      }
      
      // Update clean sheets
      if (opponentScore === 0) {
        cleanSheets++;
      }
    });
    
    // Calculate goal difference and win percentage
    const goalDifference = goalsFor - goalsAgainst;
    const winPercentage = matches > 0 ? Math.round((wins / matches) * 100) : 0;
    
    // Limit form to last 5 matches
    const recentForm = form.slice(0, 5);
    
    // Calculate points (3 for win, 1 for draw)
    const points = wins * 3 + draws;
    
    return {
      matches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference,
      cleanSheets,
      winPercentage,
      form: recentForm,
      points
    };
  } catch (error) {
    console.error('Error calculating team stats:', error);
    throw error;
  }
};

/**
 * Get team comparison data
 */
export const getTeamComparison = async (teamAId: string, teamBId: string, leagueId?: string): Promise<TeamComparison | null> => {
  try {
    // Get a safe firestore instance
    const firestore = getFirestore();

    // Get team stats for both teams
    const teamAStats = await getTeamStats(teamAId, leagueId);
    const teamBStats = await getTeamStats(teamBId, leagueId);
    
    if (!teamAStats || !teamBStats) {
      return null;
    }
    
    // Get head to head fixtures
    const fixturesCollection = collection(firestore, 'matches');
    const fixturesQuery = query(
      fixturesCollection,
      where('teams', 'array-contains', teamAId),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(fixturesQuery);
    
    // Filter fixtures to only those with both teams
    const h2hFixtures = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as LeagueFixture))
      .filter(fixture => 
        (fixture.homeTeamId === teamAId && fixture.awayTeamId === teamBId) ||
        (fixture.homeTeamId === teamBId && fixture.awayTeamId === teamAId)
      );
    
    // Calculate head to head stats
    let teamAWins = 0;
    let teamBWins = 0;
    let draws = 0;
    let teamAGoals = 0;
    let teamBGoals = 0;
    
    h2hFixtures.forEach(fixture => {
      const teamAIsHome = fixture.homeTeamId === teamAId;
      const teamAScore = teamAIsHome ? fixture.homeScore || 0 : fixture.awayScore || 0;
      const teamBScore = teamAIsHome ? fixture.awayScore || 0 : fixture.homeScore || 0;
      
      teamAGoals += teamAScore;
      teamBGoals += teamBScore;
      
      if (teamAScore > teamBScore) {
        teamAWins++;
      } else if (teamAScore < teamBScore) {
        teamBWins++;
      } else {
        draws++;
      }
    });
    
    // Create comparison stats array
    const comparisonStats = [
      {
        label: 'League Position',
        teamA: teamAStats.position || '—',
        teamB: teamBStats.position || '—',
        winner: getWinner(teamAStats.position, teamBStats.position, 'worse'),
        higher: 'worse' as const
      },
      {
        label: 'Points',
        teamA: teamAStats.points || 0,
        teamB: teamBStats.points || 0,
        winner: getWinner(teamAStats.points, teamBStats.points),
        higher: 'better' as const
      },
      {
        label: 'Matches Played',
        teamA: teamAStats.matches || 0,
        teamB: teamBStats.matches || 0,
        winner: getWinner(teamAStats.matches, teamBStats.matches),
        higher: 'better' as const
      },
      {
        label: 'Wins',
        teamA: teamAStats.wins || 0,
        teamB: teamBStats.wins || 0,
        winner: getWinner(teamAStats.wins, teamBStats.wins),
        higher: 'better' as const
      },
      {
        label: 'Draws',
        teamA: teamAStats.draws || 0,
        teamB: teamBStats.draws || 0,
        winner: getWinner(teamAStats.draws, teamBStats.draws),
        higher: 'better' as const
      },
      {
        label: 'Losses',
        teamA: teamAStats.losses || 0,
        teamB: teamBStats.losses || 0,
        winner: getWinner(teamAStats.losses, teamBStats.losses, 'worse'),
        higher: 'worse' as const
      },
      {
        label: 'Goals Scored',
        teamA: teamAStats.goalsFor || 0,
        teamB: teamBStats.goalsFor || 0,
        winner: getWinner(teamAStats.goalsFor, teamBStats.goalsFor),
        higher: 'better' as const
      },
      {
        label: 'Goals Conceded',
        teamA: teamAStats.goalsAgainst || 0,
        teamB: teamBStats.goalsAgainst || 0,
        winner: getWinner(teamAStats.goalsAgainst, teamBStats.goalsAgainst, 'worse'),
        higher: 'worse' as const
      },
      {
        label: 'Clean Sheets',
        teamA: teamAStats.cleanSheets || 0,
        teamB: teamBStats.cleanSheets || 0,
        winner: getWinner(teamAStats.cleanSheets, teamBStats.cleanSheets),
        higher: 'better' as const
      }
    ];
    
    return {
      teamA: teamAStats,
      teamB: teamBStats,
      headToHead: {
        matches: h2hFixtures.length,
        teamAWins,
        teamBWins,
        draws,
        teamAGoals,
        teamBGoals
      },
      comparisonStats
    };
  } catch (error) {
    console.error('Error getting team comparison:', error);
    throw error;
  }
};

/**
 * Get team rankings for statistics like "Most Goals", "Best Defense", etc.
 */
export const getTeamRankings = async (
  leagueId: string, 
  category: 'goals' | 'defense' | 'cleanSheets' | 'possession',
  limit: number = 5
): Promise<{
  teamId: string,
  teamName: string,
  value: number,
  colorPrimary?: string
}[]> => {
  try {
    // Get a safe firestore instance
    const firestore = getFirestore();

    const statsCollection = collection(firestore, 'teamStats');
    let orderByField: string;
    
    switch (category) {
      case 'goals':
        orderByField = 'goalsFor';
        break;
      case 'defense':
        orderByField = 'goalsAgainst';
        break;
      case 'cleanSheets':
        orderByField = 'cleanSheets';
        break;
      case 'possession':
        orderByField = 'avgPossession';
        break;
      default:
        orderByField = 'points';
    }
    
    // For defense, we want ascending order (less goals conceded is better)
    const direction = category === 'defense' ? 'asc' : 'desc';
    
    const statsQuery = query(
      statsCollection,
      where('leagueId', '==', leagueId),
      orderBy(orderByField, direction === 'desc' ? 'desc' : 'asc'),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(statsQuery);
    
    // If no stats, try getting from standings
    if (snapshot.empty && (category === 'goals' || category === 'defense')) {
      console.log(`No team stats found for ${category}, trying standings instead`);
      const standingsCollection = collection(firestore, 'leagueStandings');
      
      // Map category to standings field
      const standingsField = category === 'goals' ? 'goalsFor' : 'goalsAgainst';
      
      const standingsQuery = query(
        standingsCollection,
        where('leagueId', '==', leagueId),
        orderBy(standingsField, direction === 'desc' ? 'desc' : 'asc'),
        firestoreLimit(limit)
      );
      
      const standingsSnapshot = await getDocs(standingsQuery);
      
      // Get team details to include colors
      const teamIds = standingsSnapshot.docs.map(doc => doc.data().teamId);
      const teams: Record<string, Team> = {};
      
      // Fetch teams in parallel for better performance
      await Promise.all(
        teamIds.map(async (teamId) => {
          try {
            const teamDoc = await getDoc(doc(firestore, 'teams', teamId));
            if (teamDoc.exists()) {
              teams[teamId] = { 
                id: teamDoc.id, 
                ...teamDoc.data() 
              } as Team;
            }
          } catch (e) {
            console.warn(`Error fetching team ${teamId}: ${e}`);
          }
        })
      );
      
      // Map the results
      return standingsSnapshot.docs.map(doc => {
        const data = doc.data();
        const team = teams[data.teamId];
        
        return {
          teamId: data.teamId,
          teamName: data.teamName || (team?.name || 'Unknown Team'),
          value: data[standingsField] || 0,
          colorPrimary: team?.colorPrimary
        };
      });
    }
    
    // Get team details to include colors
    const teamsCollection = collection(firestore, 'teams');
    const teams = await getDocs(teamsCollection);
    const teamsMap = new Map<string, Team>();
    
    teams.docs.forEach(teamDoc => {
      teamsMap.set(teamDoc.id, { 
        id: teamDoc.id, 
        ...teamDoc.data() 
      } as Team);
    });
    
    // Map the results
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const team = teamsMap.get(data.teamId);
      
      return {
        teamId: data.teamId,
        teamName: data.teamName,
        value: data[orderByField],
        colorPrimary: team?.colorPrimary
      };
    });
  } catch (error) {
    console.error('Error fetching team rankings:', error);
    throw error;
  }
};

/**
 * Get player of the month award
 */
export const getPlayerOfTheMonth = async (
  leagueId: string,
  month?: string,
  year?: number
): Promise<PlayerAward | null> => {
  try {
    // Get a safe firestore instance
    const firestore = getFirestore();

    const awardsCollection = collection(firestore, 'playerAwards');
    let awardsQuery;
    
    // If month and year are specified
    if (month && year) {
      awardsQuery = query(
        awardsCollection,
        where('leagueId', '==', leagueId),
        where('awardType', '==', 'playerOfMonth'),
        where('month', '==', month),
        where('year', '==', year)
      );
    } 
    // If only year is specified
    else if (year) {
      awardsQuery = query(
        awardsCollection,
        where('leagueId', '==', leagueId),
        where('awardType', '==', 'playerOfMonth'),
        where('year', '==', year),
        orderBy('month', 'desc'),
        firestoreLimit(1)
      );
    } 
    // Default - get the most recent
    else {
      awardsQuery = query(
        awardsCollection,
        where('leagueId', '==', leagueId),
        where('awardType', '==', 'playerOfMonth'),
        orderBy('year', 'desc'),
        orderBy('month', 'desc'),
        firestoreLimit(1)
      );
    }
    
    const snapshot = await getDocs(awardsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    // Return the first document
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as PlayerAward;
  } catch (error) {
    console.error('Error fetching player of the month:', error);
    throw error;
  }
};

/**
 * Get league metadata
 */
export const getLeagueInfo = async (leagueId: string): Promise<{
  name: string;
  season: string;
  isActive: boolean;
} | null> => {
  try {
    // Get a safe firestore instance
    const firestore = getFirestore();

    const leagueDoc = await getDoc(doc(firestore, 'leagues', leagueId));
    
    if (!leagueDoc.exists()) {
      return null;
    }
    
    const data = leagueDoc.data();
    return {
      name: data.name || '',
      season: data.season || '',
      isActive: data.isActive || false
    };
  } catch (error) {
    console.error('Error fetching league info:', error);
    throw error;
  }
};

/**
 * Get team standings count for a specific position
 * Useful for highlighting relegation or promotion spots
 */
export const getPositionCount = async (
  leagueId: string, 
  position: 'top' | 'bottom',
  count: number
): Promise<LeagueStanding[]> => {
  try {
    // Get a safe firestore instance
    const firestore = getFirestore();

    const standingsCollection = collection(firestore, 'leagueStandings');
    const standingsQuery = query(
      standingsCollection,
      where('leagueId', '==', leagueId),
      orderBy('position', position === 'top' ? 'asc' : 'desc'),
      firestoreLimit(count)
    );
    
    const snapshot = await getDocs(standingsQuery);
    
    return snapshot.docs.map(doc => ({
      ...doc.data()
    } as LeagueStanding));
  } catch (error) {
    console.error('Error fetching position count:', error);
    throw error;
  }
};

// Helper function to determine winner in comparison
function getWinner(
  valueA: number | string | undefined, 
  valueB: number | string | undefined,
  higherIsBetter: 'better' | 'worse' = 'better'
): 'A' | 'B' | 'tie' | undefined {
  // Handle undefined values
  if (valueA === undefined || valueB === undefined) {
    return undefined;
  }
  
  // Convert to numbers if they're strings
  const numA = typeof valueA === 'string' ? parseInt(valueA) : valueA;
  const numB = typeof valueB === 'string' ? parseInt(valueB) : valueB;
  
  // Handle NaN
  if (isNaN(numA) || isNaN(numB)) {
    return undefined;
  }
  
  if (numA === numB) {
    return 'tie';
  }
  
  if (higherIsBetter === 'better') {
    return numA > numB ? 'A' : 'B';
  } else {
    return numA < numB ? 'A' : 'B';
  }
}