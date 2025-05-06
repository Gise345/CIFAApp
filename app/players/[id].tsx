// CIFAMobileApp/app/players/[id].tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../src/services/firebase/config';
import { useParams, getParam } from '../../src/utils/router';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import Section from '../../src/components/common/Section';

// Define the Player interface to match Firestore structure
interface PlayerTeam {
  id: string;
  name: string;
  color?: string;
  colorPrimary?: string;
}

interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  [key: string]: number; // Allow for other stats
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  dateOfBirth?: string;
  age?: number;
  height?: number;
  weight?: number;
  nationality?: string;
  teamId: string;
  team?: PlayerTeam;
  bio?: string;
  stats?: PlayerStats;
  photoUrl?: string;
}

export default function PlayerDetailScreen() {
  // Use the SDK 53 compatible router utilities
  const params = useParams();
  const playerId = getParam(params, 'id') || '';
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load player data from Firestore
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) {
        setError('Player ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if Firestore is initialized
        if (!firestore) {
          setError('Database connection not available');
          setLoading(false);
          return;
        }

        // Fetch player document from Firestore
        const playerDoc = await getDoc(doc(firestore, 'players', playerId));
        
        if (!playerDoc.exists()) {
          setError('Player not found');
          setLoading(false);
          return;
        }
        
        const playerData = playerDoc.data();
        
        // Create player object with data from Firestore
        const player: Player = {
          id: playerDoc.id,
          name: playerData.name || '',
          number: playerData.number || 0,
          position: playerData.position || '',
          dateOfBirth: playerData.dateOfBirth,
          age: playerData.age,
          height: playerData.height,
          weight: playerData.weight,
          nationality: playerData.nationality,
          teamId: playerData.teamId || '',
          bio: playerData.bio,
          stats: playerData.stats,
          photoUrl: playerData.photoUrl
        };
        
        // Fetch team data if available
        if (player.teamId) {
          try {
            const teamDoc = await getDoc(doc(firestore, 'teams', player.teamId));
            
            if (teamDoc.exists()) {
              const teamData = teamDoc.data();
              player.team = {
                id: teamDoc.id,
                name: teamData.name || '',
                color: teamData.colorPrimary || '#2563eb'
              };
            }
          } catch (teamError) {
            console.error('Error fetching team data:', teamError);
            // Continue with player data even if team data fails
          }
        }
        
        setPlayer(player);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError('Failed to load player details');
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Player Details" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading player details...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Player Details" showBack={true} />
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={32} color="white" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // No player data
  if (!player) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Player Details" showBack={true} />
          <View style={styles.errorContainer}>
            <Feather name="user-x" size={32} color="white" />
            <Text style={styles.errorText}>Player information not available</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Get player initials for placeholder
  const getPlayerInitials = (name: string): string => {
    if (!name) return '';
    
    return name.split(' ').map(n => n[0]).join('');
  };

  // Main content with player data
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Player Details" showBack={true} />
        <ScrollView style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.playerHeader}>
              <View style={styles.playerImageContainer}>
                {player.photoUrl ? (
                  <Image
                    source={{ uri: player.photoUrl }}
                    style={styles.playerImage}
                  />
                ) : (
                  <View style={[
                    styles.playerImagePlaceholder, 
                    { backgroundColor: player.team?.color || '#2563eb' }
                  ]}>
                    <Text style={styles.playerInitials}>
                      {getPlayerInitials(player.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.playerNumberBadge}>
                  <Text style={styles.playerNumberText}>{player.number}</Text>
                </View>
              </View>
              
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{player.position}</Text>
                </View>
                <Text style={styles.teamName}>{player.team?.name || 'Unknown Team'}</Text>
              </View>
            </View>
          </View>

          <Section title="PLAYER INFO" style={styles.section}>
            <Card>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nationality:</Text>
                <Text style={styles.infoValue}>{player.nationality || 'Unknown'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{player.age ? `${player.age} years` : 'Unknown'}</Text>
              </View>
              {player.height && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height:</Text>
                  <Text style={styles.infoValue}>{player.height} cm</Text>
                </View>
              )}
              {player.weight && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight:</Text>
                  <Text style={styles.infoValue}>{player.weight} kg</Text>
                </View>
              )}
              {player.dateOfBirth && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date of Birth:</Text>
                  <Text style={styles.infoValue}>{player.dateOfBirth}</Text>
                </View>
              )}
            </Card>
          </Section>
          
          {player.bio && (
            <Section title="BIOGRAPHY" style={styles.section}>
              <Card>
                <Text style={styles.bioText}>{player.bio}</Text>
              </Card>
            </Section>
          )}
          
          {player.stats && (
            <Section title="STATISTICS" style={styles.section}>
              <Card>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{player.stats.appearances || 0}</Text>
                    <Text style={styles.statLabel}>Appearances</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{player.stats.goals || 0}</Text>
                    <Text style={styles.statLabel}>Goals</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{player.stats.assists || 0}</Text>
                    <Text style={styles.statLabel}>Assists</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{player.stats.yellowCards || 0}</Text>
                    <Text style={styles.statLabel}>Yellow Cards</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{player.stats.redCards || 0}</Text>
                    <Text style={styles.statLabel}>Red Cards</Text>
                  </View>
                </View>
              </Card>
            </Section>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 12,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  playerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  playerImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  playerNumberBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  playerNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  positionBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  positionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  teamName: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});