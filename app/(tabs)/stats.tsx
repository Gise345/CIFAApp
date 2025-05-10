// CIFAMobileApp/app/(tabs)/stats.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import LeagueTable from '../../src/components/tables/LeagueTable';
import LeagueSelector from '../../src/components/leagues/LeagueSelector';
import TopScorers from '../../src/components/tables/TopScorers';
import Card from '../../src/components/common/Card';
import { LEAGUE_CATEGORIES, LeagueCategory } from '../../src/constants/LeagueTypes';
import { goToLeague, router } from '../../src/utils/router';

export default function StatsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<LeagueCategory>(LEAGUE_CATEGORIES[0]);
  
  // Handle when a league category is selected
  const handleCategorySelect = (category: LeagueCategory) => {
    setSelectedCategory(category);
  };
  
  // Navigation to full league tables
  const navigateToLeagueStandings = () => {
    // Use string navigation pattern which is compatible with SDK 53
    goToLeague(`${selectedCategory.id}/standings`);
  };
  
  // Navigation to league fixtures
  const navigateToLeagueFixtures = () => {
    // Use string navigation pattern which is compatible with SDK 53
    goToLeague(`${selectedCategory.id}/fixtures`);
  };
  
  // Navigation to league results
  const navigateToLeagueResults = () => {
    // Use string navigation pattern which is compatible with SDK 53
    goToLeague(`${selectedCategory.id}/results`);
  };
  
  // Navigation to top scorers
  const navigateToTopScorers = () => {
    // Use string navigation with query parameter
    const path = `/stats/top-scorers?categoryId=${selectedCategory.id}`;
    // router.push can work with string paths directly
    router.push(path);
  };

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Statistics" />
        
        {/* League Selector */}
        <LeagueSelector 
          selectedCategoryId={selectedCategory.id}
          onSelectCategory={handleCategorySelect}
        />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* League Title */}
          <View style={styles.leagueHeader}>
            <Text style={styles.leagueTitle}>{selectedCategory.label}</Text>
            <Text style={styles.seasonText}>2024-25 Season</Text>
          </View>
          
          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={navigateToLeagueStandings}
            >
              <View style={styles.quickLinkIcon}>
                <Feather name="list" size={24} color="white" />
              </View>
              <Text style={styles.quickLinkText}>Table</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={navigateToLeagueFixtures}
            >
              <View style={styles.quickLinkIcon}>
                <Feather name="calendar" size={24} color="white" />
              </View>
              <Text style={styles.quickLinkText}>Fixtures</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLink}
              onPress={navigateToLeagueResults}
            >
              <View style={styles.quickLinkIcon}>
                <Feather name="check-square" size={24} color="white" />
              </View>
              <Text style={styles.quickLinkText}>Results</Text>
            </TouchableOpacity>
          </View>
          
          {/* League Table */}
          <LeagueTable 
            leagueId={selectedCategory.id} 
            onViewFullTable={navigateToLeagueStandings}
          />
          
          {/* Top Scorers */}
          <TopScorers 
            categoryId={selectedCategory.id}
            onViewAll={navigateToTopScorers}
          />
          
          {/* Team Stats */}
          <Card style={styles.statsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>TEAM STATS</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statLabel}>
                <Text style={styles.statLabelText}>Most Goals</Text>
              </View>
              <View style={styles.statValue}>
                <View style={[styles.teamDot, { backgroundColor: '#16a34a' }]} />
                <Text style={styles.statValueText}>Elite SC (28)</Text>
              </View>
              <View style={styles.statBar}>
                <View style={[styles.statBarFill, { width: '85%', backgroundColor: '#16a34a' }]} />
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statLabel}>
                <Text style={styles.statLabelText}>Best Defense</Text>
              </View>
              <View style={styles.statValue}>
                <View style={[styles.teamDot, { backgroundColor: '#1e40af' }]} />
                <Text style={styles.statValueText}>Scholars (7 conceded)</Text>
              </View>
              <View style={styles.statBar}>
                <View style={[styles.statBarFill, { width: '75%', backgroundColor: '#1e40af' }]} />
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statLabel}>
                <Text style={styles.statLabelText}>Most Clean Sheets</Text>
              </View>
              <View style={styles.statValue}>
                <View style={[styles.teamDot, { backgroundColor: '#16a34a' }]} />
                <Text style={styles.statValueText}>Elite SC (6)</Text>
              </View>
              <View style={styles.statBar}>
                <View style={[styles.statBarFill, { width: '65%', backgroundColor: '#16a34a' }]} />
              </View>
            </View>
          </Card>
          
          {/* Player of the Month */}
          <LinearGradient
            colors={['#2563eb', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playerCard}
          >
            <Text style={styles.playerCardTitle}>PLAYER OF THE MONTH</Text>
            <View style={styles.playerInfo}>
              <View style={styles.playerImageContainer}>
                <View style={styles.playerImage}>
                  {/* Player image would go here */}
                </View>
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>Mark Ebanks</Text>
                <Text style={styles.playerTeam}>Elite SC / Forward</Text>
                <View style={styles.playerStats}>
                  <View style={styles.playerStat}>
                    <Feather name="award" size={14} color="white" style={styles.statIcon} />
                    <Text style={styles.playerStatText}>5 Goals</Text>
                  </View>
                  <View style={styles.playerStat}>
                    <Feather name="heart" size={14} color="white" style={styles.statIcon} />
                    <Text style={styles.playerStatText}>3 Assists</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  leagueHeader: {
    marginBottom: 16,
  },
  leagueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  seasonText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  quickLinks: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  quickLinkIcon: {
    marginBottom: 4,
  },
  quickLinkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statsCard: {
    marginVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 12,
    color: '#2563eb',
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    marginBottom: 4,
  },
  statLabelText: {
    fontSize: 14,
    color: '#4b5563',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statValueText: {
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
  playerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  playerCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  playerInfo: {
    flexDirection: 'row',
  },
  playerImageContainer: {
    marginRight: 16,
  },
  playerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  playerTeam: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  playerStats: {
    flexDirection: 'row',
  },
  playerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    marginRight: 4,
  },
  playerStatText: {
    fontSize: 12,
    color: 'white',
  },
});