// CIFAMobileApp/app/players/[id].tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import Section from '../../src/components/common/Section';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const playerId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock player data - would come from Firebase in production
  const playerData = {
    id: playerId,
    name: 'Mark Ebanks',
    number: 9,
    position: 'Forward',
    dateOfBirth: '1996-05-15',
    age: 29,
    height: 183, // cm
    weight: 75, // kg
    nationality: 'Cayman Islands',
    team: {
      id: 'team1',
      name: 'Elite SC',
      color: '#16a34a',
    },
    bio: 'Mark Ebanks is a talented forward known for his pace and finishing ability. He has been a consistent top scorer in the Cayman Islands Premier League and represents the national team in international competitions.',
    stats: {
      appearances: 45,
      goals: 32,
      assists: 14,
      yellowCards: 5,
      redCards: 1,
    },
    photoUrl: null,
  };

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [playerId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Player Details" showBack={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading player details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Player Details" showBack={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                {playerData.photoUrl ? (
                  <Image
                    source={{ uri: playerData.photoUrl }}
                    style={styles.playerImage}
                  />
                ) : (
                  <View style={[styles.playerImagePlaceholder, { backgroundColor: playerData.team.color }]}>
                    <Text style={styles.playerInitials}>
                      {playerData.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                )}
                <View style={styles.playerNumberBadge}>
                  <Text style={styles.playerNumberText}>{playerData.number}</Text>
                </View>
              </View>
              
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{playerData.name}</Text>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{playerData.position}</Text>
                </View>
                <Text style={styles.teamName}>{playerData.team.name}</Text>
              </View>
            </View>
          </View>

          <Section title="PLAYER INFO" style={styles.section}>
            <Card>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nationality:</Text>
                <Text style={styles.infoValue}>{playerData.nationality}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{playerData.age} years</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Height:</Text>
                <Text style={styles.infoValue}>{playerData.height} cm</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{playerData.weight} kg</Text>
              </View>
            </Card>
          </Section>
          
          <Section title="BIOGRAPHY" style={styles.section}>
            <Card>
              <Text style={styles.bioText}>{playerData.bio}</Text>
            </Card>
          </Section>
          
          <Section title="STATISTICS" style={styles.section}>
            <Card>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{playerData.stats.appearances}</Text>
                  <Text style={styles.statLabel}>Appearances</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{playerData.stats.goals}</Text>
                  <Text style={styles.statLabel}>Goals</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{playerData.stats.assists}</Text>
                  <Text style={styles.statLabel}>Assists</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{playerData.stats.yellowCards}</Text>
                  <Text style={styles.statLabel}>Yellow Cards</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{playerData.stats.redCards}</Text>
                  <Text style={styles.statLabel}>Red Cards</Text>
                </View>
              </View>
            </Card>
          </Section>
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
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
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