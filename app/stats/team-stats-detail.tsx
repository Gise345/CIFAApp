// app/stats/team-stats-detail.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import { useParams, getParam } from '../../src/utils/router';
import { getLeagueById } from '../../src/services/firebase/leagues';
import TeamLogo from '../../src/components/common/TeamLogo';
import { useStats } from '../../src/hooks/useStats';
import StatsScreenWrapper from '../../src/components/helpers/StatsScreenWrapper';
import { LEAGUE_CATEGORIES } from '../../src/constants/LeagueTypes';

// Enum for stat categories
enum StatCategory {
  Goals = 'goals',
  Defense = 'defense',
  CleanSheets = 'cleanSheets',
  Possession = 'possession',
  YellowCards = 'yellowCards',
  RedCards = 'redCards',
  Corners = 'corners',
  Fouls = 'fouls',
}

// Interface for team stat
interface TeamStat {
  teamId: string;
  teamName: string;
  value: number;
  colorPrimary?: string;
}

// Interface for category data
interface CategoryData {
  category: StatCategory;
  title: string;
  teams: TeamStat[];
  lowerIsBetter?: boolean;
  showPercentage?: boolean;
  valueLabel?: string;
}

export default function TeamStatsDetailScreen() {
  // Get category ID from URL params
  const params = useParams<{categoryId?: string}>();
  const categoryId = params?.categoryId || '';

  const { fetchTeamRankings, loading, error } = useStats();
  
  // State variables
  const [leagueName, setLeagueName] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>(StatCategory.Goals);

  // Load data when component mounts or category changes
  useEffect(() => {
    loadData();
  }, [categoryId]);

  // Function to load league and stats data
  const loadData = async () => {
    if (!categoryId) return;
    
    try {
      // Fetch league details
      const league = await getLeagueById(categoryId);
      if (league) {
        setLeagueName(league.name);
      } else {
        // If no league found, try to find in predefined categories
        const category = LEAGUE_CATEGORIES.find(cat => cat.id === categoryId);
        if (category) {
          setLeagueName(category.label);
        }
      }

      // Fetch all stats categories
      const statCategories = [
        StatCategory.Goals,
        StatCategory.Defense,
        StatCategory.CleanSheets,
        StatCategory.Possession,
        StatCategory.YellowCards,
        StatCategory.RedCards,
        StatCategory.Corners,
        StatCategory.Fouls
      ];

      const results = await fetchTeamRankings(categoryId, statCategories as any, 10);
      
      // Transform results into category data
      const categoryData: CategoryData[] = results.map(result => {
        let categoryInfo: CategoryData = {
          category: result.category as StatCategory,
          title: getCategoryTitle(result.category as StatCategory),
          teams: result.teams,
          lowerIsBetter: isLowerBetter(result.category as StatCategory),
          showPercentage: showsPercentage(result.category as StatCategory),
          valueLabel: getValueLabel(result.category as StatCategory),
        };
        return categoryInfo;
      });
      
      setCategories(categoryData);
    } catch (err) {
      console.error('Error loading team stats:', err);
    }
  };

  // Get category title
  const getCategoryTitle = (category: StatCategory): string => {
    switch (category) {
      case StatCategory.Goals: return 'Most Goals Scored';
      case StatCategory.Defense: return 'Best Defense (Goals Conceded)';
      case StatCategory.CleanSheets: return 'Most Clean Sheets';
      case StatCategory.Possession: return 'Highest Average Possession';
      case StatCategory.YellowCards: return 'Most Yellow Cards';
      case StatCategory.RedCards: return 'Most Red Cards';
      case StatCategory.Corners: return 'Most Corners';
      case StatCategory.Fouls: return 'Most Fouls Committed';
      default: return 'Stats';
    }
  };

  // Check if lower is better for a category
  const isLowerBetter = (category: StatCategory): boolean => {
    return category === StatCategory.Defense;
  };

  // Check if category shows percentage
  const showsPercentage = (category: StatCategory): boolean => {
    return category === StatCategory.Possession;
  };

  // Get value label for category
  const getValueLabel = (category: StatCategory): string => {
    switch (category) {
      case StatCategory.Defense: return 'conceded';
      case StatCategory.Possession: return '%';
      default: return '';
    }
  };

  // Handle refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle team press
  const handleTeamPress = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  // Handle category selection
  const handleCategorySelection = (category: StatCategory) => {
    setSelectedCategory(category);
  };

  // Get selected category data
  const getSelectedCategoryData = (): CategoryData | undefined => {
    return categories.find(cat => cat.category === selectedCategory);
  };

  // Render stat bar
  const renderStatBar = (team: TeamStat, index: number, categoryData: CategoryData) => {
    // Calculate bar width based on stats
    const calculateBarWidth = () => {
      const maxValue = categoryData.teams[0]?.value || 1;
      
      if (categoryData.lowerIsBetter) {
        // For defense (lower is better), invert the percentage
        return `${Math.min((100 * maxValue / team.value), 100)}%`;
      } else {
        // For other stats (higher is better)
        return `${Math.min((100 * team.value / maxValue), 100)}%`;
      }
    };

    // Format value based on category
    const formatValue = () => {
      if (categoryData.showPercentage) {
        return `${team.value}%`;
      } else if (categoryData.valueLabel) {
        return `${team.value} ${categoryData.valueLabel}`;
      } else {
        return `${team.value}`;
      }
    };

    // Get highlight color
    const getHighlightColor = (index: number) => {
      if (index === 0) return '#16a34a'; // Green for top
      if (index === 1) return '#2563eb'; // Blue for second
      if (index === 2) return '#7c3aed'; // Purple for third
      return team.colorPrimary || '#6b7280'; // Team color or gray
    };

    return (
      <TouchableOpacity 
        key={team.teamId + index} 
        style={styles.statItem}
        onPress={() => handleTeamPress(team.teamId)}
      >
        <View style={styles.statHeader}>
          <Text style={styles.rankText}>{index + 1}</Text>
          <TeamLogo
            teamId={team.teamId}
            teamName={team.teamName}
            size={32}
            colorPrimary={getHighlightColor(index)}
            style={styles.teamLogo}
          />
          <Text style={styles.teamName}>{team.teamName}</Text>
          <Text style={styles.statValue}>{formatValue()}</Text>
        </View>
        <View style={styles.barContainer}>
          <View 
            style={[
              styles.barFill, 
              { 
                width: `${parseFloat(calculateBarWidth())}%`,
                backgroundColor: getHighlightColor(index)
              }
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Render content based on loading/error state
  const renderContent = () => {
    // Loading state
    if (loading && !refreshing && categories.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading team statistics...</Text>
        </View>
      );
    }

    // Error state
    if (error && !refreshing) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={32} color="white" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Empty state
    if (categories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="bar-chart-2" size={32} color="white" />
          <Text style={styles.emptyText}>No team statistics available for this league</Text>
        </View>
      );
    }

    // Get selected category
    const selectedData = getSelectedCategoryData();
    if (!selectedData || selectedData.teams.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="bar-chart-2" size={32} color="white" />
          <Text style={styles.emptyText}>No data available for this category</Text>
        </View>
      );
    }

    // Show stat bars
    return (
      <ScrollView
        contentContainerStyle={styles.statsContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      >
        <Text style={styles.sectionTitle}>{selectedData.title}</Text>
        {selectedData.teams.map((team, index) => 
          renderStatBar(team, index, selectedData)
        )}
      </ScrollView>
    );
  };

  return (
    <StatsScreenWrapper>
      <Header title={leagueName || "Team Stats"} showBack={true} />

      {/* Category selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categorySelector}
        contentContainerStyle={styles.categorySelectorContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.category}
            style={[
              styles.categoryButton,
              selectedCategory === category.category && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelection(category.category)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category.category && styles.selectedCategoryText
              ]}
            >
              {getCategoryTitle(category.category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main content */}
      <View style={styles.container}>
        {renderContent()}
      </View>
    </StatsScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  categorySelector: {
    marginVertical: 8,
  },
  categorySelectorContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedCategory: {
    backgroundColor: 'white',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#2563eb',
  },
  statsContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statItem: {
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankText: {
    width: 24,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  teamLogo: {
    marginRight: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});