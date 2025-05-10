// src/components/teams/TeamFixtures.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

import Card from '../common/Card';
import Section from '../common/Section';
import FixtureItem from '../matches/FixtureItem'; // This expects a different type
import { useTeams } from '../../hooks/useTeams';
import { goToFixture } from '../../utils/router';
import { LeagueFixture } from '../../services/firebase/leagues';

// Define the Fixture type expected by FixtureItem component
interface Team {
  id: string;
  name: string;
  code: string;
  logo?: string;
  primaryColor: string;
}

interface Fixture {
  id: string;
  date: string;
  time: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  venue?: string;
  status?: 'scheduled' | 'live' | 'completed';
  homeScore?: number;
  awayScore?: number;
}

// Function to convert LeagueFixture to Fixture type
const convertToFixture = (leagueFixture: LeagueFixture): Fixture => {
  // Format date if it's a Firestore timestamp
  const fixtureDate = leagueFixture.date instanceof Date 
    ? leagueFixture.date 
    : leagueFixture.date.toDate();
  
  return {
    id: leagueFixture.id,
    date: format(fixtureDate, 'MMM d, yyyy'),
    time: format(fixtureDate, 'h:mm a'),
    competition: leagueFixture.competition || 'League Match',
    homeTeam: {
      id: leagueFixture.homeTeamId,
      name: leagueFixture.homeTeamName,
      code: getTeamCode(leagueFixture.homeTeamName),
      logo: leagueFixture.homeTeamLogo,
      primaryColor: '#2563eb' // Default blue if no color provided
    },
    awayTeam: {
      id: leagueFixture.awayTeamId,
      name: leagueFixture.awayTeamName,
      code: getTeamCode(leagueFixture.awayTeamName),
      logo: leagueFixture.awayTeamLogo,
      primaryColor: '#ef4444' // Default red if no color provided
    },
    venue: leagueFixture.venue,
    status: leagueFixture.status as 'scheduled' | 'live' | 'completed',
    homeScore: leagueFixture.homeScore,
    awayScore: leagueFixture.awayScore
  };
};

// Helper to create a team code from name
const getTeamCode = (teamName: string): string => {
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

interface TeamFixturesProps {
  teamId: string;
  limit?: number;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

const TeamFixtures: React.FC<TeamFixturesProps> = ({
  teamId,
  limit = 3,
  showViewAll = true,
  onViewAllPress
}) => {
  const { fetchTeamFixtures, getFixturesByStatus, loading, error } = useTeams();
  const [fixtures, setFixtures] = useState<LeagueFixture[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Load fixtures data on mount
  useEffect(() => {
    const loadFixtures = async () => {
      try {
        const fixturesData = await fetchTeamFixtures(teamId);
        setFixtures(fixturesData);
      } catch (err) {
        console.error('Error loading fixtures:', err);
      }
    };
    
    if (teamId) {
      loadFixtures();
    }
  }, [teamId, fetchTeamFixtures]);
  
  // Get fixtures by status
  const { liveFixtures, upcomingFixtures, pastFixtures } = getFixturesByStatus(fixtures);
  
  // Get fixtures based on active tab
  const displayFixtures = activeTab === 'upcoming' 
    ? [...liveFixtures, ...upcomingFixtures].slice(0, limit) 
    : pastFixtures.slice(0, limit);
  
  // Handle fixture press
  const handleFixturePress = (fixtureId: string) => {
    goToFixture(fixtureId);
  };
  
  // Handle view all
  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    }
  };
  
  return (
    <Section
      title={activeTab === 'upcoming' ? 'UPCOMING FIXTURES' : 'RECENT RESULTS'}
      viewAllText={showViewAll ? "View All" : undefined}
      onViewAll={showViewAll ? handleViewAll : undefined}
      style={styles.section}
    >
      <Card style={styles.card}>
        {/* Tab selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Results
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Loading state */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading fixtures...</Text>
          </View>
        )}
        
        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Fixtures list */}
        {!loading && !error && (
          <>
            {displayFixtures.length > 0 ? (
              <FlatList
                data={displayFixtures}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <FixtureItem 
                    fixture={convertToFixture(item)}  // Convert to expected type
                    onPress={() => handleFixturePress(item.id)}
                  />
                )}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="calendar" size={24} color="#9ca3af" />
                <Text style={styles.emptyText}>
                  {activeTab === 'upcoming' 
                    ? 'No upcoming fixtures' 
                    : 'No recent results'}
                </Text>
              </View>
            )}
          </>
        )}
      </Card>
    </Section>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  listContent: {
    paddingBottom: 8,
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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
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
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default TeamFixtures;