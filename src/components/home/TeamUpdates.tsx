// CIFAMobileApp/src/components/home/TeamUpdates.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TeamStory {
  id: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  colorPrimary: string;
  hasUnreadUpdates: boolean;
}

const TeamUpdates: React.FC = () => {
  // This would come from Firebase in production
  const teamStories: TeamStory[] = [
    {
      id: '1',
      teamId: 'national',
      teamName: 'National',
      teamCode: 'CAY',
      colorPrimary: '#C41E3A',
      hasUnreadUpdates: true,
    },
    {
      id: '2',
      teamId: 'scholars',
      teamName: 'Scholars',
      teamCode: 'SCH',
      colorPrimary: '#C41E3A',
      hasUnreadUpdates: true,
    },
    {
      id: '3',
      teamId: 'elite',
      teamName: 'Elite SC',
      teamCode: 'ELT',
      colorPrimary: '#0A1172',
      hasUnreadUpdates: true,
    },
    {
      id: '4',
      teamId: 'bodden',
      teamName: 'Bodden',
      teamCode: 'BTF',
      colorPrimary: '#0A1172',
      hasUnreadUpdates: false,
    },
    {
      id: '5',
      teamId: 'future',
      teamName: 'Future SC',
      teamCode: 'FSC',
      colorPrimary: '#0A1172',
      hasUnreadUpdates: false,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>TEAM UPDATES</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {teamStories.map(team => (
          <TouchableOpacity key={team.id} style={styles.storyContainer}>
            <LinearGradient
              colors={
                team.hasUnreadUpdates
                  ? ['#3b82f6', '#1d4ed8']
                  : ['#94a3b8', '#64748b']
              }
              style={styles.storyRing}
            >
              <View style={styles.storyImageContainer}>
                <View 
                  style={[
                    styles.teamLogo, 
                    { backgroundColor: team.colorPrimary }
                  ]}
                >
                  <Text style={styles.teamCode}>{team.teamCode}</Text>
                </View>
              </View>
            </LinearGradient>
            <Text style={styles.teamName}>{team.teamName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removed the background color to allow gradient to flow through
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white', // Changed to white for better contrast on gradient
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCode: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  teamName: {
    fontSize: 12,
    marginTop: 4,
    color: 'white', // Changed to white for better contrast on gradient
  },
});

export default TeamUpdates;