// CIFAMobileApp/src/components/teams/EnhancedPlayerList.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useTeams } from '../../hooks/useTeams';
import { Player } from '../../types/team';
import Card from '../common/Card';
import Section from '../common/Section';

interface EnhancedPlayerListProps {
  teamId: string;
  limit?: number;
  showViewAll?: boolean;
}

const EnhancedPlayerList: React.FC<EnhancedPlayerListProps> = ({ 
  teamId, 
  limit, 
  showViewAll = true 
}) => {
  const router = useRouter();
  const { teamPlayers, loading, error, fetchTeamPlayers } = useTeams();
  
  // Load players on mount if not already loaded
  useEffect(() => {
    if (teamId && (!teamPlayers || teamPlayers.length === 0)) {
      fetchTeamPlayers(teamId);
    }
  }, [teamId]);
  
  // Group players by position
  const getPositionGroups = () => {
    if (!teamPlayers || teamPlayers.length === 0) return {};
    
    const groups: { [key: string]: Player[] } = {
      'Goalkeeper': [],
      'Defender': [],
      'Midfielder': [],
      'Forward': []
    };
    
    teamPlayers.forEach(player => {
      const position = player.position || 'Other';
      if (!groups[position]) {
        groups[position] = [];
      }
      groups[position].push(player);
    });
    
    // Apply limit if provided
    if (limit) {
      let count = 0;
      const limitedGroups: { [key: string]: Player[] } = {};
      
      for (const position in groups) {
        limitedGroups[position] = [];
        for (const player of groups[position]) {
          if (count >= limit) break;
          limitedGroups[position].push(player);
          count++;
        }
        if (count >= limit) break;
      }
      
      return limitedGroups;
    }
    
    return groups;
  };
  
  const positionGroups = getPositionGroups();
  
  const handlePlayerPress = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };
  
  const handleViewAllPress = () => {
    router.push(`/teams/${teamId}/roster`);
  };

  return (
    <Section 
      title="SQUAD" 
      viewAllText="View Full Squad"
      onViewAll={showViewAll ? handleViewAllPress : undefined}
      style={styles.section}
    >
      <Card>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading squad...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : teamPlayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={24} color="#9ca3af" />
            <Text style={styles.emptyText}>No player information available</Text>
          </View>
        ) : (
          <View style={styles.playerListContainer}>
            {Object.entries(positionGroups).map(([position, players]) => 
              players.length > 0 && (
                <View key={position} style={styles.positionSection}>
                  <Text style={styles.positionTitle}>{position}s</Text>
                  {players.map(player => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.playerRow}
                      onPress={() => handlePlayerPress(player.id)}
                    >
                      <View style={styles.playerNumberContainer}>
                        <Text style={styles.playerNumber}>{player.number}</Text>
                      </View>
                      <View style={styles.playerInfoContainer}>
                        <View style={styles.playerPhotoContainer}>
                          {player.photoUrl ? (
                            <Image 
                              source={{ uri: player.photoUrl }} 
                              style={styles.playerPhoto} 
                            />
                          ) : (
                            <View style={styles.playerPhotoPlaceholder}>
                              <Text style={styles.playerInitials}>
                                {getPlayerInitials(player.name)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.playerTextContainer}>
                          <Text style={styles.playerName}>{player.name}</Text>
                          <Text style={styles.playerDetails}>
                            {player.nationality || 'Unknown'} • {player.position}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )
            )}
          </View>
        )}
      </Card>
    </Section>
  );
};

// Helper function to get player initials
const getPlayerInitials = (name: string): string => {
  if (!name) return '';
  
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Return first letter of first and last name
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
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
  playerListContainer: {
    padding: 16,
  },
  positionSection: {
    marginBottom: 16,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  playerNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerPhotoContainer: {
    marginRight: 12,
  },
  playerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  playerTextContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  playerDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default EnhancedPlayerList;