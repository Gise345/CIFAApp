// CIFAMobileApp/src/components/news/NewsDetail.tsx
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
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';

import { useNews } from '../../hooks/useNews';
import { NewsArticle } from '../../services/firebase/news';
import Badge from '../common/Badge';

const NewsDetail: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { newsId } = params;
  
  const { fetchNewsById } = useNews();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!newsId) {
        setError('Article ID not provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const fetchedArticle = await fetchNewsById(newsId as string);
        setArticle(fetchedArticle);
        setLoading(false);
      } catch (err) {
        setError('Failed to load article');
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
        url: `https://www.caymanislandsfa.com/news/${article.id}`, // This would be your actual share URL
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const renderImage = () => {
    if (!article?.thumbnailUrl) {
      return (
        <View style={styles.imagePlaceholder}>
          <Feather name="image" size={40} color="#D1D5DB" />
        </View>
      );
    }
    
    return (
      <Image 
        source={{ uri: article.thumbnailUrl }} 
        style={styles.image}
        resizeMode="cover"
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading article...</Text>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Feather name="alert-circle" size={40} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'Article not found'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Feather name="share-2" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.imageContainer}>
          {renderImage()}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={styles.imageTitleGradient}
          >
            <Badge text={article.category} variant="primary" />
            {article.featured && (
              <Badge text="FEATURED" variant="warning" style={styles.featuredBadge} />
            )}
          </LinearGradient>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.date}>{formatDate(article.date)}</Text>
            <Text style={styles.author}>By {article.author}</Text>
          </View>
          
          {article.summary && (
            <Text style={styles.summary}>{article.summary}</Text>
          )}
          
          <Text style={styles.body}>{article.body}</Text>
          
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {article.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
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
                    // In a real app, this would open a lightbox or media viewer
                    onPress={() => {}}
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
          
          {/* Related articles would go here in a real app */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  imageContainer: {
    position: 'relative',
    height: 240,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
  },
  featuredBadge: {
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  author: {
    fontSize: 14,
    color: '#6B7280',
  },
  summary: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4B5563',
  },
  mediaSection: {
    marginBottom: 20,
  },
  mediaSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  mediaScrollContent: {
    paddingBottom: 12,
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
});

export default NewsDetail;