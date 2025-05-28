// app/admin/roles/index.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import { useAuth } from '../../../src/hooks/useAuth';

export default function AdminRolesScreen() {
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
    }
  }, [isAdmin]);

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Roles & Permissions" showBack={true} />
        
        <View style={styles.content}>
          <Card style={styles.comingSoonCard}>
            <Feather name="shield" size={48} color="#8b5cf6" />
            <Text style={styles.comingSoonTitle}>Roles & Permissions</Text>
            <Text style={styles.comingSoonText}>
              Advanced role-based access control and permission management will be available soon.
            </Text>
            <Text style={styles.featureList}>
              • Custom user roles{'\n'}
              • Permission management{'\n'}
              • Access control lists{'\n'}
              • Role assignments{'\n'}
              • Permission auditing
            </Text>
          </Card>
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
    padding: 20,
    justifyContent: 'center',
  },
  comingSoonCard: {
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureList: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    textAlign: 'left',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
});