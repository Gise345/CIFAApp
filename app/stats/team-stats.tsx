// app/stats/team-stats.tsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import { useStats } from '../../src/hooks/useStats';
import { useParams, getParam } from '../../src/utils/router';
import TeamLogo from '../../src/components/common/TeamLogo';
import StatsScreenWrapper from '../../src/components/helpers/StatsScreenWrapper';

// Helper function to get color for stats
const getStatColor = (category: string) => {
  switch (category) {
    case 'goals':
      return '#16a34a'; // Green
    case 'defense':
      return '#1e40af'; // Blue
    case 'cleanSheets':
      return '#7e22ce'; // Purple
    case 'possession':
      return '#ea580c'; // Orange
    default:
      return '#2563eb'; // Default blue
  }
};

export default function TeamStatsPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = getParam(params, 'categoryId') || '';
  
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
    loadStats();
  }, [categoryId]);
  
  const loadStats = async () => {
    if (!categoryId) return;
    
    const categories = ['goals', 'defense', 'cleanSheets', 'possession'] as const;
    const data = await fetchTeamRankings(categoryId, [...categories], 10); // Get top 10 teams
    setStats(data);
  };

  const handleTeamPress = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };
  
  // Render content based on loading/error states
  const renderContent = () => {
    // Loading state
    if (loading && stats.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading team statistics...</Text>
        </View>
      );
    }
    
    // Error state
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={32} color="white" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    
    // Empty state
    if (stats.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="bar-chart-2" size={32} color="white" />
          <Text style={styles.emptyText}>No team statistics available</Text>
        </View>
      );
    }
    
    // Get the stats categories
    const goalsStats = stats.find(stat => stat.category === 'goals')?.teams || [];
    const defenseStats = stats.find(stat => stat.category === 'defense')?.teams || [];
    const cleanSheetsStats = stats.find(stat => stat.category === 'cleanSheets')?.teams || [];
    const possessionStats = stats.find(stat => stat.category === 'possession')?.teams || [];
    
    return (
      <ScrollView style={styles.content}>
        {/* Most Goals */}
        {goalsStats.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Most Goals</Text>
            {goalsStats.map((team, index) => (
              <StatBar 
                key={`goals-${team.teamId}`}
                team={team}
                index={index}
                type="goals"
                maxValue={goalsStats[0].value}
                onPress={() => handleTeamPress(team.teamId)}
              />
            ))}
          </View>
        )}
        
        {/* Best Defense */}
        {defenseStats.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Best Defense</Text>
            {defenseStats.map((team, index) => (
              <StatBar 
                key={`defense-${team.teamId}`}
                team={team}
                index={index}
                type="defense"
                maxValue={defenseStats[0].value}
                lowerIsBetter
                onPress={() => handleTeamPress(team.teamId)}
              />
            ))}
          </View>
        )}
        
        {/* Most Clean Sheets */}
        {cleanSheetsStats.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Most Clean Sheets</Text>
            {cleanSheetsStats.map((team, index) => (
              <StatBar 
                key={`cleanSheets-${team.teamId}`}
                team={team}
                index={index}
                type="cleanSheets"
                maxValue={cleanSheetsStats[0].value}
                onPress={() => handleTeamPress(team.teamId)}
              />
            ))}
          </View>
        )}
        
        {/* Highest Possession */}
        {possessionStats.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Highest Possession</Text>
            {possessionStats.map((team, index) => (
              <StatBar 
                key={`possession-${team.teamId}`}
                team={team}
                index={index}
                type="possession"
                maxValue={possessionStats[0].value}
                showPercentage
                onPress={() => handleTeamPress(team.teamId)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    );
  };
  
  return (
    <StatsScreenWrapper>
      <Header title="Team Stats" showBack={true} />
      {renderContent()}
    </StatsScreenWrapper>
  );
}

// StatBar component to display team stat with a bar
interface StatBarProps {
  team: {
    teamId: string;
    teamName: string;
    value: number;
    colorPrimary?: string;
  };
  index: number;
  type: 'goals' | 'defense' | 'cleanSheets' | 'possession';
  maxValue: number;
  lowerIsBetter?: boolean;
  showPercentage?: boolean;
  onPress?: () => void;
}

const StatBar: React.FC<StatBarProps> = ({ 
  team, 
  index, 
  type, 
  maxValue,
  lowerIsBetter = false,
  showPercentage = false,
  onPress
}) => {
  // Get bar width as percentage
  const getBarWidth = () => {
    if (lowerIsBetter) {
      // For defense, lower is better
      return `${Math.min((maxValue / team.value) * 100, 100)}%`;
    } else {
      // For other stats, higher is better
      return `${Math.min((team.value / maxValue) * 100, 100)}%`;
    }
  };
  
  // Get default color based on type
  const getDefaultColor = () => {
    switch (type) {
      case 'goals':
        return '#16a34a'; // Green
      case 'defense':
        return '#1e40af'; // Blue
      case 'cleanSheets':
        return '#7e22ce'; // Purple
      case 'possession':
        return '#ea580c'; // Orange
      default:
        return '#2563eb'; // Default blue
    }
  };
  
  // Format value based on type
  const formatValue = () => {
    if (type === 'defense') {
      return `${team.value} conceded`;
    } else if (showPercentage) {
      return `${team.value}%`;
    } else {
      return team.value.toString();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.statBarContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statBarTop}>
        <Text style={styles.statPosition}>{index + 1}</Text>
        <TeamLogo
          teamId={team.teamId}
          teamName={team.teamName}
          size={24}
          colorPrimary={team.colorPrimary || getDefaultColor()}
          style={styles.teamLogo}
        />
        <Text style={styles.statTeamName}>{team.teamName}</Text>
        <Text style={styles.statValue}>{formatValue()}</Text>
      </View>
      <View style={styles.statBarTrack}>
        <View 
          style={[
            styles.statBarFill, 
            { 
              width: parseFloat(getBarWidth()) / 100, 
              backgroundColor: team.colorPrimary || getDefaultColor() 
            }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
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
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statBarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statPosition: {
    width: 24,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  teamLogo: {
    marginRight: 8,
  },
  statTeamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  statBarTrack: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});