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
  const fetchTopScorers = useCallback(async (categoryId: string, limit?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const scorers = await getTopScorers(categoryId, limit);
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
  const fetchTeamStats = useCallback(async (teamId: string, leagueId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get stats from Firestore first
      let stats = await getTeamStats(teamId, leagueId);
      
      // If no stats document exists, calculate from fixtures
      if (!stats) {
        const fixtures = await getTeamFixtures(teamId);
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
      }
      
      setTeamStats(stats);
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
  const fetchTeamComparison = useCallback(async (teamAId: string, teamBId: string, leagueId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const comparison = await getTeamComparison(teamAId, teamBId, leagueId);
      setComparisonStats(comparison);
      
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
    limit?: number
  ) => {
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

  // Fetch player of the month
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
    setPlayerOfMonth
  };
};