// app/notification-settings.tsx - Notification Settings Screen
import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import Header from '../src/components/common/Header';
import { useAuth } from '../src/hooks/useAuth';

export default function NotificationSettingsScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to manage notification settings.');
      router.replace('/(auth)/login');
    }
  }, [user]);

  if (!user) {
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
        <Header title="Notification Settings" showBack={true} />
        
        <ScrollView style={styles.content}>
          <View style={styles.comingSoon}>
            <Feather name="bell" size={48} color="#9ca3af" />
            <Text style={styles.comingSoonText}>Notification settings coming soon</Text>
            <Text style={styles.comingSoonSubtext}>
              Customize your notification preferences for matches, news, and team updates.
            </Text>
          </View>
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
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});