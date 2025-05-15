// src/components/stats/LeagueSelector.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { getActiveLeagues } from '../../services/firebase/leagues';
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
              type: league.type as any, // Type assertion needed here
              division: league.division,
              ageGroup: league.ageGroup,
              color: '#2563eb' // Default color
            };
          });
          
          setLeagues(leagueCategories);
        } else {
          // Fall back to predefined categories if no active leagues
          setLeagues(LEAGUE_CATEGORIES);
        }
      } catch (error) {
        console.error('Error loading leagues:', error);
        // Fall back to predefined categories
        setLeagues(LEAGUE_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeagues();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading leagues...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {leagues.map((league) => (
        <TouchableOpacity
          key={league.id}
          style={[
            styles.leagueButton,
            selectedId === league.id && styles.selectedLeague,
            { borderColor: league.color || '#2563eb' }
          ]}
          onPress={() => onSelectLeague(league.id)}
        >
          <Text 
            style={[
              styles.leagueText,
              selectedId === league.id && styles.selectedText,
              { color: selectedId === league.id ? 'white' : league.color || '#2563eb' }
            ]}
          >
            {league.label}
          </Text>
        </TouchableOpacity>
      ))}
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
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  leagueButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 100,
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
});

export default LeagueSelector;