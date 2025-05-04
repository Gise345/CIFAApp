// CIFAMobileApp/src/components/news/NewsList.tsx
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
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';;

interface NewsListProps {
  category?: string;
  featured?: boolean;
  limit?: number;
  showSearch?: boolean;
  showCategories?: boolean;
}

const NewsList: React.FC<NewsListProps> = ({
  category,
  featured = false,
  limit = 10,
  showSearch = true,
  showCategories = true
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
    'NATIONAL TEAM',
    "MEN'S PREMIER LEAGUE",
    "WOMEN'S PREMIER LEAGUE",
    'YOUTH FOOTBALL',
    'COACHING & DEVELOPMENT'
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
    if (featured) {
      await fetchFeaturedNews(limit);
    } else if (activeCategory && activeCategory !== 'ALL') {
      await fetchNewsByCategory(activeCategory, limit);
    } else {
      await fetchNews(undefined, limit);
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
      const results = await searchNewsArticles(searchQuery);
      setDisplayArticles(results);
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

  // Navigate to article detail
  const navigateToArticle = (articleId: string) => {
    router.push(`/news/${articleId}`);
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

  // Render header
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
          <Feather name="alert-circle" size={40} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load articles</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadArticles}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (searchQuery && displayArticles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="search" size={40} color="#6b7280" />
          <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
          <TouchableOpacity style={styles.retryButton} onPress={clearSearch}>
            <Text style={styles.retryButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (displayArticles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="file-text" size={40} color="#6b7280" />
          <Text style={styles.emptyText}>No articles found</Text>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={displayArticles}
        renderItem={({ item }) => (
          <NewsCard
            id={item.id}
            title={item.title}
            category={item.category}
            imageUrl={item.thumbnailUrl || ''}
            timeAgo={formatDate(item.date)}
            onPress={() => navigateToArticle(item.id)}
            style={styles.newsCard}
          />
        )}
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
    paddingBottom: 40, // Extra padding at bottom for better scrolling
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#374151',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingRight: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  activeCategoryPill: {
    backgroundColor: '#2563eb',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  activeCategoryPillText: {
    color: 'white',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsCard: {
    marginBottom: 16,
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NewsList;
