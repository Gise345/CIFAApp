// app/leagues/[id]/results.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useParams, getParam } from '../../../src/utils/router';
import { useLeagues } from '../../../src/hooks/useLeagues';
import Header from '../../../src/components/common/Header';
import LeagueFixtures from '../../../src/components/leagues/LeagueFixtures';

export default function LeagueResultsScreen() {
  const params = useParams();
  const leagueId = getParam(params, 'id') || '';
  
  const router = useRouter();
  const { 
    fetchLeagueById, 
    selectedLeague, 
    loading, 
    error,
    resetErrors
  } = useLeagues();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Load league data
  useEffect(() => {
    const loadLeagueData = async () => {
      try {
        setIsLoading(true);
        resetErrors();
        
        if (leagueId) {
          await fetchLeagueById(leagueId);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading league:', err);
        setIsLoading(false);
      }
    };
    
    loadLeagueData();
  }, [leagueId]);
  
  // Navigate to league page with different tab
  const navigateToFixtures = () => {
    router.push(`/leagues/${leagueId}/fixtures`);
  };
  
  const navigateToStandings = () => {
    router.push(`/leagues/${leagueId}/standings`);
  };
  
  // Loading state
  if (isLoading || loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Results" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading results...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
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
        <Header title="Results" showBack={true} />
        
        <ScrollView style={styles.content}>
          {/* League Name */}
          <View style={styles.leagueHeaderContainer}>
            <Text style={styles.leagueName}>
              {selectedLeague?.name || 'League Results'}
            </Text>
            <Text style={styles.leagueSeason}>
              {selectedLeague?.season || '2024-2025'}
            </Text>
          </View>
          
          {/* Navigation Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tab}
              onPress={navigateToFixtures}
            >
              <Text style={styles.tabText}>FIXTURES</Text>
            </TouchableOpacity>
            <View style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>RESULTS</Text>
            </View>
            <TouchableOpacity 
              style={styles.tab}
              onPress={navigateToStandings}
            >
              <Text style={styles.tabText}>TABLE</Text>
            </TouchableOpacity>
          </View>
          
          {/* League Results Component */}
          <View style={styles.resultsContainer}>
            <LeagueFixtures 
              leagueId={leagueId} 
              status="completed"
              showVenue={true}
            />
          </View>
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
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
  },
  leagueHeaderContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  leagueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  leagueSeason: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});