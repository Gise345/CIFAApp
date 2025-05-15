// src/components/stats/LeagueSelector.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { getActiveLeagues, League } from '../../services/firebase/leagues';
import { LEAGUE_CATEGORIES, LeagueCategory } from '../../constants/LeagueTypes';

interface LeagueSelectorProps {
  selectedId: string;
  onSelectLeague: (leagueId: string) => void;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({ 
  selectedId, 
  onSelectLeague 
}) => {
  const [leagues, setLeagues] = useState<LeagueCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawLeagues, setRawLeagues] = useState<League[]>([]);

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        // First try to load leagues from Firestore
        const activeLeagues = await getActiveLeagues();
        setRawLeagues(activeLeagues || []);
        
        if (activeLeagues && activeLeagues.length > 0) {
          // Create a map to track used IDs
          const usedIds = new Set<string>();
          
          // Map active leagues to categories
          const leagueCategories = activeLeagues.map((league, index) => {
            // Generate a unique ID for this league
            let uniqueId = league.id;
            
            // If ID is already used, add a suffix
            if (usedIds.has(uniqueId)) {
              uniqueId = `${uniqueId}-${index}`;
            }
            
            // Add ID to used set
            usedIds.add(uniqueId);
            
            // Check if we have a predefined category for this league
            const existingCategory = LEAGUE_CATEGORIES.find(c => 
              c.type === league.type && 
              c.division === league.division && 
              c.ageGroup === league.ageGroup
            );

            if (existingCategory) {
              // Use predefined category with the unique ID
              return {
                ...existingCategory,
                id: uniqueId, // Use the unique ID
                label: league.name || existingCategory.label, // Prefer actual league name
              };
            }

            // Create a new category if not found in predefined categories
            return {
              id: uniqueId,
              label: league.name,
              type: league.type as any, // Type assertion needed here
              division: league.division,
              ageGroup: league.ageGroup,
              color: '#2563eb' // Default color
            };
          });
          
          setLeagues(leagueCategories);
        } else {
          // Generate unique IDs for predefined categories
          const uniqueCategories = LEAGUE_CATEGORIES.map((cat, index) => ({
            ...cat,
            id: `${cat.id}-${index}` // Ensure unique ID by adding index
          }));
          
          setLeagues(uniqueCategories);
        }
      } catch (error) {
        console.error('Error loading leagues:', error);
        // Fall back to predefined categories with unique IDs
        const uniqueCategories = LEAGUE_CATEGORIES.map((cat, index) => ({
          ...cat,
          id: `${cat.id}-${index}` // Ensure unique ID by adding index
        }));
        
        setLeagues(uniqueCategories);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeagues();
  }, []);

  // For debugging - add console logs
  useEffect(() => {
    if (leagues.length > 0) {
      console.log("Loaded leagues:", leagues.map(l => `${l.id}: ${l.label}`));
    }
  }, [leagues]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6b7280" />
        <Text style={styles.loadingText}>Loading leagues...</Text>
      </View>
    );
  }

  // Find the league that best matches the selected ID
  const findMatchingLeague = (id: string) => {
    // First try exact match
    const exactMatch = leagues.find(league => league.id === id);
    if (exactMatch) return exactMatch.id;
    
    // Then try match without index suffix
    const baseIdMatch = leagues.find(league => id.startsWith(league.id.split('-')[0]));
    if (baseIdMatch) return baseIdMatch.id;
    
    // Default to first league
    return leagues.length > 0 ? leagues[0].id : '';
  };

  // Get best matching ID for selection
  const matchingId = findMatchingLeague(selectedId);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {leagues.map((league, index) => {
        // Create a unique key using ID and index
        const key = `${league.id}-${index}`;
        
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.leagueButton,
              matchingId === league.id && styles.selectedLeague,
              { borderColor: league.color || '#2563eb' }
            ]}
            onPress={() => onSelectLeague(league.id)}
          >
            <Text 
              style={[
                styles.leagueText,
                matchingId === league.id && styles.selectedText,
                { color: matchingId === league.id ? 'white' : league.color || '#2563eb' }
              ]}
              numberOfLines={1}
            >
              {league.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      
      {leagues.length === 0 && (
        <View style={styles.noLeaguesContainer}>
          <Text style={styles.noLeaguesText}>No leagues available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  leagueButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 100,
    maxWidth: 160,
    alignItems: 'center',
  },
  selectedLeague: {
    backgroundColor: '#2563eb',
  },
  leagueText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
  },
  noLeaguesContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noLeaguesText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default LeagueSelector;