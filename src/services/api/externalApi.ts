// src/services/api/externalApi.ts
import { NationalTeam, NationalTeamMatch, NationalTeamPlayer } from '../../types/nationalTeam';

// Base URLs for external APIs
const FIFA_API_BASE = 'https://api.fifa.com/api/v3';
const CONCACAF_API_BASE = 'https://api.concacaf.com/v1'; // Example URL, actual URL may differ

/**
 * Fetch Cayman Islands national team data from FIFA or CONCACAF API
 */
export const fetchNationalTeamData = async (teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20'): Promise<NationalTeam> => {
  try {
    // FIFA team IDs for Cayman Islands teams (these are examples, use actual IDs)
    const teamIds = {
      'mens': '43935',       // Men's team FIFA ID
      'womens': '43936',     // Women's team FIFA ID
      'youth-u17': '43937',  // U-17 team FIFA ID
      'youth-u20': '43938',  // U-20 team FIFA ID
    };
    
    // FIFA endpoint
    const endpoint = `${FIFA_API_BASE}/teams/${teamIds[teamType]}`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Error fetching team data from FIFA API');
    }
    
    const data = await response.json();
    
    // Transform FIFA API data to our internal format
    return transformFifaTeamData(data, teamType);
  } catch (error) {
    console.error('Error fetching national team data:', error);
    throw error;
  }
};

/**
 * Fetch matches for Cayman Islands national teams
 */
export const fetchNationalTeamMatches = async (
  teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20', 
  status?: 'upcoming' | 'past' | 'all'
): Promise<NationalTeamMatch[]> => {
  try {
    // FIFA team IDs for Cayman Islands teams (these are examples, use actual IDs)
    const teamIds = {
      'mens': '43935',
      'womens': '43936', 
      'youth-u17': '43937',
      'youth-u20': '43938',
    };
    
    const now = new Date().toISOString();
    
    // Determine status filter
    const filter = status === 'upcoming' ? `&from=${now}` :
                  status === 'past' ? `&to=${now}` : '';
    
    // FIFA API endpoint for matches
    const endpoint = `${FIFA_API_BASE}/calendar/matches?teamId=${teamIds[teamType]}${filter}`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Error fetching match data from FIFA API');
    }
    
    const data = await response.json();
    
    // Transform FIFA API data to our internal format
    return transformFifaMatchData(data.Results || []);
  } catch (error) {
    console.error('Error fetching national team matches:', error);
    throw error;
  }
};

/**
 * Fetch player data for Cayman Islands national teams
 */
export const fetchNationalTeamPlayers = async (
  teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20'
): Promise<NationalTeamPlayer[]> => {
  try {
    // FIFA team IDs for Cayman Islands teams (these are examples, use actual IDs)
    const teamIds = {
      'mens': '43935',
      'womens': '43936',
      'youth-u17': '43937',
      'youth-u20': '43938',
    };
    
    // FIFA API endpoint for team squad
    const endpoint = `${FIFA_API_BASE}/teams/${teamIds[teamType]}/squad`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Error fetching player data from FIFA API');
    }
    
    const data = await response.json();
    
    // Transform FIFA API data to our internal format
    return transformFifaPlayerData(data.Players || []);
  } catch (error) {
    console.error('Error fetching national team players:', error);
    throw error;
  }
};

/**
 * Fetch FIFA rankings for Cayman Islands teams
 */
export const fetchFifaRanking = async (
  teamType: 'mens' | 'womens'
): Promise<{rank: number, points: number, previousRank: number, confederation: string}> => {
  try {
    // Both men's and women's teams have FIFA rankings
    if (teamType !== 'mens' && teamType !== 'womens') {
      throw new Error('FIFA rankings are only available for men\'s and women\'s teams');
    }
    
    const endpoint = `${FIFA_API_BASE}/rankings/${teamType === 'mens' ? 'FIFA' : 'FIFAWOMEN'}/ranking`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Failed to fetch FIFA rankings');
    }
    
    const data = await response.json();
    
    // Find Cayman Islands in the rankings
    const caymanRanking = data.Rankings.find((r: any) => r.TeamName === 'Cayman Islands');
    
    if (!caymanRanking) {
      throw new Error('Cayman Islands not found in FIFA rankings');
    }
    
    return {
      rank: caymanRanking.Rank,
      points: caymanRanking.Points,
      previousRank: caymanRanking.PreviousRank,
      confederation: caymanRanking.ConfederationName
    };
    
  } catch (error) {
    console.error('Error fetching FIFA rankings:', error);
    throw error;
  }
};

