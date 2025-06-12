// app/admin/players/stats.tsx - Complete Final Version
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
  updateDoc
} from 'firebase/firestore';
import { firestore } from '../../../src/services/firebase/config';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import { useAuth } from '../../../src/hooks/useAuth';

interface PlayerStats {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  position: string;
  goals: number;
  assists: number;
  appearances: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  cleanSheets?: number;
  saves?: number;
  season: string;
  leagueId: string;
  updatedAt?: any;
}

export default function AdminPlayerStatsScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('2024-25');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // EXACT SAME AUTH PATTERN as working admin components
  useEffect(() => {
    if (!authLoading) {
      console.log('Admin Player Stats - Auth Check:', {
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
        Alert.alert('Access Denied', 'You must be an admin to access player statistics');
        router.back();
        return;
      }
      
      if (isAdmin === true) {
        setHasCheckedAuth(true);
        fetchPlayerStats();
      }
    }
  }, [authLoading, user, isAdmin]);

  // Fetch player statistics
  const fetchPlayerStats = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching player stats for season:', selectedSeason);
      
      const statsQuery = query(
        collection(firestore, 'playerStats'),
        where('season', '==', selectedSeason),
        orderBy('goals', 'desc')
      );
      
      const snapshot = await getDocs(statsQuery);
      const stats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerStats[];
      
      console.log('Fetched player stats:', stats.length);
      setPlayerStats(stats);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      Alert.alert('Error', 'Failed to load player statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlayerStats();
    setRefreshing(false);
  };

  const handleEditPlayer = (player: PlayerStats) => {
    Alert.alert('Coming Soon', 'Player editing functionality will be implemented soon.');
  };

  const handleAddNewStats = () => {
    Alert.alert('Coming Soon', 'Add new player stats functionality will be implemented soon.');
  };

  const filteredStats = playerStats.filter(player =>
    player.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlayerStatItem = ({ item }: { item: PlayerStats }) => (
    <Card style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.playerName || 'Unknown Player'}</Text>
          <Text style={styles.teamName}>{item.teamName || 'Unknown Team'}</Text>
          <Text style={styles.position}>{item.position || 'Unknown Position'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditPlayer(item)}
        >
          <Feather name="edit-2" size={16} color="#2563eb" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.goals || 0}</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.assists || 0}</Text>
          <Text style={styles.statLabel}>Assists</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.appearances || 0}</Text>
          <Text style={styles.statLabel}>Apps</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.minutesPlayed || 0}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.yellowCards || 0}</Text>
          <Text style={styles.statLabel}>Yellow</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.redCards || 0}</Text>
          <Text style={styles.statLabel}>Red</Text>
        </View>
      </View>
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
          <Header title="Player Statistics" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading player statistics...</Text>
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
        <Header title="Player Statistics" showBack={true} />
        
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
            <Text style={styles.titleText}>Player Stats ({filteredStats.length})</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddNewStats}
            >
              <Feather name="plus" size={16} color="white" />
              <Text style={styles.addButtonText}>Add Stats</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search players or teams..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Stats Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{filteredStats.length}</Text>
                <Text style={styles.summaryLabel}>Players</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {filteredStats.reduce((sum, p) => sum + (p.goals || 0), 0)}
                </Text>
                <Text style={styles.summaryLabel}>Total Goals</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {filteredStats.reduce((sum, p) => sum + (p.assists || 0), 0)}
                </Text>
                <Text style={styles.summaryLabel}>Total Assists</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {Math.round(filteredStats.reduce((sum, p) => sum + (p.minutesPlayed || 0), 0) / 90)}
                </Text>
                <Text style={styles.summaryLabel}>Matches</Text>
              </View>
            </View>
          </Card>

          {/* Player Stats List */}
          {filteredStats.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Feather name="bar-chart-2" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No player statistics found</Text>
                <Text style={styles.emptySubtext}>
                  Add some player stats or try adjusting your search criteria
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={handleAddNewStats}
                >
                  <Text style={styles.emptyButtonText}>Add First Player Stats</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <FlatList
              data={filteredStats}
              renderItem={renderPlayerStatItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.statsListContent}
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
    minWidth: 120,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
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
  statsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  playerCard: {
    marginBottom: 12,
    padding: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 2,
  },
  position: {
    fontSize: 12,
    color: '#6b7280',
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
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