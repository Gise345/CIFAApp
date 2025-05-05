// CIFAMobileApp/app/admin/teams/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../../src/hooks/useAuth';
import { useTeams } from '../../../src/hooks/useTeams';
import { Team } from '../../../src/types/team';
import { deleteTeam } from '../../../src/services/firebase/teams';
import Header from '../../../src/components/common/Header';
import Button from '../../../src/components/common/Button';
import TeamLogo from '../../../src/components/common/TeamLogo';

export default function AdminTeamsScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { teams, loading, error, fetchTeams } = useTeams();
  
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is authorized
  useEffect(() => {
    if (user === null) {
      // Not logged in, redirect to login
      router.replace('/login');
    } else if (isAdmin === false) {
      // Logged in but not admin
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.back();
    }
  }, [user, isAdmin, router]);

  // Load teams on mount
  useEffect(() => {
    if (isAdmin) {
      loadTeams();
    }
  }, [isAdmin]);

  const loadTeams = async () => {
    try {
      await fetchTeams();
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeams();
    setRefreshing(false);
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  // Delete team
  const handleDeleteTeam = (team: Team) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${team.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await deleteTeam(team.id);
              
              // Refresh the list
              await loadTeams();
              setActionLoading(false);
            } catch (err) {
              console.error('Error deleting team:', err);
              setActionLoading(false);
              Alert.alert('Error', 'Failed to delete team.');
            }
          }
        }
      ]
    );
  };

  // Edit team
  const handleEditTeam = (teamId: string) => {
    router.push(`/admin/teams/edit/${teamId}`);
  };

  // View team details
  const handleViewTeam = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  // Handle creation of new team
  const handleCreateTeam = () => {
    router.push('/admin/teams/create');
  };

  // Render each team in the list
  const renderTeam = ({ item }: { item: Team }) => (
    <View style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <TeamLogo 
            teamId={item.id}
            teamName={item.name}
            teamCode={getTeamInitials(item.name)}
            size="small"
            colorPrimary={item.colorPrimary}
          />
          <View style={styles.teamTextInfo}>
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamDivision}>{item.division}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewTeam(item.id)}
        >
          <Feather name="eye" size={16} color="#2563eb" />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditTeam(item.id)}
        >
          <Feather name="edit-2" size={16} color="#047857" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTeam(item)}
          disabled={actionLoading}
        >
          <Feather name="trash-2" size={16} color="#dc2626" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading state
  if (loading && !refreshing && teams.length === 0) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Manage Teams" showBack={true} />
          <View style={styles.content}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading teams...</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Render screen
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Manage Teams" showBack={true} />
        <View style={styles.content}>
          {actionLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
          
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Teams</Text>
            <Button 
              title="Create New" 
              onPress={handleCreateTeam}
              style={styles.createButton}
            />
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={40} color="#ef4444" />
              <Text style={styles.errorText}>Failed to load teams</Text>
              <Button 
                title="Retry" 
                onPress={loadTeams}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <FlatList
              data={teams}
              renderItem={renderTeam}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Feather name="users" size={40} color="#6b7280" />
                  <Text style={styles.emptyText}>No teams found</Text>
                  <Button 
                    title="Create First Team" 
                    onPress={handleCreateTeam}
                    style={styles.emptyButton}
                  />
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Helper function to get team initials
const getTeamInitials = (teamName: string): string => {
  if (!teamName) return '';
  
  const words = teamName.split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }
  
  // Return first letter of each word (up to 3)
  return words
    .slice(0, 3)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

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
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 180,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamTextInfo: {
    marginLeft: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  teamDivision: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  viewButton: {
    backgroundColor: '#eff6ff',
  },
  viewButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#ecfdf5',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
});