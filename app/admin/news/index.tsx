// CIFAMobileApp/app/admin/news/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image
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
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import { firestore } from '../../../src/services/firebase/config';
import { NewsArticle } from '../../../src/services/firebase/news';
import { useAuth } from '../../../src/hooks/useAuth';

export default function AdminNewsScreen() {
  const { user, isAdmin } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'GENERAL',
    'NATIONAL TEAM',
    "MEN'S PREMIER LEAGUE",
    "WOMEN'S PREMIER LEAGUE",
    'YOUTH FOOTBALL',
    'COACHING & DEVELOPMENT',
    'TRANSFERS'
  ];

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    fetchArticles();
  }, [isAdmin]);

  const fetchArticles = async () => {
    if (!firestore) return;
    
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

  const handleCreateNew = () => {
    router.push('/admin/news/create');
  };

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/news/edit/${articleId}`);
  };

  const handleToggleFeatured = async (articleId: string, currentFeatured: boolean) => {
    if (!firestore) return;
    
    try {
      await updateDoc(doc(firestore, 'news', articleId), {
        featured: !currentFeatured
      });
      
      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, featured: !currentFeatured }
          : article
      ));
      
      Alert.alert('Success', `Article ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating article:', error);
      Alert.alert('Error', 'Failed to update article');
    }
  };

  const handleDeleteArticle = (articleId: string, articleTitle: string) => {
    if (!firestore) return;
    
    Alert.alert(
      'Delete Article',
      `Are you sure you want to delete "${articleTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'news', articleId));
              setArticles(prev => prev.filter(article => article.id !== articleId));
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

  const filteredArticles = selectedCategory === 'ALL' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

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
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Manage News" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading articles...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Manage News" showBack={true} />
        
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{articles.length}</Text>
            <Text style={styles.statLabel}>Total Articles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {articles.filter(a => a.featured).length}
            </Text>
            <Text style={styles.statLabel}>Featured</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateNew}
          >
            <Feather name="plus" size={20} color="white" />
            <Text style={styles.createButtonText}>New Article</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Articles List */}
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
          {filteredArticles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No articles found</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={handleCreateNew}
              >
                <Text style={styles.emptyButtonText}>Create First Article</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredArticles.map(article => (
              <Card key={article.id} style={styles.articleCard}>
                <View style={styles.articleContent}>
                  {article.thumbnailUrl ? (
                    <Image 
                      source={{ uri: article.thumbnailUrl }} 
                      style={styles.articleThumbnail}
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Feather name="image" size={24} color="#9ca3af" />
                    </View>
                  )}
                  
                  <View style={styles.articleInfo}>
                    <View style={styles.articleHeader}>
                      <Text style={styles.articleTitle} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <View style={styles.articleBadges}>
                        <Badge 
                          text={article.category} 
                          variant="primary" 
                          style={styles.categoryBadge}
                        />
                        {article.featured && (
                          <Badge 
                            text="FEATURED" 
                            variant="warning" 
                            style={styles.featuredBadge}
                          />
                        )}
                      </View>
                    </View>
                    
                    {article.summary && (
                      <Text style={styles.articleSummary} numberOfLines={2}>
                        {article.summary}
                      </Text>
                    )}
                    
                    <View style={styles.articleMeta}>
                      <Text style={styles.articleAuthor}>
                        <Feather name="user" size={12} color="#6b7280" /> {article.author}
                      </Text>
                      <Text style={styles.articleDate}>
                        <Feather name="clock" size={12} color="#6b7280" /> {formatDate(article.date)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditArticle(article.id)}
                  >
                    <Feather name="edit-2" size={18} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleToggleFeatured(article.id, article.featured)}
                  >
                    <Feather 
                      name={article.featured ? "star" : "star"} 
                      size={18} 
                      color="#f59e0b" 
                    />
                    <Text style={styles.actionButtonText}>
                      {article.featured ? 'Unfeature' : 'Feature'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteArticle(article.id, article.title)}
                  >
                    <Feather name="trash-2" size={18} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Delete
                    </Text>
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
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  categoryText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#1e3a8a',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  articleCard: {
    margin: 16,
    marginBottom: 8,
    padding: 0,
    overflow: 'hidden',
  },
  articleContent: {
    flexDirection: 'row',
    padding: 16,
  },
  articleThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleHeader: {
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  articleBadges: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryBadge: {
    marginRight: 6,
  },
  featuredBadge: {
    marginRight: 6,
  },
  articleSummary: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 12,
  },
  articleDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteButton: {
    borderRightWidth: 0,
  },
  deleteButtonText: {
    color: '#ef4444',
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
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
});