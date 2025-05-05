// CIFAMobileApp/app/teams/[id]/roster.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useParams, getParam } from '../../../src/utils/router';
import { useTeams } from '../../../src/hooks/useTeams';
import TeamRoster from '../../../src/components/teams/TeamRoster';

export default function TeamRosterScreen() {
  // Use the new params approach for SDK 53
  const params = useParams();
  const teamId = getParam(params, 'id') || '';
  
  const { loading, error, fetchTeamPlayers, teamPlayers } = useTeams();
  const [refreshing, setRefreshing] = useState(false);

  // Load players on mount
  useEffect(() => {
    if (teamId) {
      fetchTeamPlayers(teamId);
    }
  }, [teamId]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!teamId) return;
    
    setRefreshing(true);
    await fetchTeamPlayers(teamId);
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading squad...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={32} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh} 
          colors={['#2563eb']}
        />
      }
    >
      <TeamRoster teamId={teamId} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
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
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});