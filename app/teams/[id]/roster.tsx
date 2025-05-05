// CIFAMobileApp/app/teams/[id]/roster.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView,
  ScrollView,
  Text
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../../src/components/common/Header';
import TeamRoster from '../../../src/components/teams/TeamRoster';

// Simple utility to get team ID from URL
const getTeamIdFromPath = (): string => {
  // In a production app, you would parse the path segments 
  // For now, we'll return a default value
  return 'team1';
};

export default function TeamRosterScreen() {
  // Get the team ID from the URL path
  const teamId = getTeamIdFromPath();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Team Squad" showBack={true} />
        <View style={styles.content}>
          <TeamRoster teamId={teamId} />
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
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  }
});