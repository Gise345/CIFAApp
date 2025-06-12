// app/admin/leagues/index.tsx - Admin Leagues Management
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
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
  doc,
  deleteDoc
} from 'firebase/firestore';
import { firestore } from '../../../src/services/firebase/config';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import { useAuth } from '../../../src/hooks/useAuth';

interface League {
  id: string;
  name: string;
  shortName: string;
  division: string;
  season: string;
  status: 'active' | 'inactive' | 'upcoming' | 'completed';
  teams: number;
  matches: number;
  startDate?: any;
  endDate?: any;
  description?: string;
  logo?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function AdminLeaguesScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // EXACT SAME AUTH PATTERN as working admin components
  useEffect(() => {
    if (!authLoading) {
      console.log('Admin Leagues - Auth Check:', {
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
        Alert.alert('Access Denied', 'You must be an admin to access league management');
        router.back();
        return;
      }
      
      if (isAdmin === true) {
        setHasCheckedAuth(true);
        fetchLeagues();
      }
    }
  }, [authLoading, user, isAdmin]);

  const fetchLeagues = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      const leaguesQuery = query(
        collection(firestore, 'leagues'),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(leaguesQuery);
      const leaguesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as League[];
      
      setLeagues(leaguesData);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      Alert.alert('Error', 'Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeagues();
    setRefreshing(false);
  };

  const handleCreateLeague = () => {
    Alert.alert('Coming Soon', 'League creation functionality will be implemented soon.');
  };

  const handleEditLeague = (leagueId: string) => {
    Alert.alert('Coming Soon', 'League editing functionality will be implemented soon.');
  };

  const handleDeleteLeague = (league: League) => {
    Alert.alert(
      'Delete League',
      `Are you sure you want to delete "${league.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!firestore) {
              Alert.alert('Error', 'Database connection lost');
              return;
            }
            
            try {
              const leagueDocRef = doc(firestore, 'leagues', league.id);
              await deleteDoc(leagueDocRef);
              setLeagues(prev => prev.filter(l => l.id !== league.id));
              Alert.alert('Success', 'League deleted successfully');
            } catch (error) {
              console.error('Error deleting league:', error);
              Alert.alert('Error', 'Failed to delete league');
            }
          }
        }
      ]
    );
  };

  const getStatusBadge = (status?: string | null) => {
    const safeStatus = status || 'unknown';
    
    switch (safeStatus.toLowerCase()) {
      case 'active':
        return <Badge text="ACTIVE" variant="success" />;
      case 'inactive':
        return <Badge text="INACTIVE" variant="secondary" />;
      case 'upcoming':
        return <Badge text="UPCOMING" variant="info" />;
      case 'completed':
        return <Badge text="COMPLETED" variant="danger" />;
      default:
        return <Badge text={safeStatus.toUpperCase()} variant="secondary" />;
    }
  };

  // EXACT SAME LOADING PATTERN as working components
  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="League Management" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading leagues...</Text>
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
        <Header title="League Management" showBack={true} />
        
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
            <Text style={styles.titleText}>Leagues ({leagues.length})</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateLeague}
            >
              <Feather name="plus" size={16} color="white" />
              <Text style={styles.createButtonText}>Create League</Text>
            </TouchableOpacity>
          </View>
          
          {/* Leagues List */}
          {leagues.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Feather name="award" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No leagues found</Text>
                <Text style={styles.emptySubtext}>
                  Create your first league to get started with organizing competitions
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={handleCreateLeague}
                >
                  <Text style={styles.emptyButtonText}>Create First League</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            leagues.map(league => (
              <Card key={league.id} style={styles.leagueCard}>
                <View style={styles.leagueHeader}>
                  <View style={styles.leagueInfo}>
                    <Text style={styles.leagueName}>{league.name}</Text>
                    <Text style={styles.leagueMeta}>
                      {league.division} • Season {league.season}
                    </Text>
                    <View style={styles.badgeContainer}>
                      {getStatusBadge(league.status)}
                    </View>
                  </View>
                  {league.logo && (
                    <View style={styles.logoContainer}>
                      <Text style={styles.logoText}>🏆</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.leagueDescription} numberOfLines={2}>
                  {league.description || 'No description available'}
                </Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{league.teams || 0}</Text>
                    <Text style={styles.statLabel}>Teams</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{league.matches || 0}</Text>
                    <Text style={styles.statLabel}>Matches</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{league.season}</Text>
                    <Text style={styles.statLabel}>Season</Text>
                  </View>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditLeague(league.id)}
                  >
                    <Feather name="edit-2" size={16} color="#2563eb" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteLeague(league)}
                  >
                    <Feather name="trash-2" size={16} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
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
  createButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 130,
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
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
  leagueCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  leagueHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  leagueMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  logoText: {
    fontSize: 24,
  },
  leagueDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  editButtonText: {
    color: '#2563eb',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#ef4444',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});