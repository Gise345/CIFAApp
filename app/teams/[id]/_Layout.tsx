// CIFAMobileApp/app/teams/[id]/_layout.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTeams } from '../../../src/hooks/useTeams';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParams, getParam, goBack } from '../../../src/utils/router';

export default function TeamLayout() {
  // Use the new params approach for SDK 53
  const params = useParams();
  const teamId = getParam(params, 'id') || '';
  
  const { selectedTeam, loading, error, fetchTeamById } = useTeams();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Load team data on mount
  useEffect(() => {
    loadTeamData();
  }, [teamId]);
  
  const loadTeamData = async () => {
    if (teamId) {
      // Load team details if not already loaded
      if (!selectedTeam || selectedTeam.id !== teamId) {
        await fetchTeamById(teamId);
      }
    }
  };
  
  // Get primary color from team data or use default
  const getPrimaryColor = () => {
    if (selectedTeam?.colorPrimary) {
      return selectedTeam.colorPrimary;
    }
    return '#2563eb'; // Default blue
  };
  
  // Toggle team follow status
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    // In a real app, you would update this in a database
  };
  
  // Get team initials
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
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[getPrimaryColor(), '#191970', '#041E42']} // Start with team color, fade to standard app background
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => goBack()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Team Header Content */}
          <View style={styles.teamHeaderContent}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : error ? (
              <Text style={styles.errorText}>
                Error loading team
              </Text>
            ) : selectedTeam ? (
              <View style={styles.teamInfoContainer}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoText}>
                    {getTeamInitials(selectedTeam.name)}
                  </Text>
                </View>
                <View style={styles.teamTextContainer}>
                  <Text style={styles.teamName}>
                    {selectedTeam.name}
                  </Text>
                  <Text style={styles.teamDivision}>
                    {selectedTeam.division || 'Team'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.loadingText}>
                Loading team...
              </Text>
            )}
          </View>
          
          {/* Follow Button */}
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={toggleFollow}
          >
            <Feather 
              name={isFollowing ? "star" : "star"} 
              size={20} 
              color={isFollowing ? "#FFD700" : "white"} 
            />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Tab Navigator */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: getPrimaryColor(),
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: 'white',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarIconStyle: {
            marginBottom: 3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Overview",
            tabBarIcon: ({ color }) => (
              <Feather name="info" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="roster"
          options={{
            title: "Squad",
            tabBarIcon: ({ color }) => (
              <Feather name="users" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="fixtures"
          options={{
            title: "Fixtures",
            tabBarIcon: ({ color }) => (
              <Feather name="calendar" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color }) => (
              <Feather name="bar-chart-2" size={20} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  gradient: {
    paddingTop: 20, // For status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamHeaderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  teamInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamTextContainer: {
    flexDirection: 'column',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  teamDivision: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
  },
  errorText: {
    fontSize: 14,
    color: 'white',
  },
});