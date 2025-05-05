// CIFAMobileApp/app/(tabs)/clubs.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import TeamList from '../../src/components/teams/TeamList';

// Basic Team type definition
interface Team {
  id: string;
  name: string;
  shortName: string;
  division: string;
  colorPrimary: string;
  logo?: string;
}

export default function ClubsScreen() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);

  // Mock data for teams - in production, this would come from your API or Firebase
  useEffect(() => {
    // Simulate loading from API
    setTimeout(() => {
      const mockTeams: Team[] = [
        {
          id: 'team1',
          name: 'Elite Sports Club',
          shortName: 'Elite SC',
          division: "Men's Premier League",
          colorPrimary: '#16a34a', // Green
        },
        {
          id: 'team2',
          name: 'Scholars International',
          shortName: 'Scholars',
          division: "Men's Premier League",
          colorPrimary: '#1e40af', // Blue
        },
        {
          id: 'team3',
          name: 'Bodden Town FC',
          shortName: 'Bodden Town',
          division: "Men's Premier League",
          colorPrimary: '#7e22ce', // Purple
        },
        {
          id: 'team4',
          name: 'Future SC',
          shortName: 'Future',
          division: "Men's Premier League",
          colorPrimary: '#ca8a04', // Yellow
        },
        {
          id: 'team5',
          name: 'Roma United',
          shortName: 'Roma',
          division: "Men's Premier League",
          colorPrimary: '#be123c', // Red
        },
      ];
      
      setTeams(mockTeams);
      setLoading(false);
    }, 1000);
  }, []);

  // View all teams
  const handleViewAllTeams = () => {
    // Navigate to all teams view
    console.log('View all teams');
  };
  
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Football Clubs" />
        
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading teams...</Text>
            </View>
          ) : (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Premier League</Text>
                <TeamList onViewAll={handleViewAllTeams} />
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Women's League</Text>
                <TeamList onViewAll={handleViewAllTeams} />
              </View>
            </View>
          )}
        </View>
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
});