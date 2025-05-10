// src/utils/firebaseDataUtils.ts
import { 
    collection, 
    query,
    where,
    getDocs,
    doc,
    getDoc,
    orderBy,
    limit as firestoreLimit,
    Timestamp,
    DocumentData,
    Firestore
  } from 'firebase/firestore';
  import { firestore as firestoreInstance } from '../services/firebase/config';
  import { Team, Player } from '../types/team';
  import { LeagueFixture } from '../services/firebase/leagues';
  
  // Helper to safely get Firestore instance
  const getFirestore = (): Firestore => {
    if (!firestoreInstance) {
      throw new Error('Firestore not initialized');
    }
    return firestoreInstance;
  };
  
  /**
   * Update logoUrl field for teams to ensure consistency
   */
  export const updateTeamLogoUrls = async (teams: Team[]): Promise<Team[]> => {
    return teams.map(team => {
      // Check if the team has a logo field but not logoUrl
      if (team.logoUrl && !team.logoUrl) {
        return {
          ...team,
          logoUrl: team.logoUrl,
          // Keep logo for backward compatibility
          logo: team.logoUrl
        };
      }
      
      return team;
    });
  };
  
  /**
   * Create consistent fixture objects for UI components
   */
  export const createFixtureObject = (fixture: LeagueFixture): any => {
    // Format date if it's a Firestore timestamp
    const fixtureDate = fixture.date instanceof Date 
      ? fixture.date 
      : fixture.date.toDate();
      
    return {
      id: fixture.id,
      date: fixtureDate.toLocaleDateString(),
      time: fixtureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      competition: fixture.competition || 'League Match',
      homeTeam: {
        id: fixture.homeTeamId,
        name: fixture.homeTeamName,
        code: getTeamInitials(fixture.homeTeamName),
        logo: fixture.homeTeamLogo || '',
        logoUrl: fixture.homeTeamLogo || '',
        primaryColor: '#2563eb' // Default blue if no color provided
      },
      awayTeam: {
        id: fixture.awayTeamId,
        name: fixture.awayTeamName,
        code: getTeamInitials(fixture.awayTeamName),
        logo: fixture.awayTeamLogo || '',
        logoUrl: fixture.awayTeamLogo || '',
        primaryColor: '#ef4444' // Default red if no color provided
      },
      venue: fixture.venue,
      status: fixture.status as 'scheduled' | 'live' | 'completed',
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore
    };
  };
  
  // Helper function to get team code from name
  export const getTeamInitials = (teamName: string): string => {
    if (!teamName) return '';
    
    const words = teamName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    
    // Return first letter of each word (up to 3)
    return words
      .slice(0, 3)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  /**
   * Helper function to check if the Firebase data exists
   */
  export const checkFirebaseData = async (): Promise<boolean> => {
    try {
      const teamCount = await getCollectionCount('teams');
      const matchCount = await getCollectionCount('matches');
      const playerCount = await getCollectionCount('players');
      const leagueCount = await getCollectionCount('leagues');
      
      console.log(`Found data: Teams: ${teamCount}, Matches: ${matchCount}, Players: ${playerCount}, Leagues: ${leagueCount}`);
      
      return teamCount > 0 && matchCount > 0 && playerCount > 0 && leagueCount > 0;
    } catch (error) {
      console.error('Error checking Firebase data:', error);
      return false;
    }
  };
  
  // Helper to get collection count
  export const getCollectionCount = async (collectionName: string): Promise<number> => {
    try {
      const firestore = getFirestore();
      const snapshot = await getDocs(collection(firestore, collectionName));
      return snapshot.size;
    } catch (error) {
      console.error(`Error getting collection count for ${collectionName}:`, error);
      return 0;
    }
  };