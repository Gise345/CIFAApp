// app/admin/players/index.tsx - Admin Players Management
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Button from '../../../src/components/common/Button';
import { useAuth } from '../../../src/hooks/useAuth';

export default function AdminPlayersScreen() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
  }, [isAdmin]);

  const handleCreatePlayer = () => {
    // Will implement later
    Alert.alert('Coming Soon', 'Player creation functionality will be implemented soon.');
  };

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Player Management" showBack={true} />
        
        <ScrollView style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Players</Text>
            <Button 
              title="Add Player" 
              onPress={handleCreatePlayer}
              style={styles.createButton}
            />
          </View>
          
          <View style={styles.emptyContainer}>
            <Feather name="user" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Player management coming soon</Text>
            <Text style={styles.emptySubtext}>
              This feature will allow you to manage player profiles, statistics, and team assignments.
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    minWidth: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});