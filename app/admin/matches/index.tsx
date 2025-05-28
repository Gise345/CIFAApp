// app/admin/matches/index.tsx - Admin Matches Management
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
  orderBy, 
  getDocs,
  doc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { format } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

interface Match {
  id: string;
  leagueId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: Timestamp | any;
  time: string;
  venue: string;
  competition: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  featured?: boolean;
}

export default function AdminMatchesScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);


  useEffect(() => {
  // Only check auth after loading is complete
  if (!authLoading) {
    console.log('Admin Matches Screen - Auth Check:', {
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
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    if (isAdmin === true) {
      setHasCheckedAuth(true);
      fetchMatches();
    }
  }
}, [authLoading, user, isAdmin]);

  const fetchMatches = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      const matchesQuery = query(
        collection(firestore, 'matches'),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(matchesQuery);
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Match));
      
      setMatches(matchesData);
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const handleCreateMatch = () => {
    router.push('/admin/matches/create');
  };

  const handleEditMatch = (matchId: string) => {
    router.push(`/admin/matches/edit/${matchId}`);
  };

  const handleDeleteMatch = (match: Match) => {
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete the match "${match.homeTeamName} vs ${match.awayTeamName}"? This action cannot be undone.`,
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
              const matchDocRef = doc(firestore, 'matches', match.id);
              await deleteDoc(matchDocRef);
              setMatches(prev => prev.filter(m => m.id !== match.id));
              Alert.alert('Success', 'Match deleted successfully');
            } catch (error) {
              console.error('Error deleting match:', error);
              Alert.alert('Error', 'Failed to delete match');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'Unknown';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge text="LIVE" variant="danger" />;
      case 'completed':
        return <Badge text="Completed" variant="success" />;
      case 'scheduled':
        return <Badge text="Scheduled" variant="info" />;
      case 'postponed':
        return <Badge text="Postponed" variant="warning" />;
      case 'cancelled':
        return <Badge text="Cancelled" variant="secondary" />;
      default:
        return <Badge text={status} variant="secondary" />;
    }
  };

  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Match Management" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>
            {authLoading ? 'Checking permissions...' : 'Loading matches...'}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Don't render if not admin
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
        <Header title="Match Management" showBack={true} />
        
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
          {/* Header with Create Button */}
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Matches ({matches.length})</Text>
            <Button 
              title="Add Match" 
              onPress={handleCreateMatch}
              style={styles.createButton}
            />
          </View>
          
          {/* Stats Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <Card style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
              <Feather name="play" size={20} color="#dc2626" />
              <Text style={styles.statValue}>
                {matches.filter(m => m.status === 'live').length}
              </Text>
              <Text style={styles.statLabel}>Live</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <Feather name="clock" size={20} color="#2563eb" />
              <Text style={styles.statValue}>
                {matches.filter(m => m.status === 'scheduled').length}
              </Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
              <Feather name="check-circle" size={20} color="#16a34a" />
              <Text style={styles.statValue}>
                {matches.filter(m => m.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
          </ScrollView>
          
          {/* Matches List */}
          {matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No matches found</Text>
              <Button 
                title="Add First Match" 
                onPress={handleCreateMatch}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            matches.map(match => (
              <Card key={match.id} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchInfo}>
                    <Text style={styles.competition}>{match.competition}</Text>
                    <Text style={styles.matchDate}>
                      {formatDate(match.date)} • {match.time}
                    </Text>
                  </View>
                  <View style={styles.badgeContainer}>
                    {getStatusBadge(match.status)}
                    {match.featured && (
                      <Badge text="FEATURED" variant="warning" style={styles.featuredBadge} />
                    )}
                  </View>
                </View>
                
                <View style={styles.teamsContainer}>
                  <View style={styles.team}>
                    <Text style={styles.teamName}>{match.homeTeamName}</Text>
                    {match.status === 'completed' && (
                      <Text style={styles.score}>{match.homeScore || 0}</Text>
                    )}
                  </View>
                  
                  <View style={styles.vs}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>
                  
                  <View style={styles.team}>
                    <Text style={styles.teamName}>{match.awayTeamName}</Text>
                    {match.status === 'completed' && (
                      <Text style={styles.score}>{match.awayScore || 0}</Text>
                    )}
                  </View>
                </View>
                
                <Text style={styles.venue}>📍 {match.venue}</Text>
                
                <View style={styles.matchActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditMatch(match.id)}
                  >
                    <Feather name="edit-2" size={16} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteMatch(match)}
                  >
                    <Feather name="trash-2" size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
          
          {/* Footer spacing */}
          <View style={styles.footer} />
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    minWidth: 100,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statCard: {
    padding: 16,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 140,
  },
  matchCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  competition: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 2,
  },
  matchDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredBadge: {
    marginLeft: 6,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 4,
  },
  vs: {
    marginHorizontal: 16,
  },
  vsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  venue: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  matchActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteText: {
    color: '#ef4444',
  },
  footer: {
    height: 40,
  },
});