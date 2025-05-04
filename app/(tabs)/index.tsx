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
import { useRouter } from 'expo-router';

export default function LatestScreen() {
  const router = useRouter();
  
  const handleLiveStreamPress = () => {
    // This would open the live stream when implemented
    console.log('Live stream button pressed');
  };
  
  const handleMatchRecapPress = () => {
    // This would open the match recap video player when implemented
    console.log('Match recap pressed');
  };
  
  const handleViewAllVideos = () => {
    // This would navigate to the videos library when implemented
    console.log('View all videos pressed');
  };
  
  const handleViewAllNews = () => {
    // Navigate to news page when implemented
    console.log('View all news pressed');
  };

  const handleViewAllFixtures = () => {
    // Navigate to fixtures page when implemented
    console.log('View all fixtures pressed');
  };

  return (
    <LinearGradient
      colors={[ '#E50914' ,'#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <Header title="CIFA" showNotification={true} showMenu={true} />
        <ScrollView style={styles.scrollView}>
          <TeamUpdates />
          <MatchRecap 
            
            onViewAll={handleViewAllVideos}
          />
          <FeaturedMatch />
          <LiveStreamButton onPress={handleLiveStreamPress} />
          <UpcomingFixtures onViewAll={handleViewAllFixtures} />
          
          
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