// app/leagues/[id]/standings.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSegments, router } from 'expo-router';

import Header from '../../../src/components/common/Header';
import { LeagueStanding } from '../../../src/services/firebase/leagues';
import { useLeagues } from '../../../src/hooks/useLeagues';
import { useParams, getParam } from '../../../src/utils/router';
import TeamLogo from '../../../src/components/common/TeamLogo';
import StatsScreenWrapper from '../../../src/components/helpers/StatsScreenWrapper';
import { LEAGUE_CATEGORIES } from '../../../src/constants/LeagueTypes';

export default function LeagueStandingsScreen() {
  const segments = useSegments();
  const params = useParams();
  const leagueId = getParam(params, 'id') || '';
  
  const { 
    fetchLeagueById, 
    fetchLeagueStandings, 
    standings, 
    selectedLeague, 
    loading, 
    error 
  } = useLeagues();
  
  const [refreshing, setRefreshing] = useState(false);
  const [leagueName, setLeagueName] = useState<string>('League Standings');

  useEffect(() => {
    loadData();
  }, [leagueId]);

  const loadData = async () => {
    if (!leagueId) return;
    
    try {
      // Fetch league details first
      const league = await fetchLeagueById(leagueId);
      
      if (league) {
        setLeagueName(league.name);
      } else {
        // If league not found in database, try finding in predefined categories
        const category = LEAGUE_CATEGORIES.find(cat => cat.id === leagueId);
        if (category) {
          setLeagueName(category.label);
        }
      }
      
      // Fetch the standings
      await fetchLeagueStandings(leagueId);
    } catch (err) {
      console.error('Error loading league standings:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Determine highlight colors for positions
  const getPositionHighlightColor = (position: number): string | undefined => {
    // This is a simplified example - adjust based on your league rules
    if (position === 1) {
      return '#16a34a'; // Green for champion
    } else if (position <= 3) {
      return '#2563eb'; // Blue for promotion or continental qualification
    } else if (position >= standings.length - 2 && standings.length > 10) {
      return '#ef4444'; // Red for relegation
    }
    return undefined;
  };

  // Render Content based on loading/error state
  const renderContent = () => {
    if (loading && !refreshing && standings.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading standings...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={32} color="white" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (standings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="list" size={32} color="white" />
          <Text style={styles.emptyText}>No standings available for this league</Text>
        </View>
      );
    }

    return (
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
        <View style={styles.card}>
          {/* League Header */}
          <View style={styles.leagueHeader}>
            <Text style={styles.leagueTitle}>{leagueName}</Text>
            <Text style={styles.leagueSeason}>2024-25 Season</Text>
          </View>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.positionColumn]}>#</Text>
            <Text style={[styles.headerText, styles.teamColumn]}>Team</Text>
            <Text style={[styles.headerText, styles.statColumn]}>P</Text>
            <Text style={[styles.headerText, styles.statColumn]}>W</Text>
            <Text style={[styles.headerText, styles.statColumn]}>D</Text>
            <Text style={[styles.headerText, styles.statColumn]}>L</Text>
            <Text style={[styles.headerText, styles.statColumn]}>GF</Text>
            <Text style={[styles.headerText, styles.statColumn]}>GA</Text>
            <Text style={[styles.headerText, styles.gdColumn]}>GD</Text>
            <Text style={[styles.headerText, styles.pointsColumn]}>PTS</Text>
          </View>
          
          {/* Team Rows */}
          {standings.map((team, index) => {
            const positionColor = getPositionHighlightColor(team.position);
            
            return (
              <TouchableOpacity 
                key={team.teamId}
                style={[
                  styles.tableRow, 
                  index % 2 === 0 ? styles.evenRow : null
                ]}
                onPress={() => {
                  // Navigate to team detail
                  router.push(`/teams/${team.teamId}`);
                }}
              >
                <View 
                  style={[
                    styles.positionColumn, 
                    styles.positionIndicator,
                    positionColor ? { backgroundColor: positionColor } : null
                  ]}
                >
                  <Text style={[
                    styles.positionText,
                    positionColor ? styles.highlightedPosition : null
                  ]}>
                    {team.position}
                  </Text>
                </View>
                
                <View style={[styles.teamColumn, styles.teamInfo]}>
                  <TeamLogo
                    teamId={team.teamId}
                    teamName={team.teamName}
                    size={24}
                    style={styles.teamLogo}
                  />
                  <Text 
                    style={styles.teamName}
                    numberOfLines={1}
                  >
                    {team.teamName}
                  </Text>
                </View>
                
                <Text style={[styles.cellText, styles.statColumn]}>{team.played}</Text>
                <Text style={[styles.cellText, styles.statColumn]}>{team.won}</Text>
                <Text style={[styles.cellText, styles.statColumn]}>{team.drawn}</Text>
                <Text style={[styles.cellText, styles.statColumn]}>{team.lost}</Text>
                <Text style={[styles.cellText, styles.statColumn]}>{team.goalsFor}</Text>
                <Text style={[styles.cellText, styles.statColumn]}>{team.goalsAgainst}</Text>
                <Text 
                  style={[
                    styles.cellText, 
                    styles.gdColumn,
                    team.goalDifference > 0 ? styles.positiveGD : 
                    team.goalDifference < 0 ? styles.negativeGD : null
                  ]}
                >
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </Text>
                <Text style={[styles.cellText, styles.pointsColumn, styles.pointsText]}>
                  {team.points}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Legend Section */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#16a34a' }]} />
            <Text style={styles.legendText}>Champion</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2563eb' }]} />
            <Text style={styles.legendText}>Promotion / Continental Qualification</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Relegation</Text>
          </View>
        </View>
        
        {/* Form Guide - Optional, uncomment if you have this data */}
        {/* <View style={styles.formGuideContainer}>
          <Text style={styles.formGuideTitle}>Recent Form</Text>
          {standings.slice(0, 5).map(team => (
            <View key={`form-${team.teamId}`} style={styles.formItem}>
              <Text style={styles.formTeamName}>{team.teamName}</Text>
              <View style={styles.formResults}>
                {team.form?.slice(0, 5).map((result, i) => (
                  <View 
                    key={`form-${team.teamId}-${i}`} 
                    style={[
                      styles.formResult,
                      result === 'W' ? styles.formWin : 
                      result === 'D' ? styles.formDraw : 
                      styles.formLoss
                    ]}
                  >
                    <Text style={styles.formResultText}>{result}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View> */}
        
        {/* Footer note */}
        <Text style={styles.footnote}>
          * Standings updated after each completed match day
        </Text>
      </ScrollView>
    );
  };

  return (
    <StatsScreenWrapper>
      <Header 
        title={leagueName} 
        showBack={true}
      />
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
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leagueHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  leagueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  leagueSeason: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#f9fafb',
  },
  positionColumn: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
  },
  highlightedPosition: {
    color: 'white',
  },
  teamColumn: {
    flex: 3,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    marginRight: 8,
  },
  teamName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  statColumn: {
    width: 24,
    textAlign: 'center',
  },
  gdColumn: {
    width: 30,
    textAlign: 'center',
  },
  pointsColumn: {
    width: 30,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },
  pointsText: {
    fontWeight: 'bold',
    color: '#111827',
  },
  positiveGD: {
    color: '#16a34a',
  },
  negativeGD: {
    color: '#ef4444',
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#4b5563',
  },
  formGuideContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formGuideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  formTeamName: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
  },
  formResults: {
    flexDirection: 'row',
  },
  formResult: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  formWin: {
    backgroundColor: '#16a34a',
  },
  formDraw: {
    backgroundColor: '#9ca3af',
  },
  formLoss: {
    backgroundColor: '#ef4444',
  },
  formResultText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footnote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
  },
});