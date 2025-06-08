// app/admin/news/edit/[id].tsx - Fixed Navigation and Parameter Handling
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../../../../src/hooks/useAuth';
import { useNews } from '../../../../src/hooks/useNews';
import Header from '../../../../src/components/common/Header';
import NewsForm from '../../../../src/components/news/NewsForm';
import Button from '../../../../src/components/common/Button';
import { NewsArticle } from '../../../../src/services/firebase/news';

export default function EditNewsScreen() {
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
  
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { fetchNewsById } = useNews();
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check if user is authorized
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to access this page');
        router.replace('/(auth)/login' as any);
        return;
      }
      
      if (isAdmin === false) {
        Alert.alert('Access Denied', 'You must be an admin to access this page');
        router.back();
        return;
      }
      
      if (isAdmin === true) {
        setHasCheckedAuth(true);
      }
    }
  }, [authLoading, user, isAdmin]);

  // Load article
  useEffect(() => {
    const loadArticle = async () => {
      if (!newsId) {
        setError('Article ID not provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('EditNewsScreen: Loading article with ID:', newsId);
        const fetchedArticle = await fetchNewsById(newsId);
        
        if (fetchedArticle) {
          console.log('EditNewsScreen: Article loaded:', fetchedArticle.title);
          console.log('EditNewsScreen: Article images:', {
            thumbnail: fetchedArticle.thumbnailUrl,
            media: fetchedArticle.mediaUrls
          });
          setArticle(fetchedArticle);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    
    if (hasCheckedAuth && newsId) {
      loadArticle();
    }
  }, [hasCheckedAuth, newsId, fetchNewsById]);

  const handleSaveSuccess = () => {
    console.log('EditNewsScreen: Article updated successfully');
    
    try {
      // Navigate back to admin news list with proper route
      router.replace('/admin/news' as any);
    } catch (error) {
      console.error('EditNewsScreen: Navigation error after save:', error);
      try {
        // Alternative navigation
        router.push('/admin/news' as any);
      } catch (error2) {
        console.error('EditNewsScreen: Fallback navigation failed:', error2);
        Alert.alert(
          'Success', 
          'Article updated successfully! Please navigate back to the news list manually.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Auth loading state
  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Edit Article" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Checking permissions...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Auth failed
  if (!isAdmin || !hasCheckedAuth) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Edit Article" showBack={true} />
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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Edit Article" showBack={true} />
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={40} color="#ef4444" />
            <Text style={styles.errorText}>
              {error || 'Article not found'}
            </Text>
            <Button 
              title="Go Back" 
              onPress={() => {
                try {
                  router.back();
                } catch (error) {
                  router.replace('/admin/news' as any);
                }
              }}
              style={styles.backButton}
            />
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
        <Header title="Edit Article" showBack={true} />
        <View style={styles.content}>
          <NewsForm 
            existingArticle={article} 
            onSaveSuccess={handleSaveSuccess} 
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
    overflow: 'hidden',
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
    fontSize: 16,
    color: 'white',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    minWidth: 120,
  },
});