// Data transformation functions
function transformFifaTeamData(data: any, teamType: string): NationalTeam {
  // Transform FIFA API data format to our app's format
  return {
    id: data.IdTeam,
    name: data.Name[0].Description,
    shortName: data.ShortName[0].Description,
    type: teamType,
    logoUrl: data.PictureUrl,
    bannerUrl: null,
    primaryColor: '#c41e3a', // Cayman Islands red
    secondaryColor: '#00448e', // Cayman Islands blue
    tertiaryColor: '#ffffff', // White
    homeVenue: "Truman Bodden Sports Complex",
    coach: data.Coaches?.length > 0 ? data.Coaches[0].Name[0].Description : 'TBD',
    confederation: 'CONCACAF',
    worldRanking: data.Ranking?.Rank || null,
    confederationRanking: data.Ranking?.ConfederationRank || null,
    bio: `The ${teamType === 'mens' ? "men's" : teamType === 'womens' ? "women's" : teamType} national football team of the Cayman Islands is controlled by the Cayman Islands Football Association.`,
    achievements: [],
    stats: {
      matches: 0,
      wins: 0, 
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0
    }
  };
}

function transformFifaMatchData(data: any[]): NationalTeamMatch[] {
  // Transform FIFA API match data format to our app's format
  return data.map(match => ({
    id: match.IdMatch,
    competition: match.CompetitionName[0].Description,
    stage: match.StageName[0].Description,
    date: new Date(match.Date).toISOString(),
    venue: match.Stadium.Name[0].Description,
    city: match.Stadium.CityName[0].Description,
    country: match.Stadium.CountryName[0].Description,
    homeTeam: {
      id: match.Home.IdTeam,
      name: match.Home.TeamName[0].Description,
      shortName: match.Home.ShortName[0].Description,
      logoUrl: match.Home.PictureUrl,
      score: match.Home.Score
    },
    awayTeam: {
      id: match.Away.IdTeam,
      name: match.Away.TeamName[0].Description,
      shortName: match.Away.ShortName[0].Description,
      logoUrl: match.Away.PictureUrl,
      score: match.Away.Score
    },
    status: getMatchStatus(match.MatchStatus),
    events: match.Goals ? match.Goals.map((goal: any) => ({
      type: 'goal',
      minute: goal.Minute,
      teamId: goal.IdTeam,
      playerId: goal.IdPlayer,
      playerName: goal.PlayerName[0].Description
    })) : []
  }));
}

function transformFifaPlayerData(data: any[]): NationalTeamPlayer[] {
  // Transform FIFA API player data format to our app's format
  return data.map(player => ({
    id: player.IdPlayer,
    name: player.PlayerName[0].Description,
    shortName: player.ShortName[0].Description,
    photoUrl: player.PictureUrl,
    position: player.PositionLocalized[0].Description,
    jerseyNumber: player.ShirtNumber,
    dateOfBirth: player.BirthDate,
    club: player.ClubName ? player.ClubName[0].Description : null,
    height: player.Height,
    weight: player.Weight,
    caps: player.Caps || 0,
    goals: player.Goals || 0,
    isCaptain: player.IsCaptain
  }));
}

// Helper function to get match status
function getMatchStatus(status: string): 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed' {
  switch (status) {
    case '0':
      return 'scheduled';
    case '1':
    case '2':
    case '3':
      return 'live';
    case '4':
      return 'completed';
    case '5':
      return 'cancelled';
    case '6':
      return 'postponed';
    default:
      return 'scheduled';
  }
}