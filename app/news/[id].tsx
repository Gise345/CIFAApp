// app/news/[id].tsx - SDK 52 Compatible News Detail Page
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Share,
  Alert
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';

import { useNews } from '../../src/hooks/useNews';
import { NewsArticle } from '../../src/services/firebase/news';
import Badge from '../../src/components/common/Badge';

const NewsDetail: React.FC = () => {
  const router = useRouter();
  const params = useGlobalSearchParams();
  
  // Extract article ID from params - handle both string and array cases
  const getArticleId = () => {
    const id = params.id;
    if (Array.isArray(id)) {
      return id[0] || null;
    }
    return id || null;
  };
  
  const newsId = getArticleId();
  
  const { fetchNewsById } = useNews();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('NewsDetail: Received params:', params);
    console.log('NewsDetail: Article ID:', newsId);
    
    const loadArticle = async () => {
      if (!newsId) {
        console.error('NewsDetail: Article ID not provided');
        setError('Article ID not provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('NewsDetail: Fetching article with ID:', newsId);
        const fetchedArticle = await fetchNewsById(newsId);
        
        if (fetchedArticle) {
          console.log('NewsDetail: Article loaded successfully:', fetchedArticle.title);
          setArticle(fetchedArticle);
        } else {
          console.error('NewsDetail: Article not found');
          setError('Article not found');
        }
      } catch (err) {
        console.error('NewsDetail: Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    
    loadArticle();
  }, [newsId, fetchNewsById]);

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await Share.share({
        message: `Check out this article from CIFA: ${article.title}`,
        url: `https://www.caymanislandsfa.com/news/${article.id}`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error going back:', error);
      // Fallback to news tab
      router.replace('/(tabs)/news' as any);
    }
  };

  const renderImage = () => {
    if (!article?.thumbnailUrl) {
      return (
        <View style={styles.imagePlaceholder}>
          <Feather name="image" size={40} color="#D1D5DB" />
          <Text style={styles.placeholderText}>No image available</Text>
        </View>
      );
    }
    
    return (
      <Image 
        source={{ uri: article.thumbnailUrl }} 
        style={styles.image}
        resizeMode="cover"
        onError={(error) => {
          console.log('Image load error:', error.nativeEvent.error);
        }}
      />
    );
  };

  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return 'Unknown date';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleGoBack}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Article</Text>
            <View style={styles.shareButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading article...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleGoBack}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Article</Text>
            <View style={styles.shareButton} />
          </View>
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>
              {error || 'Article not found'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleGoBack}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleGoBack}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article</Text>
          <TouchableOpacity 
            onPress={handleShare}
            style={styles.shareButton}
          >
            <Feather name="share" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Article Image */}
          <View style={styles.imageContainer}>
            {renderImage()}
            
            {/* Overlay with category and featured badge */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageTitleGradient}
            >
              <View style={styles.badgeContainer}>
                <Badge text={article.category} variant="primary" />
                {article.featured && (
                  <Badge text="FEATURED" variant="success" style={styles.featuredBadge} />
                )}
              </View>
            </LinearGradient>
          </View>
          
          {/* Article Content */}
          <View style={styles.articleContent}>
            <Text style={styles.title}>{article.title}</Text>
            
            <View style={styles.metaInfo}>
              <Text style={styles.date}>{formatDate(article.date)}</Text>
              <Text style={styles.author}>By {article.author}</Text>
            </View>
            
            {article.summary && (
              <Text style={styles.summary}>{article.summary}</Text>
            )}
            
            <Text style={styles.body}>{article.body}</Text>
            
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsTitle}>Tags</Text>
                <View style={styles.tagsWrapper}>
                  {article.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Media Gallery */}
            {article.mediaUrls && article.mediaUrls.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={styles.mediaSectionTitle}>Media Gallery</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mediaScrollContent}
                >
                  {article.mediaUrls.map((url, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.mediaItem}
                      onPress={() => {
                        console.log('Opening media item:', url);
                      }}
                    >
                      <Image 
                        source={{ uri: url }} 
                        style={styles.mediaImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Share Section */}
            <View style={styles.shareSection}>
              <Text style={styles.shareSectionTitle}>Share this article</Text>
              <TouchableOpacity 
                style={styles.shareArticleButton}
                onPress={handleShare}
              >
                <Feather name="share-2" size={20} color="#2563eb" />
                <Text style={styles.shareArticleText}>Share Article</Text>
              </TouchableOpacity>
            </View>
            
            {/* Bottom padding */}
            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  shareButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  imageTitleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredBadge: {
    marginLeft: 8,
  },
  articleContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 32,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 16,
  },
  author: {
    fontSize: 14,
    color: '#6b7280',
  },
  summary: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  body: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 26,
    marginBottom: 24,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  mediaSection: {
    marginBottom: 24,
  },
  mediaSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  mediaScrollContent: {
    paddingRight: 16,
  },
  mediaItem: {
    width: 160,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  shareSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shareSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  shareArticleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  shareArticleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  bottomPadding: {
    height: 32,
  },
});

export default NewsDetail;