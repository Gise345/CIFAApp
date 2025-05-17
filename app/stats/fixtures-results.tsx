// app/stats/fixtures-results.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SectionList
} from 'react-native';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import { useParams, getParam } from '../../src/utils/router';
import { getLeagueById, getFixturesByLeague, LeagueFixture } from '../../src/services/firebase/leagues';
import TeamLogo from '../../src/components/common/TeamLogo';
import StatsScreenWrapper from '../../src/components/helpers/StatsScreenWrapper';
import { LEAGUE_CATEGORIES } from '../../src/constants/LeagueTypes';

interface SectionData {
  title: string;
  data: LeagueFixture[];
}

export default function FixturesResultsScreen() {
  // Get category ID from URL params
  const params = useParams();
  const categoryId = getParam(params, 'categoryId') || '';

  // State variables
  const [fixtures, setFixtures] = useState<LeagueFixture[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [leagueName, setLeagueName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'fixtures' | 'results'>('all');

  // Load data when component mounts or category changes
  useEffect(() => {
    loadData();
  }, [categoryId]);

  // Function to load fixtures data
  const loadData = async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      setError(null);

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

      // Fetch all fixtures for the league
      const fixturesData = await getFixturesByLeague(categoryId);
      setFixtures(fixturesData);
      
      // Process into sections
      processFixtures(fixturesData, activeTab);
    } catch (err) {
      console.error('Error loading fixtures data:', err);
      setError('Failed to load fixtures and results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process fixtures into sections based on active tab
  const processFixtures = (fixturesData: LeagueFixture[], tab: 'all' | 'fixtures' | 'results') => {
    // Current date for comparison
    const now = new Date();
    
    // Filter fixtures based on active tab
    let filteredFixtures = fixturesData;
    if (tab === 'fixtures') {
      filteredFixtures = fixturesData.filter(f => 
        f.status === 'scheduled' && new Date(f.date?.toDate?.() || f.date) > now
      );
    } else if (tab === 'results') {
      filteredFixtures = fixturesData.filter(f => f.status === 'completed');
    }
    
    // Group fixtures by month for better organization
    const groupedByMonth: Record<string, LeagueFixture[]> = {};
    
    filteredFixtures.forEach(fixture => {
      try {
        // Format date to month year
        const fixtureDate = fixture.date?.toDate?.() 
          ? fixture.date.toDate() 
          : new Date(fixture.date);
        
        const monthYear = format(fixtureDate, 'MMMM yyyy');
        
        if (!groupedByMonth[monthYear]) {
          groupedByMonth[monthYear] = [];
        }
        
        groupedByMonth[monthYear].push(fixture);
      } catch (error) {
        console.warn('Error processing fixture date:', error);
      }
    });
    
    // Sort fixtures within each month
    Object.keys(groupedByMonth).forEach(month => {
      groupedByMonth[month].sort((a, b) => {
        const dateA = a.date?.toDate?.() ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate?.() ? b.date.toDate() : new Date(b.date);
        
        // For fixtures, sort by date ascending
        // For results, sort by date descending
        return tab === 'results'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
    });
    
    // Create sections array from grouped fixtures
    // Sort months in chronological order (for fixtures) or reverse (for results)
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return tab === 'results'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    
    const sectionData: SectionData[] = sortedMonths.map(month => ({
      title: month,
      data: groupedByMonth[month]
    }));
    
    setSections(sectionData);
  };

  // Handle refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Navigate to fixture details
  const handleFixturePress = (fixtureId: string) => {
    router.push(`/fixtures/${fixtureId}`);
  };

  // Format fixture date to full format
  const formatMatchDate = (date: any): string => {
    try {
      // Handle different date formats
      const dateObj = date?.toDate ? date.toDate() : new Date(date);
      return format(dateObj, 'EEEE, dd MMMM yyyy');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'fixtures' | 'results') => {
    setActiveTab(tab);
    processFixtures(fixtures, tab);
  };

  // Render fixture item
  const renderFixtureItem = ({ item }: { item: LeagueFixture }) => {
    const isCompleted = item.status === 'completed';
    
    return (
      <TouchableOpacity 
        style={styles.fixtureItem}
        onPress={() => handleFixturePress(item.id)}
      >
        <Text style={styles.fixtureDate}>{formatMatchDate(item.date)}</Text>
        
        <View style={styles.matchRow}>
          <View style={styles.teamSection}>
            <TeamLogo
              teamId={item.homeTeamId}
              teamName={item.homeTeamName}
              size={24}
              style={styles.teamLogo}
            />
            <Text style={styles.teamName} numberOfLines={1}>{item.homeTeamName}</Text>
          </View>
          
          <View style={styles.scoreSection}>
            {isCompleted ? (
              <Text style={styles.scoreText}>
                {item.homeScore} - {item.awayScore}
              </Text>
            ) : (
              <Text style={styles.matchTime}>
                {item.time || (typeof item.date?.toDate === 'function' ? 
                item.date.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '15:00')}
              </Text>
            )}
          </View>
          
          <View style={styles.teamSection}>
            <TeamLogo
              teamId={item.awayTeamId}
              teamName={item.awayTeamName}
              size={24}
              style={styles.teamLogo}
            />
            <Text style={styles.teamName} numberOfLines={1}>{item.awayTeamName}</Text>
          </View>
        </View>
        
        <Text style={styles.venueText}>{item.venue}</Text>
      </TouchableOpacity>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section: { title } }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  // Render content based on loading/error state
  const renderContent = () => {
    // Show loading indicator
    if (loading && !refreshing && fixtures.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading fixtures and results...</Text>
        </View>
      );
    }

    // Show error message
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

    // Show empty state if no fixtures
    if (sections.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={32} color="white" />
          <Text style={styles.emptyText}>
            No {activeTab === 'all' ? 'fixtures or results' : activeTab} available for this league
          </Text>
        </View>
      );
    }

    // Show fixtures
    return (
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id || `fixture-${index}`}
        renderItem={renderFixtureItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      />
    );
  };

  return (
    <StatsScreenWrapper>
      <Header title={leagueName || "Fixtures & Results"} showBack={true} />
      
      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabChange('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fixtures' && styles.activeTab]}
          onPress={() => handleTabChange('fixtures')}
        >
          <Text style={[styles.tabText, activeTab === 'fixtures' && styles.activeTabText]}>Fixtures</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'results' && styles.activeTab]}
          onPress={() => handleTabChange('results')}
        >
          <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>Results</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main content - directly render the content without wrapping in another ScrollView */}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563eb',
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  fixtureItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  fixtureDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  teamSection: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    marginRight: 8,
  },
  teamName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  scoreSection: {
    flex: 2,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  matchTime: {
    fontSize: 14,
    color: '#2563eb',
  },
  venueText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
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