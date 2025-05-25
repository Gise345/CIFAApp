// CIFAMobileApp/app/admin/news/create.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import Header from '../../../src/components/common/Header';
import NewsForm from '../../../src/components/news/NewsForm';
import { useAuth } from '../../../src/hooks/useAuth';

export default function CreateNewsScreen() {
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
    }
  }, [isAdmin]);

  const handleSaveSuccess = () => {
    router.back();
  };

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
});