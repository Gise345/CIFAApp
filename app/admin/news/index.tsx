// app/admin/news/index.tsx - Admin News Management
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  doc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';


interface NewsArticle {
  id: string;
  title: string;
  body: string;
  summary?: string;
  author: string;
  date: Timestamp | any;
  category: string;
  tags: string[];
  featured: boolean;
  mediaUrls: string[];
  thumbnailUrl?: string;
}

export default function AdminNewsScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  

  const fetchNews = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      const newsQuery = query(
        collection(firestore, 'news'),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(newsQuery);
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsArticle));
      
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
      Alert.alert('Error', 'Failed to load news articles');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
  // Only check auth after loading is complete
  if (!authLoading) {
    console.log('Admin News Screen - Auth Check:', {
      user: user?.email,
      isAdmin,
      authLoading
    });
    
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to access this page');
      router.replace('/(auth)/login');
      return;
    }
    
    if (isAdmin === false) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    if (isAdmin === true) {
      setHasCheckedAuth(true);
      fetchNews();
    }
  }
}, [authLoading, user, isAdmin]);

  const fetchArticles = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      const articlesQuery = query(
        collection(firestore, 'news'),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(articlesQuery);
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsArticle));
      
      setArticles(articlesData);
    } catch (error) {
      console.error('Error fetching articles:', error);
      Alert.alert('Error', 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setRefreshing(false);
  };

  const handleCreateArticle = () => {
    router.push('/admin/news/create');
  };

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/news/edit/${articleId}`);
  };

  const handleDeleteArticle = (article: NewsArticle) => {
    Alert.alert(
      'Delete Article',
      `Are you sure you want to delete "${article.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!firestore) {
              Alert.alert('Error', 'Database connection lost');
              return;
            }
            
            try {
              const articleDocRef = doc(firestore, 'news', article.id);
              await deleteDoc(articleDocRef);
              setArticles(prev => prev.filter(a => a.id !== article.id));
              Alert.alert('Success', 'Article deleted successfully');
            } catch (error) {
              console.error('Error deleting article:', error);
              Alert.alert('Error', 'Failed to delete article');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'Unknown';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="News Management" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading articles...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!isAdmin || !hasCheckedAuth) {
  return null;
}

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="News Management" showBack={true} />
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563eb"
            />
          }
        >
          {/* Header with Create Button */}
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Articles ({articles.length})</Text>
            <Button 
              title="Create Article" 
              onPress={handleCreateArticle}
              style={styles.createButton}
            />
          </View>
          
          {/* Articles List */}
          {articles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No articles found</Text>
              <Button 
                title="Create First Article" 
                onPress={handleCreateArticle}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            articles.map(article => (
              <Card key={article.id} style={styles.articleCard}>
                <View style={styles.articleHeader}>
                  <View style={styles.articleInfo}>
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text style={styles.articleMeta}>
                      By {article.author} • {formatDate(article.date)}
                    </Text>
                    <View style={styles.badgeContainer}>
                      <Badge 
                        text={article.category} 
                        variant="primary" 
                        style={styles.categoryBadge}
                      />
                      {article.featured && (
                        <Badge 
                          text="FEATURED" 
                          variant="success" 
                          style={styles.featuredBadge}
                        />
                      )}
                    </View>
                  </View>
                  {article.thumbnailUrl && (
                    <View style={styles.thumbnailContainer}>
                      <Text style={styles.thumbnailText}>📷</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.articleSummary} numberOfLines={3}>
                  {article.summary || article.body.substring(0, 150) + '...'}
                </Text>
                
                <View style={styles.articleActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditArticle(article.id)}
                  >
                    <Feather name="edit-2" size={16} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteArticle(article)}
                  >
                    <Feather name="trash-2" size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
          
          {/* Footer spacing */}
          <View style={styles.footer} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    minWidth: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 160,
  },
  articleCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  articleMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  categoryBadge: {
    marginRight: 6,
  },
  featuredBadge: {
    marginRight: 6,
  },
  thumbnailContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  thumbnailText: {
    fontSize: 20,
  },
  articleSummary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteText: {
    color: '#ef4444',
  },
  footer: {
    height: 40,
  },
});

function setNews(newsData: NewsArticle[]) {
  throw new Error('Function not implemented.');
}
