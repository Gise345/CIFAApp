// app/(tabs)/national/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import NationalTeamSelector from '../../src/components/national/NationalTeamSelector';
import NationalTeamOverview from '../../src/components/national/NationalTeamOverview';
import NationalTeamPlayers from '../../src/components/national/NationalTeamPlayers';
import NationalTeamMatches from '../../src/components/national/NationalTeamMatches';
import { useNationalTeam } from '../../src/hooks/useNationalTeam';

type TeamType = 'mens' | 'womens' | 'youth-u17' | 'youth-u20';
type TabType = 'overview' | 'players' | 'matches';

export default function NationalTeamScreen() {
  const router = useRouter();
  const [activeTeam, setActiveTeam] = useState<TeamType>('mens');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const {
    team, 
    matches, 
    players, 
    ranking, 
    loading, 
    error,
    fetchTeamData,
    fetchMatches,
    fetchPlayers,
    fetchRanking
  } = useNationalTeam();

  useEffect(() => {
    loadTeamData();
  }, [activeTeam]);

  const loadTeamData = async () => {
    // Load all team data when team changes
    await fetchTeamData(activeTeam);
    await fetchMatches(activeTeam);
    await fetchPlayers(activeTeam);
    
    // Only fetch ranking for men's and women's teams
    if (activeTeam === 'mens' || activeTeam === 'womens') {
      await fetchRanking(activeTeam);
    }
  };

  const handleTeamChange = (teamType: TeamType) => {
    setActiveTeam(teamType);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    const teamColor = team?.primaryColor || '#C41E3A'; // Default to Cayman Islands red
    
    switch (activeTab) {
      case 'overview':
        return (
          <NationalTeamOverview
            team={team}
            ranking={ranking}
            loading={loading}
            error={error}
            onRosterPress={() => setActiveTab('players')}
            onFixturesPress={() => setActiveTab('matches')}
            onStatsPress={() => setActiveTab('matches')}
          />
        );
      case 'players':
        return (
          <NationalTeamPlayers
            players={players}
            loading={loading}
            error={error}
            teamPrimaryColor={teamColor}
          />
        );
      case 'matches':
        return (
          <NationalTeamMatches
            matches={matches}
            loading={loading}
            error={error}
            teamPrimaryColor={teamColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={team ? [team.primaryColor, team.secondaryColor] : ['#C41E3A', '#00448E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="National Teams" />
        
        {/* Team Selector */}
        <NationalTeamSelector 
          activeTeam={activeTeam}
          onTeamChange={handleTeamChange}
        />
        
        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'overview' && [styles.activeTab, { borderColor: team?.primaryColor || '#C41E3A' }]
            ]}
            onPress={() => handleTabChange('overview')}
          >
            <Feather 
              name="info" 
              size={20} 
              color={activeTab === 'overview' ? (team?.primaryColor || '#C41E3A') : 'white'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'overview' && { color: team?.primaryColor || '#C41E3A' }
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'players' && [styles.activeTab, { borderColor: team?.primaryColor || '#C41E3A' }]
            ]}
            onPress={() => handleTabChange('players')}
          >
            <Feather 
              name="users" 
              size={20} 
              color={activeTab === 'players' ? (team?.primaryColor || '#C41E3A') : 'white'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'players' && { color: team?.primaryColor || '#C41E3A' }
              ]}
            >
              Players
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'matches' && [styles.activeTab, { borderColor: team?.primaryColor || '#C41E3A' }]
            ]}
            onPress={() => handleTabChange('matches')}
          >
            <Feather 
              name="calendar" 
              size={20} 
              color={activeTab === 'matches' ? (team?.primaryColor || '#C41E3A') : 'white'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'matches' && { color: team?.primaryColor || '#C41E3A' }
              ]}
            >
              Matches
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Content Area */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 6,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  }
});