// src/components/teams/TeamCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Team } from '../../types/team';
import { goToTeam } from '../../utils/router';

interface TeamCardProps {
  team: Team;
  style?: any;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, style }) => {
  const handlePress = () => {
    goToTeam(team.id);
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

  // Get second color for gradient based on primary color
  const getSecondaryColor = (primaryColor: string): string => {
    // If we have a team-defined secondary color, use it
    if (team.colorSecondary) {
      return team.colorSecondary;
    }
    
    // Otherwise, darken the primary color
    // Convert hex to RGB
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);
    
    // Darken by multiplying by 0.7
    const darkenedR = Math.floor(r * 0.7);
    const darkenedG = Math.floor(g * 0.7);
    const darkenedB = Math.floor(b * 0.7);
    
    // Convert back to hex
    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[
          team.colorPrimary || '#2563eb', 
          getSecondaryColor(team.colorPrimary || '#2563eb')
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.teamInfo}>
          <View style={styles.logoContainer}>
            {team.logoUrl ? (
              <Image source={{ uri: team.logoUrl }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>{getTeamInitials(team.name)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.teamName} numberOfLines={1}>
              {team.name}
            </Text>
            <Text style={styles.division} numberOfLines={1}>
              {team.division}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          <Feather name="chevron-right" size={20} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  textContainer: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  division: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TeamCard;