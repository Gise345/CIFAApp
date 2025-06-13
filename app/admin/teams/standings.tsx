// app/admin/teams/standings.tsx - Fixed Firebase Integration
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
  Firestore
} from 'firebase/firestore';
import { firestore } from '../../../src/services/firebase/config';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import { useAuth } from '../../../src/hooks/useAuth';

// Firebase guard function
const getFirestore = (): Firestore => {
  if (!firestore) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  return firestore;
};

interface TeamStanding {
  id: string;
  teamId: string;
  teamName: string;
  leagueId: string;
  leagueName: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
  season: string;
  updatedAt?: any;
}

export default function AdminTeamStandingsScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('2024-25');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Auth check pattern
  useEffect(() => {
    if (!authLoading) {
      console.log('Admin Team Standings - Auth Check:', {
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
        Alert.alert('Access Denied', 'You must be an admin to access team standings');
        router.back();
        return;
      }
      
      if (isAdmin === true) {
        setHasCheckedAuth(true);
        fetchStandings();
      }
    }
  }, [authLoading, user, isAdmin]);

  // Fixed Firebase fetch - looking for 'leagueStandings' collection
  const fetchStandings = async () => {
    try {
      console.log('Fetching team standings from leagueStandings collection...');
      
      const db = getFirestore();
      
      // Query the correct collection: 'leagueStandings'
      const standingsQuery = query(
        collection(db, 'leagueStandings'),
        orderBy('points', 'desc')
      );
      
      const snapshot = await getDocs(standingsQuery);
      console.log('Raw standings documents:', snapshot.docs.length);
      
      if (snapshot.empty) {
        console.log('No documents found in leagueStandings collection');
        setStandings([]);
        setLoading(false);
        return;
      }
      
      const standingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document data:', data);
        
        return {
          id: doc.id,
          teamId: data.teamId || doc.id,
          teamName: data.teamName || data.team || 'Unknown Team',
          leagueId: data.leagueId || data.league || 'unknown',
          leagueName: data.leagueName || data.league || 'Unknown League',
          position: data.position || 0,
          played: data.played || data.matches || 0,
          won: data.won || data.wins || 0,
          drawn: data.drawn || data.draws || 0,
          lost: data.lost || data.losses || 0,
          goalsFor: data.goalsFor || data.gf || 0,
          goalsAgainst: data.goalsAgainst || data.ga || 0,
          goalDifference: data.goalDifference || data.gd || (data.goalsFor || 0) - (data.goalsAgainst || 0),
          points: data.points || 0,
          form: data.form || data.recentForm || [],
          season: data.season || selectedSeason,
          updatedAt: data.updatedAt
        };
      }) as TeamStanding[];
      
      // Sort by points descending, then by goal difference
      standingsData.sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.goalDifference - a.goalDifference;
      });
      
      console.log('Processed standings data:', standingsData.length);
      setStandings(standingsData);
    } catch (error) {
      console.error('Error fetching team standings:', error);
      Alert.alert('Error', 'Failed to load team standings. Please check your connection and try again.');
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStandings();
    setRefreshing(false);
  };

  const handleUpdateStanding = async (teamId: string, updates: Partial<TeamStanding>) => {
    Alert.alert('Coming Soon', 'Team standing updates will be implemented soon.');
  };

  const handleAddResult = (team: TeamStanding) => {
    Alert.alert(
      'Add Match Result',
      `Add a new match result for ${team.teamName}`,
      [
        {
          text: 'Win',
          onPress: () => Alert.alert('Coming Soon', 'Result updates will be implemented soon.')
        },
        {
          text: 'Draw',
          onPress: () => Alert.alert('Coming Soon', 'Result updates will be implemented soon.')
        },
        {
          text: 'Loss',
          onPress: () => Alert.alert('Coming Soon', 'Result updates will be implemented soon.')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getFormColor = (result: string) => {
    switch (result) {
      case 'W': return '#16a34a';
      case 'D': return '#f59e0b';
      case 'L': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const filteredStandings = standings.filter(team => {
    const matchesSearch = team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.leagueName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeague = selectedLeague === 'all' || team.leagueId === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  const renderStandingItem = ({ item, index }: { item: TeamStanding; index: number }) => (
    <Card style={styles.standingCard}>
      <View style={styles.standingRow}>
        <View style={styles.positionContainer}>
          <Text style={[
            styles.positionText,
            index < 3 && styles.topPositionText
          ]}>
            {index + 1}
          </Text>
        </View>
        
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <Text style={styles.leagueName}>{item.leagueName}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{item.played}</Text>
            <Text style={styles.statLabel}>P</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{item.won}</Text>
            <Text style={styles.statLabel}>W</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{item.drawn}</Text>
            <Text style={styles.statLabel}>D</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{item.lost}</Text>
            <Text style={styles.statLabel}>L</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{item.goalDifference > 0 ? '+' : ''}{item.goalDifference}</Text>
            <Text style={styles.statLabel}>GD</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={[styles.statValue, styles.pointsValue]}>{item.points}</Text>
            <Text style={styles.statLabel}>Pts</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          {item.form.slice(-5).map((result, idx) => (
            <View 
              key={idx}
              style={[
                styles.formBadge,
                { backgroundColor: getFormColor(result) }
              ]}
            >
              <Text style={styles.formText}>{result}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddResult(item)}
        >
          <Feather name="plus" size={16} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  // Loading state
  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Team Standings" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading team standings...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Auth check
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
        <Header title="Team Standings" showBack={true} />
        
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
            <Text style={styles.titleText}>League Standings ({filteredStandings.length})</Text>
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={() => Alert.alert('Coming Soon', 'Bulk update functionality will be implemented soon.')}
            >
              <Feather name="refresh-cw" size={16} color="white" />
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams or leagues..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* League Filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLeague === 'all' && styles.activeFilterButton
              ]}
              onPress={() => setSelectedLeague('all')}
            >
              <Text style={[
                styles.filterText,
                selectedLeague === 'all' && styles.activeFilterText
              ]}>
                All Leagues
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLeague === 'premier' && styles.activeFilterButton
              ]}
              onPress={() => setSelectedLeague('premier')}
            >
              <Text style={[
                styles.filterText,
                selectedLeague === 'premier' && styles.activeFilterText
              ]}>
                Premier Division
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLeague === 'first' && styles.activeFilterButton
              ]}
              onPress={() => setSelectedLeague('first')}
            >
              <Text style={[
                styles.filterText,
                selectedLeague === 'first' && styles.activeFilterText
              ]}>
                First Division
              </Text>
            </TouchableOpacity>
          </View>

          {/* Standings Table Header */}
          <Card style={styles.tableHeader}>
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>Pos</Text>
              <Text style={[styles.headerText, styles.teamHeader]}>Team</Text>
              <Text style={styles.headerText}>P</Text>
              <Text style={styles.headerText}>W</Text>
              <Text style={styles.headerText}>D</Text>
              <Text style={styles.headerText}>L</Text>
              <Text style={styles.headerText}>GD</Text>
              <Text style={styles.headerText}>Pts</Text>
              <Text style={styles.headerText}>Form</Text>
              <Text style={styles.headerText}>Action</Text>
            </View>
          </Card>

          {/* Standings List */}
          {filteredStandings.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Feather name="award" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No standings found</Text>
                <Text style={styles.emptySubtext}>
                  {loading ? 'Loading standings...' : 'No team standings available for the selected criteria'}
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList
              data={filteredStandings}
              renderItem={renderStandingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.standingsListContent}
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
  updateButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  updateButtonText: {
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  tableHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    width: 32,
    textAlign: 'center',
  },
  teamHeader: {
    flex: 1,
    textAlign: 'left',
    marginLeft: 8,
  },
  standingsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  standingCard: {
    marginBottom: 8,
    padding: 12,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionContainer: {
    width: 32,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  topPositionText: {
    color: '#059669',
  },
  teamInfo: {
    flex: 1,
    marginLeft: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  leagueName: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  statColumn: {
    width: 32,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  pointsValue: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  formContainer: {
    flexDirection: 'row',
    marginLeft: 8,
    width: 80,
  },
  formBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  formText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    marginLeft: 8,
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
  },
});