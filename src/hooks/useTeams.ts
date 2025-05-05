// CIFAMobileApp/src/hooks/useTeams.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getTeams, 
  getTeamById, 
  getTeamPlayers,
  getTeamWithRelatedData
} from '../services/firebase/teams';
import { 
  getTeamFixtures, 
  LeagueFixture 
} from '../services/firebase/leagues';
import { Team, Player } from '../types/team'; // Import types from types file instead

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


export const useTeams = () => {
  const [state, setState] = useState<TeamsState>({
    teams: [],
    selectedTeam: null,
    teamPlayers: [],
    teamFixtures: [],
    selectedLeague: null,  // Add this
    teamStanding: null,    // Add this
    loading: false,
    error: null
  });

  // Fetch all teams
  const fetchTeams = useCallback(async (type?: string, division?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const teams = await getTeams(type, division);
      setState(prev => ({ ...prev, teams, loading: false }));
      return teams;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Fetch a specific team by ID
  const fetchTeamById = useCallback(async (teamId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const team = await getTeamById(teamId);
      setState(prev => ({ ...prev, selectedTeam: team, loading: false }));
      return team;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team details';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Fetch players for a team
  const fetchTeamPlayers = useCallback(async (teamId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const players = await getTeamPlayers(teamId);
      setState(prev => ({ ...prev, teamPlayers: players, loading: false }));
      return players;
    } catch (error) {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team fixtures';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Load all team data at once
  const loadTeamData = useCallback(async (teamId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await getTeamWithRelatedData(teamId);
      
      if (!result) {
        throw new Error('Failed to load team data');
      }
      
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to load team data';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Helper function to get fixtures by status
  const getFixturesByStatus = (fixtures: LeagueFixture[]) => {
    const now = new Date();
    
    const liveFixtures = fixtures.filter(fixture => fixture.status === 'live');
    
    const upcomingFixtures = fixtures
      .filter(fixture => 
        fixture.status === 'scheduled' && 
        fixture.date.toDate() > now
      )
      .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
    
    const pastFixtures = fixtures
      .filter(fixture => 
        fixture.status === 'completed' || 
        (fixture.status === 'scheduled' && fixture.date.toDate() < now)
      )
      .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());
    
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

  return {
    ...state,
    fetchTeams,
    fetchTeamById,
    fetchTeamPlayers,
    fetchTeamFixtures,
    loadTeamData,
    getFixturesByStatus,
    resetState
  };
};

export default useTeams;