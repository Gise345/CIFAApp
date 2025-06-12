// app/admin/matches/stats.tsx - Complete Professional Match Statistics Management
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  where,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../../../src/services/firebase/config';
import { format } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import { useAuth } from '../../../src/hooks/useAuth';

interface MatchStats {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  date: any;
  venue: string;
  attendance?: number;
  referee?: string;
  league: string;
  season: string;
  homeStats: TeamMatchStats;
  awayStats: TeamMatchStats;
  events: MatchEvent[];
  updatedAt?: any;
}

interface TeamMatchStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  passes: number;
  passAccuracy: number;
  offsides: number;
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty';
  minute: number;
  team: 'home' | 'away';
  player: string;
  description: string;
}

export default function AdminMatchStatsScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [matchStats, setMatchStats] = useState<MatchStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // EXACT SAME AUTH PATTERN as working admin components
  useEffect(() => {
    if (!authLoading) {
      console.log('Admin Match Stats - Auth Check:', {
        user: user?.email,
        isAdmin,
        authLoading
      });
      
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to access this page');
        router.replace('/(auth)/login');
        return;
      }
      
      if (isAdmin === false) {
        Alert.alert('Access Denied', 'You must be an admin to access match statistics');
        router.back();
        return;
      }
      
      if (isAdmin === true) {
        setHasCheckedAuth(true);
        fetchMatchStats();
      }
    }
  }, [authLoading, user, isAdmin]);

  const fetchMatchStats = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching match statistics...');
      
      let statsQuery = query(
        collection(firestore, 'matches'),
        orderBy('date', 'desc')
      );

      if (selectedStatus !== 'all') {
        statsQuery = query(
          collection(firestore, 'matches'),
          where('status', '==', selectedStatus),
          orderBy('date', 'desc')
        );
      }
      
      const snapshot = await getDocs(statsQuery);
      const stats = snapshot.docs.map(doc => ({
        id: doc.id,
        matchId: doc.id,
        ...doc.data(),
        // Ensure stats objects exist
        homeStats: doc.data().homeStats || {
          possession: 0, shots: 0, shotsOnTarget: 0, corners: 0,
          fouls: 0, yellowCards: 0, redCards: 0, passes: 0,
          passAccuracy: 0, offsides: 0
        },
        awayStats: doc.data().awayStats || {
          possession: 0, shots: 0, shotsOnTarget: 0, corners: 0,
          fouls: 0, yellowCards: 0, redCards: 0, passes: 0,
          passAccuracy: 0, offsides: 0
        },
        events: doc.data().events || []
      })) as MatchStats[];
      
      console.log('Fetched match stats:', stats.length);
      setMatchStats(stats);
    } catch (error) {
      console.error('Error fetching match stats:', error);
      Alert.alert('Error', 'Failed to load match statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatchStats();
    setRefreshing(false);
  };

  const handleEditMatch = (matchId: string) => {
    Alert.alert('Coming Soon', 'Match statistics editing will be implemented soon.');
  };

  const handleAddMatchStats = () => {
    Alert.alert('Coming Soon', 'Add match statistics functionality will be implemented soon.');
  };

  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'TBD';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'TBD';
    }
  };

  const getStatusBadge = (status?: string | null) => {
    const safeStatus = status || 'unknown';
    
    switch (safeStatus.toLowerCase()) {
      case 'live':
        return <Badge text="LIVE" variant="danger" />;
      case 'completed':
        return <Badge text="COMPLETED" variant="success" />;
      case 'scheduled':
        return <Badge text="SCHEDULED" variant="info" />;
      case 'postponed':
        return <Badge text="POSTPONED" variant="warning" />;
      case 'cancelled':
        return <Badge text="CANCELLED" variant="secondary" />;
      default:
        return <Badge text={safeStatus.toUpperCase()} variant="secondary" />;
    }
  };

  const filteredStats = matchStats.filter(match =>
    (match.homeTeam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     match.awayTeam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     match.league?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedStatus === 'all' || match.status === selectedStatus) &&
    (selectedLeague === 'all' || match.league === selectedLeague)
  );

  const renderMatchStatItem = ({ item }: { item: MatchStats }) => (
    <Card style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <View style={styles.teamsContainer}>
            <Text style={styles.teamName}>{item.homeTeam || 'Home Team'}</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {item.homeScore || 0} - {item.awayScore || 0}
              </Text>
            </View>
            <Text style={styles.teamName}>{item.awayTeam || 'Away Team'}</Text>
          </View>
          <Text style={styles.matchMeta}>
            {item.league} • {formatDate(item.date)}
          </Text>
          <Text style={styles.venue}>{item.venue || 'Venue TBD'}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusBadge(item.status)}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditMatch(item.id)}
          >
            <Feather name="edit-2" size={16} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Match Statistics */}
      {item.status === 'completed' && (
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Match Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <Text style={styles.homeStatValue}>{item.homeStats.possession}%</Text>
              <Text style={styles.statLabel}>Possession</Text>
              <Text style={styles.awayStatValue}>{item.awayStats.possession}%</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.homeStatValue}>{item.homeStats.shots}</Text>
              <Text style={styles.statLabel}>Shots</Text>
              <Text style={styles.awayStatValue}>{item.awayStats.shots}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.homeStatValue}>{item.homeStats.shotsOnTarget}</Text>
              <Text style={styles.statLabel}>Shots on Target</Text>
              <Text style={styles.awayStatValue}>{item.awayStats.shotsOnTarget}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.homeStatValue}>{item.homeStats.corners}</Text>
              <Text style={styles.statLabel}>Corners</Text>
              <Text style={styles.awayStatValue}>{item.awayStats.corners}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.homeStatValue}>{item.homeStats.fouls}</Text>
              <Text style={styles.statLabel}>Fouls</Text>
              <Text style={styles.awayStatValue}>{item.awayStats.fouls}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.homeStatValue}>
                {item.homeStats.yellowCards}/{item.homeStats.redCards}
              </Text>
              <Text style={styles.statLabel}>Cards</Text>
              <Text style={styles.awayStatValue}>
                {item.awayStats.yellowCards}/{item.awayStats.redCards}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Match Events */}
      {item.events && item.events.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.eventsSectionTitle}>Key Events</Text>
          {item.events.slice(0, 3).map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventMinute}>{event.minute}'</Text>
              <Feather 
                name={event.type === 'goal' ? 'target' : event.type === 'yellow_card' ? 'square' : 'x-square'} 
                size={14} 
                color={event.type === 'goal' ? '#16a34a' : event.type === 'yellow_card' ? '#f59e0b' : '#ef4444'} 
              />
              <Text style={styles.eventDescription}>{event.player} - {event.description}</Text>
            </View>
          ))}
          {item.events.length > 3 && (
            <Text style={styles.moreEvents}>+{item.events.length - 3} more events</Text>
          )}
        </View>
      )}
    </Card>
  );

  // EXACT SAME LOADING PATTERN as working components
  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Match Statistics" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading match statistics...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // EXACT SAME AUTH CHECK as working components
  if (!isAdmin || !hasCheckedAuth) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Match Statistics" showBack={true} />
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563eb"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Match Statistics ({filteredStats.length})</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddMatchStats}
            >
              <Feather name="plus" size={16} color="white" />
              <Text style={styles.addButtonText}>Add Stats</Text>
            </TouchableOpacity>
          </View>

          {/* Search and Filters */}
          <View style={styles.filtersContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search matches..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedStatus === 'all' && styles.activeFilterButton
                ]}
                onPress={() => setSelectedStatus('all')}
              >
                <Text style={[
                  styles.filterText,
                  selectedStatus === 'all' && styles.activeFilterText
                ]}>
                  All Matches
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedStatus === 'live' && styles.activeFilterButton
                ]}
                onPress={() => setSelectedStatus('live')}
              >
                <Text style={[
                  styles.filterText,
                  selectedStatus === 'live' && styles.activeFilterText
                ]}>
                  Live
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedStatus === 'completed' && styles.activeFilterButton
                ]}
                onPress={() => setSelectedStatus('completed')}
              >
                <Text style={[
                  styles.filterText,
                  selectedStatus === 'completed' && styles.activeFilterText
                ]}>
                  Completed
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedStatus === 'scheduled' && styles.activeFilterButton
                ]}
                onPress={() => setSelectedStatus('scheduled')}
              >
                <Text style={[
                  styles.filterText,
                  selectedStatus === 'scheduled' && styles.activeFilterText
                ]}>
                  Scheduled
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Summary Stats */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{filteredStats.length}</Text>
                <Text style={styles.summaryLabel}>Total Matches</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {filteredStats.filter(m => m.status === 'live').length}
                </Text>
                <Text style={styles.summaryLabel}>Live Now</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {filteredStats.filter(m => m.status === 'completed').length}
                </Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {filteredStats.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0)}
                </Text>
                <Text style={styles.summaryLabel}>Total Goals</Text>
              </View>
            </View>
          </Card>

          {/* Matches List */}
          {filteredStats.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Feather name="activity" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No match statistics found</Text>
                <Text style={styles.emptySubtext}>
                  Add some match statistics or try adjusting your search criteria
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={handleAddMatchStats}
                >
                  <Text style={styles.emptyButtonText}>Add First Match Stats</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <FlatList
              data={filteredStats}
              renderItem={renderMatchStatItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.matchesList}
            />
          )}
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 110,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  summaryCard: {
    margin: 16,
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  matchesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  matchCard: {
    marginBottom: 16,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  matchInfo: {
    flex: 1,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  scoreContainer: {
    marginHorizontal: 16,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  matchMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  venue: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    marginTop: 8,
  },
  statsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  homeStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 60,
    textAlign: 'left',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    textAlign: 'center',
  },
  awayStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 60,
    textAlign: 'right',
  },
  eventsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  eventsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventMinute: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    width: 30,
  },
  eventDescription: {
    fontSize: 12,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  moreEvents: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyCard: {
    margin: 16,
    padding: 32,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});