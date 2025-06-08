// app/admin/news/create.tsx - Fixed Create News Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import Header from '../../../src/components/common/Header';
import NewsForm from '../../../src/components/news/NewsForm';
import { useAuth } from '../../../src/hooks/useAuth';

export default function CreateNewsScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    console.log('Create News Screen - Auth State:', {
      user: user?.email,
      isAdmin,
      authLoading
    });

    // Only check auth after loading is complete
    if (!authLoading) {
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
      }
    }
  }, [authLoading, user, isAdmin]);

  const handleSaveSuccess = () => {
    console.log('Article saved successfully, navigating back...');
    
    try {
      // Navigate back to the news management page
      router.back();
    } catch (error) {
      console.error('Navigation error after save:', error);
      try {
        // Fallback navigation
        router.replace('/admin/news');
      } catch (error2) {
        console.error('Fallback navigation failed:', error2);
        // At least show success message
        Alert.alert('Success', 'Article created successfully!');
      }
    }
  };

  // Loading state while checking authentication
  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Create Article" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Checking permissions...</Text>
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
        <Header title="Create Article" showBack={true} />
        
        <View style={styles.content}>
          <NewsForm onSaveSuccess={handleSaveSuccess} />
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