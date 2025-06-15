// app/admin/matches/stats.tsx - COMPLETELY FIXED VERSION
import React, { useState, useEffect, useRef  } from 'react';
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
  FlatList,
  Animated
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
  Timestamp,
  addDoc,
  Firestore
} from 'firebase/firestore';
import { firestore } from '../../../src/services/firebase/config';
import { format } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import { useAuth } from '../../../src/hooks/useAuth';

// Firebase guard function
const getFirestore = (): Firestore => {
  if (!firestore) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  return firestore;
};

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
  const [showAddModal, setShowAddModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Helper function to safely convert values to strings
const safeString = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return String(value);
};

// Helper function to safely convert to number
const safeNumber = (value: any, fallback: number = 0): number => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? fallback : parsed;
};

  // Animation effect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auth check pattern
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
    try {
      console.log('Fetching match statistics...');
      setLoading(true); // Ensure loading is true during fetch
      
      const db = getFirestore();
      let statsQuery = query(
        collection(db, 'matches'),
        orderBy('date', 'desc')
      );

      if (selectedStatus !== 'all') {
        statsQuery = query(
          collection(db, 'matches'),
          where('status', '==', selectedStatus),
          orderBy('date', 'desc')
        );
      }
      
      const snapshot = await getDocs(statsQuery);
      console.log('Raw match documents:', snapshot.docs.length);
      
      if (snapshot.empty) {
        console.log('No matches found in Firebase');
        setMatchStats([]);
        setLoading(false);
        return;
      }
      
      const stats = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Use the correct field names based on your Match interface
        const homeTeamName = data.homeTeamName || data.homeTeam || 'Home Team';
        const awayTeamName = data.awayTeamName || data.awayTeam || 'Away Team';
        
        return {
          id: doc.id,
          matchId: doc.id,
          homeTeam: homeTeamName,
          awayTeam: awayTeamName,
          homeScore: Math.max(0, data.homeScore || 0),
          awayScore: Math.max(0, data.awayScore || 0),
          status: data.status || 'scheduled',
          date: data.date || Timestamp.now(),
          venue: data.venue || 'TBD',
          attendance: Math.max(0, data.attendance || 0),
          referee: data.referee || '',
          league: data.leagueId || 'Unknown League',
          season: data.season || '2024-25',
          homeStats: {
            possession: Math.max(0, Math.min(100, data.homeStats?.possession || 50)),
            shots: Math.max(0, data.homeStats?.shots || 0),
            shotsOnTarget: Math.max(0, data.homeStats?.shotsOnTarget || 0),
            corners: Math.max(0, data.homeStats?.corners || 0),
            fouls: Math.max(0, data.homeStats?.fouls || 0),
            yellowCards: Math.max(0, data.homeStats?.yellowCards || 0),
            redCards: Math.max(0, data.homeStats?.redCards || 0),
            passes: Math.max(0, data.homeStats?.passes || 0),
            passAccuracy: Math.max(0, Math.min(100, data.homeStats?.passAccuracy || 0)),
            offsides: Math.max(0, data.homeStats?.offsides || 0)
          },
          awayStats: {
            possession: Math.max(0, Math.min(100, data.awayStats?.possession || 50)),
            shots: Math.max(0, data.awayStats?.shots || 0),
            shotsOnTarget: Math.max(0, data.awayStats?.shotsOnTarget || 0),
            corners: Math.max(0, data.awayStats?.corners || 0),
            fouls: Math.max(0, data.awayStats?.fouls || 0),
            yellowCards: Math.max(0, data.awayStats?.yellowCards || 0),
            redCards: Math.max(0, data.awayStats?.redCards || 0),
            passes: Math.max(0, data.awayStats?.passes || 0),
            passAccuracy: Math.max(0, Math.min(100, data.awayStats?.passAccuracy || 0)),
            offsides: Math.max(0, data.awayStats?.offsides || 0)
          },
          events: Array.isArray(data.events) ? data.events : [],
          updatedAt: data.updatedAt
        };
      }) as MatchStats[];
      
      console.log('Processed match stats:', stats.length);
      setMatchStats(stats);
    } catch (error) {
      console.error('Error fetching match stats:', error);
      Alert.alert('Error', 'Failed to load match statistics');
      setMatchStats([]);
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
    const match = matchStats.find(m => m.id === matchId);
    if (!match) return;
    
    Alert.alert(
      'Edit Match',
      `${match.homeTeam} vs ${match.awayTeam}`,
      [
        {
          text: 'Edit Score',
          onPress: () => promptEditScore(match)
        },
        {
          text: 'Edit Status',
          onPress: () => promptEditStatus(match)
        },
        {
          text: 'Edit Stats',
          onPress: () => Alert.alert('Coming Soon', 'Match statistics editing will be implemented soon.')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const promptEditScore = (match: MatchStats) => {
    Alert.alert(
      'Edit Score',
      `Current: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`,
      [
        {
          text: 'Home +1',
          onPress: () => updateMatchScore(match.id, match.homeScore + 1, match.awayScore)
        },
        {
          text: 'Away +1',
          onPress: () => updateMatchScore(match.id, match.homeScore, match.awayScore + 1)
        },
        {
          text: 'Reset (0-0)',
          onPress: () => updateMatchScore(match.id, 0, 0)
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const promptEditStatus = (match: MatchStats) => {
    Alert.alert(
      'Edit Status',
      `Current status: ${match.status}`,
      [
        {
          text: 'Live',
          onPress: () => updateMatchStatus(match.id, 'live')
        },
        {
          text: 'Completed',
          onPress: () => updateMatchStatus(match.id, 'completed')
        },
        {
          text: 'Scheduled',
          onPress: () => updateMatchStatus(match.id, 'scheduled')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const updateMatchScore = async (matchId: string, homeScore: number, awayScore: number) => {
    try {
      const db = getFirestore();
      const matchRef = doc(db, 'matches', matchId);
      
      await updateDoc(matchRef, {
        homeScore: Math.max(0, homeScore),
        awayScore: Math.max(0, awayScore),
        updatedAt: new Date()
      });
      
      Alert.alert('Success', 'Match score updated successfully!');
      fetchMatchStats();
    } catch (error) {
      console.error('Error updating match score:', error);
      Alert.alert('Error', 'Failed to update match score');
    }
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      const db = getFirestore();
      const matchRef = doc(db, 'matches', matchId);
      
      await updateDoc(matchRef, {
        status,
        updatedAt: new Date()
      });
      
      Alert.alert('Success', 'Match status updated successfully!');
      fetchMatchStats();
    } catch (error) {
      console.error('Error updating match status:', error);
      Alert.alert('Error', 'Failed to update match status');
    }
  };

  const handleAddMatchStats = () => {
    Alert.alert(
      'Add Match Statistics',
      'Choose how to add match statistics:',
      [
        {
          text: 'Quick Add',
          onPress: () => Alert.alert('Coming Soon', 'Quick add match stats will be implemented soon.')
        },
        {
          text: 'Full Stats',
          onPress: () => Alert.alert('Coming Soon', 'Full match statistics editor will be implemented soon.')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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
    const safeStatus = String(status || 'unknown');
    
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

  // FIXED renderMatchStatItem with professional UI enhancements
 const renderMatchStatItem = ({ item }: { item: MatchStats }) => {
  // Early return if item is invalid
  if (!item || typeof item !== 'object') {
    console.warn('Invalid item passed to renderMatchStatItem:', item);
    return (
      <Card style={styles.matchCard}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTextRed}>Invalid match data</Text>
        </View>
      </Card>
    );
  }

  const isLive = item.status === 'live';
  const isCompleted = item.status === 'completed';
  const showStats = isLive || isCompleted;
  
  // Safely extract all values
  const homeTeam = safeString(item.homeTeam, 'Home Team');
  const awayTeam = safeString(item.awayTeam, 'Away Team');
  const homeScore = safeNumber(item.homeScore, 0);
  const awayScore = safeNumber(item.awayScore, 0);
  const venue = safeString(item.venue, 'TBD');
  const league = safeString(item.league, 'Unknown League');
  const season = safeString(item.season, 'Unknown Season');
  const referee = safeString(item.referee);
  const attendance = safeNumber(item.attendance);
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={[styles.matchCard, isLive && styles.liveMatchCard]}>
        {/* Match Header Section */}
        <View style={styles.matchHeader}>
          <View style={styles.statusBadgeContainer}>
            {getStatusBadge(item.status)}
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditMatch(item.id)}
          >
            <Feather name="edit-2" size={18} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Match Info Section */}
        <View style={styles.matchInfoSection}>
          <View style={styles.dateVenueContainer}>
            <View style={styles.dateIconContainer}>
              <Feather name="calendar" size={14} color="#6b7280" />
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.venueIconContainer}>
              <Feather name="map-pin" size={14} color="#6b7280" />
              <Text style={styles.venueText}>{venue}</Text>
            </View>
          </View>
          
          <Text style={styles.leagueText}>{league} • {season}</Text>
        </View>

        {/* Teams and Score Section */}
        <View style={styles.mainMatchContainer}>
          <View style={styles.teamContainer}>
            <View style={styles.teamLogoPlaceholder}>
              <Text style={styles.teamInitial}>
                {homeTeam.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.teamName} numberOfLines={2}>{homeTeam}</Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, isLive && styles.liveScore]}>
              {homeScore.toString()}
            </Text>
            <Text style={styles.scoreDivider}>-</Text>
            <Text style={[styles.score, isLive && styles.liveScore]}>
              {awayScore.toString()}
            </Text>
          </View>
          
          <View style={styles.teamContainer}>
            <View style={styles.teamLogoPlaceholder}>
              <Text style={styles.teamInitial}>
                {awayTeam.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.teamName} numberOfLines={2}>{awayTeam}</Text>
          </View>
        </View>

        {/* Match Statistics - Enhanced UI */}
        {showStats && item.homeStats && item.awayStats && (
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>MATCH STATISTICS</Text>
            
            <View style={styles.statsGrid}>
              {/* Possession with visual bar */}
              <View style={styles.possessionContainer}>
                <View style={styles.possessionLabels}>
                  <Text style={styles.possessionValue}>
                    {safeNumber(item.homeStats.possession, 0).toString()}%
                  </Text>
                  <Text style={styles.possessionLabel}>Possession</Text>
                  <Text style={styles.possessionValue}>
                    {safeNumber(item.awayStats.possession, 0).toString()}%
                  </Text>
                </View>
                <View style={styles.possessionBar}>
                  <View style={[
                    styles.homePossessionFill, 
                    { width: `${safeNumber(item.homeStats.possession, 0)}%` }
                  ]} />
                  <View style={[
                    styles.awayPossessionFill, 
                    { width: `${safeNumber(item.awayStats.possession, 0)}%` }
                  ]} />
                </View>
              </View>

              {/* Other Stats */}
              {[
                { 
                  label: 'Total Shots', 
                  home: safeNumber(item.homeStats.shots, 0), 
                  away: safeNumber(item.awayStats.shots, 0) 
                },
                { 
                  label: 'Shots on Target', 
                  home: safeNumber(item.homeStats.shotsOnTarget, 0), 
                  away: safeNumber(item.awayStats.shotsOnTarget, 0) 
                },
                { 
                  label: 'Corners', 
                  home: safeNumber(item.homeStats.corners, 0), 
                  away: safeNumber(item.awayStats.corners, 0) 
                },
                { 
                  label: 'Fouls', 
                  home: safeNumber(item.homeStats.fouls, 0), 
                  away: safeNumber(item.awayStats.fouls, 0) 
                },
                { 
                  label: 'Yellow Cards', 
                  home: safeNumber(item.homeStats.yellowCards, 0), 
                  away: safeNumber(item.awayStats.yellowCards, 0) 
                },
                { 
                  label: 'Red Cards', 
                  home: safeNumber(item.homeStats.redCards, 0), 
                  away: safeNumber(item.awayStats.redCards, 0) 
                },
              ].map((stat, index) => (
                <View key={index} style={styles.statRow}>
                  <Text style={styles.statValue}>{stat.home.toString()}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.away.toString()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Match Events - Enhanced */}
        {item.events && Array.isArray(item.events) && item.events.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>KEY EVENTS</Text>
            <View style={styles.eventsContainer}>
              {item.events.slice(0, 5).map((event, index) => {
                if (!event || typeof event !== 'object') return null;
                
                const eventType = safeString(event.type, 'unknown');
                const eventMinute = safeNumber(event.minute, 0);
                const eventPlayer = safeString(event.player, 'Unknown');
                const eventDescription = safeString(event.description || eventType, 'Unknown Event');
                
                const eventIcon = {
                  goal: 'target',
                  yellow_card: 'square',
                  red_card: 'x-square',
                  substitution: 'refresh-cw',
                  penalty: 'target'
                }[eventType] || 'circle';
                
                const eventColor = {
                  goal: '#10b981',
                  yellow_card: '#f59e0b',
                  red_card: '#ef4444',
                  substitution: '#6b7280',
                  penalty: '#3b82f6'
                }[eventType] || '#6b7280';
                
                return (
                  <View key={index} style={styles.eventItem}>
                    <View style={styles.eventTimeContainer}>
                      <Text style={styles.eventMinute}>{eventMinute.toString()}'</Text>
                    </View>
                    <View style={[styles.eventIconContainer, { backgroundColor: `${eventColor}15` }]}>
                      <Feather name={eventIcon as any} size={16} color={eventColor} />
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventPlayer}>{eventPlayer}</Text>
                      <Text style={styles.eventDescription}>{eventDescription}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Additional Info Footer */}
        {(referee || attendance > 0) && (
          <View style={styles.additionalInfo}>
            {referee && (
              <View style={styles.infoItem}>
                <Feather name="user" size={12} color="#6b7280" />
                <Text style={styles.infoText}>Referee: {referee}</Text>
              </View>
            )}
            {attendance > 0 && (
              <View style={styles.infoItem}>
                <Feather name="users" size={12} color="#6b7280" />
                <Text style={styles.infoText}>
                  Attendance: {attendance.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

  // Loading state
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

  // Auth check
  if (!isAdmin || !hasCheckedAuth) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Match Statistics" showBack={true} />
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Access denied</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
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
        
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View>
              <Text style={styles.titleText}>Match Statistics</Text>
              <Text style={styles.subtitleText}>{filteredStats.length} matches found</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddMatchStats}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.addButtonGradient}
              >
                <Feather name="plus" size={18} color="white" />
                <Text style={styles.addButtonText}>Add Stats</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Search and Filters */}
          <View style={styles.filtersContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams, leagues..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContainer}
            >
              {['all', 'live', 'completed', 'scheduled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    selectedStatus === status && styles.activeFilterButton
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedStatus === status && styles.activeFilterText
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <LinearGradient
              colors={['#f8fafc', '#f1f5f9']}
              style={styles.summaryCard}
            >
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <Feather name="activity" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.summaryValue}>{filteredStats.length}</Text>
                  <Text style={styles.summaryLabel}>Total Matches</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: '#fef3c7' }]}>
                    <Feather name="radio" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.summaryValue}>
                    {filteredStats.filter(m => m.status === 'live').length}
                  </Text>
                  <Text style={styles.summaryLabel}>Live Now</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: '#d1fae5' }]}>
                    <Feather name="check-circle" size={20} color="#10b981" />
                  </View>
                  <Text style={styles.summaryValue}>
                    {filteredStats.filter(m => m.status === 'completed').length}
                  </Text>
                  <Text style={styles.summaryLabel}>Completed</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: '#fce7f3' }]}>
                    <Feather name="target" size={20} color="#ec4899" />
                  </View>
                  <Text style={styles.summaryValue}>
                    {filteredStats.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Goals</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Matches List */}
          <FlatList
            data={filteredStats}
            renderItem={renderMatchStatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.matchesList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#3b82f6"
                colors={['#3b82f6']}
              />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingSection}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingSectionText}>Loading matches...</Text>
                </View>
              ) : (
                <Card style={styles.emptyCard}>
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                      <Feather name="activity" size={48} color="#e5e7eb" />
                    </View>
                    <Text style={styles.emptyText}>No match statistics found</Text>
                    <Text style={styles.emptySubtext}>
                      Start by adding your first match statistics
                    </Text>
                    <TouchableOpacity 
                      style={styles.emptyButton}
                      onPress={handleAddMatchStats}
                    >
                      <LinearGradient
                        colors={['#3b82f6', '#2563eb']}
                        style={styles.emptyButtonGradient}
                      >
                        <Text style={styles.emptyButtonText}>Add First Match</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </Card>
              )
            }
          />
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
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  loadingSection: {
    padding: 60,
    alignItems: 'center',
  },
  loadingSectionText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterScroll: {
    marginTop: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeFilterButton: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  filterText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#3b82f6',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  matchesList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  matchCard: {
    marginBottom: 16,
    padding: 0,
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  liveMatchCard: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  matchInfoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateVenueContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  dateIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venueIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  venueText: {
    fontSize: 12,
    color: '#6b7280',
  },
  leagueText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  mainMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 100,
  },
  teamLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  teamInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b7280',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 18,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    minWidth: 50,
    textAlign: 'center',
  },
  liveScore: {
    color: '#f59e0b',
  },
  scoreDivider: {
    fontSize: 24,
    color: '#d1d5db',
    marginHorizontal: 8,
  },
  statsSection: {
    backgroundColor: '#f9fafb',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  possessionContainer: {
    marginBottom: 8,
  },
  possessionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  possessionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  possessionLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  possessionBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  homePossessionFill: {
    backgroundColor: '#3b82f6',
    height: '100%',
  },
  awayPossessionFill: {
    backgroundColor: '#ef4444',
    height: '100%',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 40,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  eventsSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fefefe',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  eventsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  eventsContainer: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventTimeContainer: {
    minWidth: 40,
  },
  eventMinute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  eventIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  eventPlayer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  additionalInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyCard: {
    margin: 20,
    padding: 40,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
errorContainer: {
  padding: 20,
  alignItems: 'center',
  justifyContent: 'center',
},
errorTextRed: {
  fontSize: 14,
  color: '#ef4444',
  textAlign: 'center',
},
});