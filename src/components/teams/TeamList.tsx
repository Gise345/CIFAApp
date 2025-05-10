// src/components/teams/TeamList.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Team } from '../../types/team';
import { goToTeam } from '../../utils/router';
import { getTeams } from '../../services/firebase/teams';

interface TeamListProps {
  teams?: Team[];
  division?: string;
  type?: string;
  limit?: number;
  onViewAll?: () => void;
  showLoading?: boolean;
}

const TeamList: React.FC<TeamListProps> = ({ 
  teams: propTeams,
  division,
  type = 'club',
  limit = 5,
  onViewAll,
  showLoading = true
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>(propTeams || []);
  
  // If teams are not provided as props, fetch them based on type and division
  useEffect(() => {
    if (!propTeams && division) {
      const fetchTeams = async () => {
        try {
          setLoading(true);
          const teamsData = await getTeams(type, division);
          setTeams(teamsData);
          setLoading(false);
        } catch (err) {
          console.error(`Error fetching ${division} teams:`, err);
          setError(`Failed to load teams. Please try again.`);
          setLoading(false);
        }
      };
      
      fetchTeams();
    }
  }, [division, type, propTeams]);
    
  // Limit number of teams shown
  const limitedTeams = teams.slice(0, limit);
  
  const handleTeamPress = (teamId: string) => {
    // Navigate to team detail page
    goToTeam(teamId);
  };

  // Get team initials for placeholder logo
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

  // Generate a consistent color based on team name
  const getTeamColor = (teamName: string): string => {
    const colors = [
      '#2563eb', // Blue
      '#16a34a', // Green
      '#7e22ce', // Purple
      '#ca8a04', // Yellow/gold
      '#ef4444', // Red
      '#0891b2', // Cyan
      '#9333ea', // Indigo
      '#f97316', // Orange
      '#14b8a6', // Teal
      '#84cc16', // Lime
    ];
    
    // Simple hash function to get consistent index
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Render loading state
  if (loading && showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={24} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render empty state
  if (teams.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={24} color="#9ca3af" />
        <Text style={styles.emptyText}>No teams found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {limitedTeams.map((team) => (
        <TouchableOpacity 
          key={team.id}
          style={styles.teamCard}
          onPress={() => handleTeamPress(team.id)}
        >
          <View 
            style={[
              styles.teamLogo, 
              { backgroundColor: team.colorPrimary || getTeamColor(team.name) }
            ]}
          >
            {team.logo ? (
              <Image source={{ uri: team.logo }} style={styles.logoImage} />
            ) : (
              <Text style={styles.teamInitials}>
                {getTeamInitials(team.name)}
              </Text>
            )}
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
          <Text style={styles.teamDivision} numberOfLines={1}>{team.division}</Text>
        </TouchableOpacity>
      ))}
      
      {onViewAll && teams.length > limit && (
        <TouchableOpacity 
          style={styles.viewAllCard}
          onPress={onViewAll}
        >
          <View style={styles.viewAllCircle}>
            <Text style={styles.viewAllPlus}>+</Text>
          </View>
          <Text style={styles.viewAllText}>View All Teams</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  teamCard: {
    width: 100,
    marginRight: 16,
    alignItems: 'center',
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teamInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  teamDivision: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  viewAllCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllPlus: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  viewAllText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default TeamList;