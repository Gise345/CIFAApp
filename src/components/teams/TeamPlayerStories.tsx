// CIFAMobileApp/src/components/teams/TeamPlayerStories.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Modal 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Player } from '../../types/team';

interface TeamPlayerStoriesProps {
  teamId: string;
  players: Player[];
}

const TeamPlayerStories: React.FC<TeamPlayerStoriesProps> = ({ teamId, players }) => {
  const router = useRouter();
  const [activeStory, setActiveStory] = useState<Player | null>(null);
  const [storyVisible, setStoryVisible] = useState(false);
  
  // Sort players by position order: goalkeepers, defenders, midfielders, forwards
  const sortedPlayers = [...players].sort((a, b) => {
    const positionOrder: Record<string, number> = {
      'Goalkeeper': 1,
      'Defender': 2,
      'Midfielder': 3,
      'Forward': 4
    };
    
    return (positionOrder[a.position] || 5) - (positionOrder[b.position] || 5);
  });
  
  // Handle player story press - show modal with player info
  const handleStoryPress = (player: Player) => {
    setActiveStory(player);
    setStoryVisible(true);
  };
  
  // Navigate to player profile
  const navigateToPlayer = (playerId: string) => {
    setStoryVisible(false);
    setTimeout(() => {
      router.push(`/players/${playerId}`);
    }, 300);
  };
  
  // Navigate to team squad
  const navigateToSquad = () => {
    router.push(`/teams/${teamId}/roster`);
  };
  
  // Render player story modal
  const renderStoryModal = () => {
    if (!activeStory) return null;
    
    return (
      <Modal
        visible={storyVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStoryVisible(false)}
      >
        <LinearGradient
          colors={['rgba(30, 64, 175, 0.98)', 'rgba(4, 30, 66, 0.98)']}
          style={styles.modalContainer}
        >
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setStoryVisible(false)}
          >
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Player info */}
          <View style={styles.storyContent}>
            <View style={styles.playerImageLarge}>
              {activeStory.photoUrl ? (
                <Image 
                  source={{ uri: activeStory.photoUrl }} 
                  style={styles.playerPhoto} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.playerPhotoPlaceholder}>
                  <Text style={styles.playerInitialsLarge}>
                    {getPlayerInitials(activeStory.name)}
                  </Text>
                </View>
              )}
              <View style={styles.jerseyNumber}>
                <Text style={styles.jerseyNumberText}>{activeStory.number}</Text>
              </View>
            </View>
            
            <Text style={styles.playerNameLarge}>{activeStory.name}</Text>
            <Text style={styles.playerPosition}>{activeStory.position}</Text>
            
            <View style={styles.playerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeStory.age || '-'}</Text>
                <Text style={styles.statLabel}>Age</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.floor(Math.random() * 50) + 1}</Text>
                <Text style={styles.statLabel}>Appearances</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {activeStory.position === 'Forward' || activeStory.position === 'Midfielder' 
                    ? Math.floor(Math.random() * 20)
                    : activeStory.position === 'Defender'
                      ? Math.floor(Math.random() * 5)
                      : '0'
                  }
                </Text>
                <Text style={styles.statLabel}>Goals</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewProfileButton}
              onPress={() => navigateToPlayer(activeStory.id)}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* View All Players */}
        <TouchableOpacity 
          style={styles.viewAllContainer}
          onPress={navigateToSquad}
        >
          <View style={styles.viewAllCircle}>
            <Feather name="users" size={24} color="#6b7280" />
          </View>
          <Text style={styles.storyName}>View All</Text>
        </TouchableOpacity>
        
        {/* Player Stories */}
        {sortedPlayers.map(player => (
          <TouchableOpacity
            key={player.id}
            style={styles.storyContainer}
            onPress={() => handleStoryPress(player)}
          >
            <LinearGradient
              colors={getPositionColors(player.position) as [string, string]}
              style={styles.storyRing}
            >
              <View style={styles.storyImageContainer}>
                {player.photoUrl ? (
                  <Image 
                    source={{ uri: player.photoUrl }} 
                    style={styles.storyImage} 
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
            </LinearGradient>
            <Text style={styles.storyName} numberOfLines={1}>
              {getLastName(player.name)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {renderStoryModal()}
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

// Helper function to get last name
const getLastName = (name: string): string => {
  if (!name) return '';
  
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0];
  }
  
  return words[words.length - 1];
};

// Helper function to get position colors for stories
const getPositionColors = (position: string): [string, string] => {
  switch (position) {
    case 'Goalkeeper':
      return ['#10b981', '#059669']; // Green
    case 'Defender':
      return ['#3b82f6', '#2563eb']; // Blue
    case 'Midfielder':
      return ['#8b5cf6', '#7c3aed']; // Purple
    case 'Forward':
      return ['#ef4444', '#dc2626']; // Red
    default:
      return ['#6b7280', '#4b5563']; // Gray
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 70,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storyImage: {
    width: 60,
    height: 60,
  },
  playerPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  playerInitialsLarge: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  storyName: {
    fontSize: 12,
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },
  viewAllContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 70,
  },
  viewAllCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  storyContent: {
    alignItems: 'center',
    width: '100%',
  },
  playerImageLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  playerPhoto: {
    width: '100%',
    height: '100%',
  },
  jerseyNumber: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  jerseyNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewProfileButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewProfileText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
});

export default TeamPlayerStories;