// app/admin/news/index.tsx - Fixed Admin News Management
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
        fetchArticles();
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

  // Fixed navigation function for SDK 52
  const handleCreateArticle = () => {
    console.log('Create article button pressed');
    
    try {
      // SDK 52 compatible navigation
      router.push('/admin/news/create' as any);
      console.log('Navigation successful');
    } catch (error) {
      console.error('Primary navigation failed:', error);
      
      try {
        // Fallback method for SDK 52
        router.replace('/admin/news/create' as any);
        console.log('Fallback navigation successful');
      } catch (error2) {
        console.error('Fallback navigation failed:', error2);
        Alert.alert(
          'Navigation Error', 
          'Unable to navigate to create article page. Please try refreshing the app.',
          [
            { text: 'OK' },
            { 
              text: 'Refresh App', 
              onPress: () => {
                // Simple page refresh fallback
                try {
                  router.replace('/admin/news' as any);
                } catch (e) {
                  console.error('Refresh failed:', e);
                }
              }
            }
          ]
        );
      }
    }
  };

  const handleEditArticle = (articleId: string) => {
    console.log('Edit article:', articleId);
    
    try {
      router.push(`/admin/news/edit/${articleId}` as any);
    } catch (error) {
      console.error('Edit navigation failed:', error);
      try {
        router.replace(`/admin/news/edit/${articleId}` as any);
      } catch (error2) {
        console.error('Edit navigation fallback failed:', error2);
        Alert.alert('Navigation Error', 'Unable to navigate to edit article page. Please try refreshing the app.');
      }
    }
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

  // Loading state
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

  // Auth check failed
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
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateArticle}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={16} color="white" />
              <Text style={styles.createButtonText}>Create Article</Text>
            </TouchableOpacity>
          </View>
          
          {/* Articles List */}
          {articles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No articles found</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={handleCreateArticle}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyButtonText}>Create First Article</Text>
              </TouchableOpacity>
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
                  {article.summary || article.body}
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditArticle(article.id)}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={16} color="#2563eb" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteArticle(article)}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={16} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 120,
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  articleCard: {
    marginHorizontal: 16,
    marginVertical: 8,
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
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  articleMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
  },
  featuredBadge: {
    backgroundColor: '#dcfce7',
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  thumbnailText: {
    fontSize: 24,
  },
  articleSummary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  editButtonText: {
    color: '#2563eb',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#ef4444',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});