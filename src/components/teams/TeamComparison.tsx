// src/components/teams/TeamComparison.tsx
import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTeams } from '../../hooks/useTeams';
import { useStats } from '../../hooks/useStats';
import Card from '../common/Card';
import TeamLogo from '../common/TeamLogo';
import { Team } from '../../types/team';
import { getTeams } from '../../services/firebase/teams';

interface TeamComparisonProps {
  teamAId: string;
  teamBId?: string; // Optional - if not provided, show team selector
}

const TeamComparison: React.FC<TeamComparisonProps> = ({ teamAId, teamBId: initialTeamBId }) => {
  const { fetchTeamById } = useTeams();
  const { fetchTeamComparison, loading, error } = useStats();
  
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [teamBId, setTeamBId] = useState<string | undefined>(initialTeamBId);
  const [comparison, setComparison] = useState<any>(null);
  const [teamOptions, setTeamOptions] = useState<Team[]>([]);
  const [loadingTeamOptions, setLoadingTeamOptions] = useState(false);
  const [teamSelectorVisible, setTeamSelectorVisible] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  
  // Load teams data
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoadingTeams(true);
        
        // Load team A
        const teamAData = await fetchTeamById(teamAId);
        setTeamA(teamAData);
        
        // Load team B if selected
        if (teamBId) {
          const teamBData = await fetchTeamById(teamBId);
          setTeamB(teamBData);
          
          // Fetch comparison data
          const comparisonData = await fetchTeamComparison(teamAId, teamBId);
          setComparison(comparisonData);
        }
        
        setLoadingTeams(false);
      } catch (err) {
        console.error('Error loading teams for comparison:', err);
        setLoadingTeams(false);
      }
    };
    
    loadTeams();
  }, [teamAId, teamBId, fetchTeamById, fetchTeamComparison]);
  
  // Load team options when modal is shown
  useEffect(() => {
    if (teamSelectorVisible && teamOptions.length === 0) {
      const fetchTeamOptions = async () => {
        try {
          setLoadingTeamOptions(true);
          
          // Get team A details to know its division
          const teamADetails = await fetchTeamById(teamAId);
          
          if (teamADetails) {
            // Fetch teams from the same division
            const allTeams = await getTeams('club', teamADetails.division);
            
            // Filter out the current team A
            const filteredTeams = allTeams.filter(team => team.id !== teamAId);
            setTeamOptions(filteredTeams);
          }
          
          setLoadingTeamOptions(false);
        } catch (err) {
          console.error('Error loading team options:', err);
          setLoadingTeamOptions(false);
        }
      };
      
      fetchTeamOptions();
    }
  }, [teamSelectorVisible, teamOptions.length, teamAId, fetchTeamById]);
  
  // Select a team to compare with
  const selectTeamB = async (team: Team) => {
    setTeamB(team);
    setTeamBId(team.id);
    setTeamSelectorVisible(false);
    
    // Fetch comparison data
    const comparisonData = await fetchTeamComparison(teamAId, team.id);
    setComparison(comparisonData);
  };
  
  // Toggle team selector modal
  const toggleTeamSelector = () => {
    setTeamSelectorVisible(!teamSelectorVisible);
  };
  
  // Render loading state
  if ((loading || loadingTeams) && !teamA) {
    return (
      <Card>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>Loading comparison data...</Text>
        </View>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Card>
    );
  }

  // Instead of using FlatList for comparison stats, we'll use manual rendering
  const renderStatsItem = (stat: any, index: number) => {
    return (
      <View 
        key={`stat-${index}`}
        style={[
          styles.statRow,
          index < (comparison?.comparisonStats?.length || 0) - 1 && styles.statRowBorder
        ]}
      >
        {/* Team A Value */}
        <Text 
          style={[
            styles.statValue,
            stat.winner === 'A' && styles.winnerValue
          ]}
        >
          {stat.teamA}
        </Text>
        
        {/* Stat Label */}
        <View style={styles.statLabelContainer}>
          <Text style={styles.statLabel}>{stat.label}</Text>
          <View style={styles.comparisonBar}>
            {typeof stat.teamA === 'number' && typeof stat.teamB === 'number' ? (
              <>
                <View 
                  style={[
                    styles.barA,
                    { 
                      flex: stat.teamA || 1,
                      backgroundColor: teamA?.colorPrimary || '#2563eb'
                    }
                  ]}
                />
                <View 
                  style={[
                    styles.barB,
                    { 
                      flex: stat.teamB || 1,
                      backgroundColor: teamB?.colorPrimary || '#ef4444'
                    }
                  ]}
                />
              </>
            ) : (
              <View style={styles.noBarData} />
            )}
          </View>
        </View>
        
        {/* Team B Value */}
        <Text 
          style={[
            styles.statValue,
            stat.winner === 'B' && styles.winnerValue
          ]}
        >
          {stat.teamB}
        </Text>
      </View>
    );
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Team Comparison</Text>
      </View>
      
      {/* Team Headers */}
      <View style={styles.teamsHeader}>
        {/* Team A */}
        <View style={styles.teamHeader}>
          <TeamLogo
            teamId={teamA?.id || ''}
            teamName={teamA?.name || ''}
            teamCode={getTeamInitials(teamA?.name || '')}
            size="medium"
            colorPrimary={teamA?.colorPrimary}
          />
          <Text style={styles.teamName} numberOfLines={1}>{teamA?.name || ''}</Text>
        </View>
        
        {/* VS */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        {/* Team B */}
        {teamB ? (
          <TouchableOpacity 
            style={styles.teamHeader}
            onPress={toggleTeamSelector}
          >
            <TeamLogo
              teamId={teamB.id}
              teamName={teamB.name}
              teamCode={getTeamInitials(teamB.name)}
              size="medium"
              colorPrimary={teamB.colorPrimary}
            />
            <Text style={styles.teamName} numberOfLines={1}>{teamB.name}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.selectTeamButton}
            onPress={toggleTeamSelector}
          >
            <Feather name="plus-circle" size={24} color="#2563eb" />
            <Text style={styles.selectTeamText}>Select Team</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Team Selector Modal - This moves the FlatList out of the ScrollView */}
      <Modal
        visible={teamSelectorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTeamSelectorVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a team to compare</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => setTeamSelectorVisible(false)}
              >
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {loadingTeamOptions ? (
              <View style={styles.loadingOptionsContainer}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Loading teams...</Text>
              </View>
            ) : teamOptions.length > 0 ? (
              <FlatList
                data={teamOptions}
                keyExtractor={(item) => item.id}
                style={styles.teamsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.teamOption}
                    onPress={() => selectTeamB(item)}
                  >
                    <TeamLogo
                      teamId={item.id}
                      teamName={item.name}
                      teamCode={getTeamInitials(item.name)}
                      size="small"
                      colorPrimary={item.colorPrimary}
                    />
                    <Text style={styles.teamOptionName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.noTeamsContainer}>
                <Feather name="info" size={20} color="#6b7280" />
                <Text style={styles.noTeamsText}>No other teams available in this division</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
      
      {/* Comparison Stats */}
      {teamB && comparison && (
        <View style={styles.statsContainer}>
          {/* Display Head-to-Head info at the top */}
          {comparison.headToHead && comparison.headToHead.matches > 0 && (
            <View style={styles.headToHeadContainer}>
              <Text style={styles.h2hTitle}>Head-to-Head</Text>
              <View style={styles.h2hStats}>
                <View style={styles.h2hStat}>
                  <Text style={styles.h2hValue}>{comparison.headToHead.teamAWins}</Text>
                  <Text style={styles.h2hLabel}>Wins</Text>
                </View>
                <View style={styles.h2hStat}>
                  <Text style={styles.h2hValue}>{comparison.headToHead.draws}</Text>
                  <Text style={styles.h2hLabel}>Draws</Text>
                </View>
                <View style={styles.h2hStat}>
                  <Text style={styles.h2hValue}>{comparison.headToHead.teamBWins}</Text>
                  <Text style={styles.h2hLabel}>Wins</Text>
                </View>
              </View>
              <Text style={styles.h2hMatches}>
                {comparison.headToHead.matches} matches played
              </Text>
            </View>
          )}
          
          {/* Display comparison stats with manual rendering instead of FlatList */}
          {comparison.comparisonStats?.map(renderStatsItem)}
        </View>
      )}
      
      {/* If team B is selected but no comparison data */}
      {teamB && !comparison && (
        <View style={styles.emptyContainer}>
          <Feather name="bar-chart-2" size={24} color="#9ca3af" />
          <Text style={styles.emptyText}>No comparison data available</Text>
        </View>
      )}
    </Card>
  );
};

// Helper function to get team initials
const getTeamInitials = (teamName: string): string => {
  if (!teamName) return '';
  
  const words = teamName.split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }
  
  // Return first letter of each word (up to 3)
  return words
    .slice(0, 3)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  teamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  teamHeader: {
    flex: 2,
    alignItems: 'center',
  },
  teamName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  vsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  selectTeamButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 16,
    borderRadius: 8,
  },
  selectTeamText: {
    marginTop: 8,
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  loadingOptionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  teamsList: {
    maxHeight: 400,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  teamOptionName: {
    marginLeft: 12,
    fontSize: 14,
    color: '#111827',
  },
  noTeamsContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noTeamsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  headToHeadContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  h2hTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  h2hStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  h2hStat: {
    flex: 1,
    alignItems: 'center',
  },
  h2hValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  h2hLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  h2hMatches: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  winnerValue: {
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabelContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  comparisonBar: {
    height: 6,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barA: {
    height: '100%',
  },
  barB: {
    height: '100%',
  },
  noBarData: {
    height: '100%',
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default TeamComparison;