// src/hooks/useNationalTeam.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchNationalTeamData, 
  fetchNationalTeamMatches, 
  fetchNationalTeamPlayers,
  fetchFifaRanking
} from '../services/api/externalApi';
import { NationalTeam, NationalTeamMatch, NationalTeamPlayer } from '../../src/types/nationalTeam';

interface NationalTeamState {
  team: NationalTeam | null;
  matches: {
    upcoming: NationalTeamMatch[];
    past: NationalTeamMatch[];
  };
  players: NationalTeamPlayer[];
  ranking: {
    world: number | null;
    confederation: number | null;
    points: number | null;
    previousRank: number | null;
  };
  loading: boolean;
  error: string | null;
}

interface UseNationalTeamReturn extends NationalTeamState {
  fetchTeamData: (teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20') => Promise<void>;
  fetchMatches: (teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20') => Promise<void>;
  fetchPlayers: (teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20') => Promise<void>;
  fetchRanking: (teamType: 'mens' | 'womens') => Promise<void>;
}

export const useNationalTeam = (): UseNationalTeamReturn => {
  const [state, setState] = useState<NationalTeamState>({
    team: null,
    matches: {
      upcoming: [],
      past: []
    },
    players: [],
    ranking: {
      world: null,
      confederation: null,
      points: null,
      previousRank: null
    },
    loading: false,
    error: null
  });

  // Fetch team data from FIFA/CONCACAF
  
// Update to src/hooks/useNationalTeam.ts

// In fetchTeamData function:
const fetchTeamData = useCallback(async (teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20') => {
  try {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const teamData = await fetchNationalTeamData(teamType);
    setState(prev => ({ 
      ...prev, 
      team: teamData,
      loading: false
    }));
  } catch (error) {
    console.error('Error in useNationalTeam hook:', error);
    setState(prev => ({ 
      ...prev, 
      error: 'Failed to load team data. Please try again later.',
      loading: false
    }));
  }
}, []);

// Similar updates to error handling in fetchMatches, fetchPlayers, and fetchRanking

  // Fetch team matches
  const fetchMatches = useCallback(async (teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch upcoming matches
      const upcomingMatches = await fetchNationalTeamMatches(teamType, 'upcoming');
      
      // Fetch past matches
      const pastMatches = await fetchNationalTeamMatches(teamType, 'past');
      
      setState(prev => ({ 
        ...prev, 
        matches: {
          upcoming: upcomingMatches,
          past: pastMatches
        },
        loading: false
      }));
    } catch (error) {
      console.error('Error in useNationalTeam hook:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load match data. Please try again later.',
        loading: false
      }));
    }
  }, []);

  // Fetch team players
  const fetchPlayers = useCallback(async (teamType: 'mens' | 'womens' | 'youth-u17' | 'youth-u20') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const players = await fetchNationalTeamPlayers(teamType);
      setState(prev => ({ 
        ...prev, 
        players,
        loading: false
      }));
    } catch (error) {
      console.error('Error in useNationalTeam hook:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load player data. Please try again later.',
        loading: false
      }));
    }
  }, []);

  // Fetch FIFA rankings (only for men's and women's teams)
  const fetchRanking = useCallback(async (teamType: 'mens' | 'womens') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Only men's and women's teams have FIFA rankings
      if (teamType === 'mens' || teamType === 'womens') {
        const rankingData = await fetchFifaRanking(teamType);
        setState(prev => ({ 
          ...prev, 
          ranking: {
            world: rankingData.rank,
            confederation: null, // This would need to be calculated from the confederation ranking
            points: rankingData.points,
            previousRank: rankingData.previousRank
          },
          loading: false
        }));
      } else {
        // Youth teams don't have FIFA rankings
        setState(prev => ({ 
          ...prev, 
          ranking: {
            world: null,
            confederation: null,
            points: null,
            previousRank: null
          },
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error in useNationalTeam hook:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load ranking data. Please try again later.',
        loading: false
      }));
    }
  }, []);

  return {
    ...state,
    fetchTeamData,
    fetchMatches,
    fetchPlayers,
    fetchRanking
  };
};