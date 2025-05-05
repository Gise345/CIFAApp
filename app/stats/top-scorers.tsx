// CIFAMobileApp/app/stats/top-scorers.tsx
import React from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../src/components/common/Header';
import TopScorers from '../../src/components/tables/TopScorers';

// Simple utility to get category from URL
const getCategoryFromUrl = (): string => {
  // In SDK 53, params extraction is different
  // This is a workaround (in a real implementation you would parse the URL)
  return 'mensPremier';
};

export default function TopScorersScreen() {
  // Get category from URL
  const categoryId = getCategoryFromUrl();

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Top Scorers" showBack={true} />
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <TopScorers 
              categoryId={categoryId} 
            />
          </View>
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
  },
  section: {
    padding: 16,
  }
});