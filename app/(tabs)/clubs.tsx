// CIFAMobileApp/app/(tabs)/clubs.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  SectionList,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import TeamLogo from '../../src/components/common/TeamLogo';
import { useTeams } from '../../src/hooks/useTeams';
import { Team } from '../../src/types/team';
import { useAuth } from '../../src/hooks/useAuth';

// Structure for the sections in our list
interface SectionData {
  title: string;
  data: Team[];
  type: 'followed' | 'league';
  leagueId?: string;
}

export default function ClubsScreen() {
  const router = useRouter();
  const { fetchTeams, teams, loading } = useTeams();
  const { user } = useAuth();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [followedTeams, setFollowedTeams] = useState<Team[]>([]);
  
  // Load teams data on mount
  useEffect(() => {
    loadTeams();
  }, []);
  
  // Load teams grouped by division
  const loadTeams = async () => {
    try {
      // Fetch all teams to start with
      await fetchTeams();
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };
  
  // Process teams into sections when teams data changes
  useEffect(() => {
    if (teams.length > 0) {
      // Group teams by division
      const teamsByDivision: Record<string, Team[]> = {};
      teams.forEach(team => {
        const division = team.division || 'Other';
        if (!teamsByDivision[division]) {
          teamsByDivision[division] = [];
        }
        teamsByDivision[division].push(team);
      });
      
      // Sort divisions to ensure Men's Premier, then Women's Premier come first
      const sortedDivisions = Object.keys(teamsByDivision).sort((a, b) => {
        if (a === "Men's Premier League") return -1;
        if (b === "Men's Premier League") return 1;
        if (a === "Women's Premier League") return -1;
        if (b === "Women's Premier League") return 1;
        return a.localeCompare(b);
      });
      
      // Build sections array
      const newSections: SectionData[] = [];
      
      // Add "Teams You Follow" section at the top (if logged in)
      if (user) {
        // In a real app, you would fetch the user's followed teams from a database
        // For now, we'll just use a sample
        const mockFollowedTeams = teams.filter(team => 
          ['elite', 'scholars'].includes(team.id)
        );
        
        setFollowedTeams(mockFollowedTeams);
        
        newSections.push({
          title: 'Teams You Follow',
          data: mockFollowedTeams.length > 0 ? mockFollowedTeams : [],
          type: 'followed'
        });
      }
      
      // Add each division as a section
      sortedDivisions.forEach(division => {
        newSections.push({
          title: division,
          data: teamsByDivision[division],
          type: 'league',
          leagueId: getLeagueIdFromDivision(division)
        });
      });
      
      setSections(newSections);
    }
  }, [teams, user]);
  
  // Navigate to team detail
  const handleTeamPress = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };
  
  // Add team to followed teams
  const handleFollowTeam = (team: Team) => {
    // In a real app, you would update the user's database record
    // For now, we'll just update the state
    setFollowedTeams(prev => [...prev, team]);
    
    // Update the sections to reflect this change
    setSections(prev => {
      const updated = [...prev];
      // Find the "Teams You Follow" section
      const followedSection = updated.find(section => section.type === 'followed');
      if (followedSection) {
        // Add the team if it's not already there
        if (!followedSection.data.some(t => t.id === team.id)) {
          followedSection.data = [...followedSection.data, team];
        }
      }
      return updated;
    });
  };
  
  // Remove team from followed teams
  const handleUnfollowTeam = (teamId: string) => {
    // In a real app, you would update the user's database record
    // For now, we'll just update the state
    setFollowedTeams(prev => prev.filter(team => team.id !== teamId));
    
    // Update the sections to reflect this change
    setSections(prev => {
      const updated = [...prev];
      // Find the "Teams You Follow" section
      const followedSection = updated.find(section => section.type === 'followed');
      if (followedSection) {
        followedSection.data = followedSection.data.filter(team => team.id !== teamId);
      }
      return updated;
    });
  };
  
  // Render a team item
  const renderTeam = (team: Team, isFollowed: boolean) => (
    <TouchableOpacity
      style={styles.teamItem}
      onPress={() => handleTeamPress(team.id)}
    >
      <View style={styles.teamInfo}>
        <TeamLogo
          teamId={team.id}
          teamCode={getTeamInitials(team.name)}
          colorPrimary={team.colorPrimary}
          size="small"
        />
        <Text style={styles.teamName}>{team.name}</Text>
      </View>
      
      {user && (
        <TouchableOpacity
          style={styles.followButton}
          onPress={() => isFollowed ? handleUnfollowTeam(team.id) : handleFollowTeam(team)}
        >
          <Feather 
            name={isFollowed ? "star" : "star"} 
            size={18} 
            color={isFollowed ? "#FFD700" : "#94a3b8"} 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
  
  // Empty component for "Teams You Follow" section
  const renderEmptyFollowSection = () => (
    <View style={styles.emptyFollowContainer}>
      <Feather name="star" size={24} color="#94a3b8" />
      <Text style={styles.emptyFollowText}>
        Follow your favorite teams for quick access
      </Text>
      <Text style={styles.emptyFollowSubtext}>
        Tap the star icon next to any team to add it here
      </Text>
    </View>
  );
  
  // Render a section header
  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      
      {section.leagueId && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push(`/leagues/${section.leagueId}/standings`)}
        >
          <Text style={styles.viewAllText}>View Table</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Clubs" />
        
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading clubs...</Text>
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={({ item, section }) => 
                renderTeam(
                  item, 
                  section.type === 'followed' || followedTeams.some(t => t.id === item.id)
                )
              }
              renderSectionHeader={renderSectionHeader}
              ListHeaderComponent={
                <View style={styles.intro}>
                  <Text style={styles.introTitle}>Football Clubs</Text>
                  <Text style={styles.introSubtitle}>
                    Find and follow your favorite teams
                  </Text>
                </View>
              }
              ListFooterComponent={<View style={styles.footer} />}
              stickySectionHeadersEnabled={true}
              renderSectionFooter={({ section }) => 
                section.type === 'followed' && section.data.length === 0 
                  ? renderEmptyFollowSection() 
                  : null
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

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

// Helper function to map division names to league IDs
const getLeagueIdFromDivision = (division: string): string => {
  const mapping: Record<string, string> = {
    "Men's Premier League": "mensPremier",
    "Women's Premier League": "womensPremier",
    "Men's First Division": "mensFirstDiv",
    "Youth U-17": "youthU17",
    "Youth U-15": "youthU15",
  };
  
  return mapping[division] || '';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  intro: {
    padding: 16,
    paddingTop: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  viewAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: '#4b5563',
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 12,
  },
  followButton: {
    padding: 8,
  },
  emptyFollowContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  emptyFollowText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyFollowSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    height: 20,
  },
});