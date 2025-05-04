// CIFAMobileApp/app/leagues/[id]/standings.tsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Header from '../../../src/components/common/Header';
import LeagueTable from '../../../src/components/tables/LeagueTable';

export default function LeagueStandingsScreen() {
  const { id } = useLocalSearchParams();
  const leagueId = Array.isArray(id) ? id[0] : id;

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="League Standings" showBack={true} />
        <ScrollView style={styles.content}>
          <LeagueTable leagueId={leagueId} />
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
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
});