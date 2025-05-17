// src/components/stats/LeagueSelector.tsx - Updated without ScrollView nesting
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList,
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { getActiveLeagues, League } from '../../services/firebase/leagues';
import { LEAGUE_CATEGORIES, LeagueCategory, getSortedLeagueCategories } from '../../constants/LeagueTypes';

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
          
          // Map active leagues to categories with ordering
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
            // Determine order based on type and division
            let order = 999; // Default order for unknown categories
            if (league.type === 'mens' && league.division === 'Premier') {
              order = 1;
            } else if (league.type === 'womens' && league.division === 'Premier') {
              order = 2;
            } else if (league.type === 'mens' && league.division === 'First') {
              order = 3;
            } else if (league.type === 'boys' || league.type === 'girls') {
              order = 4;
            } else if (league.type === 'mens' && league.division === 'Championship') {
              order = 5;
            } else if (league.type === 'womens' && league.division === 'Championship') {
              order = 6;
            }

            return {
              id: uniqueId,
              label: league.name,
              type: league.type as any, // Type assertion needed here
              division: league.division,
              ageGroup: league.ageGroup,
              color: '#2563eb', // Default color
              order: order
            };
          });
          
          // Sort categories by order
          const sortedCategories = leagueCategories.sort((a, b) => (a.order || 999) - (b.order || 999));
          setLeagues(sortedCategories);
        } else {
          // Use predefined categories sorted by order
          setLeagues(getSortedLeagueCategories());
        }
      } catch (error) {
        console.error('Error loading leagues:', error);
        // Fall back to predefined categories sorted by order
        setLeagues(getSortedLeagueCategories());
      } finally {
        setLoading(false);
      }
    };
    
    loadLeagues();
  }, []);

  // For debugging - add console logs
  useEffect(() => {
    if (leagues.length > 0) {
      console.log("Loaded leagues:", leagues.map(l => `${l.id}: ${l.label} (order: ${l.order})`));
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
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      data={leagues}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={[
            styles.leagueButton,
            matchingId === item.id && styles.selectedLeague,
            { borderColor: item.color || '#2563eb' }
          ]}
          onPress={() => onSelectLeague(item.id)}
        >
          <Text 
            style={[
              styles.leagueText,
              matchingId === item.id && styles.selectedText,
              { color: matchingId === item.id ? 'white' : item.color || '#2563eb' }
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.noLeaguesContainer}>
          <Text style={styles.noLeaguesText}>No leagues available</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8, //space between buttons
    minWidth: 80,
    maxWidth: 250,

    alignItems: 'center',
  },
  selectedLeague: {
    backgroundColor: '#2563eb',
  },
  leagueText: {
    fontSize: 11,
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
  },
  noLeaguesContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noLeaguesText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default LeagueSelector;