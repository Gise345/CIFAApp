// CIFAMobileApp/app/(tabs)/index.tsx
import React from 'react';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../src/components/common/Header';
import TeamUpdates from '../../src/components/home/TeamUpdates';
import FeaturedMatch from '../../src/components/home/FeaturedMatch';
import UpcomingFixtures from '../../src/components/home/upcomingFixtures';
import LiveStreamButton from '../../src/components/home/LiveStreamButton';
import MatchRecap from '../../src/components/home/MatchRecap';
import NewsList from '../../src/components/home/NewsList';
import { router } from 'expo-router';

export default function HomeScreen() {
  // Handle navigation to different sections
  const handleLiveStreamPress = () => {
    // This would open the live stream when implemented
    console.log('Live stream button pressed');
  };
  
  const handleViewAllHighlights = () => {
    // Navigate to the highlights page
    router.push('/highlights');
  };
  
  const handleViewAllNews = () => {
    // Navigate to news page
    router.push('/news');
  };

  const handleViewAllFixtures = () => {
    // Navigate to fixtures page
    router.push('/fixtures');
  };

  return (
    <LinearGradient
      colors={['#E50914', '#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <Header title="CIFA" showNotification={true} showMenu={true} />
        <ScrollView style={styles.scrollView}>
          {/* Team Updates */}
          <TeamUpdates />
          
          {/* Instagram Highlights */}
          <MatchRecap onViewAll={handleViewAllHighlights} />
          
          {/* Featured Match */}
          <FeaturedMatch />
          
          {/* Live Stream Button */}
          <LiveStreamButton onPress={handleLiveStreamPress} />
          
          {/* Upcoming Fixtures */}
          <UpcomingFixtures onViewAll={handleViewAllFixtures} />
          
          {/* Latest News */}
          <NewsList onViewAll={handleViewAllNews} />
          
          {/* Add padding at the bottom for better scrolling */}
          <View style={styles.bottomPadding} />
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
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 30,
  },
});