// CIFAMobileApp/app/teams/[id]/players.tsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Header from '../../common/Header';
import PlayerList from '../../teams/PlayerList';

export default function TeamPlayersScreen() {
  const { id } = useLocalSearchParams();
  const teamId = Array.isArray(id) ? id[0] : id;

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Team Squad" showBack={true} />
        <ScrollView style={styles.content}>
          <PlayerList teamId={teamId} showViewAll={false} />
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