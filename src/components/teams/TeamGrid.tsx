// src/components/teams/TeamGrid.tsx - Updated
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Team } from '../../types/team';
import TeamLogo from '../common/TeamLogo';

interface TeamGridProps {
  teams: Team[];
  loading?: boolean;
  error?: string | null;
  onViewAll?: () => void;
  emptyMessage?: string;
  title?: string;
}

const TeamGrid: React.FC<TeamGridProps> = ({
  teams,
  loading = false,
  error = null,
  onViewAll,
  emptyMessage = 'No teams found',
  title,
}) => {
  // Navigate to team detail screen
  const navigateToTeam = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  // Render a single team item
  const renderTeamItem = ({ item }: { item: Team }) => {
    const teamColor = item.colorPrimary || '#2563eb';
    
    return (
      <TouchableOpacity 
        style={styles.teamItem}
        onPress={() => navigateToTeam(item.id)}
      >
        <View style={styles.logoContainer}>
          <TeamLogo 
            teamId={item.id}
            teamName={item.name}
            size={60}
            colorPrimary={teamColor}
          />
        </View>
        <Text style={styles.teamName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.teamDivision} numberOfLines={1}>{item.division}</Text>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.messageContainer}>
        <Feather name="alert-circle" size={24} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Empty state
  if (teams.length === 0) {
    return (
      <View style={styles.messageContainer}>
        <Feather name="users" size={24} color="#9ca3af" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Optional Title Header */}
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {onViewAll && (
            <TouchableOpacity onPress={onViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Teams Grid */}
      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
  },
  gridContainer: {
    padding: 8,
  },
  teamItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    maxWidth: '33%',
  },
  logoContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
    color: '#111827',
  },
  teamDivision: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default TeamGrid;