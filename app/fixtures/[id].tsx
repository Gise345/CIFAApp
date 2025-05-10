// CIFAMobileApp/app/fixtures/[id].tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

import Header from '../../src/components/common/Header';
import FixtureDetails from '../../src/components/leagues/FixtureDetails';

export default function FixtureDetailsScreen() {
  const { id } = useLocalSearchParams();
  const fixtureId = Array.isArray(id) ? id[0] : id;

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Match Details" showBack={true} />
        
        <View style={styles.content}>
          <FixtureDetails fixtureId={fixtureId} />
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
  },
});