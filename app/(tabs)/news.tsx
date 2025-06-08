// app/(tabs)/news.tsx - News Tab Page with Fixed Navigation
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar,
  ActivityIndicator,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import Header from '../../src/components/common/Header';
import NewsList from '../../src/components/news/NewsList';
import { useNews } from '../../src/hooks/useNews';

export default function NewsScreen() {
  const { loading, error, fetchNews } = useNews();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadInitialNews = async () => {
      try {
        await fetchNews(undefined, 20); // Load 20 latest articles
      } catch (error) {
        console.error('Error loading initial news:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialNews();
  }, []);

  // Fixed navigation function for SDK 52
  const handleNavigateToArticle = (articleId: string) => {
    console.log('Navigating to article:', articleId);
    
    if (!articleId) {
      console.error('Article ID is missing');
      return;
    }
    
    try {
      // Use the correct route format for your app structure
      router.push(`/news/${articleId}` as any);
    } catch (error) {
      console.error('Navigation error:', error);
      try {
        // Fallback navigation
        router.replace(`/news/${articleId}` as any);
      } catch (error2) {
        console.error('Fallback navigation failed:', error2);
        // You could also try other navigation patterns here
      }
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={styles.safeArea}>
          <Header title="News" showBack={false} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading news...</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <Header title="News" showBack={false} />
        
        <View style={styles.content}>
          <NewsList 
            showSearch={true}
            showCategories={true}
            limit={50}
            onNavigateToArticle={handleNavigateToArticle}
          />
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
});