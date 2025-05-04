// CIFAMobileApp/app/teams/[id]/fixtures.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  RefreshControl,
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useTeams } from '../../../src/hooks/useTeams';
import { LeagueFixture } from '../../../src/services/firebase/leagues';
import FixtureItem from '../../../src/components/Leagues/FixtureItem';

export default function TeamFixturesScreen() {
  const { id } = useLocalSearchParams();
  const teamId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  
  const { selectedTeam, teamFixtures, loading, error, loadTeamData, getFixturesByStatus } = useTeams();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Load team data on mount
  useEffect(() => {
    if (teamId) {
      loadTeamData(teamId);
    }
  }, [teamId]);
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (teamId) {
      await loadTeamData(teamId);
    }
    setRefreshing(false);
  };
  
  // Get fixtures based on active tab
  const { liveFixtures, upcomingFixtures, pastFixtures } = getFixturesByStatus(teamFixtures);
  
  // Combine live and upcoming fixtures
  const displayedFixtures = activeTab === 'upcoming' 
    ? [...liveFixtures, ...upcomingFixtures]
    : pastFixtures;
  
  // Navigate to fixture details
  const navigateToFixture = (fixtureId: string) => {
    router.push(`/fixtures/${fixtureId}`);
  };
  
  // Group fixtures by month for section headers
  const groupFixturesByMonth = (fixtures: LeagueFixture[]) => {
    const grouped: { [month: string]: LeagueFixture[] } = {};
    
    fixtures.forEach(fixture => {
      const date = fixture.date.toDate();
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(fixture);
    });
    
    return Object.entries(grouped).map(([month, fixtures]) => ({
      month,
      data: fixtures
    }));
  };
  
  const sections = groupFixturesByMonth(displayedFixtures);
  
  // Render loading state
  if (loading && !refreshing && !selectedTeam) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading fixtures...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Results
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={32} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Fixtures List */}
      {!error && (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.month}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.monthHeader}>{item.month}</Text>
              {item.data.map((fixture) => (
                <FixtureItem
                  key={fixture.id}
                  fixture={fixture}
                  showVenue={true}
                  showLeague={true}
                  onPress={() => navigateToFixture(fixture.id)}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming'
                  ? 'No upcoming fixtures'
                  : 'No previous fixtures'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  listContent: {
    paddingBottom: 40,
  },
  monthHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});