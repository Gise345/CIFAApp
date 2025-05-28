// app/admin/teams/index.tsx - Fixed with proper admin check
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
  where
} from 'firebase/firestore';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';
import { useTeams } from '../../../src/hooks/useTeams';

export default function AdminTeamsScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { teams, fetchTeams, loading: teamsLoading } = useTeams();
  const [refreshing, setRefreshing] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Only check auth after loading is complete
    if (!authLoading) {
      console.log('Admin Teams Screen - Auth Check:', {
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
        fetchTeams();
      }
    }
  }, [authLoading, user, isAdmin]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
    setRefreshing(false);
  };

  const handleCreateTeam = () => {
    router.push('/admin/teams/create' as any);
  };

  const handleEditTeam = (teamId: string) => {
    router.push(`/admin/teams/${teamId}` as any);
  };

  const handleDeleteTeam = (team: any) => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
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
              const teamDocRef = doc(firestore, 'teams', team.id);
              await deleteDoc(teamDocRef);
              
              // Refresh teams list
              await fetchTeams();
              Alert.alert('Success', 'Team deleted successfully');
            } catch (error) {
              console.error('Error deleting team:', error);
              Alert.alert('Error', 'Failed to delete team');
            }
          }
        }
      ]
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'club':
        return <Badge text="CLUB" variant="primary" />;
      case 'national':
        return <Badge text="NATIONAL" variant="danger" />;
      default:
        return <Badge text={type.toUpperCase()} variant="secondary" />;
    }
  };

  // Show loading while auth is being checked
  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Team Management" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>
              {authLoading ? 'Checking permissions...' : 'Loading teams...'}
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
        <Header title="Team Management" showBack={true} />
        
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
            <Text style={styles.titleText}>Teams ({teams.length})</Text>
            <Button 
              title="Add Team" 
              onPress={handleCreateTeam}
              style={styles.createButton}
            />
          </View>
          
          {/* Stats Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <Feather name="shield" size={20} color="#2563eb" />
              <Text style={styles.statValue}>
                {teams.filter(t => t.type === 'club').length}
              </Text>
              <Text style={styles.statLabel}>Clubs</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
              <Feather name="flag" size={20} color="#dc2626" />
              <Text style={styles.statValue}>
                {teams.filter(t => t.type === 'national').length}
              </Text>
              <Text style={styles.statLabel}>National</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
              <Feather name="users" size={20} color="#16a34a" />
              <Text style={styles.statValue}>{teams.length}</Text>
              <Text style={styles.statLabel}>Total Teams</Text>
            </Card>
          </ScrollView>
          
          {/* Teams List */}
          {teamsLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.centerText}>Loading teams...</Text>
            </View>
          ) : teams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="shield" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No teams found</Text>
              <Button 
                title="Add First Team" 
                onPress={handleCreateTeam}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            teams.map(team => (
              <Card key={team.id} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <View style={styles.teamLogoContainer}>
                    {team.logoUrl ? (
                      <View style={[styles.teamLogo, { backgroundColor: team.colorPrimary || '#e5e7eb' }]}>
                        <Text style={styles.logoText}>
                          {team.shortName?.substring(0, 3).toUpperCase() || team.name.substring(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.teamLogo, { backgroundColor: team.colorPrimary || '#e5e7eb' }]}>
                        <Text style={styles.logoText}>
                          {team.shortName?.substring(0, 3).toUpperCase() || team.name.substring(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamDivision}>{team.division || 'No division'}</Text>
                  </View>
                  
                  {getTypeBadge(team.type)}
                </View>
                
                {team.venue && (
                  <Text style={styles.teamVenue}>📍 {team.venue}</Text>
                )}
                
                <View style={styles.teamStats}>
                  <View style={styles.teamStat}>
                    <Text style={styles.teamStatLabel}>Founded</Text>
                    <Text style={styles.teamStatValue}>{team.foundedYear || 'N/A'}</Text>
                  </View>
                  <View style={styles.teamStat}>
                    <Text style={styles.teamStatLabel}>Players</Text>
                    <Text style={styles.teamStatValue}>0</Text>
                  </View>
                  <View style={styles.teamStat}>
                    <Text style={styles.teamStatLabel}>Matches</Text>
                    <Text style={styles.teamStatValue}>0</Text>
                  </View>
                </View>
                
                <View style={styles.teamActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditTeam(team.id)}
                  >
                    <Feather name="edit-2" size={16} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push(`/teams/${team.id}` as any)}
                  >
                    <Feather name="eye" size={16} color="#16a34a" />
                    <Text style={[styles.actionButtonText, { color: '#16a34a' }]}>View</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteTeam(team)}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  centerText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
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
  teamCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamLogoContainer: {
    marginRight: 12,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  teamDivision: {
    fontSize: 14,
    color: '#6b7280',
  },
  teamVenue: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  teamStats: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  teamStat: {
    flex: 1,
    alignItems: 'center',
  },
  teamStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  teamStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  teamActions: {
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