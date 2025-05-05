// CIFAMobileApp/src/components/teams/TeamRoster.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useTeams } from '../../hooks/useTeams';
import { Player } from '../../types/team';

interface TeamRosterProps {
  teamId: string;
  compact?: boolean;  // For a more compact view if needed
}

// Group players by position
interface PlayersByPosition {
  Goalkeepers: Player[];
  Defenders: Player[];
  Midfielders: Player[];
  Forwards: Player[];
}

const TeamRoster: React.FC<TeamRosterProps> = ({ teamId, compact = false }) => {
  const router = useRouter();
  const { fetchTeamPlayers, loading, error } = useTeams();
  
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition>({
    Goalkeepers: [],
    Defenders: [],
    Midfielders: [],
    Forwards: []
  });
  
  // Load players on mount
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const players = await fetchTeamPlayers(teamId);
        
        // Group players by position
        const grouped: PlayersByPosition = {
          Goalkeepers: [],
          Defenders: [],
          Midfielders: [],
          Forwards: []
        };
        
        players.forEach(player => {
          if (player.position === 'Goalkeeper') {
            grouped.Goalkeepers.push(player);
          } else if (player.position === 'Defender') {
            grouped.Defenders.push(player);
          } else if (player.position === 'Midfielder') {
            grouped.Midfielders.push(player);
          } else if (player.position === 'Forward') {
            grouped.Forwards.push(player);
          }
        });
        
        setPlayersByPosition(grouped);
      } catch (error) {
        console.error('Error loading players:', error);
      }
    };
    
    loadPlayers();
  }, [teamId, fetchTeamPlayers]);
  
  // Navigate to player details
  const navigateToPlayer = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };
  
  // Render position section
  const renderPositionSection = (title: string, players: Player[]) => {
    if (players.length === 0) return null;
    
    return (
      <View style={styles.positionSection}>
        <View style={styles.positionHeader}>
          <Text style={styles.positionTitle}>{title}</Text>
          <Text style={styles.positionCount}>{players.length}</Text>
        </View>
        
        {players.map(player => (
          <TouchableOpacity
            key={player.id}
            style={styles.playerRow}
            onPress={() => navigateToPlayer(player.id)}
          >
            {/* Player Number */}
            <View style={styles.playerNumberContainer}>
              <Text style={styles.playerNumber}>{player.number}</Text>
            </View>
            
            {/* Player Photo */}
            <View style={styles.playerPhotoContainer}>
              {player.photoUrl ? (
                <Image 
                  source={{ uri: player.photoUrl }} 
                  style={styles.playerPhoto} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.playerPhotoPlaceholder}>
                  <Text style={styles.playerInitials}>
                    {getPlayerInitials(player.name)}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Player Info */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerDetails}>
                {player.nationality || 'Unknown'} • {player.age ? `${player.age} yrs` : ''}
              </Text>
            </View>
            
            {/* Arrow Icon */}
            <Feather 
              name="chevron-right" 
              size={18} 
              color="#9ca3af" 
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Handle loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Loading squad...</Text>
      </View>
    );
  }
  
  // Handle error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={24} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load players</Text>
      </View>
    );
  }
  
  // Handle empty state
  const totalPlayers = Object.values(playersByPosition).reduce(
    (total, players) => total + players.length, 
    0
  );
  
  if (totalPlayers === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={24} color="#9ca3af" />
        <Text style={styles.emptyText}>No player information available</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {renderPositionSection('Goalkeepers', playersByPosition.Goalkeepers)}
      {renderPositionSection('Defenders', playersByPosition.Defenders)}
      {renderPositionSection('Midfielders', playersByPosition.Midfielders)}
      {renderPositionSection('Forwards', playersByPosition.Forwards)}
    </View>
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
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  compactContainer: {
    paddingBottom: 0,
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
  },
  positionSection: {
    marginBottom: 16,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
  },
  positionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  positionCount: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  playerNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  playerInfo: {
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
  arrowIcon: {
    marginLeft: 8,
  },
});

export default TeamRoster;