// src/contexts/StatsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useStats } from '../hooks/useStats';
import { useLeagues } from '../hooks/useLeagues';
import { LEAGUE_CATEGORIES, LeagueCategory } from '../constants/LeagueTypes';
import { TopScorer } from '../services/firebase/stats';
import { LeagueStanding, getActiveLeagues, League } from '../services/firebase/leagues';

interface StatsContextType {
  selectedLeagueId: string;
  setSelectedLeagueId: (id: string) => void;
  leagueCategories: LeagueCategory[];
  topScorers: TopScorer[];
  standings: LeagueStanding[];
  leagueName: string;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { fetchTopScorers, loading: statsLoading, error: statsError } = useStats();
  const { fetchLeagueById, fetchLeagueStandings, standings, loading: leaguesLoading, error: leaguesError } = useLeagues();
  
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(
    LEAGUE_CATEGORIES.find(c => c.id === 'cayman-mens-premier-league')?.id || 
    LEAGUE_CATEGORIES[0]?.id || 
    'mens-premier-league'
  );
  const [leagueCategories, setLeagueCategories] = useState<LeagueCategory[]>(LEAGUE_CATEGORIES);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [leagueName, setLeagueName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load active leagues
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        // First try to load leagues from Firestore
        const activeLeagues = await getActiveLeagues();
        
        if (activeLeagues && activeLeagues.length > 0) {
          // Map active leagues to categories
          const leagueCategories = activeLeagues.map(league => {
            // Check if we have a predefined category for this league
            const existingCategory = LEAGUE_CATEGORIES.find(c => 
              c.type === league.type && 
              c.division === league.division && 
              c.ageGroup === league.ageGroup
            );

            if (existingCategory) {
              return existingCategory;
            }

            // Create a new category if not found in predefined categories
            return {
              id: league.id,
              label: league.name,
              type: league.type,
              division: league.division,
              ageGroup: league.ageGroup,
              color: '#2563eb' // Default color
            };
          });
          
          setLeagueCategories(leagueCategories);
        }
      } catch (err) {
        console.error('Error loading leagues:', err);
        // Fall back to predefined categories if error occurs
      }
    };
    
    loadLeagues();
  }, []);

  // Load league details and stats when selected league changes
  useEffect(() => {
    const loadLeagueData = async () => {
      if (!selectedLeagueId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Load the league details
        const league = await fetchLeagueById(selectedLeagueId);
        
        if (league) {
          setLeagueName(league.name);
        } else {
          // If no league found, try to find in predefined categories
          const category = LEAGUE_CATEGORIES.find(cat => cat.id === selectedLeagueId);
          if (category) {
            setLeagueName(category.label);
          } else {
            setLeagueName('League');
          }
        }
        
        // Load standings
        await fetchLeagueStandings(selectedLeagueId);
        
        // Load top scorers
        const scorers = await fetchTopScorers(selectedLeagueId, 5);
        setTopScorers(scorers);
      } catch (err) {
        console.error('Error loading league data:', err);
        setError('Failed to load league statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadLeagueData();
  }, [selectedLeagueId]);

  // Manually refresh stats
  const refreshStats = async () => {
    if (!selectedLeagueId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Refresh all data
      await Promise.all([
        fetchLeagueById(selectedLeagueId),
        fetchLeagueStandings(selectedLeagueId),
        fetchTopScorers(selectedLeagueId, 5)
      ]);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      setError('Failed to refresh statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Use any errors from the hooks
  useEffect(() => {
    if (statsError) {
      setError(statsError);
    } else if (leaguesError) {
      setError(leaguesError);
    }
  }, [statsError, leaguesError]);

  // Determine if we're loading based on the hooks
  useEffect(() => {
    setLoading(statsLoading || leaguesLoading);
  }, [statsLoading, leaguesLoading]);

  const value = {
    selectedLeagueId,
    setSelectedLeagueId,
    leagueCategories,
    topScorers,
    standings,
    leagueName,
    loading,
    error,
    refreshStats
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

// Custom hook to use the stats context
export const useStatsContext = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStatsContext must be used within a StatsProvider');
  }
  return context;
};