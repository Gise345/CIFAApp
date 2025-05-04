// CIFAMobileApp/src/hooks/useLeagues.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getAllLeagues,
  getActiveLeagues,
  getLeaguesByType,
  getLeagueById,
  getLeagueStandings,
  getFixturesByLeague,
  getFixtureById,
  getUpcomingFixtures,
  getRecentResults,
  getTeamFixtures,
  getLiveMatches,
  League,
  LeagueStanding,
  LeagueFixture
} from '../services/firebase/leagues';

interface LeaguesState {
  leagues: League[];
  selectedLeague: League | null;
  standings: LeagueStanding[];
  fixtures: LeagueFixture[];
  upcomingFixtures: LeagueFixture[];
  recentResults: LeagueFixture[];
  liveMatches: LeagueFixture[];
  selectedFixture: LeagueFixture | null;
  loading: boolean;
  error: string | null;
}

export const useLeagues = () => {
  const [state, setState] = useState<LeaguesState>({
    leagues: [],
    selectedLeague: null,
    standings: [],
    fixtures: [],
    upcomingFixtures: [],
    recentResults: [],
    liveMatches: [],
    selectedFixture: null,
    loading: false,
    error: null
  });

  // Fetch all leagues
  const fetchAllLeagues = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const leagues = await getAllLeagues();
      setState(prev => ({ ...prev, leagues, loading: false }));
      return leagues;
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load leagues', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch active leagues
  const fetchActiveLeagues = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const leagues = await getActiveLeagues();
      setState(prev => ({ ...prev, leagues, loading: false }));
      return leagues;
    } catch (error) {
      console.error('Error fetching active leagues:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load active leagues', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch leagues by type, division, and/or age group
  const fetchLeaguesByType = useCallback(async (
    type?: 'mens' | 'womens' | 'boys' | 'girls',
    division?: string,
    ageGroup?: string
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const leagues = await getLeaguesByType(type, division, ageGroup);
      setState(prev => ({ ...prev, leagues, loading: false }));
      return leagues;
    } catch (error) {
      console.error('Error fetching leagues by type:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load leagues', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch league by ID
  const fetchLeagueById = useCallback(async (leagueId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const league = await getLeagueById(leagueId);
      setState(prev => ({ ...prev, selectedLeague: league, loading: false }));
      return league;
    } catch (error) {
      console.error('Error fetching league:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load league details', 
        loading: false 
      }));
      return null;
    }
  }, []);

  // Fetch league standings
  const fetchLeagueStandings = useCallback(async (leagueId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const standings = await getLeagueStandings(leagueId);
      setState(prev => ({ ...prev, standings, loading: false }));
      return standings;
    } catch (error) {
      console.error('Error fetching league standings:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load league standings', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch fixtures by league
  const fetchFixturesByLeague = useCallback(async (
    leagueId: string,
    status?: 'scheduled' | 'completed'
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const fixtures = await getFixturesByLeague(leagueId, status);
      setState(prev => ({ ...prev, fixtures, loading: false }));
      return fixtures;
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load fixtures', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch fixture by ID
  const fetchFixtureById = useCallback(async (fixtureId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const fixture = await getFixtureById(fixtureId);
      setState(prev => ({ ...prev, selectedFixture: fixture, loading: false }));
      return fixture;
    } catch (error) {
      console.error('Error fetching fixture:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load fixture details', 
        loading: false 
      }));
      return null;
    }
  }, []);

  // Fetch upcoming fixtures
  const fetchUpcomingFixtures = useCallback(async (limit: number = 5) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const fixtures = await getUpcomingFixtures(limit);
      setState(prev => ({ ...prev, upcomingFixtures: fixtures, loading: false }));
      return fixtures;
    } catch (error) {
      console.error('Error fetching upcoming fixtures:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load upcoming fixtures', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch recent results
  const fetchRecentResults = useCallback(async (limit: number = 5) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const results = await getRecentResults(limit);
      setState(prev => ({ ...prev, recentResults: results, loading: false }));
      return results;
    } catch (error) {
      console.error('Error fetching recent results:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load recent results', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch team fixtures
  const fetchTeamFixtures = useCallback(async (teamId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const fixtures = await getTeamFixtures(teamId);
      setState(prev => ({ ...prev, fixtures, loading: false }));
      return fixtures;
    } catch (error) {
      console.error('Error fetching team fixtures:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load team fixtures', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Fetch live matches
  const fetchLiveMatches = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const matches = await getLiveMatches();
      setState(prev => ({ ...prev, liveMatches: matches, loading: false }));
      return matches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load live matches', 
        loading: false 
      }));
      return [];
    }
  }, []);

  // Reset state errors
  const resetErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchAllLeagues,
    fetchActiveLeagues,
    fetchLeaguesByType,
    fetchLeagueById,
    fetchLeagueStandings,
    fetchFixturesByLeague,
    fetchFixtureById,
    fetchUpcomingFixtures,
    fetchRecentResults,
    fetchTeamFixtures,
    fetchLiveMatches,
    resetErrors
  };
};

export default useLeagues;