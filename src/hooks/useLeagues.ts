// src/hooks/useLeagues.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getAllLeagues,
  getActiveLeagues,
  getLeagueById,
  getLeagueStandings,
  getFixturesByLeague,
  League,
  LeagueStanding,
  LeagueFixture
} from '../services/firebase/leagues';
import { handleApiError } from '../utils/errorHandling';

const leagueCache: Record<string, League> = {};
const standingsCache: Record<string, LeagueStanding[]> = {};
const fixturesCache: Record<string, LeagueFixture[]> = {};

export const useLeagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [fixtures, setFixtures] = useState<LeagueFixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all leagues
  const fetchLeagues = useCallback(async (activeOnly: boolean = true, forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache if not forcing refresh
      if (!forceRefresh && leagues.length > 0) {
        setLoading(false);
        return leagues;
      }
      
      const leaguesData = activeOnly ? 
        await getActiveLeagues() : 
        await getAllLeagues();
      
      setLeagues(leaguesData);
      setLoading(false);
      return leaguesData;
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetching leagues');
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, [leagues]);

  // Fetch a league by ID
  const fetchLeagueById = useCallback(async (leagueId: string, forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache if not forcing refresh
      if (!forceRefresh && leagueCache[leagueId]) {
        setSelectedLeague(leagueCache[leagueId]);
        setLoading(false);
        return leagueCache[leagueId];
      }
      
      const league = await getLeagueById(leagueId);
      
      if (league) {
        leagueCache[leagueId] = league;
        setSelectedLeague(league);
      } else {
        setSelectedLeague(null);
      }
      
      setLoading(false);
      return league;
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetching league details');
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  // Fetch league standings
  const fetchLeagueStandings = useCallback(async (leagueId: string, forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache if not forcing refresh
      if (!forceRefresh && standingsCache[leagueId]) {
        setStandings(standingsCache[leagueId]);
        setLoading(false);
        return standingsCache[leagueId];
      }
      
      const standingsData = await getLeagueStandings(leagueId);
      
      // Cache the results
      standingsCache[leagueId] = standingsData;
      setStandings(standingsData);
      
      setLoading(false);
      return standingsData;
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetching league standings');
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, []);

  // Fetch league fixtures
  const fetchLeagueFixtures = useCallback(async (
    leagueId: string, 
    status?: 'scheduled' | 'completed',
    limit?: number,
    forceRefresh: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a cache key including status and limit
      const cacheKey = `${leagueId}-${status || 'all'}-${limit || 'unlimited'}`;
      
      // Check cache if not forcing refresh
      if (!forceRefresh && fixturesCache[cacheKey]) {
        setFixtures(fixturesCache[cacheKey]);
        setLoading(false);
        return fixturesCache[cacheKey];
      }
      
      const fixturesData = await getFixturesByLeague(leagueId, status, limit);
      
      // Cache the results
      fixturesCache[cacheKey] = fixturesData;
      setFixtures(fixturesData);
      
      setLoading(false);
      return fixturesData;
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetching league fixtures');
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, []);

  // Reset errors
  const resetErrors = useCallback(() => {
    setError(null);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    Object.keys(leagueCache).forEach(key => {
      delete leagueCache[key];
    });
    
    Object.keys(standingsCache).forEach(key => {
      delete standingsCache[key];
    });
    
    Object.keys(fixturesCache).forEach(key => {
      delete fixturesCache[key];
    });
    
    setLeagues([]);
    setSelectedLeague(null);
    setStandings([]);
    setFixtures([]);
  }, []);

  return {
    leagues,
    selectedLeague,
    standings,
    fixtures,
    loading,
    error,
    fetchLeagues,
    fetchLeagueById,
    fetchLeagueStandings,
    fetchLeagueFixtures,
    resetErrors,
    clearCache
  };
};

export default useLeagues;