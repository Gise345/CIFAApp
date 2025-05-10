// src/components/leagues/LeagueFixtures.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  SectionList,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, isSameDay } from 'date-fns';

import { useLeagues } from '../../hooks/useLeagues';
import { LeagueFixture } from '../../services/firebase/leagues';
import Card from '../common/Card';
import FixtureItem from './FixtureItem';

interface SectionData {
  title: string;
  date: Date;
  data: LeagueFixture[];
}

interface LeagueFixturesProps {
  leagueId: string;
  status?: 'scheduled' | 'completed';
  showVenue?: boolean;
  maxItems?: number;
  onViewAllFixtures?: () => void;
}

const LeagueFixtures: React.FC<LeagueFixturesProps> = ({
  leagueId,
  status = 'scheduled',
  showVenue = true,
  maxItems,
  onViewAllFixtures
}) => {
  const router = useRouter();
  const { 
    fetchLeagueById,
    fetchFixturesByLeague,
    fixtures,
    selectedLeague, 
    loading,
    error
  } = useLeagues();

  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loadingLeague, setLoadingLeague] = useState(false);

  useEffect(() => {
    loadData();
  }, [leagueId, status]);

  // Load league and fixtures data
  const loadData = async () => {
    try {
      setLoadingLeague(true);
      if (leagueId) {
        const league = await fetchLeagueById(leagueId);
        if (league) {
          await fetchFixturesByLeague(leagueId, status);
        }
      }
      setLoadingLeague(false);
    } catch (err) {
      console.error('Error loading league data:', err);
      setLoadingLeague(false);
    }
  };

  // Helper function to convert Firestore Timestamp to JavaScript Date
  const convertToDate = (fixtureDate: any): Date => {
    // If it's a Firestore Timestamp with a toDate method
    if (fixtureDate && typeof fixtureDate.toDate === 'function') {
      return fixtureDate.toDate();
    }
    // If it's already a Date object
    if (fixtureDate instanceof Date) {
      return fixtureDate;
    }
    // Otherwise try to parse as string or number
    return new Date(fixtureDate);
  };

  // Group fixtures by date when fixtures data changes
  useEffect(() => {
    if (fixtures.length > 0) {
      // Group fixtures by date
      const groupedFixtures: { [date: string]: LeagueFixture[] } = {};
      
      // Apply maxItems limit if specified
      const limitedFixtures = maxItems ? fixtures.slice(0, maxItems) : fixtures;
      
      limitedFixtures.forEach(fixture => {
        // Convert Firestore Timestamp to JavaScript Date
        const fixtureDate = convertToDate(fixture.date);
        const dateKey = format(fixtureDate, 'yyyy-MM-dd');
        
        if (!groupedFixtures[dateKey]) {
          groupedFixtures[dateKey] = [];
        }
        
        groupedFixtures[dateKey].push(fixture);
      });
      
      // Convert to sections format for SectionList
      const fixturesSections: SectionData[] = Object.keys(groupedFixtures)
        .map(dateKey => {
          const date = new Date(dateKey);
          return {
            title: formatDateHeader(date),
            date,
            data: groupedFixtures[dateKey]
          };
        })
        .sort((a, b) => {
          // For scheduled fixtures, sort ascending. For completed, sort descending
          return status === 'scheduled' 
            ? a.date.getTime() - b.date.getTime()
            : b.date.getTime() - a.date.getTime();
        });
      
      setSections(fixturesSections);
    } else {
      setSections([]);
    }
  }, [fixtures, maxItems, status]);

  // Format date for section headers
  const formatDateHeader = (date: Date): string => {
    const today = new Date();
    const isToday = isSameDay(date, today);
    
    if (isToday) {
      return 'Today';
    }
    
    return format(date, 'EEE, dd MMM yyyy');
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Navigate to fixture details
  const navigateToFixture = (fixtureId: string) => {
    router.push(`/fixtures/${fixtureId}`);
  };

  // Render loading state
  if ((loading || loadingLeague) && !refreshing && fixtures.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Loading fixtures...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={24} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render empty state
  if (sections.length === 0 && !loading && !loadingLeague) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="calendar" size={24} color="#9ca3af" />
        <Text style={styles.emptyText}>
          {status === 'completed' 
            ? 'No completed matches found' 
            : 'No upcoming fixtures available'}
        </Text>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {status === 'completed' ? 'Results' : 'Fixtures'}
        </Text>
        {onViewAllFixtures && (
          <TouchableOpacity onPress={onViewAllFixtures}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FixtureItem 
            fixture={item} 
            onPress={() => navigateToFixture(item.id)}
            showVenue={showVenue}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              {status === 'completed' 
                ? 'No results available yet' 
                : 'No fixtures scheduled yet'}
            </Text>
          </View>
        )}
      />

      {/* Show "View All" button if we have a maxItems limit and there are more fixtures */}
      {maxItems && fixtures.length > maxItems && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={onViewAllFixtures}
        >
          <Text style={styles.viewAllButtonText}>View All Fixtures</Text>
          <Feather name="chevron-right" size={16} color="#2563eb" />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
  },
  list: {
    maxHeight: 500, // Set a max height to prevent the list from getting too long
  },
  listContent: {
    paddingBottom: 8,
  },
  sectionHeader: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#2563eb',
    marginRight: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyListContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default LeagueFixtures;