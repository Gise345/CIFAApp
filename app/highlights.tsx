// app/highlights.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { 
  fetchInstagramPosts, 
  InstagramMedia, 
  getPostTitle, 
  formatInstagramDate,
  getPostBadgeInfo
} from '../src/services/instagram/instagramService';
import Header from '../src/components/common/Header';

// Calculate grid item dimensions based on screen width
const { width } = Dimensions.get('window');
const numColumns = 2;
const gap = 8;
const itemWidth = (width - (gap * (numColumns + 1))) / numColumns;
const itemHeight = itemWidth * 1.5; // Using 2:3 aspect ratio for cards

interface MediaGridItemProps {
  item: InstagramMedia;
  onPress: (media: InstagramMedia) => void;
}

// Grid Item for FlatList
const MediaGridItem: React.FC<MediaGridItemProps> = ({ item, onPress }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Get post details
  const badge = getPostBadgeInfo(item);
  
  // Determine media source URL
  const mediaUrl = 
    item.media_type === 'VIDEO' 
      ? item.thumbnail_url || item.media_url 
      : item.media_url;
  
  return (
    <TouchableOpacity 
      style={[styles.gridItem, { width: itemWidth, height: itemHeight }]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {/* Media Thumbnail */}
      <Image 
        source={{ uri: mediaUrl || 'https://dummyimage.com/600x400/000/fff&text=CIFA' }}
        style={styles.mediaThumbnail}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      
      {loading && (
        <View style={styles.mediaOverlay}>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
      
      {error && (
        <View style={styles.mediaOverlay}>
          <Feather name="alert-triangle" size={20} color="white" />
        </View>
      )}
      
      {/* Video indicator */}
      {item.media_type === 'VIDEO' && (
        <View style={styles.videoIndicator}>
          <Feather name="play" size={20} color="white" />
        </View>
      )}
      
      {/* Album indicator */}
      {item.media_type === 'CAROUSEL_ALBUM' && (
        <View style={styles.albumIndicator}>
          <Feather name="layers" size={16} color="white" />
        </View>
      )}
      
      {/* Title gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.titleGradient}
      >
        <Text style={styles.mediaTitle} numberOfLines={2}>
          {getPostTitle(item.caption)}
        </Text>
        <Text style={styles.mediaDate}>{formatInstagramDate(item.timestamp)}</Text>
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
  );
};

// Main Component
export default function HighlightsScreen() {
  const [posts, setPosts] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Load Instagram posts
  const loadPosts = useCallback(async (showRefresh: boolean = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const instagramPosts = await fetchInstagramPosts(30); // Get more posts for this view
      setPosts(instagramPosts);
    } catch (err) {
      console.error('Error loading Instagram posts:', err);
      setError('Failed to load highlights. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);
  
  // Handle pull-to-refresh
  const handleRefresh = () => {
    loadPosts(true);
  };
  
  // Handle press on a media item
  const handleMediaPress = async (media: InstagramMedia) => {
    // Open the Instagram post in the Instagram app or web browser
    if (media.permalink) {
      try {
        const supported = await Linking.canOpenURL(media.permalink);
        
        if (supported) {
          await Linking.openURL(media.permalink);
        } else {
          console.error(`Cannot open URL: ${media.permalink}`);
        }
      } catch (err) {
        console.error('Error opening Instagram link:', err);
      }
    }
  };
  
  // Filter posts by type
  const getFilteredPosts = () => {
    if (!filterType) return posts;
    
    switch (filterType) {
      case 'VIDEO':
        return posts.filter(post => post.media_type === 'VIDEO');
      case 'IMAGE':
        return posts.filter(post => post.media_type === 'IMAGE');
      case 'CAROUSEL_ALBUM':
        return posts.filter(post => post.media_type === 'CAROUSEL_ALBUM');
      default:
        return posts;
    }
  };
  
  // Handle filter change
  const handleFilterChange = (type: string | null) => {
    setFilterType(type === filterType ? null : type);
  };
  
  // Render header with filtering options
  const renderHeader = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.sectionTitle}>CIFA Updates & Highlights</Text>
      <Text style={styles.sectionSubtitle}>
        Latest updates from the official Instagram account
      </Text>
      
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterType === null && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange(null)}
        >
          <Text style={[
            styles.filterButtonText,
            filterType === null && styles.activeFilterText
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterType === 'VIDEO' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('VIDEO')}
        >
          <Feather 
            name="video" 
            size={14} 
            color={filterType === 'VIDEO' ? 'white' : '#64748b'}
            style={styles.filterIcon} 
          />
          <Text style={[
            styles.filterButtonText,
            filterType === 'VIDEO' && styles.activeFilterText
          ]}>
            Videos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterType === 'IMAGE' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('IMAGE')}
        >
          <Feather 
            name="image" 
            size={14} 
            color={filterType === 'IMAGE' ? 'white' : '#64748b'}
            style={styles.filterIcon} 
          />
          <Text style={[
            styles.filterButtonText,
            filterType === 'IMAGE' && styles.activeFilterText
          ]}>
            Photos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterType === 'CAROUSEL_ALBUM' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('CAROUSEL_ALBUM')}
        >
          <Feather 
            name="layers" 
            size={14} 
            color={filterType === 'CAROUSEL_ALBUM' ? 'white' : '#64748b'}
            style={styles.filterIcon} 
          />
          <Text style={[
            styles.filterButtonText,
            filterType === 'CAROUSEL_ALBUM' && styles.activeFilterText
          ]}>
            Albums
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Feather name="instagram" size={48} color="#64748b" />
        <Text style={styles.emptyText}>No highlights available</Text>
        <Text style={styles.emptySubtext}>
          Follow @theofficialcifa on Instagram for updates
        </Text>
      </View>
    );
  };
  
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Highlights" showBack={true} />
        
        <View style={styles.content}>
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading highlights...</Text>
            </View>
          )}
          
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={32} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => loadPosts()}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!loading && !error && (
            <FlatList
              data={getFilteredPosts()}
              renderItem={({ item }) => (
                <MediaGridItem 
                  item={item} 
                  onPress={handleMediaPress}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.columnWrapper}
              ListHeaderComponent={renderHeader}
              ListEmptyComponent={renderEmpty}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={handleRefresh}
                  colors={['#2563eb']}
                  tintColor="#2563eb"
                />
              }
            />
          )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  gridContainer: {
    padding: gap,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: gap,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    right: 12,
    top: 40, // Below the badge
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumIndicator: {
    position: 'absolute',
    right: 12,
    top: 40, // Below the badge
    width: 30,
    height: 30,
    borderRadius: 15,
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
  mediaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  mediaDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#64748b',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
});