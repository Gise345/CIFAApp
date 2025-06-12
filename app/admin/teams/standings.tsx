// app/admin/teams/standings.tsx - New Team Standings Management Page
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
import Button from '../../../src/components/common/Button';
import { useAuth } from '../../../src/hooks/useAuth';

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
  form: string[]; // Last 5 results: 'W', 'D', 'L'
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

  // Check admin permission
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access team standings');
      router.back();
      return;
    }
  }, [isAdmin, authLoading]);

  // Fetch team standings
  const fetchStandings = async () => {
    if (!isAdmin || !firestore) return;
    
    try {
      console.log('Fetching team standings for season:', selectedSeason);
      
      let standingsQuery;
      if (selectedLeague === 'all') {
        standingsQuery = query(
          collection(firestore, 'standings'),
          where('season', '==', selectedSeason),
          orderBy('points', 'desc'),
          orderBy('goalDifference', 'desc')
        );
      } else {
        standingsQuery = query(
          collection(firestore, 'standings'),
          where('season', '==', selectedSeason),
          where('leagueId', '==', selectedLeague),
          orderBy('points', 'desc'),
          orderBy('goalDifference', 'desc')
        );
      }
      
      const snapshot = await getDocs(standingsQuery);
      const standingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamStanding[];
      
      console.log('Fetched team standings:', standingsData.length);
      setStandings(standingsData);
    } catch (error) {
      console.error('Error fetching team standings:', error);
      Alert.alert('Error', 'Failed to load team standings');
    }
  };

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchStandings().finally(() => setLoading(false));
    }
  }, [isAdmin, authLoading, selectedSeason, selectedLeague]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStandings();
    setRefreshing(false);
  };

  const handleUpdateStanding = async (teamId: string, updates: Partial<TeamStanding>) => {
    if (!firestore) return;
    
    try {
      const standingRef = doc(firestore, 'standings', teamId);
      await updateDoc(standingRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      Alert.alert('Success', 'Team standing updated successfully');
      await fetchStandings();
    } catch (error) {
      console.error('Error updating team standing:', error);
      Alert.alert('Error', 'Failed to update team standing');
    }
  };

  const handleAddResult = (team: TeamStanding) => {
    Alert.alert(
      'Add Match Result',
      `Add a new match result for ${team.teamName}`,
      [
        {
          text: 'Win',
          onPress: () => {
            const updatedTeam = {
              ...team,
              played: team.played + 1,
              won: team.won + 1,
              points: team.points + 3,
              form: [...team.form.slice(-4), 'W']
            };
            handleUpdateStanding(team.id, updatedTeam);
          }
        },
        {
          text: 'Draw',
          onPress: () => {
            const updatedTeam = {
              ...team,
              played: team.played + 1,
              drawn: team.drawn + 1,
              points: team.points + 1,
              form: [...team.form.slice(-4), 'D']
            };
            handleUpdateStanding(team.id, updatedTeam);
          }
        },
        {
          text: 'Loss',
          onPress: () => {
            const updatedTeam = {
              ...team,
              played: team.played + 1,
              lost: team.lost + 1,
              form: [...team.form.slice(-4), 'L']
            };
            handleUpdateStanding(team.id, updatedTeam);
          }
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

  const filteredStandings = standings.filter(team =>
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.leagueName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (authLoading || (loading && isAdmin)) {
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

  if (!isAdmin) {
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
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>League Standings</Text>
            <Text style={styles.subtitleText}>Season {selectedSeason}</Text>
          </View>
          <View style={styles.updateButtonContainer}>
            <TouchableOpacity 
              style={styles.updateButtonIcon} 
              onPress={() => Alert.alert('Coming Soon', 'Bulk update functionality will be implemented soon.')}
            >
              <Feather name="refresh-cw" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search and Filters */}
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
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
        </ScrollView>

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
        <FlatList
          data={filteredStandings}
          renderItem={renderStandingItem}
          keyExtractor={(item) => item.id}
          style={styles.standingsList}
          contentContainerStyle={styles.standingsListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Feather name="award" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No standings found</Text>
                <Text style={styles.emptySubtext}>
                  No team standings available for the selected criteria
                </Text>
              </View>
            </Card>
          }
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitleText: {
    fontSize: 14,
    color: '#93c5fd',
    marginTop: 4,
  },
  updateButtonContainer: {
    marginLeft: 16,
  },
  updateButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeFilterButton: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  filterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#2563eb',
  },
  tableHeader: {
    marginHorizontal: 16,
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
  standingsList: {
    flex: 1,
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
    marginTop: 40,
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