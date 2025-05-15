// app/(tabs)/stats.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import TeamStats from '../../src/components/stats/TeamStats';
import TopScorersCard from '../../src/components/stats/TopScorersCard';
import LeagueSelector from '../../src/components/stats/LeagueSelector';
import LeagueStandings from '../../src/components/leagues/LeagueStandings';
import { StatsProvider, useStatsContext } from '../../src/contexts/StatsContext';

// Main component wrapped with provider
export default function StatsScreen() {
  return (
    <StatsProvider>
      <StatsContent />
    </StatsProvider>
  );
}

// Inner component that uses the stats context
function StatsContent() {
  const { 
    selectedLeagueId, 
    setSelectedLeagueId, 
    leagueName, 
    loading, 
    error, 
    refreshStats 
  } = useStatsContext();
  const [refreshing, setRefreshing] = useState(false);

  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
  };

  const handleViewAllStats = () => {
    router.push(`/stats/team-stats?categoryId=${selectedLeagueId}`);
  };

  const handleViewTopScorers = () => {
    router.push(`/stats/top-scorers?categoryId=${selectedLeagueId}`);
  };

  const handleViewFullTable = () => {
    router.push(`/leagues/${selectedLeagueId}/standings`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    setRefreshing(false);
  };

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header 
          title={leagueName || "Statistics"} 
          showBack={false}
        />
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={32} color="white" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor="#2563eb"
              />
            }
          >
            {/* League Selector */}
            <LeagueSelector
              selectedId={selectedLeagueId}
              onSelectLeague={handleLeagueChange}
            />
            
            <View style={styles.divider} />
            
            {/* League Table */}
            <LeagueStandings
              leagueId={selectedLeagueId}
              showTeamLogos={true}
              maxRows={6}
              onViewFullTable={handleViewFullTable}
            />
            
            {/* Team Stats */}
            <TeamStats
              categoryId={selectedLeagueId}
              onViewAll={handleViewAllStats}
            />
            
            {/* Top Scorers */}
            <TopScorersCard
              categoryId={selectedLeagueId}
              limit={5}
              onViewAll={handleViewTopScorers}
            />
            
            {/* Footer padding */}
            <View style={styles.footer} />
          </ScrollView>
        )}
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
  divider: {
    height: 8,
    backgroundColor: '#f3f4f6',
  },
  footer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});