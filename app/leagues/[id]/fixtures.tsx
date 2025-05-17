// app/leagues/[id]/fixtures.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

import Header from '../../../src/components/common/Header';
import TeamLogo from '../../../src/components/common/TeamLogo';
import { useParams, router, getParam } from '../../../src/utils/router';
import { useLeagues } from '../../../src/hooks/useLeagues';
import { getFixturesByLeague, LeagueFixture } from '../../../src/services/firebase/leagues';

export default function LeagueFixturesScreen() {
  // Get league ID from route params
  const params = useParams();
  const leagueId = getParam(params, 'id') || '';

  const { fetchLeagueById, selectedLeague, loading: leagueLoading, error: leagueError } = useLeagues();
  const [fixtures, setFixtures] = useState<LeagueFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'results'>('upcoming');
  const [filteredFixtures, setFilteredFixtures] = useState<LeagueFixture[]>([]);
  const [groupedFixtures, setGroupedFixtures] = useState<Record<string, LeagueFixture[]>>({});
  const [months, setMonths] = useState<string[]>([]);

  // Load data on component mount
  useEffect(() => {
    if (leagueId) {
      loadData();
    }
  }, [leagueId]);

  // Load league and fixtures data
  const loadData = async () => {
    if (!leagueId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch league details
      await fetchLeagueById(leagueId);
      
      // Fetch fixtures/results
      const fixturesData = await getFixturesByLeague(leagueId);
      setFixtures(fixturesData);
    } catch (err) {
      console.error('Error loading fixtures data:', err);
      setError('Failed to load fixtures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle fixture press
  const handleFixturePress = (fixtureId: string) => {
    router.push(`/fixtures/${fixtureId}`);
  };

  // Filter and sort fixtures based on active tab
  const getFilteredFixtures = () => {
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      // Get scheduled fixtures in ascending order (soonest first)
      return fixtures
        .filter(fixture => 
          fixture.status === 'scheduled' && 
          new Date(fixture.date?.toDate?.() ? fixture.date.toDate() : fixture.date) > now
        )
        .sort((a, b) => {
          const dateA = new Date(a.date?.toDate?.() ? a.date.toDate() : a.date);
          const dateB = new Date(b.date?.toDate?.() ? b.date.toDate() : b.date);
          return dateA.getTime() - dateB.getTime();
        });
    } else {
      // Get completed fixtures in descending order (most recent first)
      return fixtures
        .filter(fixture => fixture.status === 'completed')
        .sort((a, b) => {
          const dateA = new Date(a.date?.toDate?.() ? a.date.toDate() : a.date);
          const dateB = new Date(b.date?.toDate?.() ? b.date.toDate() : b.date);
          return dateB.getTime() - dateA.getTime();
        });
    }
  };

  // Process fixtures when active tab changes or new fixtures are loaded
  useEffect(() => {
    // Filter fixtures
    const filtered = getFilteredFixtures();
    setFilteredFixtures(filtered);
    
    // Group by month
    const grouped = groupFixturesByMonth(filtered);
    setGroupedFixtures(grouped);
    
    // Sort months
    const sortedMonths = Object.keys(grouped);
    if (activeTab === 'upcoming') {
      sortedMonths.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    } else {
      sortedMonths.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }
    setMonths(sortedMonths);
  }, [activeTab, fixtures]);

  // Format match date
  const formatMatchDate = (date: any): string => {
    try {
      // Handle different date formats
      const dateObj = date?.toDate ? date.toDate() : new Date(date);
      return format(dateObj, 'EEEE, MMMM dd, yyyy');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  // Group fixtures by month for better visual organization
  const groupFixturesByMonth = (fixtures: LeagueFixture[]) => {
    const groupedFixtures: { [key: string]: LeagueFixture[] } = {};
    
    fixtures.forEach(fixture => {
      try {
        const dateObj = fixture.date?.toDate ? fixture.date.toDate() : new Date(fixture.date);
        const monthYear = format(dateObj, 'MMMM yyyy');
        
        if (!groupedFixtures[monthYear]) {
          groupedFixtures[monthYear] = [];
        }
        
        groupedFixtures[monthYear].push(fixture);
      } catch (error) {
        console.warn('Error grouping fixture by month:', error);
      }
    });
    
    return groupedFixtures;
  };

  // Handle tab change
  const handleTabChange = (tab: 'upcoming' | 'results') => {
    setActiveTab(tab);
  };

  // Render a single fixture
  const renderFixture = (fixture: LeagueFixture) => {
    const isCompleted = fixture.status === 'completed';
    
    return (
      <TouchableOpacity 
        key={fixture.id} 
        style={styles.fixtureCard}
        onPress={() => handleFixturePress(fixture.id)}
      >
        <Text style={styles.fixtureDate}>{formatMatchDate(fixture.date)}</Text>
        
        <View style={styles.matchRow}>
          <View style={styles.teamContainer}>
            <TeamLogo
              teamId={fixture.homeTeamId}
              teamName={fixture.homeTeamName}
              size={36}
            />
            <Text style={styles.teamName}>{fixture.homeTeamName}</Text>
          </View>
          
          <View style={styles.scoreContainer}>
            {isCompleted ? (
              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>{fixture.homeScore}</Text>
                <Text style={styles.scoreSeparator}>-</Text>
                <Text style={styles.scoreText}>{fixture.awayScore}</Text>
              </View>
            ) : (
              <Text style={styles.matchTime}>
                {fixture.time || (typeof fixture.date?.toDate === 'function' ? 
                fixture.date.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '15:00')}
              </Text>
            )}
          </View>
          
          <View style={styles.teamContainer}>
            <TeamLogo
              teamId={fixture.awayTeamId}
              teamName={fixture.awayTeamName}
              size={36}
            />
            <Text style={styles.teamName}>{fixture.awayTeamName}</Text>
          </View>
        </View>
        
        {fixture.venue && (
          <Text style={styles.venueText}>{fixture.venue}</Text>
        )}
        
        {fixture.status === 'live' && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render loading state
  if ((loading || leagueLoading) && !refreshing && fixtures.length === 0) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Fixtures" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading fixtures...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Show fixtures list
  const renderFixturesList = () => {
    if (filteredFixtures.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={32} color="#9ca3af" />
          <Text style={styles.emptyText}>
            No {activeTab === 'upcoming' ? 'upcoming fixtures' : 'results'} available
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.fixturesContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      >
        {months.map(month => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthTitle}>{month}</Text>
            
            {groupedFixtures[month].map(fixture => renderFixture(fixture))}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title={selectedLeague?.name || "Fixtures"} showBack={true} />
        
        {/* Tab navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => handleTabChange('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'results' && styles.activeTab]}
            onPress={() => handleTabChange('results')}
          >
            <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
              Results
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {/* Error state */}
          {(error || leagueError) && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={32} color="#ef4444" />
              <Text style={styles.errorText}>{error || leagueError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={loadData}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Loading state */}
          {(loading || leagueLoading) && !refreshing && fixtures.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading fixtures...</Text>
            </View>
          ) : renderFixturesList()}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
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
    color: '#6b7280',
    textAlign: 'center',
  },
  fixturesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  monthSection: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  fixtureCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fixtureDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamContainer: {
    flex: 3,
    alignItems: 'center',
  },
  teamName: {
    marginTop: 8,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  scoreContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 8,
  },
  matchTime: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  venueText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
});