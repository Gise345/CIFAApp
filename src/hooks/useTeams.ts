// src/hooks/useTeams.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTeams as fetchTeamsFromFirebase, 
  getTeamById, 
  getTeamPlayers,
  getTeamWithRelatedData,
  getNationalTeams
} from '../services/firebase/teams';
import { 
  getTeamFixtures,
  LeagueFixture 
} from '../services/firebase/leagues';
import { Team, Player } from '../types/team';

interface TeamsState {
  teams: Team[];
  selectedTeam: Team | null;
  teamPlayers: Player[];
  teamFixtures: LeagueFixture[];
  loading: boolean;
  error: string | null;
  selectedLeague: any | null;
  teamStanding: any | null;
}

// Create a cache object to store fetched teams and reduce duplicate requests
const teamsCache: Record<string, Team[]> = {};
const teamByIdCache: Record<string, Team> = {};
const teamPlayersCache: Record<string, Player[]> = {};

export const useTeams = () => {
  const [state, setState] = useState<TeamsState>({
    teams: [],
    selectedTeam: null,
    teamPlayers: [],
    teamFixtures: [],
    selectedLeague: null,
    teamStanding: null,
    loading: false,
    error: null
  });

  // Use refs to track pending requests and avoid race conditions
  const pendingRequests = useRef<Record<string, boolean>>({});

  // Fetch all teams with optional filtering
  const fetchTeams = useCallback(async (type?: string, division?: string, forceRefresh = false) => {
    // Create a cache key based on filters
    const cacheKey = `${type || 'all'}-${division || 'all'}`;
    
    // Check if we have cached data and not forcing refresh
    if (!forceRefresh && teamsCache[cacheKey] && teamsCache[cacheKey].length > 0) {
      setState(prev => ({ ...prev, teams: teamsCache[cacheKey], loading: false }));
      return teamsCache[cacheKey];
    }
    
    // Check if request is already pending
    if (pendingRequests.current[cacheKey]) {
      return state.teams;
    }
    
    // Mark request as pending
    pendingRequests.current[cacheKey] = true;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log(`Fetching teams with type: ${type}, division: ${division}`);
      const teams = await fetchTeamsFromFirebase(type, division);
      
      // Cache the results
      teamsCache[cacheKey] = teams;
      
      // Cache individual teams by ID for quicker lookups
      teams.forEach(team => {
        teamByIdCache[team.id] = team;
      });
      
      setState(prev => ({ ...prev, teams, loading: false }));
      
      // Clear pending status
      delete pendingRequests.current[cacheKey];
      
      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      
      // Clear pending status
      delete pendingRequests.current[cacheKey];
      
      return [];
    }
  }, [state.teams]);

  // Fetch national teams
  const fetchNationalTeams = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if we have cached data and not forcing refresh
      if (!forceRefresh && teamsCache['national'] && teamsCache['national'].length > 0) {
        setState(prev => ({ ...prev, teams: teamsCache['national'], loading: false }));
        return teamsCache['national'];
      }
      
      const nationalTeams = await getNationalTeams();
      
      // Cache the results
      teamsCache['national'] = nationalTeams;
      
      setState(prev => ({ ...prev, teams: nationalTeams, loading: false }));
      return nationalTeams;
    } catch (error) {
      console.error('Error fetching national teams:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch national teams';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Fetch a specific team by ID
  const fetchTeamById = useCallback(async (teamId: string, forceRefresh = false) => {
    // Check if we have it in cache and not forcing refresh
    if (!forceRefresh && teamByIdCache[teamId]) {
      setState(prev => ({ ...prev, selectedTeam: teamByIdCache[teamId], loading: false }));
      return teamByIdCache[teamId];
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const team = await getTeamById(teamId);
      
      if (team) {
        // Cache the result
        teamByIdCache[team.id] = team;
        setState(prev => ({ ...prev, selectedTeam: team, loading: false }));
      } else {
        setState(prev => ({ ...prev, selectedTeam: null, loading: false }));
      }
      
      return team;
    } catch (error) {
      console.error('Error fetching team:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team details';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Fetch players for a team
  const fetchTeamPlayers = useCallback(async (teamId: string, forceRefresh = false) => {
    // Check if we have it in cache and not forcing refresh
    if (!forceRefresh && teamPlayersCache[teamId] && teamPlayersCache[teamId].length > 0) {
      setState(prev => ({ ...prev, teamPlayers: teamPlayersCache[teamId], loading: false }));
      return teamPlayersCache[teamId];
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const players = await getTeamPlayers(teamId);
      
      // Cache the results
      teamPlayersCache[teamId] = players;
      
      setState(prev => ({ ...prev, teamPlayers: players, loading: false }));
      return players;
    } catch (error) {
      console.error('Error fetching team players:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team players';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Fetch fixtures for a team
  const fetchTeamFixtures = useCallback(async (teamId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const fixtures = await getTeamFixtures(teamId);
      
      setState(prev => ({ ...prev, teamFixtures: fixtures, loading: false }));
      return fixtures;
    } catch (error) {
      console.error('Error fetching team fixtures:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team fixtures';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Load all team data at once
  const loadTeamData = useCallback(async (teamId: string, forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if we already have team details in cache to avoid extra calls
      let team: Team | null = null;
      if (!forceRefresh && teamByIdCache[teamId]) {
        team = teamByIdCache[teamId];
      }
      
      // Fetch comprehensive data from Firebase
      const result = await getTeamWithRelatedData(teamId);
      
      if (!result) {
        throw new Error('Failed to load team data');
      }
      
      // Update caches
      teamByIdCache[result.team.id] = result.team;
      teamPlayersCache[teamId] = result.players;
      
      setState(prev => ({
        ...prev,
        selectedTeam: result.team,
        teamPlayers: result.players,
        teamFixtures: result.fixtures,
        selectedLeague: result.league,
        teamStanding: result.standings,
        loading: false
      }));
      
      return result;
    } catch (error) {
      console.error('Error loading team data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load team data';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Helper function to get fixtures by status
  const getFixturesByStatus = (fixtures: LeagueFixture[] = []) => {
    if (!fixtures.length) {
      return { liveFixtures: [], upcomingFixtures: [], pastFixtures: [] };
    }
    
    const now = new Date();
    
    // Helper function to safely convert any date format to a JavaScript Date
    const convertToDate = (dateValue: any): Date => {
      // For Firestore Timestamp objects
      if (dateValue && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
      }
      
      // For standard Date objects
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      // For string or number date representations
      try {
        return new Date(dateValue);
      } catch (e) {
        // Fallback to current date if parsing fails
        console.warn('Invalid date format:', dateValue);
        return new Date();
      }
    };
    
    // Find live fixtures
    const liveFixtures = fixtures.filter(fixture => 
      fixture.status === 'live'
    );
    
    // Find upcoming fixtures
    const upcomingFixtures = fixtures.filter(fixture => {
      if (fixture.status !== 'scheduled') return false;
      
      // Convert fixture date to JavaScript Date
      const fixtureDate = convertToDate(fixture.date);
      return fixtureDate > now;
    }).sort((a, b) => {
      // Sort by date ascending
      const dateA = convertToDate(a.date);
      const dateB = convertToDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Find past fixtures
    const pastFixtures = fixtures.filter(fixture => {
      if (fixture.status === 'completed') return true;
      if (fixture.status !== 'scheduled') return false;
      
      // Convert fixture date to JavaScript Date
      const fixtureDate = convertToDate(fixture.date);
      return fixtureDate < now;
    }).sort((a, b) => {
      // Sort by date descending (most recent first)
      const dateA = convertToDate(a.date);
      const dateB = convertToDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return { liveFixtures, upcomingFixtures, pastFixtures };
  };

  // Reset state
  const resetState = useCallback(() => {
    setState({
      teams: [],
      selectedTeam: null,
      teamPlayers: [],
      teamFixtures: [],
      selectedLeague: null,
      teamStanding: null,
      loading: false,
      error: null
    });
  }, []);

  // Clear cache (useful when logging out or for debugging)
  const clearCache = useCallback(() => {
    Object.keys(teamsCache).forEach(key => {
      delete teamsCache[key];
    });
    
    Object.keys(teamByIdCache).forEach(key => {
      delete teamByIdCache[key];
    });
    
    Object.keys(teamPlayersCache).forEach(key => {
      delete teamPlayersCache[key];
    });
    
    resetState();
  }, [resetState]);

  return {
    ...state,
    fetchTeams,
    fetchNationalTeams,
    fetchTeamById,
    fetchTeamPlayers,
    fetchTeamFixtures,
    loadTeamData,
    getFixturesByStatus,
    resetState,
    clearCache
  };
};

export default useTeams;