// src/components/stats/TeamStats.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Card from '../common/Card';
import Section from '../common/Section';
import { useStats } from '../../hooks/useStats';
import { Feather } from '@expo/vector-icons';
import TeamLogo from '../common/TeamLogo';
import { router } from 'expo-router';

interface TeamStatsProps {
  categoryId: string;
  onViewAll?: () => void;
}

const TeamStats: React.FC<TeamStatsProps> = ({ categoryId, onViewAll }) => {
  const { fetchTeamRankings, loading, error } = useStats();
  const [stats, setStats] = useState<{
    category: string;
    teams: {
      teamId: string;
      teamName: string;
      value: number;
      colorPrimary?: string;
    }[];
  }[]>([]);

  useEffect(() => {
    const loadTeamStats = async () => {
      const categories = Array.from(['goals', 'defense', 'cleanSheets'] as const);
      const data = await fetchTeamRankings(categoryId, categories, 3);
      setStats(data);
    };
    
    loadTeamStats();
  }, [categoryId, fetchTeamRankings]);

  // Loading state
  if (loading && stats.length === 0) {
    return (
      <Section 
        title="TEAM STATS" 
        viewAllText="View All" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading team statistics...</Text>
          </View>
        </Card>
      </Section>
    );
  }

  // Error state
  if (error) {
    return (
      <Section 
        title="TEAM STATS" 
        viewAllText="View All" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      </Section>
    );
  }

  // Empty state
  if (stats.length === 0) {
    return (
      <Section 
        title="TEAM STATS" 
        viewAllText="View All" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.emptyContainer}>
            <Feather name="bar-chart-2" size={24} color="#9ca3af" />
            <Text style={styles.emptyText}>No team statistics available</Text>
          </View>
        </Card>
      </Section>
    );
  }

  // Find the stats for each category
  const goalsStats = stats.find(stat => stat.category === 'goals')?.teams || [];
  const defenseStats = stats.find(stat => stat.category === 'defense')?.teams || [];
  const cleanSheetsStats = stats.find(stat => stat.category === 'cleanSheets')?.teams || [];

  // Helper to get proper label for defense stats
  const getDefenseLabel = (value: number) => {
    return `${value} conceded`;
  };

  const handleTeamPress = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  return (
    <Section 
      title="TEAM STATS" 
      viewAllText="View All" 
      onViewAll={onViewAll}
      style={styles.section}
    >
      <Card style={styles.card}>
        {/* Most Goals */}
        {goalsStats.length > 0 && (
          <>
            <Text style={styles.statTitle}>Most Goals</Text>
            {goalsStats.map((team) => (
              <View key={team.teamId} style={styles.statItem}>
                <View style={styles.statHeader}>
                  <TeamLogo
                    teamId={team.teamId}
                    teamName={team.teamName}
                    size={24}
                    colorPrimary={team.colorPrimary}
                    style={styles.teamLogo}
                  />
                  <Text 
                    style={styles.teamName} 
                    onPress={() => handleTeamPress(team.teamId)}
                    numberOfLines={1}
                  >
                    {team.teamName}
                  </Text>
                  <Text style={styles.statValue}>{team.value}</Text>
                </View>
                <View style={styles.statBar}>
                  <View 
                    style={[
                      styles.statBarFill, 
                      { 
                        width: `${Math.min((team.value / goalsStats[0].value) * 100, 100)}%`, 
                        backgroundColor: team.colorPrimary || '#16a34a' 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Best Defense */}
        {defenseStats.length > 0 && (
          <>
            <Text style={styles.statTitle}>Best Defense</Text>
            {defenseStats.map((team) => (
              <View key={team.teamId} style={styles.statItem}>
                <View style={styles.statHeader}>
                  <TeamLogo
                    teamId={team.teamId}
                    teamName={team.teamName}
                    size={24}
                    colorPrimary={team.colorPrimary}
                    style={styles.teamLogo}
                  />
                  <Text 
                    style={styles.teamName} 
                    onPress={() => handleTeamPress(team.teamId)}
                    numberOfLines={1}
                  >
                    {team.teamName}
                  </Text>
                  <Text style={styles.statValue}>{getDefenseLabel(team.value)}</Text>
                </View>
                <View style={styles.statBar}>
                  <View 
                    style={[
                      styles.statBarFill, 
                      { 
                        width: `${Math.min((defenseStats[0].value / team.value) * 100, 100)}%`, 
                        backgroundColor: team.colorPrimary || '#1e40af' 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Most Clean Sheets */}
        {cleanSheetsStats.length > 0 && (
          <>
            <Text style={styles.statTitle}>Most Clean Sheets</Text>
            {cleanSheetsStats.map((team) => (
              <View key={team.teamId} style={styles.statItem}>
                <View style={styles.statHeader}>
                  <TeamLogo
                    teamId={team.teamId}
                    teamName={team.teamName}
                    size={24}
                    colorPrimary={team.colorPrimary}
                    style={styles.teamLogo}
                  />
                  <Text 
                    style={styles.teamName} 
                    onPress={() => handleTeamPress(team.teamId)}
                    numberOfLines={1}
                  >
                    {team.teamName}
                  </Text>
                  <Text style={styles.statValue}>{team.value}</Text>
                </View>
                <View style={styles.statBar}>
                  <View 
                    style={[
                      styles.statBarFill, 
                      { 
                        width: `${Math.min((team.value / cleanSheetsStats[0].value) * 100, 100)}%`, 
                        backgroundColor: team.colorPrimary || '#16a34a' 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </>
        )}
      </Card>
    </Section>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    padding: 16,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  statItem: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamLogo: {
    marginRight: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default TeamStats;