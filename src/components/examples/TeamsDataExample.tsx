// CIFAMobileApp/src/components/examples/TeamsDataExample.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useTeams } from '../../hooks/useTeams';
import { Team } from '../../types/team';
import Card from '../common/Card';

const TeamsDataExample: React.FC = () => {
  const { fetchTeams, teams, loading, error } = useTeams();
  const [refreshing, setRefreshing] = useState(false);

  // Load teams on component mount
  useEffect(() => {
    loadTeams();
  }, []);

  // Function to load teams data
  const loadTeams = async () => {
    try {
      setRefreshing(true);
      await fetchTeams();
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teams Data Example</Text>
      <Text style={styles.subtitle}>
        This example shows real data fetched from Firestore using the useTeams hook.
      </Text>
      
      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      )}
      
      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTeams}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={loadTeams}
        disabled={loading}
      >
        <Text style={styles.refreshButtonText}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Text>
      </TouchableOpacity>
      
      {/* Teams List */}
      <ScrollView style={styles.teamsList}>
        {teams.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No teams found. Try seeding some data from the Firebase Test screen.
            </Text>
          </View>
        ) : (
          teams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

// Team Card Component
interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  return (
    <Card style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View 
          style={[
            styles.teamLogo, 
            { backgroundColor: team.colorPrimary || '#2563eb' }
          ]}
        >
          <Text style={styles.teamLogoText}>
            {getTeamInitials(team.name)}
          </Text>
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamDivision}>{team.division}</Text>
        </View>
      </View>
      
      {team.description && (
        <Text style={styles.teamDescription}>
          {team.description.length > 150 
            ? `${team.description.substring(0, 150)}...` 
            : team.description}
        </Text>
      )}
      
      {/* Team Details */}
      <View style={styles.teamDetails}>
        {team.venue && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Venue:</Text>
            <Text style={styles.detailValue}>{team.venue}</Text>
          </View>
        )}
        
        {team.foundedYear && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Founded:</Text>
            <Text style={styles.detailValue}>{team.foundedYear}</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

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
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  teamsList: {
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  teamCard: {
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamLogoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamInfo: {
    flex: 1,
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
  teamDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  teamDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    marginRight: 16,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});

export default TeamsDataExample;