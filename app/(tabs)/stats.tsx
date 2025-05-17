// app/(tabs)/stats.tsx
import React, { useState, useEffect } from 'react';
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
import LeagueFixturesResults from '../../src/components/stats/LeagueFixturesResults';
import { StatsProvider, useStatsContext } from '../../src/contexts/StatsContext';
import { TeamStatsRowSkeleton, TopScorersSkeleton } from '../../src/components/common/SkeletonLoader';
import ErrorBoundary from '../../src/components/common/ErrorBoundary';

// Main component wrapped with provider
export default function StatsScreen() {
  return (
    <ErrorBoundary>
      <StatsProvider>
        <StatsContent />
      </StatsProvider>
    </ErrorBoundary>
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
  
  // Log the selected league ID for debugging
  useEffect(() => {
    console.log("Selected League ID:", selectedLeagueId);
  }, [selectedLeagueId]);

  const handleLeagueChange = (leagueId: string) => {
    console.log("League selected:", leagueId);
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

  const handleViewFixturesResults = () => {
    router.push(`/leagues/${selectedLeagueId}/fixtures`);
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
          <ScrollView style={styles.content}>
            {/* League Selector - Always show this even during loading */}
            <LeagueSelector
              selectedId={selectedLeagueId}
              onSelectLeague={handleLeagueChange}
            />
            
            <View style={styles.divider} />
            
            {/* Skeleton Loaders */}
            <View style={styles.skeletonContainer}>
              {/* League Table Skeleton */}
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonHeader}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonSubtitle} />
                </View>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={styles.tableRowSkeleton}>
                    <View style={styles.positionSkeleton} />
                    <View style={styles.teamSkeleton}>
                      <View style={styles.logoSkeleton} />
                      <View style={styles.teamNameSkeleton} />
                    </View>
                    <View style={styles.statsSkeleton} />
                  </View>
                ))}
              </View>
              
              {/* Team Stats Skeleton */}
              <TeamStatsRowSkeleton count={3} />
              
              {/* Top Scorers Skeleton */}
              <TopScorersSkeleton />
            </View>
          </ScrollView>
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

             {/* Fixtures & Results Section - New from pasted code */}
             {selectedLeagueId && (
              <LeagueFixturesResults
                leagueId={selectedLeagueId}
                onViewAll={handleViewFixturesResults}
              />
            )}
            
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
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  skeletonHeader: {
    marginBottom: 16,
  },
  skeletonTitle: {
    height: 20,
    width: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 14,
    width: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  tableRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  positionSkeleton: {
    width: 20,
    height: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginRight: 12,
  },
  teamSkeleton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSkeleton: {
    width: 24,
    height: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginRight: 8,
  },
  teamNameSkeleton: {
    width: 120,
    height: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  statsSkeleton: {
    width: 60,
    height: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginLeft: 12,
  },
});