// CIFAMobileApp/app/leagues/[id]/results.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Header from '../../../src/components/common/Header';
import Section from '../../../src/components/common/Section';
import Card from '../../../src/components/common/Card';

export default function LeagueResultsScreen() {
  const { id } = useLocalSearchParams();
  const leagueId = Array.isArray(id) ? id[0] : id;

  // In a real app, this data would come from Firebase based on leagueId
  const leagueName = leagueId === 'mensPremier' 
    ? "Men's Premier League" 
    : leagueId === 'womensPremier'
      ? "Women's Premier League"
      : "League";

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Recent Results" showBack={true} />
        <ScrollView style={styles.content}>
          <Section title={leagueName.toUpperCase()} style={styles.section}>
            <Card>
              <Text style={styles.recentText}>Recent Results</Text>
              
              {/* This would be replaced with a proper results component */}
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Results for {leagueName} will appear here</Text>
              </View>
            </Card>
          </Section>
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
  section: {
    marginBottom: 16,
  },
  recentText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  placeholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});