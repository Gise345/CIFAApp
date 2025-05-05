// src/components/teams/TeamList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Team } from '../../types/team';
import { goToTeam } from '../../utils/router';

interface TeamListProps {
  teams: Team[];
  division?: string;
  limit?: number;
  onViewAll?: () => void;
}

const TeamList: React.FC<TeamListProps> = ({ 
  teams,
  division,
  limit = 5,
  onViewAll
}) => {
  // Filter teams by division if specified
  const filteredTeams = division 
    ? teams.filter(team => team.division === division)
    : teams;
    
  // Limit number of teams shown
  const limitedTeams = filteredTeams.slice(0, limit);
  
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
      
      {onViewAll && filteredTeams.length > limit && (
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