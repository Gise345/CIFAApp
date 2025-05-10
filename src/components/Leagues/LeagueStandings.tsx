// src/components/leagues/LeagueStandings.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useLeagues } from '../../hooks/useLeagues';
import { LeagueStanding } from '../../services/firebase/leagues';
import Card from '../common/Card';

interface LeagueStandingsProps {
  leagueId: string;
  showTeamLogos?: boolean;
  showFullTable?: boolean;
  maxRows?: number;
  onViewFullTable?: () => void;
}

const LeagueStandings: React.FC<LeagueStandingsProps> = ({
  leagueId,
  showTeamLogos = true,
  showFullTable = false,
  maxRows = 4,
  onViewFullTable
}) => {
  const router = useRouter();
  const { 
    fetchLeagueById, 
    fetchLeagueStandings, 
    standings, 
    selectedLeague,
    loading, 
    error,
    resetErrors
  } = useLeagues();

  const [displayedStandings, setDisplayedStandings] = useState<LeagueStanding[]>([]);
  const [loadingLeague, setLoadingLeague] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [leagueId]);

  // Load standings data
  const loadData = async () => {
    try {
      setLoadingLeague(true);
      resetErrors();
      
      if (leagueId) {
        const league = await fetchLeagueById(leagueId);
        if (league) {
          await fetchLeagueStandings(leagueId);
        }
      }
      
      setLoadingLeague(false);
    } catch (err) {
      console.error('Error loading league data:', err);
      setLoadingLeague(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Update displayed standings when standings change
  useEffect(() => {
    if (standings.length > 0) {
      // If showFullTable is true, show all standings
      // Otherwise, only show up to maxRows
      const limitedStandings = showFullTable 
        ? standings 
        : standings.slice(0, maxRows);
      
      setDisplayedStandings(limitedStandings);
    }
  }, [standings, showFullTable, maxRows]);

  // Handle navigation to team details
  const handleTeamPress = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  // Render loading state
  if ((loading || loadingLeague) && !refreshing && standings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Loading standings...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={24} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load standings</Text>
      </View>
    );
  }

  // Render empty state
  if (displayedStandings.length === 0 && !loading && !loadingLeague) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="list" size={24} color="#9ca3af" />
        <Text style={styles.emptyText}>No standings available</Text>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>League Table</Text>
        {!showFullTable && onViewFullTable && (
          <TouchableOpacity onPress={onViewFullTable}>
            <Text style={styles.viewAllText}>Full Table</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.positionCell]}>#</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>P</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>W</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>D</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>L</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>GD</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>PTS</Text>
      </View>

      {/* Table Rows */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {displayedStandings.map((team, index) => (
          <TouchableOpacity
            key={team.teamId}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.evenRow : null
            ]}
            onPress={() => handleTeamPress(team.teamId)}
          >
            <Text style={[styles.cell, styles.positionCell]}>{team.position}</Text>
            <View style={styles.teamCell}>
              {showTeamLogos && (
                <View 
                  style={[
                    styles.teamLogo,
                    { backgroundColor: getTeamColor(team.position) }
                  ]}
                >
                  <Text style={styles.teamLogoText}>
                    {getTeamInitials(team.teamName)}
                  </Text>
                </View>
              )}
              <Text 
                style={styles.teamName}
                numberOfLines={1}
              >
                {team.teamName}
              </Text>
            </View>
            <Text style={[styles.cell, styles.statsCell]}>{team.played}</Text>
            <Text style={[styles.cell, styles.statsCell]}>{team.won}</Text>
            <Text style={[styles.cell, styles.statsCell]}>{team.drawn}</Text>
            <Text style={[styles.cell, styles.statsCell]}>{team.lost}</Text>
            <Text style={[styles.cell, styles.statsCell]}>{team.goalDifference}</Text>
            <Text style={[styles.cell, styles.pointsCell]}>{team.points}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Show "View Full Table" button if not showing full table */}
      {!showFullTable && displayedStandings.length < standings.length && (
        <TouchableOpacity 
          style={styles.viewFullTableButton}
          onPress={onViewFullTable}
        >
          <Text style={styles.viewFullTableText}>View Full Table</Text>
          <Feather name="chevron-right" size={16} color="#2563eb" />
        </TouchableOpacity>
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

// Helper function to get color based on position
const getTeamColor = (position: number): string => {
  // Colors for different positions
  switch (position) {
    case 1:
      return '#16a34a'; // Green - Champion
    case 2:
    case 3:
      return '#2563eb'; // Blue - Champions League spots
    case 4:
    case 5:
      return '#7c3aed'; // Purple - Europa League spots
    default:
      return '#6b7280'; // Gray - Mid-table
  }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  evenRow: {
    backgroundColor: '#f9fafb',
  },
  cell: {
    fontSize: 14,
    color: '#111827',
  },
  positionCell: {
    width: 30,
    textAlign: 'center',
  },
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  teamLogoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  teamName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  statsCell: {
    width: 40,
    textAlign: 'center',
  },
  pointsCell: {
    width: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#111827',
  },
  viewFullTableButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  viewFullTableText: {
    fontSize: 14,
    color: '#2563eb',
    marginRight: 4,
  },
  loadingContainer: {
    padding: 20,
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
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
});

export default LeagueStandings;