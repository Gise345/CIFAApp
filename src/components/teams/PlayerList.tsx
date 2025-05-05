// CIFAMobileApp/src/components/teams/PlayerList.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Card from '../common/Card';
import Section from '../common/Section';
import { useTeams } from '../../../src/hooks/useTeams';
import { Player } from '../../types/team'; 

interface PlayerListProps {
  teamId: string;
  limit?: number;
  showViewAll?: boolean;
  showPositionGroups?: boolean;
}

// Group players by position
interface PlayersByPosition {
  Goalkeepers: Player[];
  Defenders: Player[];
  Midfielders: Player[];
  Forwards: Player[];
}

const PlayerList: React.FC<PlayerListProps> = ({ 
  teamId, 
  limit, 
  showViewAll = true,
  showPositionGroups = true
}) => {
  const router = useRouter();
  const { fetchTeamPlayers: getTeamPlayers, loading, error } = useTeams();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition>({
    Goalkeepers: [],
    Defenders: [],
    Midfielders: [],
    Forwards: []
  });
  
  // Load players data
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const playersData = await getTeamPlayers(teamId);
        setPlayers(playersData);
        
        // Group players by position
        const grouped: PlayersByPosition = {
          Goalkeepers: [],
          Defenders: [],
          Midfielders: [],
          Forwards: []
        };
        
        playersData.forEach(player => {
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
      } catch (err) {
        console.error('Error loading players:', err);
      }
    };
    
    if (teamId) {
      loadPlayers();
    }
  }, [teamId]);

  // Apply limit if provided
  const displayedPlayers = limit ? players.slice(0, limit) : players;

  // Handle player press - navigate to player details
  const handlePlayerPress = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };
  
  // Handle view all press - navigate to team roster
  const handleViewAllPress = () => {
    router.push(`/teams/${teamId}/roster`);
  };

  // Render player item
  const renderPlayerItem = (player: Player) => (
    <TouchableOpacity
      key={player.id}
      style={styles.playerRow}
      onPress={() => handlePlayerPress(player.id)}
    >
      <View style={styles.playerNumberContainer}>
        <Text style={styles.playerNumber}>{player.number}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerNationality}>{player.nationality}</Text>
      </View>
      <Text style={styles.playerAge}>{player.age} yrs</Text>
    </TouchableOpacity>
  );

  // Render players by position
  const renderPositionSection = (positionTitle: string, positionPlayers: Player[]) => {
    if (positionPlayers.length === 0) return null;
    
    return (
      <View style={styles.positionSection}>
        <Text style={styles.positionTitle}>{positionTitle}</Text>
        {positionPlayers.map(player => renderPlayerItem(player))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={24} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load players</Text>
      </View>
    );
  }

  if (players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={24} color="#9ca3af" />
        <Text style={styles.emptyText}>No players found</Text>
      </View>
    );
  }

  return (
    <Section 
      title="SQUAD" 
      viewAllText="View All Players"
      onViewAll={showViewAll ? handleViewAllPress : undefined}
      style={styles.section}
    >
      <Card>
        {showPositionGroups ? (
          <>
            {renderPositionSection('Goalkeepers', playersByPosition.Goalkeepers)}
            {renderPositionSection('Defenders', playersByPosition.Defenders)}
            {renderPositionSection('Midfielders', playersByPosition.Midfielders)}
            {renderPositionSection('Forwards', playersByPosition.Forwards)}
          </>
        ) : (
          displayedPlayers.map(player => renderPlayerItem(player))
        )}
      </Card>
    </Section>
  );
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
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  playerNationality: {
    fontSize: 12,
    color: '#6b7280',
  },
  playerAge: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default PlayerList;