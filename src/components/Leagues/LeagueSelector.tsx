// CIFAMobileApp/src/components/leagues/LeagueSelector.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { LeagueCategory, LEAGUE_CATEGORIES } from '../../constants/LeagueTypes';

interface LeagueSelectorProps {
  selectedCategoryId?: string;
  onSelectCategory: (category: LeagueCategory) => void;
  loading?: boolean;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
  loading = false
}) => {
  return (
    <LinearGradient
      colors={['#0A1172', '#2F4CB3']} // Dark blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="white" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {LEAGUE_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategoryId === category.id && styles.activeTab
              ]}
              onPress={() => onSelectCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategoryId === category.id && styles.activeText
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  categoryTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#0A1172',
  },
  loadingContainer: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LeagueSelector;