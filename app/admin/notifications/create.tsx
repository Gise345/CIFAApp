// CIFAMobileApp/app/admin/notifications/create.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../../src/hooks/useAuth';
import Header from '../../../src/components/common/Header';
import NotificationForm from '../../../src/components/news/NotificationForm';

export default function CreateNotificationScreen() {
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
    router.replace('./admin/notifications');
  };

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Create Notification" showBack={true} />
        <View style={styles.content}>
          <NotificationForm onSaveSuccess={handleSaveSuccess} />
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