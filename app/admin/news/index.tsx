// CIFAMobileApp/app/admin/news/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';


import { useAuth } from '../../../src/hooks/useAuth';
import { useNews } from '../../../src/hooks/useNews';
import { NewsArticle } from '../../../src/services/firebase/news';
import { toggleFeaturedStatus, deleteNewsArticle } from '../../../src/services/firebase/news';
import Header from '../../../src/components/common/Header';
import Button from '../../../src/components/common/Button';

export default function AdminNewsScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { articles, loading, error, fetchNews } = useNews();
  
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is authorized
  useEffect(() => {
    if (user === null) {
      // Not logged in, redirect to login
      router.replace('/login');
    } else if (isAdmin === false) {
      // Logged in but not admin
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.back();
    }
  }, [user, isAdmin, router]);

  // Load articles on mount
  useEffect(() => {
    if (isAdmin) {
      loadArticles();
    }
  }, [isAdmin]);

  const loadArticles = async () => {
    try {
      await fetchNews(undefined, 50); // Get up to 50 articles for management
    } catch (err) {
      console.error('Error loading articles:', err);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadArticles();
    setRefreshing(false);
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (articleId: string, featured: boolean) => {
    try {
      setActionLoading(true);
      await toggleFeaturedStatus(articleId, !featured);
      
      // Refresh the list
      await loadArticles();
      setActionLoading(false);
    } catch (err) {
      console.error('Error toggling featured status:', err);
      setActionLoading(false);
      Alert.alert('Error', 'Failed to update article status.');
    }
  };

  // Delete article
  const handleDeleteArticle = (article: NewsArticle) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${article.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await deleteNewsArticle(article.id);
              
              // Refresh the list
              await loadArticles();
              setActionLoading(false);
            } catch (err) {
              console.error('Error deleting article:', err);
              setActionLoading(false);
              Alert.alert('Error', 'Failed to delete article.');
            }
          }
        }
      ]
    );
  };

  // Edit article
  const handleEditArticle = (articleId: string) => {
    router.push(`./admin/news/edit/${articleId}`);
  };

  // Render each article in the list
  const renderArticle = ({ item }: { item: NewsArticle }) => {
    return (
      <View style={styles.articleCard}>
        <View style={styles.articleHeader}>
          <Text 
            style={styles.articleTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>
        
        <View style={styles.articleMeta}>
          <Text style={styles.metaText}>{item.category}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => router.push(`/news/${item.id}`)}
          >
            <Feather name="eye" size={16} color="#2563eb" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditArticle(item.id)}
          >
            <Feather name="edit-2" size={16} color="#047857" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, item.featured ? styles.unfeaturedButton : styles.featuredButton]}
            onPress={() => handleToggleFeatured(item.id, item.featured)}
            disabled={actionLoading}
          >
            <Feather 
              name={item.featured ? "star" : "star"} 
              size={16} 
              color={item.featured ? "#f59e0b" : "#f59e0b"} 
            />
            <Text 
              style={item.featured ? styles.unfeaturedButtonText : styles.featuredButtonText}
            >
              {item.featured ? "Unfeature" : "Feature"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteArticle(item)}
            disabled={actionLoading}
          >
            <Feather name="trash-2" size={16} color="#dc2626" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing && articles.length === 0) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Manage News" showBack={true} />
          <View style={styles.content}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading articles...</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Render screen
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Manage News" showBack={true} />
        <View style={styles.content}>
          {actionLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
          
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>News Articles</Text>
            <Link href="/admin/news/create" asChild>
              <Button 
                title="Create New" 
                onPress={() => {}}
                style={styles.createButton}
              />
            </Link>
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={40} color="#ef4444" />
              <Text style={styles.errorText}>Failed to load articles</Text>
              <Button 
                title="Retry" 
                onPress={loadArticles}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <FlatList
              data={articles}
              renderItem={renderArticle}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Feather name="file-text" size={40} color="#6b7280" />
                  <Text style={styles.emptyText}>No articles found</Text>
                  <Link href="/admin/news/create" asChild>
                    <Button 
                      title="Create First Article" 
                      onPress={() => {}}
                      style={styles.emptyButton}
                    />
                  </Link>
                </View>
              )}
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
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    minWidth: 100,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 180,
  },
  articleCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  featuredText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  articleMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 4,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  viewButton: {
    backgroundColor: '#eff6ff',
  },
  viewButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#ecfdf5',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  featuredButton: {
    backgroundColor: '#fffbeb',
  },
  featuredButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  unfeaturedButton: {
    backgroundColor: '#fffbeb',
  },
  unfeaturedButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
});