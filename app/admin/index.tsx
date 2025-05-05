// CIFAMobileApp/app/admin/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import { useAuth } from '../../src/hooks/useAuth';

interface AdminMenuCardProps {
  title: string;
  icon: string;
  onPress: () => void;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  // Redirect if not admin
  useEffect(() => {
    if (user === null) {
      router.replace('/login');
    } else if (isAdmin === false) {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.back();
    }
  }, [user, isAdmin, router]);
  
  // Admin dashboard UI with menu options
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Admin Dashboard" showBack={true} />
        <ScrollView style={styles.content}>
          <View style={styles.menuGrid}>
            <AdminMenuCard 
              title="Manage News" 
              icon="file-text"
              onPress={() => router.push('/admin/news')}
            />
            <AdminMenuCard 
              title="Manage Matches" 
              icon="calendar"
              onPress={() => router.push('./matches')}
            />
            <AdminMenuCard 
              title="Manage Teams" 
              icon="users"
              onPress={() => router.push('./teams')}
            />
            <AdminMenuCard 
              title="Notifications" 
              icon="bell"
              onPress={() => router.push('/admin/notifications')}
            />
            <AdminMenuCard 
              title="Database" 
              icon="database"
              onPress={() => router.push('/admin/firebase-test')}
            />
            <AdminMenuCard 
              title="Settings" 
              icon="settings"
              onPress={() => router.push('./settings')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Helper component for admin menu cards
const AdminMenuCard: React.FC<AdminMenuCardProps> = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress}>
    <Feather name={icon as any} size={24} color="#2563eb" style={styles.menuIcon} />
    <Text style={styles.menuTitle}>{title}</Text>
  </TouchableOpacity>
);

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
    paddingTop: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  menuCard: {
    width: '46%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: '2%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    height: 120,
  },
  menuIcon: {
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
});