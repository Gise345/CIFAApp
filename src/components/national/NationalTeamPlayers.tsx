// src/components/national/NationalTeamPlayers.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { NationalTeamPlayer } from '../../types/nationalTeam';
import Feather from '@expo/vector-icons/Feather';import { useRouter } from 'expo-router';

interface NationalTeamPlayersProps {
  players: NationalTeamPlayer[];
  loading: boolean;
  error: string | null;
  teamPrimaryColor: string;
}

const NationalTeamPlayers: React.FC<NationalTeamPlayersProps> = ({
  players,
  loading,
  error,
  teamPrimaryColor
}) => {
  const router = useRouter();
  const [activePosition, setActivePosition] = useState<string | null>(null);
  
  // Group players by position
  const positionGroups: Record<string, NationalTeamPlayer[]> = players.reduce((groups, player) => {
    const position = player.position;
    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(player);
    return groups;
  }, {} as Record<string, NationalTeamPlayer[]>);
  
  // Get unique positions for filter tabs
  const positions = Object.keys(positionGroups);
  
  // Filter players by selected position
  const filteredPlayers = activePosition 
    ? positionGroups[activePosition] || []
    : players;
  
  // Navigate to player details
  const handlePlayerPress = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={teamPrimaryColor} />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-triangle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>No player information available</Text>
      </View>
    );
  }

  const renderPlayer = ({ item }: { item: NationalTeamPlayer }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => handlePlayerPress(item.id)}
    >
      <View style={styles.playerImageContainer}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.playerImage} />
        ) : (
          <View style={[styles.playerImagePlaceholder, { backgroundColor: teamPrimaryColor }]}>
            <Text style={styles.playerInitials}>
              {getPlayerInitials(item.name)}
            </Text>
          </View>
        )}
        <View style={[styles.jerseyNumber, { backgroundColor: teamPrimaryColor }]}>
          <Text style={styles.jerseyNumberText}>{item.jerseyNumber}</Text>
        </View>
        {item.isCaptain && (
          <View style={styles.captainBadge}>
            <Text style={styles.captainText}>C</Text>
          </View>
        )}
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
        
        <View style={styles.playerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.caps}</Text>
            <Text style={styles.statLabel}>Caps</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.goals}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Position Filter */}
      {positions.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              activePosition === null && [styles.activeTab, { borderColor: teamPrimaryColor }]
            ]}
            onPress={() => setActivePosition(null)}
          >
            <Text 
              style={[
                styles.filterTabText,
                activePosition === null && [styles.activeTabText, { color: teamPrimaryColor }]
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {positions.map(position => (
            <TouchableOpacity
              key={position}
              style={[
                styles.filterTab,
                activePosition === position && [styles.activeTab, { borderColor: teamPrimaryColor }]
              ]}
              onPress={() => setActivePosition(position)}
            >
              <Text 
                style={[
                  styles.filterTabText,
                  activePosition === position && [styles.activeTabText, { color: teamPrimaryColor }]
                ]}
              >
                {position}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {/* Players List */}
      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.playersGrid}
      />
    </View>
  );
};

// Helper function to get player initials
const getPlayerInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
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
    marginTop: 10,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    backgroundColor: 'white',
  },
  activeTab: {
    borderWidth: 2,
    backgroundColor: '#f8fafc',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTabText: {
    fontWeight: '600',
  },
  playersGrid: {
    padding: 8,
  },
  playerCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  playerImageContainer: {
    height: 160,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  playerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playerImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  jerseyNumber: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jerseyNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  captainBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captainText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  playerInfo: {
    padding: 12,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
});

export default NationalTeamPlayers;