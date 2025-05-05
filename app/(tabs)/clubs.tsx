// CIFAMobileApp/app/(tabs)/clubs.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import TeamList from '../../src/components/teams/TeamList';
import { getTeams } from '../../src/services/firebase/teams';
import { Team } from '../../src/types/team';
import { router } from '../../src/utils/router';

export default function ClubsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensTeams, setMensTeams] = useState<Team[]>([]);
  const [womensTeams, setWomensTeams] = useState<Team[]>([]);
  const [youthTeams, setYouthTeams] = useState<Team[]>([]);

  // Fetch teams from Firestore on component mount
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching men\'s teams...');
        // Fetch Men's Premier League teams
        const mensData = await getTeams('club', "Men's Premier League");
        console.log(`Found ${mensData.length} men's teams`);
        setMensTeams(mensData);
        
        console.log('Fetching women\'s teams...');
        // Fetch Women's Premier League teams
        const womensData = await getTeams('club', "Women's Premier League");
        console.log(`Found ${womensData.length} women's teams`);
        setWomensTeams(womensData);
        
        console.log('Fetching youth teams...');
        // Fetch Youth teams (can be filtered further if needed)
        const youthData = await getTeams('club', "Youth League");
        console.log(`Found ${youthData.length} youth teams`);
        setYouthTeams(youthData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams. Please try again later.');
        setLoading(false);
      }
    };

    fetchTeamsData();
  }, []);

  // Navigate to all men's teams
  const handleViewAllMensTeams = () => {
    // Use string path for navigation instead of object
    router.push('/teams?type=club&division=Men\'s Premier League');
  };
  
  // Navigate to all women's teams
  const handleViewAllWomensTeams = () => {
    // Use string path for navigation instead of object
    router.push('/teams?type=club&division=Women\'s Premier League');
  };
  
  // Navigate to all youth teams
  const handleViewAllYouthTeams = () => {
    // Use string path for navigation instead of object
    router.push('/teams?type=club&division=Youth League');
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
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading teams...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setError(null);
                  setLoading(true);
                  // Retry fetching teams
                  getTeams('club', "Men's Premier League")
                    .then(data => {
                      setMensTeams(data);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error('Error retrying team fetch:', err);
                      setError('Failed to load teams. Please try again later.');
                      setLoading(false);
                    });
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Men's Premier League Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Men's Premier League</Text>
                {mensTeams.length > 0 ? (
                  <TeamList 
                    teams={mensTeams} 
                    onViewAll={handleViewAllMensTeams} 
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No men's teams available</Text>
                  </View>
                )}
              </View>
              
              {/* Women's Premier League Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Women's Premier League</Text>
                {womensTeams.length > 0 ? (
                  <TeamList 
                    teams={womensTeams} 
                    onViewAll={handleViewAllWomensTeams} 
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No women's teams available</Text>
                  </View>
                )}
              </View>
              
              {/* Youth Teams Section */}
              {youthTeams.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Youth Teams</Text>
                  <TeamList 
                    teams={youthTeams} 
                    onViewAll={handleViewAllYouthTeams} 
                  />
                </View>
              )}
            </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
  emptyContainer: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});