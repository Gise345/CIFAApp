// app/profile.tsx - User Profile Screen
import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import Header from '../src/components/common/Header';
import Card from '../src/components/common/Card';
import { useAuth } from '../src/hooks/useAuth';

export default function ProfileScreen() {
  const { user, authUser } = useAuth();

  useEffect(() => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to view your profile.');
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
        <Header title="Profile" showBack={true} />
        
        <ScrollView style={styles.content}>
          <Card style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {authUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            
            <Text style={styles.userName}>{authUser?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{authUser?.email}</Text>
            
            <TouchableOpacity style={styles.editButton}>
              <Feather name="edit-2" size={16} color="#2563eb" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </Card>
          
          <View style={styles.comingSoon}>
            <Feather name="user" size={48} color="#9ca3af" />
            <Text style={styles.comingSoonText}>Profile features coming soon</Text>
            <Text style={styles.comingSoonSubtext}>
              Edit your profile, manage favorite teams, and customize your experience.
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
  profileCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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