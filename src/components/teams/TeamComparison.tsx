// CIFAMobileApp/src/components/teams/TeamComparison.tsx
import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTeams } from '../../hooks/useTeams';
import { useLeagues } from '../../hooks/useLeagues';
import Card from '../common/Card';
import TeamLogo from '../common/TeamLogo';
import { Team } from '../../types/team';

interface TeamComparisonProps {
  teamAId: string;
  teamBId?: string; // Optional - if not provided, show team selector
}

// Interface for comparison stats
interface ComparisonStat {
  label: string;
  teamA: number | string;
  teamB: number | string;
  winner?: 'A' | 'B' | 'tie';
  higher: 'better' | 'worse'; // Whether higher number is better or worse
}

const TeamComparison: React.FC<TeamComparisonProps> = ({ teamAId, teamBId: initialTeamBId }) => {
  const { fetchTeamById, loadTeamData } = useTeams();
  const { fetchLeagueStandings } = useLeagues();
  
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [teamBId, setTeamBId] = useState<string | undefined>(initialTeamBId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonStats, setComparisonStats] = useState<ComparisonStat[]>([]);
  const [teamOptions, setTeamOptions] = useState<Team[]>([]);
  const [showTeamSelector, setShowTeamSelector] = useState(!initialTeamBId);
  
  // Load teams data
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        
        // Load team A
        const teamAData = await fetchTeamById(teamAId);
        setTeamA(teamAData);
        
        // Load team B if selected
        if (teamBId) {
          const teamBData = await fetchTeamById(teamBId);
          setTeamB(teamBData);
        }
        
        // Load possible teams to compare with
        if (teamAData && teamAData.leagueId) {
          const standings = await fetchLeagueStandings(teamAData.leagueId);
          const leagueTeams = await Promise.all(
            standings.map(standing => fetchTeamById(standing.teamId))
          );
          
          // Filter out the current team and null values
          setTeamOptions(
            leagueTeams.filter(team => team && team.id !== teamAId) as Team[]
          );
        }
        
        // Generate comparison stats if both teams are loaded
        if (teamAData && teamBId) {
          generateComparisonStats(teamAData, await fetchTeamById(teamBId) as Team);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading teams for comparison:', err);
        setError('Failed to load team data for comparison');
        setLoading(false);
      }
    };
    
    loadTeams();
  }, [teamAId, teamBId]);
  
  // Generate comparison stats between two teams
  const generateComparisonStats = (teamA: Team, teamB: Team) => {
    if (!teamA || !teamB) return;
    
    // Mock data - in a real app, these would come from a database
    const mockStats: ComparisonStat[] = [
      {
        label: 'League Position',
        teamA: '1st',
        teamB: '3rd',
        winner: 'A',
        higher: 'worse'
      },
      {
        label: 'Points',
        teamA: 28,
        teamB: 20,
        winner: 'A',
        higher: 'better'
      },
      {
        label: 'Matches Played',
        teamA: 12,
        teamB: 12,
        winner: 'tie',
        higher: 'better'
      },
      {
        label: 'Wins',
        teamA: 9,
        teamB: 6,
        winner: 'A',
        higher: 'better'
      },
      {
        label: 'Draws',
        teamA: 1,
        teamB: 2,
        winner: 'B',
        higher: 'better'
      },
      {
        label: 'Losses',
        teamA: 2,
        teamB: 4,
        winner: 'A',
        higher: 'worse'
      },
      {
        label: 'Goals Scored',
        teamA: 28,
        teamB: 18,
        winner: 'A',
        higher: 'better'
      },
      {
        label: 'Goals Conceded',
        teamA: 10,
        teamB: 15,
        winner: 'A',
        higher: 'worse'
      },
      {
        label: 'Clean Sheets',
        teamA: 5,
        teamB: 2,
        winner: 'A',
        higher: 'better'
      }
    ];
    
    setComparisonStats(mockStats);
  };
  
  // Select a team to compare with
  const selectTeamB = (team: Team) => {
    setTeamBId(team.id);
    setTeamB(team);
    setShowTeamSelector(false);
    
    if (teamA) {
      generateComparisonStats(teamA, team);
    }
  };
  
  // Toggle team selector
  const toggleTeamSelector = () => {
    setShowTeamSelector(!showTeamSelector);
  };
  
  // Render loading state
  if (loading && !teamA) {
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
      
      {/* Team Selector */}
      {showTeamSelector && (
        <View style={styles.teamSelectorContainer}>
          <Text style={styles.selectorTitle}>Select a team to compare</Text>
          <ScrollView style={styles.teamsList}>
            {teamOptions.map(team => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamOption}
                onPress={() => selectTeamB(team)}
              >
                <TeamLogo
                  teamId={team.id}
                  teamName={team.name}
                  teamCode={getTeamInitials(team.name)}
                  size="small"
                  colorPrimary={team.colorPrimary}
                />
                <Text style={styles.teamOptionName}>{team.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Comparison Stats */}
      {!showTeamSelector && teamB && (
        <View style={styles.statsContainer}>
          {comparisonStats.map((stat, index) => (
            <View 
              key={stat.label} 
              style={[
                styles.statRow,
                index < comparisonStats.length - 1 && styles.statRowBorder
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
                  <View 
                    style={[
                      styles.barA,
                      { 
                        flex: typeof stat.teamA === 'number' ? stat.teamA : 1,
                        backgroundColor: teamA?.colorPrimary || '#2563eb'
                      }
                    ]}
                  />
                  <View 
                    style={[
                      styles.barB,
                      { 
                        flex: typeof stat.teamB === 'number' ? stat.teamB : 1,
                        backgroundColor: teamB?.colorPrimary || '#ef4444'
                      }
                    ]}
                  />
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
          ))}
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
  teamSelectorContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 12,
  },
  teamsList: {
    maxHeight: 200,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  teamOptionName: {
    marginLeft: 12,
    fontSize: 14,
    color: '#111827',
  },
  statsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
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
});

export default TeamComparison;