// CIFAMobileApp/src/hooks/useStats.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getTopScorers, 
  getTeamStats, 
  calculateTeamStats, 
  getTeamComparison,
  getTeamRankings,
  TopScorer,
  TeamStats,
  TeamComparison,
  PlayerAward
} from '../services/firebase/stats';
import { getTeamFixtures } from '../services/firebase/leagues';
import { getPlayerById } from '../services/firebase/teams';
import { Team } from '../types/team';

// Create cache objects to store fetched data and minimize duplicate requests
const topScorersCache: Record<string, TopScorer[]> = {};
const teamStatsCache: Record<string, TeamStats> = {};
const teamComparisonCache: Record<string, TeamComparison> = {};
const teamRankingsCache: Record<string, any[]> = {};

export const useStats = () => {
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [comparisonStats, setComparisonStats] = useState<TeamComparison | null>(null);
  const [teamRankings, setTeamRankings] = useState<{
    category: string;
    teams: {
      teamId: string;
      teamName: string;
      value: number;
      colorPrimary?: string;
    }[];
  }[]>([]);
  const [playerOfMonth, setPlayerOfMonth] = useState<PlayerAward | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch top scorers for a league
  const fetchTopScorers = useCallback(async (categoryId: string, limit?: number, forceRefresh = false) => {
    // Create a cache key
    const cacheKey = `${categoryId}-${limit || 'default'}`;
    
    // Check if we have cached data and not forcing refresh
    if (!forceRefresh && topScorersCache[cacheKey] && topScorersCache[cacheKey].length > 0) {
      setTopScorers(topScorersCache[cacheKey]);
      return topScorersCache[cacheKey];
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const scorers = await getTopScorers(categoryId, limit);
      
      // Cache the results
      topScorersCache[cacheKey] = scorers;
      
      setTopScorers(scorers);
      setLoading(false);
      return scorers;
    } catch (err) {
      console.error('Error fetching top scorers:', err);
      setError('Failed to load top scorers');
      setLoading(false);
      return [];
    }
  }, []);

  // Fetch stats for a specific team
  const fetchTeamStats = useCallback(async (teamId: string, forceRefresh = false, leagueId?: string) => {
    // Create a cache key
    const cacheKey = `${teamId}-${leagueId || 'default'}`;
    
    // Check if we have cached data and not forcing refresh
    if (!forceRefresh && teamStatsCache[cacheKey]) {
      setTeamStats(teamStatsCache[cacheKey]);
      return teamStatsCache[cacheKey];
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // First, try to get stats from Firestore
      let stats = await getTeamStats(teamId, leagueId);
      
      // If no stats document exists, calculate from fixtures
      if (!stats) {
        console.log('No team stats found in Firestore, calculating from fixtures...');
        
        const fixtures = await getTeamFixtures(teamId);
        if (fixtures.length > 0) {
          console.log(`Found ${fixtures.length} fixtures for team ${teamId}`);
          const calculatedStats = await calculateTeamStats(teamId, fixtures);
          
          // Use calculated stats with team ID but not as a full TeamStats object
          stats = {
            id: 'calculated',
            teamId,
            teamName: '', // Would need to fetch team info to get this
            ...calculatedStats,
            leagueId: leagueId || '',
            season: '',
            lastUpdated: new Date() as any
          } as TeamStats;
          
          console.log('Calculated stats:', stats);
        } else {
          console.log('No fixtures found for this team');
        }
      }
      
      if (stats) {
        // Cache the results
        teamStatsCache[cacheKey] = stats;
        setTeamStats(stats);
      }
      
      setLoading(false);
      return stats;
    } catch (err) {
      console.error('Error fetching team stats:', err);
      setError('Failed to load team statistics');
      setLoading(false);
      return null;
    }
  }, []);

  // Fetch comparison between two teams
  const fetchTeamComparison = useCallback(async (teamAId: string, teamBId: string, forceRefresh = false, leagueId?: string) => {
    // Create a cache key
    const cacheKey = `${teamAId}-${teamBId}-${leagueId || 'default'}`;
    
    // Check if we have cached data and not forcing refresh
    if (!forceRefresh && teamComparisonCache[cacheKey]) {
      setComparisonStats(teamComparisonCache[cacheKey]);
      return teamComparisonCache[cacheKey];
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const comparison = await getTeamComparison(teamAId, teamBId, leagueId);
      
      if (comparison) {
        // Cache the results
        teamComparisonCache[cacheKey] = comparison;
        setComparisonStats(comparison);
      }
      
      setLoading(false);
      return comparison;
    } catch (err) {
      console.error('Error fetching team comparison:', err);
      setError('Failed to load team comparison');
      setLoading(false);
      return null;
    }
  }, []);

  // Fetch team rankings for different categories
  const fetchTeamRankings = useCallback(async (
    leagueId: string,
    categories: ('goals' | 'defense' | 'cleanSheets' | 'possession')[],
    limit?: number,
    forceRefresh = false
  ) => {
    // Create a cache key
    const cacheKey = `${leagueId}-${categories.join('-')}-${limit || 'default'}`;
    
    // Check if we have cached data and not forcing refresh
    if (!forceRefresh && teamRankingsCache[cacheKey]) {
      setTeamRankings(teamRankingsCache[cacheKey]);
      return teamRankingsCache[cacheKey];
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const rankings = await Promise.all(
        categories.map(async (category) => {
          const teams = await getTeamRankings(leagueId, category, limit);
          return {
            category,
            teams
          };
        })
      );
      
      // Cache the results
      teamRankingsCache[cacheKey] = rankings;
      
      setTeamRankings(rankings);
      setLoading(false);
      return rankings;
    } catch (err) {
      console.error('Error fetching team rankings:', err);
      setError('Failed to load team rankings');
      setLoading(false);
      return [];
    }
  }, []);

  // Clear all caches (useful when logging out or for debugging)
  const clearCaches = useCallback(() => {
    Object.keys(topScorersCache).forEach(key => {
      delete topScorersCache[key];
    });
    
    Object.keys(teamStatsCache).forEach(key => {
      delete teamStatsCache[key];
    });
    
    Object.keys(teamComparisonCache).forEach(key => {
      delete teamComparisonCache[key];
    });
    
    Object.keys(teamRankingsCache).forEach(key => {
      delete teamRankingsCache[key];
    });
    
    setTopScorers([]);
    setTeamStats(null);
    setComparisonStats(null);
    setTeamRankings([]);
    setPlayerOfMonth(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    topScorers,
    teamStats,
    comparisonStats,
    teamRankings,
    playerOfMonth,
    loading,
    error,
    fetchTopScorers,
    fetchTeamStats,
    fetchTeamComparison,
    fetchTeamRankings,
    setPlayerOfMonth,
    clearCaches
  };
};