// app/teams/[id]/index.tsx - Updated with TeamLogo component
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Linking
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTeams } from '../../../src/hooks/useTeams';
import { useParams, getParam } from '../../../src/utils/router';
import { LeagueFixture } from '../../../src/services/firebase/leagues';
import TeamLogo from '../../../src/components/common/TeamLogo'; // Import the TeamLogo component

import Card from '../../../src/components/common/Card';
import EnhancedPlayerList from '../../../src/components/teams/EnhancedPlayerList';
import FixtureItem from '../../../src/components/leagues/FixtureItem';
import TeamPlayerStories from '../../../src/components/teams/TeamPlayerStories'; 

const windowWidth = Dimensions.get('window').width;

export default function TeamOverviewScreen() {
  // Use our custom router utility that handles SDK 53 params properly
  const params = useParams();
  const teamId = getParam(params, 'id') || '';
  
  const { 
    selectedTeam, 
    teamPlayers, 
    teamFixtures, 
    selectedLeague,
    teamStanding,
    loading, 
    error, 
    loadTeamData 
  } = useTeams();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Load team data on mount
  useEffect(() => {
    if (teamId) {
      loadTeamData(teamId);
    }
  }, [teamId, loadTeamData]);
  
  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (teamId) {
      await loadTeamData(teamId);
    }
    setRefreshing(false);
  };
  
  // Helper function to get fixtures by status
