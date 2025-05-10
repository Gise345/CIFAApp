// app/teams/[id]/stats.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { useTeams } from '../../../src/hooks/useTeams';
import { useStats } from '../../../src/hooks/useStats';
import { useParams, getParam } from '../../../src/utils/router';
import Card from '../../../src/components/common/Card';
import TeamComparison from '../../../src/components/teams/TeamComparison';

export default function TeamStatsScreen() {
  // Use the new params approach for SDK 53
  const params = useParams();
  const teamId = getParam(params, 'id') || '';
  
  const { selectedTeam, teamFixtures, loading: teamsLoading, error: teamsError, loadTeamData } = useTeams();
  const { fetchTeamStats, loading: statsLoading, error: statsError } = useStats();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [calculatedStats, setCalculatedStats] = useState<any>(null);
  
  // Load team data and stats on mount
  useEffect(() => {
    const loadData = async () => {
      if (!teamId) return;
      
      try {
        // First, load the team data to get team details
        await loadTeamData(teamId);
        
        // Then, fetch the team stats from Firestore
        const teamStats = await fetchTeamStats(teamId);
        if (teamStats) {
          setStats(teamStats);
        } else {
          // If no stats found in Firestore, calculate them from fixtures
          calculateStatsFromFixtures();
        }
      } catch (err) {
        console.error('Error loading team stats:', err);
      }
    };
    
    loadData();
  }, [teamId]);
  
  // Calculate stats from fixtures if Firestore data is not available
  const calculateStatsFromFixtures = () => {
    if (!teamFixtures || teamFixtures.length === 0) {
      setCalculatedStats({
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        winPercentage: 0,
        form: [] as string[]
      });
      return;
    }
    
    let matches = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let cleanSheets = 0;
    const form: string[] = [];
    
    // Only process completed fixtures
    const completedFixtures = teamFixtures.filter(fixture => 
      fixture.status === 'completed'
    );
    
    completedFixtures.forEach(fixture => {
      matches++;
      
      // Check if team is home or away
      const isHome = fixture.homeTeamId === teamId;
      const teamScore = isHome ? fixture.homeScore || 0 : fixture.awayScore || 0;
      const opponentScore = isHome ? fixture.awayScore || 0 : fixture.homeScore || 0;
      
      // Update goals
      goalsFor += teamScore;
      goalsAgainst += opponentScore;
      
      // Update results
      if (teamScore > opponentScore) {
        wins++;
        form.unshift('W');
      } else if (teamScore === opponentScore) {
        draws++;
        form.unshift('D');
      } else {
        losses++;
        form.unshift('L');
      }
      
      // Update clean sheets
      if (opponentScore === 0) {
        cleanSheets++;
      }
    });
    
    // Calculate win percentage
    const winPercentage = matches > 0 ? (wins / matches) * 100 : 0;
    
    // Limit form to last 5 matches
    const recentForm = form.slice(0, 5);
    
    const calculatedStats = {
      matches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      cleanSheets,
      winPercentage: Math.round(winPercentage),
      form: recentForm
    };
    
    setCalculatedStats(calculatedStats);
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (teamId) {
      await loadTeamData(teamId, true); // Force refresh team data
      const teamStats = await fetchTeamStats(teamId, true); // Force refresh stats
      if (teamStats) {
        setStats(teamStats);
      } else {
        calculateStatsFromFixtures();
      }
    }
    setRefreshing(false);
  };
  
  // Get the stats to display (either from Firestore or calculated)
  const displayStats = stats || calculatedStats;
  
  // Loading state
  const isLoading = (teamsLoading || statsLoading) && !refreshing;
  
  // Error handling
  const error = teamsError || statsError;
  
  if (isLoading && !selectedTeam && !displayStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading team statistics...</Text>
      </View>
    );
  }
  
  return (
    <LinearGradient
      colors={[selectedTeam?.colorPrimary || '#2563eb', '#191970', '#041E42']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* Stats Title */}
        <View style={styles.headerSection}>
          <Text style={styles.teamName}>{selectedTeam?.name || 'Team'}</Text>
          <Text style={styles.statsTitle}>Statistics</Text>
        </View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {error ? (
            <Card style={styles.errorCard}>
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={32} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </Card>
          ) : (
            <>
              {/* Season Statistics */}
              <Card style={styles.statsCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>SEASON STATISTICS</Text>
                </View>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.matches || 0}</Text>
                    <Text style={styles.statLabel}>Matches</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.wins || 0}</Text>
                    <Text style={styles.statLabel}>Wins</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.draws || 0}</Text>
                    <Text style={styles.statLabel}>Draws</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.losses || 0}</Text>
                    <Text style={styles.statLabel}>Losses</Text>
                  </View>
                </View>
                
                {/* Win Percentage */}
                <View style={styles.percentageContainer}>
                  <View style={styles.percentageHeader}>
                    <Text style={styles.percentageLabel}>Win Percentage</Text>
                    <Text style={styles.percentageValue}>{displayStats?.winPercentage || 0}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${displayStats?.winPercentage || 0}%`,
                          backgroundColor: selectedTeam?.colorPrimary || '#2563eb'
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                {/* Form */}
                <View style={styles.formContainer}>
                  <Text style={styles.formLabel}>Recent Form</Text>
                  <View style={styles.formBadges}>
                    {(displayStats?.form?.length || 0) > 0 ? (
                      displayStats.form.map((result: string, index: number) => (
                        <View 
                          key={index} 
                          style={[
                            styles.formBadge,
                            result === 'W' && styles.winBadge,
                            result === 'D' && styles.drawBadge,
                            result === 'L' && styles.lossBadge
                          ]}
                        >
                          <Text style={styles.formBadgeText}>{result}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noFormText}>No recent matches</Text>
                    )}
                  </View>
                </View>
              </Card>
              
              {/* Scoring Statistics */}
              <Card style={styles.statsCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>GOALS</Text>
                </View>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.goalsFor || 0}</Text>
                    <Text style={styles.statLabel}>Scored</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.goalsAgainst || 0}</Text>
                    <Text style={styles.statLabel}>Conceded</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.goalDifference || 0}</Text>
                    <Text style={styles.statLabel}>Difference</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayStats?.cleanSheets || 0}</Text>
                    <Text style={styles.statLabel}>Clean Sheets</Text>
                  </View>
                </View>
                
                {/* Goals Per Match */}
                <View style={styles.averageContainer}>
                  <View style={styles.averageItem}>
                    <View style={styles.averageHeader}>
                      <Text style={styles.averageLabel}>Goals Scored Per Match</Text>
                      <Text style={styles.averageValue}>
                        {displayStats?.matches > 0 
                          ? (displayStats.goalsFor / displayStats.matches).toFixed(1) 
                          : '0.0'}
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { 
                            width: `${Math.min(((displayStats?.goalsFor || 0) / Math.max(displayStats?.matches || 1, 1)) * 20, 100)}%`,
                            backgroundColor: '#059669'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.averageItem}>
                    <View style={styles.averageHeader}>
                      <Text style={styles.averageLabel}>Goals Conceded Per Match</Text>
                      <Text style={styles.averageValue}>
                        {displayStats?.matches > 0 
                          ? (displayStats.goalsAgainst / displayStats.matches).toFixed(1) 
                          : '0.0'}
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { 
                            width: `${Math.min(((displayStats?.goalsAgainst || 0) / Math.max(displayStats?.matches || 1, 1)) * 20, 100)}%`,
                            backgroundColor: '#ef4444'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </Card>
              
              {/* Team Comparison */}
              <TeamComparison teamAId={teamId} />
            </>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  headerSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  teamName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  statItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  percentageContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  percentageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentageLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  percentageValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  formContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  formLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  formBadges: {
    flexDirection: 'row',
  },
  formBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  winBadge: {
    backgroundColor: '#059669',
  },
  drawBadge: {
    backgroundColor: '#9ca3af',
  },
  lossBadge: {
    backgroundColor: '#ef4444',
  },
  formBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noFormText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  averageContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  averageItem: {
    marginBottom: 12,
  },
  averageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  averageLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  averageValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});