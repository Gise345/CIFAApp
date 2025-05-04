// CIFAMobileApp/app/admin/news/create.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../../src/hooks/useAuth';
import Header from '../../../src/components/common/Header';
import NewsForm from '../../../src/components/news/NewsForm';

export default function CreateNewsScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

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

  const handleSaveSuccess = () => {
    router.replace('./admin/news');
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
    overflow: 'hidden',
  }
});