const getFixturesByStatus = (fixtures: LeagueFixture[] = []) => {
  if (!fixtures || fixtures.length === 0) {
    return { liveFixtures: [], upcomingFixtures: [], pastFixtures: [] };
  }
  
  const now = new Date();
  
  // Helper function to safely convert any date format to a JavaScript Date
  const convertToDate = (dateValue: any): Date => {
    // For Firestore Timestamp objects
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // For standard Date objects
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // For string or number date representations
    try {
      return new Date(dateValue);
    } catch (e) {
      // Fallback to current date if parsing fails
      console.warn('Invalid date format:', dateValue);
      return new Date();
    }
  };
  
  // Find live fixtures
  const liveFixtures = fixtures.filter(fixture => 
    fixture.status === 'live'
  );
  
  // Find upcoming fixtures
  const upcomingFixtures = fixtures.filter(fixture => {
    if (fixture.status !== 'scheduled') return false;
    
    // Convert fixture date to JavaScript Date
    const fixtureDate = convertToDate(fixture.date);
    return fixtureDate > now;
  }).sort((a, b) => {
    // Sort by date ascending
    const dateA = convertToDate(a.date);
    const dateB = convertToDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Find past fixtures
  const pastFixtures = fixtures.filter(fixture => {
    if (fixture.status === 'completed') return true;
    if (fixture.status !== 'scheduled') return false;
    
    // Convert fixture date to JavaScript Date
    const fixtureDate = convertToDate(fixture.date);
    return fixtureDate < now;
  }).sort((a, b) => {
    // Sort by date descending (most recent first)
    const dateA = convertToDate(a.date);
    const dateB = convertToDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  
  return { liveFixtures, upcomingFixtures, pastFixtures };
};
  
  // Get next fixture and last result
  const { liveFixtures, upcomingFixtures, pastFixtures } = getFixturesByStatus(teamFixtures);
  
  const nextFixture = [...liveFixtures, ...upcomingFixtures][0];
  const lastResult = pastFixtures[0];
  
  // Toggle follow team
  const toggleFollow = () => {
    // In a real app, you would update this in the database
    setIsFollowing(!isFollowing);
  };
  
  // Navigate to fixture details
  const navigateToFixture = (fixtureId: string) => {
    router.push(`/fixtures/${fixtureId}`);
  };
  
  // Navigate to view all fixtures
  const handleViewAllFixtures = () => {
    router.push(`/teams/${teamId}/fixtures`);
  };
  
  // Open website
  const openWebsite = (url: string) => {
    if (url.startsWith('http')) {
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://${url}`);
    }
  };
  
  // Open social media
  const openSocialMedia = (url: string) => {
    Linking.openURL(url);
  };
  
  // Render loading state
  if (loading && !refreshing && !selectedTeam) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading team information...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={32} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Team Info */}
      {selectedTeam && (
        <>
          {/* Team Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[selectedTeam.colorPrimary || '#2563eb', '#0A1172']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.heroBg}
            >
              <View style={styles.logoContainer}>
                {/* Replace the old logo code with TeamLogo component */}
                <TeamLogo 
                  teamId={teamId}
                  teamName={selectedTeam.name}
                  size={100}
                  colorPrimary={selectedTeam.colorPrimary || '#2563eb'}
                  style={styles.logoCircle}
                />
              </View>
              
              <View style={styles.teamNameContainer}>
                <Text style={styles.teamName}>{selectedTeam.name}</Text>
                <Text style={styles.teamDivision}>{selectedTeam.division}</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={toggleFollow}
              >
                <Feather 
                  name={isFollowing ? "star" : "star"} 
                  size={18} 
                  color={isFollowing ? "#FFD700" : "white"} 
                  style={styles.followIcon}
                />
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          
          {/* Player Stories */}
          {teamPlayers.length > 0 && (
            <TeamPlayerStories teamId={teamId} players={teamPlayers} />
          )}
          
          {/* Quick Stats */}
          <View style={styles.quickStatsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pastFixtures.length}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {teamPlayers.length}
              </Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {selectedTeam.foundedYear || '-'}
              </Text>
              <Text style={styles.statLabel}>Founded</Text>
            </View>
          </View>
          
          {/* League Info Section */}
          {selectedLeague && (
            <Card style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>LEAGUE</Text>
              </View>
              
              <View style={styles.infoContent}>
                <Text style={styles.leagueName}>{selectedLeague.name}</Text>
                <Text style={styles.leagueSeason}>Season: {selectedLeague.season || '2024-25'}</Text>
                
                {teamStanding && (
                  <View style={styles.standingInfo}>
                    <Text style={styles.standingPosition}>
                      Position: {teamStanding.position || '-'}
                    </Text>
                    <Text style={styles.standingStats}>
                      {teamStanding.played || 0} Played | {teamStanding.won || 0}W - {teamStanding.drawn || 0}D - {teamStanding.lost || 0}L
                    </Text>
                    <Text style={styles.standingPoints}>
                      Points: {teamStanding.points || 0}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}
          
          {/* About Section */}
          <Card style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>ABOUT</Text>
            </View>
            
            <View style={styles.infoContent}>
              {selectedTeam.description && (
                <Text style={styles.description}>
                  {selectedTeam.description}
                </Text>
              )}
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Home Venue</Text>
                  <Text style={styles.detailValue}>{selectedTeam.venue || 'Unknown'}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Division</Text>
                  <Text style={styles.detailValue}>{selectedTeam.division || 'Unknown'}</Text>
                </View>
                
                {selectedTeam.website && (
                  <TouchableOpacity 
                    style={styles.detailItem}
                    onPress={() => openWebsite(selectedTeam.website || '')}
                  >
                    <Text style={styles.detailLabel}>Website</Text>
                    <Text style={styles.linkValue}>{selectedTeam.website}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
          
          {/* Next Fixture & Last Result */}
          <Card style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>FIXTURES</Text>
              <TouchableOpacity onPress={handleViewAllFixtures}>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.fixturesContent}>
              {(nextFixture || lastResult) ? (
                <View>
                  {/* Next Fixture */}
                  {nextFixture && (
                    <View>
                      <Text style={styles.fixtureHeader}>Next Match</Text>
                      <FixtureItem 
                        fixture={nextFixture}
                        showVenue={true}
                        showLeague={true}
                        onPress={() => navigateToFixture(nextFixture.id)}
                      />
                    </View>
                  )}
                  
                  {/* Last Result */}
                  {lastResult && (
                    <View>
                      <Text style={styles.fixtureHeader}>Last Result</Text>
                      <FixtureItem 
                        fixture={lastResult}
                        showVenue={true}
                        showLeague={true}
                        onPress={() => navigateToFixture(lastResult.id)}
                      />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noFixturesContainer}>
                  <Feather name="calendar" size={24} color="#9ca3af" />
                  <Text style={styles.noFixturesText}>No fixtures available</Text>
                </View>
              )}
            </View>
          </Card>
          
          {/* Squad / Players */}
          <Card style={styles.infoCard}> 
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>SQUAD</Text>
              <TouchableOpacity onPress={() => router.push(`/teams/${teamId}/roster`)}>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <EnhancedPlayerList teamId={teamId} showViewAll={false} />
          </Card>
          
          {/* Team Achievements */}
          {selectedTeam.achievements && selectedTeam.achievements.length > 0 && (
            <Card style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>HONOURS</Text>
              </View>
              
              <View style={styles.achievementsContainer}>
                {selectedTeam.achievements.map((achievement: string, index: number) => (
                  <View key={index} style={styles.achievementRow}>
                    <View style={[styles.achievementBullet, { backgroundColor: selectedTeam.colorPrimary || '#2563eb' }]} />
                    <Text style={styles.achievementText}>{achievement}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
          
          {/* Team Social Media */}
          {selectedTeam.socialLinks && Object.keys(selectedTeam.socialLinks || {}).length > 0 && (
            <Card style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>FOLLOW</Text>
              </View>
              
              <View style={styles.socialLinksContainer}>
                {Object.entries(selectedTeam.socialLinks || {}).map(([platform, url]) => (
                  <TouchableOpacity 
                    key={platform} 
                    style={styles.socialButton}
                    onPress={() => openSocialMedia(url as string)}
                  >
                    <Feather 
                      name={getSocialIcon(platform)} 
                      size={20} 
                      color="#2563eb" 
                    />
                    <Text style={styles.socialButtonText}>
                      {getPlatformName(platform)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

// Helper function to get social media icon
const getSocialIcon = (platform: string): any => {
  const platformLower = platform.toLowerCase();
  if (platformLower === 'facebook') return 'facebook';
  if (platformLower === 'twitter' || platformLower === 'x') return 'twitter';
  if (platformLower === 'instagram') return 'instagram';
  if (platformLower === 'youtube') return 'youtube';
  if (platformLower === 'tiktok') return 'video';
  return 'globe';
};

// Helper function to get platform display name
const getPlatformName = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return 'Facebook';
    case 'twitter':
      return 'Twitter';
    case 'x':
      return 'X';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  // Hero section
  heroSection: {
    width: '100%',
  },
  heroBg: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  teamNameContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  teamDivision: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  followIcon: {
    marginRight: 6,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  
  // Quick stats section
  quickStatsSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
  },
  
  // Info cards
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllLink: {
    fontSize: 14,
    color: '#2563eb',
  },
  infoContent: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
    paddingRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  linkValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  
  // Fixtures section
  fixturesContent: {
    paddingBottom: 8,
  },
  fixtureHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  noFixturesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFixturesText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Achievements section
  achievementsContainer: {
    padding: 16,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  
  // Social links section
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  // League section styles
  leagueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  leagueSeason: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  standingInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  standingPosition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  standingStats: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  standingPoints: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
});