// src/components/home/MatchRecap.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator 
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  fetchInstagramPosts, 
  InstagramMedia, 
  getPostTitle, 
  formatInstagramDate,
  getPostBadgeInfo
} from '../../services/instagram/instagramService';

interface MatchRecapProps {
  onViewAll?: () => void;
}

// Individual Media Card Component
const MediaCard: React.FC<{ media: InstagramMedia }> = ({ media }) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Get post details
  const title = getPostTitle(media.caption);
  const date = formatInstagramDate(media.timestamp);
  const badge = getPostBadgeInfo(media);
  
  // Handle play/pause for videos
  const handlePlayPause = () => {
    if (media.media_type !== 'VIDEO' || !videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Open Instagram link when card is pressed
  const handlePress = () => {
    if (media.permalink) {
      // For a full app, you'd use Linking.openURL here
      console.log(`Opening Instagram link: ${media.permalink}`);
    }
  };
  
  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };
  
  const handleLoadEnd = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setLoading(false);
    setError(true);
  };
  
  return (
    <View style={styles.recapContainer}>
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Media Content (Image or Video) */}
        {media.media_type === 'VIDEO' ? (
          <>
            <Video
              ref={videoRef}
              source={{ uri: media.media_url }}
              style={styles.video}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              isLooping
              onPlaybackStatusUpdate={(status: any) => {
                if (status.isLoaded) {
                  setIsPlaying(status.isPlaying);
                  setLoading(false);
                }
              }}
              onLoadStart={handleLoadStart}
              onError={handleError}
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
          </>
        ) : (
          <Image 
            source={{ 
              uri: media.media_url || media.thumbnail_url || 'https://dummyimage.com/600x400/000/fff&text=CIFA'
            }} 
            style={styles.image}
            onLoadStart={handleLoadStart}
            onLoad={handleLoadEnd}
            onError={handleError}
          />
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={24} color="white" />
            <Text style={styles.errorText}>Media unavailable</Text>
          </View>
        )}
        
        {/* Title Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.titleGradient}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </LinearGradient>
        
        {/* Badge */}
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
      </TouchableOpacity>
    </View>
  );
};

const MatchRecap: React.FC<MatchRecapProps> = ({ onViewAll }) => {
  const [posts, setPosts] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Handle navigation to All Highlights page
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push('/highlights');
    }
  };
  
  // Fetch Instagram posts on component mount
  useEffect(() => {
    const loadInstagramPosts = async () => {
      try {
        setLoading(true);
        const instagramPosts = await fetchInstagramPosts(10);
        setPosts(instagramPosts);
        setError(false);
      } catch (err) {
        console.error('Error loading Instagram posts:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadInstagramPosts();
  }, []);
  
  // Show loading spinner while fetching posts
  if (loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>RECENT HIGHLIGHTS</Text>
        </View>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading highlights...</Text>
        </View>
      </View>
    );
  }
  
  // Show error if fetch failed
  if (error && posts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>RECENT HIGHLIGHTS</Text>
        </View>
        <View style={styles.errorWrapper}>
          <Feather name="alert-circle" size={24} color="white" />
          <Text style={styles.errorText}>Couldn't load highlights</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>RECENT HIGHLIGHTS</Text>
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
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
        {posts.map((post) => (
          <MediaCard key={post.id} media={post} />
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  loadingWrapper: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 8,
  },
  errorWrapper: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    marginTop: 8,
  },
});

export default MatchRecap;