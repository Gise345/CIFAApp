// src/components/national/NationalTeamOverview.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NationalTeam } from '../../types/nationalTeam';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';import Card from '../common/Card';

interface NationalTeamOverviewProps {
  team: NationalTeam | null;
  ranking: {
    world: number | null;
    confederation: number | null;
    points: number | null;
    previousRank: number | null;
  };
  loading: boolean;
  error: string | null;
  onRosterPress: () => void;
  onFixturesPress: () => void;
  onStatsPress: () => void;
}

const NationalTeamOverview: React.FC<NationalTeamOverviewProps> = ({
  team,
  ranking,
  loading,
  error,
  onRosterPress,
  onFixturesPress,
  onStatsPress
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading team information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-triangle" size={48} color="#ffffff" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={48} color="#ffffff" />
        <Text style={styles.emptyText}>Team information unavailable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Team Header */}
      <LinearGradient
        colors={[team.primaryColor, team.secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            {team.logoUrl ? (
              <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} />
            ) : (
              <View style={[styles.placeholderLogo, { backgroundColor: team.secondaryColor }]}>
                <Text style={styles.placeholderText}>{team.shortName}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamConfederation}>{team.confederation}</Text>
          
          {/* FIFA Ranking */}
          {(team.type === 'mens' || team.type === 'womens') && (
            <View style={styles.rankingContainer}>
              <View style={styles.rankingItem}>
                <Text style={styles.rankingValue}>{ranking.world || team.worldRanking || '-'}</Text>
                <Text style={styles.rankingLabel}>FIFA Ranking</Text>
              </View>
              
              <View style={styles.rankingDivider} />
              
              <View style={styles.rankingItem}>
                <Text style={styles.rankingValue}>{ranking.confederation || team.confederationRanking || '-'}</Text>
                <Text style={styles.rankingLabel}>CONCACAF Ranking</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
      
      {/* Quick Navigation Buttons */}
      <View style={styles.navButtonsContainer}>
        <TouchableOpacity style={styles.navButton} onPress={onRosterPress}>
          <Feather name="users" size={24} color="#111827" />
          <Text style={styles.navButtonText}>Squad</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={onFixturesPress}>
          <Feather name="calendar" size={24} color="#111827" />
          <Text style={styles.navButtonText}>Fixtures</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={onStatsPress}>
          <Feather name="bar-chart-2" size={24} color="#111827" />
          <Text style={styles.navButtonText}>Stats</Text>
        </TouchableOpacity>
      </View>
      
      {/* Team Information */}
      <View style={styles.infoSection}>
        {/* Team Bio */}
        <Card style={styles.bioCard}>
          <Text style={styles.sectionTitle}>Team Overview</Text>
          <Text style={styles.bioText}>{team.bio}</Text>
          
          {/* Team Coach */}
          <View style={styles.coachContainer}>
            <Text style={styles.coachLabel}>Head Coach:</Text>
            <Text style={styles.coachName}>{team.coach}</Text>
          </View>
          
          {/* Home Venue */}
          <View style={styles.venueContainer}>
            <Text style={styles.venueLabel}>Home Venue:</Text>
            <Text style={styles.venueName}>{team.homeVenue}</Text>
          </View>
        </Card>
        
        {/* Team Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Team Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.draws}</Text>
              <Text style={styles.statLabel}>Draws</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
          </View>
          
          {team.stats.matches > 0 && (
            <View style={styles.winRateContainer}>
              <Text style={styles.winRateLabel}>Win Rate:</Text>
              <View style={styles.winRateBarContainer}>
                <View 
                  style={[
                    styles.winRateBar, 
                    { 
                      width: `${(team.stats.wins / team.stats.matches) * 100}%`,
                      backgroundColor: team.primaryColor 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.winRateValue}>
                {((team.stats.wins / team.stats.matches) * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </Card>
        
        {/* Team Achievements */}
        {team.achievements && team.achievements.length > 0 && (
          <Card style={styles.achievementsCard}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {team.achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <View style={[styles.achievementBullet, { backgroundColor: team.primaryColor }]} />
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  teamLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  placeholderLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  placeholderText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamConfederation: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  rankingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  rankingItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rankingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  rankingLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rankingDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: -20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navButtonText: {
    marginTop: 8,
    color: '#111827',
    fontWeight: '500',
  },
  infoSection: {
    padding: 16,
  },
  bioCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 16,
  },
  coachContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  coachLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 100,
  },
  coachName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  venueContainer: {
    flexDirection: 'row',
  },
  venueLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 100,
  },
  venueName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  statsCard: {
    marginBottom: 16,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
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
  winRateContainer: {
    marginTop: 8,
  },
  winRateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  winRateBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  winRateBar: {
    height: '100%',
  },
  winRateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
  },
  achievementsCard: {
    padding: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  }
});

export default NationalTeamOverview;