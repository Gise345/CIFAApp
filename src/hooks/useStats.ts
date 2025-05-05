// CIFAMobileApp/src/hooks/useStats.ts
import { useState, useCallback } from 'react';
import { firestore } from '../services/firebase/config';
import { collection, query, where, orderBy, getDocs, limit, Timestamp } from 'firebase/firestore';

// Interface for team stats
export interface TeamStat {
  teamId: string;
  teamName: string;
  colorPrimary: string;
  value: number;
}

// Interface for player of the month
export interface PlayerOfMonth {
  id: string;
  name: string;
  teamName: string;
  position: string;
  photoUrl?: string;
  goals: number;
  assists: number;
  month: string;
  year: number;
}

// Interface for top scorer
export interface TopScorer {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  position: number;
  goals: number;
  penalties: number;
  assists: number;
  gamesPlayed: number;
}

interface UseStatsResult {
  mostGoals: TeamStat[];
  bestDefense: TeamStat[];
  mostCleanSheets: TeamStat[];
  playerOfMonth: PlayerOfMonth | null;
  topScorers: TopScorer[];
  loading: boolean;
  error: string | null;
  fetchStats: (leagueId: string) => Promise<void>;
  fetchTopScorers: (leagueId: string) => Promise<void>;
}

export function useStats(): UseStatsResult {
  const [mostGoals, setMostGoals] = useState<TeamStat[]>([]);
  const [bestDefense, setBestDefense] = useState<TeamStat[]>([]);
  const [mostCleanSheets, setMostCleanSheets] = useState<TeamStat[]>([]);
  const [playerOfMonth, setPlayerOfMonth] = useState<PlayerOfMonth | null>(null);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get current season string
  const getCurrentSeason = (): string => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-based (0 = January)
    const currentYear = now.getFullYear();
    
    // Football seasons typically run from August to May
    // If we're past July, use current year as start
    const seasonStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;
    const seasonEndYear = seasonStartYear + 1;
    return `${seasonStartYear}-${seasonEndYear.toString().slice(2)}`;
  };

  // Fetch main stats (team stats and player of the month)
  const fetchStats = useCallback(async (leagueId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current season
      const season = getCurrentSeason();
      
      // Fetch most goals scored stats
      const goalsQuery = query(
        collection(firestore, 'teamStats'),
        where('leagueId', '==', leagueId),
        where('season', '==', season),
        where('type', '==', 'goalsScored'),
        orderBy('value', 'desc'),
        limit(5)
      );
      
      // Fetch best defense stats (fewest goals conceded)
      const defenseQuery = query(
        collection(firestore, 'teamStats'),
        where('leagueId', '==', leagueId),
        where('season', '==', season),
        where('type', '==', 'goalsConceded'),
        orderBy('value', 'asc'), // Ascending for best defense (lower is better)
        limit(5)
      );
      
      // Fetch most clean sheets
      const cleanSheetsQuery = query(
        collection(firestore, 'teamStats'),
        where('leagueId', '==', leagueId),
        where('season', '==', season),
        where('type', '==', 'cleanSheets'),
        orderBy('value', 'desc'),
        limit(5)
      );
      
      // Fetch player of the month (most recent)
      const playerQuery = query(
        collection(firestore, 'playerAwards'),
        where('leagueId', '==', leagueId),
        where('type', '==', 'playerOfMonth'),
        orderBy('year', 'desc'),
        orderBy('monthIndex', 'desc'),
        limit(1)
      );
      
      // Execute all queries in parallel
      const [goalsSnapshot, defenseSnapshot, cleanSheetsSnapshot, playerSnapshot] = 
        await Promise.all([
          getDocs(goalsQuery),
          getDocs(defenseQuery),
          getDocs(cleanSheetsQuery),
          getDocs(playerQuery)
        ]);
      
      // Process goals stats
      const goalsData = goalsSnapshot.docs.map(doc => ({
        teamId: doc.data().teamId,
        teamName: doc.data().teamName,
        colorPrimary: doc.data().teamColor || '#16a34a', // Default color if not provided
        value: doc.data().value
      }));
      setMostGoals(goalsData);
      
      // Process defense stats
      const defenseData = defenseSnapshot.docs.map(doc => ({
        teamId: doc.data().teamId,
        teamName: doc.data().teamName,
        colorPrimary: doc.data().teamColor || '#1e40af', // Default color if not provided
        value: doc.data().value
      }));
      setBestDefense(defenseData);
      
      // Process clean sheets stats
      const cleanSheetsData = cleanSheetsSnapshot.docs.map(doc => ({
        teamId: doc.data().teamId,
        teamName: doc.data().teamName,
        colorPrimary: doc.data().teamColor || '#16a34a', // Default color if not provided
        value: doc.data().value
      }));
      setMostCleanSheets(cleanSheetsData);
      
      // Process player of the month
      if (!playerSnapshot.empty) {
        const playerData = playerSnapshot.docs[0].data();
        setPlayerOfMonth({
          id: playerSnapshot.docs[0].id,
          name: playerData.playerName,
          teamName: playerData.teamName,
          position: playerData.position,
          photoUrl: playerData.photoUrl,
          goals: playerData.goals || 0,
          assists: playerData.assists || 0,
          month: playerData.month,
          year: playerData.year
        });
      } else {
        // If no player of the month data is found, set to null
        setPlayerOfMonth(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
      setLoading(false);
    }
  }, []);

  // Fetch top scorers
  const fetchTopScorers = useCallback(async (leagueId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current season
      const season = getCurrentSeason();
      
      // Query Firestore for top scorers in the selected league
      const scorersQuery = query(
        collection(firestore, 'topScorers'),
        where('leagueId', '==', leagueId),
        where('season', '==', season),
        orderBy('goals', 'desc'),
        limit(30) // Get top 30 scorers
      );
      
      const snapshot = await getDocs(scorersQuery);
      
      if (snapshot.empty) {
        setTopScorers([]);
      } else {
        const scorersData = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          playerId: doc.data().playerId,
          playerName: doc.data().playerName,
          teamId: doc.data().teamId,
          teamName: doc.data().teamName,
          teamColor: doc.data().teamColor || '#2563eb', // Default to blue if no color provided
          position: index + 1, // Calculate position based on order
          goals: doc.data().goals || 0,
          penalties: doc.data().penalties || 0,
          assists: doc.data().assists || 0,
          gamesPlayed: doc.data().gamesPlayed || 0
        }));
        
        setTopScorers(scorersData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading top scorers:', err);
      setError('Failed to load top scorers data');
      setLoading(false);
    }
  }, []);

  return {
    mostGoals,
    bestDefense,
    mostCleanSheets,
    playerOfMonth,
    topScorers,
    loading,
    error,
    fetchStats,
    fetchTopScorers
  };
}