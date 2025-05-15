// app/stats/top-scorers.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import Header from '../../src/components/common/Header';
import { useStats } from '../../src/hooks/useStats';
import { useParams, getParam } from '../../src/utils/router';
import { TopScorer } from '../../src/services/firebase/stats';
import TeamLogo from '../../src/components/common/TeamLogo';
import { getLeagueById } from '../../src/services/firebase/leagues';
import { LEAGUE_CATEGORIES } from '../../src/constants/LeagueTypes';
import StatsScreenWrapper from '../../src/components/helpers/StatsScreenWrapper';

export default function TopScorersScreen() {
  // Get category ID from URL params
  const params = useParams();
  const categoryId = getParam(params, 'categoryId') || '';

  // State variables
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [leagueName, setLeagueName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the stats hook but don't destructure loading and error
  // since we're managing those states locally
  const { fetchTopScorers } = useStats();

  // Load data when component mounts or category changes
  useEffect(() => {
    loadData();
  }, [categoryId]);

  // Function to load scorers data
  const loadData = async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch league details
      const league = await getLeagueById(categoryId);
      if (league) {
        setLeagueName(league.name);
      } else {
        // If no league found, try to find in predefined categories
        const category = LEAGUE_CATEGORIES.find(cat => cat.id === categoryId);
        if (category) {
          setLeagueName(category.label);
        }
      }

      // Fetch top scorers
      const data = await fetchTopScorers(categoryId, 20); // Get top 20 scorers
      setScorers(data);
    } catch (err) {
      console.error('Error loading top scorers data:', err);
      setError('Failed to load top scorers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Navigate to player details
  const handlePlayerPress = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  // Render content based on loading/error state
  const renderContent = () => {
    // Show loading indicator
    if (loading && !refreshing && scorers.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading top scorers...</Text>
        </View>
      );
    }

    // Show error message
    if (error && !refreshing) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={32} color="white" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Show content
    return (
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      >
        <View style={styles.card}>
          {/* League Title */}
          {leagueName && (
            <View style={styles.leagueHeader}>
              <Text style={styles.leagueTitle}>{leagueName}</Text>
              <Text style={styles.leagueSubtitle}>Top Scorers</Text>
            </View>
          )}

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.rankColumn]}>#</Text>
            <Text style={[styles.headerText, styles.playerColumn]}>Player</Text>
            <Text style={[styles.headerText, styles.teamColumn]}>Team</Text>
            <Text style={[styles.headerText, styles.goalsColumn]}>Goals</Text>
            <Text style={[styles.headerText, styles.assistsColumn]}>Assists</Text>
          </View>

          {/* Players List */}
          {scorers.length > 0 ? (
            scorers.map((player, index) => (
              <TouchableOpacity 
                key={player.id || `player-${index}`}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.evenRow : null
                ]}
                onPress={() => handlePlayerPress(player.playerId)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cellText, styles.rankColumn, styles.rankText]}>
                  {player.position}
                </Text>
                <View style={[styles.playerColumn, styles.playerInfo]}>
                  <View style={styles.playerPhoto} />
                  <Text style={styles.playerName}>{player.playerName}</Text>
                </View>
                <View style={styles.teamColumn}>
                  <TeamLogo
                    teamId={player.teamId}
                    teamName={player.teamName}
                    size={24}
                    colorPrimary={player.teamColor}
                  />
                </View>
                <Text style={[styles.cellText, styles.goalsColumn, styles.goalsText]}>
                  {player.goals}
                </Text>
                <Text style={[styles.cellText, styles.assistsColumn]}>
                  {player.assists || 0}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="users" size={24} color="#9ca3af" />
              <Text style={styles.emptyText}>No scorers data available</Text>
            </View>
          )}
        </View>

        {/* Footer Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendText}>
            * Statistics updated after each matchday
          </Text>
        </View>
        
        {/* Back to stats button */}
        <TouchableOpacity 
          style={styles.backToStatsButton}
          onPress={() => router.push('/stats')}
        >
          <Feather name="arrow-left" size={16} color="white" />
          <Text style={styles.backToStatsText}>Back to Stats</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <StatsScreenWrapper>
      <Header title={leagueName || "Top Scorers"} showBack={true} />
      {renderContent()}
    </StatsScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leagueHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  leagueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  leagueSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#f9fafb',
  },
  rankColumn: {
    width: 30,
    textAlign: 'center',
  },
  playerColumn: {
    flex: 4,
  },
  teamColumn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsColumn: {
    flex: 1,
    textAlign: 'center',
  },
  assistsColumn: {
    flex: 1,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#111827',
  },
  rankText: {
    fontWeight: 'bold',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerPhoto: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d1d5db',
    marginRight: 8,
  },
  playerName: {
    fontSize: 14,
    color: '#111827',
  },
  goalsText: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  legend: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  backToStatsButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToStatsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});