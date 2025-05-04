// CIFAMobileApp/src/components/home/MatchRecap.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av'; // Import ResizeMode enum from expo-av
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface VideoItemProps {
  title: string;
  date: string;
  videoSource: any;
  badge: {
    text: string;
    colors: string[];
  };
  onPress?: () => void;
}

interface MatchRecapProps {
  onViewAll?: () => void;
}

// Individual Video Card Component
const VideoCard: React.FC<VideoItemProps> = ({ title, date, videoSource, badge, onPress }) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <View style={styles.recapContainer}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={videoSource}
          style={styles.video}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          isLooping
          onPlaybackStatusUpdate={(status: any) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            }
          }}
        />
        
        {!isPlaying && (
          <TouchableOpacity 
            style={styles.playButtonContainer}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <View style={styles.playButton}>
              <Feather name="play" size={24} color="white" />
            </View>
          </TouchableOpacity>
        )}
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.titleGradient}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </LinearGradient>
        
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={badge.colors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>{badge.text}</Text>
          </LinearGradient>
        </View>

        {isPlaying && (
          <TouchableOpacity 
            style={styles.pauseButtonContainer} 
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <View style={styles.pauseButton}>
              <Feather name="pause" size={16} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const MatchRecap: React.FC<MatchRecapProps> = ({ onViewAll }) => {
  // Use local video file - will be loaded from assets
  const localVideo = require('../../../assets/images/bt-boys.mp4');
  const localVideo2 = require('../../../assets/images/charley.mp4');
  const localVideo3 = require('../../../assets/images/bts.mp4');
  const localVideo4 = require('../../../assets/images/mike.mp4');
  const localVideo5 = require('../../../assets/images/coach.mp4');
   
  // Mock data for multiple videos
  const videos: VideoItemProps[] = [
    {
      title: "Bodden Town Wins CIFA President Cup",
      date: "April 12, 2025",
      videoSource: localVideo,
      badge: {
        text: "MATCH RECAP",
        colors: ['#0A1172', '#2F4CB3']
      }
    },
    {
      title: "Academy's Women Celebrating Victory",
      date: "March 10, 2025",
      videoSource: localVideo2,
      badge: {
        text: "Match Recap",
        colors: ['#B51546', '#FF0844']
      }
    },
    {
      title: "BTS - Cayman's Men National Team ",
      date: "April 8, 2025",
      videoSource: localVideo3,
      badge: {
        text: "Behind the Scenes",
        colors: ['#0A1172', '#2F4CB3']
      }
    },
    {
      title: "Head Coach's Michael Johnson / Post-Match Interview",
      date: "April 5, 2025",
      videoSource: localVideo4,
      badge: {
        text: "Interview",
        colors: ['#0A1172', '#2F4CB3']
      }
    },
    {
      title: "CMNT Showcasing skills in Portugal",
      date: "April 5, 2025",
      videoSource: localVideo5,
      badge: {
        text: "Interview",
        colors: ['#0A1172', '#2F4CB3']
      }
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>RECENT HIGHLIGHTS</Text>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all</Text>
          <Feather name="chevron-right" size={16} color="#60a5fa" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoCardsContainer}
        snapToInterval={196} // Width of card + horizontal margin
        decelerationRate="fast"
        snapToAlignment="start"
        disableIntervalMomentum={true}
      >
        {videos.map((video, index) => (
          <VideoCard
            key={index}
            title={video.title}
            date={video.date}
            videoSource={video.videoSource}
            badge={video.badge}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#60a5fa',
    marginRight: 4,
  },
  videoCardsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  recapContainer: {
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 180, // Fixed width for more vertical look
  },
  videoContainer: {
    height: 320, // Taller height for vertical video appearance
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(67, 97, 238, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  pauseButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  pauseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default MatchRecap;