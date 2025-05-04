// CIFAMobileApp/app/admin/news/edit/[id].tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const { id } = useLocalSearchParams();
  const newsId = Array.isArray(id) ? id[0] : id;
  
  const { user, isAdmin } = useAuth();
  const { fetchNewsById } = useNews();
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const fetchedArticle = await fetchNewsById(newsId);
        setArticle(fetchedArticle);
        setLoading(false);
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
        setLoading(false);
      }
    };
    
    if (isAdmin && newsId) {
      loadArticle();
    }
  }, [isAdmin, newsId, fetchNewsById]);

  const handleSaveSuccess = () => {
    router.replace('./admin/news');
  };

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
          <View style={styles.content}>
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading article...</Text>
            </View>
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
          <View style={styles.content}>
            <View style={styles.centerContainer}>
              <Feather name="alert-circle" size={40} color="#ef4444" />
              <Text style={styles.errorText}>
                {error || 'Article not found'}
              </Text>
              <Button 
                title="Go Back" 
                onPress={() => router.back()}
                style={styles.backButton}
              />
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    minWidth: 120,
  },
});