// src/components/news/NewsList.tsx - Fixed with Proper Navigation
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import NewsCard from './NewsCard';
import { useNews } from '../../hooks/useNews';
import { NewsArticle } from '../../services/firebase/news';
import { formatDistanceToNow } from 'date-fns';

interface NewsListProps {
  category?: string;
  featured?: boolean;
  limit?: number;
  showSearch?: boolean;
  showCategories?: boolean;
  onNavigateToArticle?: (articleId: string) => void; // New prop for custom navigation
}

const NewsList: React.FC<NewsListProps> = ({
  category,
  featured = false,
  limit = 10,
  showSearch = true,
  showCategories = true,
  onNavigateToArticle
}) => {
  const router = useRouter();
  const { 
    articles, 
    loading, 
    error, 
    fetchNews, 
    fetchFeaturedNews, 
    fetchNewsByCategory,
    searchNewsArticles
  } = useNews();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(category);
  const [displayArticles, setDisplayArticles] = useState<NewsArticle[]>([]);

  // Categories for filtering
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

  // Load articles on mount and when dependencies change
  useEffect(() => {
    loadArticles();
  }, [featured, activeCategory]);

  // Set display articles when articles change
  useEffect(() => {
    setDisplayArticles(articles);
  }, [articles]);

  // Load articles based on props
  const loadArticles = async () => {
    try {
      if (featured) {
        await fetchFeaturedNews(limit);
      } else if (activeCategory && activeCategory !== 'ALL') {
        await fetchNewsByCategory(activeCategory, limit);
      } else {
        await fetchNews(undefined, limit);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArticles();
    setRefreshing(false);
  }, [featured, activeCategory, limit]);

  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await searchNewsArticles(searchQuery);
        setDisplayArticles(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setDisplayArticles(articles);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setDisplayArticles(articles);
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

  // Navigate to article detail with improved error handling
  const navigateToArticle = (articleId: string) => {
    console.log('NewsList: Navigating to article:', articleId);
    
    if (!articleId) {
      console.error('NewsList: Article ID is missing or invalid');
      return;
    }

    // Use custom navigation function if provided (from parent component)
    if (onNavigateToArticle) {
      onNavigateToArticle(articleId);
      return;
    }

    // Default navigation logic
    try {
      router.push(`/news/${articleId}` as any);
    } catch (error) {
      console.error('NewsList: Navigation error:', error);
      try {
        router.replace(`/news/${articleId}` as any);
      } catch (error2) {
        console.error('NewsList: Fallback navigation failed:', error2);
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = (newCategory: string) => {
    setActiveCategory(newCategory === 'ALL' ? undefined : newCategory);
  };

  // Render category pills
  const renderCategories = () => {
    if (!showCategories) return null;
    
    return (
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                (item === 'ALL' && !activeCategory) || activeCategory === item
                  ? styles.activeCategoryPill
                  : {}
              ]}
              onPress={() => handleCategorySelect(item)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  (item === 'ALL' && !activeCategory) || activeCategory === item
                    ? styles.activeCategoryPillText
                    : {}
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
    );
  };

  // Render search bar
  const renderSearchBar = () => {
    if (!showSearch) return null;
    
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render featured badge
  const renderHeader = () => {
    return (
      <>
        {renderSearchBar()}
        {renderCategories()}
        {featured && (
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.featuredBadge}
            >
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </LinearGradient>
          </View>
        )}
      </>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.emptyText}>Loading articles...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="wifi-off" size={48} color="#ef4444" />
          <Text style={styles.emptyText}>Unable to load news</Text>
          <Text style={styles.emptySubText}>Check your connection and try again</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (displayArticles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="file-text" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No articles found</Text>
          <Text style={styles.emptySubText}>
            {searchQuery ? 'Try adjusting your search' : 'Check back later for new content'}
          </Text>
          {activeCategory && (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => setActiveCategory(undefined)}
            >
              <Text style={styles.retryButtonText}>View All Articles</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return null;
  };

  // Render single news item
  const renderNewsItem = ({ item }: { item: NewsArticle }) => {
    console.log('Rendering article:', item.id, 'with thumbnail:', item.thumbnailUrl);
    
    return (
      <NewsCard
        id={item.id}
        title={item.title}
        category={item.category}
        imageUrl={item.thumbnailUrl} // This should now display the real image
        timeAgo={formatDate(item.date)}
        onPress={() => navigateToArticle(item.id)}
        style={styles.newsCard}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayArticles}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          // In a complete app, you would implement pagination here
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryPill: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeCategoryPill: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeCategoryPillText: {
    color: '#ffffff',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  newsCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NewsList;