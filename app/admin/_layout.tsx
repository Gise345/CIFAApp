// app/admin/_layout.tsx - Complete Admin Layout with All Routes
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router/stack';
import { useAuth } from '../../src/hooks/useAuth';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Don't redirect immediately, wait for auth to be fully loaded
    if (!loading) {
      if (!user) {
        console.log('Admin Layout: No user, redirecting to login');
        router.replace('/(auth)/login');
      } else if (isAdmin === false) {
        console.log('Admin Layout: User is not admin, redirecting to home');
        router.replace('/(tabs)/');
      } else if (isAdmin === true) {
        console.log('Admin Layout: User is admin, allowing access');
        setHasCheckedAuth(true);
      }
    }
  }, [user, isAdmin, loading]);

  // Show loading while checking authentication
  if (loading || !hasCheckedAuth) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.loadingContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>
              {loading ? 'Loading...' : 'Checking admin permissions...'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Only render the stack if user is authenticated and is admin
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main Dashboard */}
      <Stack.Screen name="index" />
      
      {/* News Management */}
      <Stack.Screen name="news/index" />
      <Stack.Screen name="news/create" />
      <Stack.Screen name="news/edit/[id]" />
      
      {/* Matches Management */}
      <Stack.Screen name="matches/index" />
      <Stack.Screen name="matches/create" />
      
      {/* Teams Management */}
      <Stack.Screen name="teams/index" />
      <Stack.Screen name="teams/create" />
      <Stack.Screen name="teams/[id]" />
      
      {/* Players Management */}
      <Stack.Screen name="players/index" />
      
      {/* Leagues Management */}
      <Stack.Screen name="leagues/index" />
      
      {/* Events Management */}
      <Stack.Screen name="events/index" />
      
      {/* Notifications Management */}
      <Stack.Screen name="notifications/index" />
      <Stack.Screen name="notifications/create" />
      
      {/* Users Management */}
      <Stack.Screen name="users/index" />
      
      {/* Analytics */}
      <Stack.Screen name="analytics/index" />
      
      {/* Content Moderation */}
      <Stack.Screen name="moderation/index" />
      
      {/* Security Center */}
      <Stack.Screen name="security/index" />
      
      {/* Media Gallery */}
      <Stack.Screen name="media/index" />
      
      {/* Email Management */}
      <Stack.Screen name="emails/index" />
      
      {/* Roles Management */}
      <Stack.Screen name="roles/index" />
      
      {/* Settings */}
      <Stack.Screen name="settings/index" />
      
      {/* Profile */}
      <Stack.Screen name="profile/index" />
      
      {/* Notification Settings */}
      <Stack.Screen name="notification-settings/index" />
      
      {/* Firebase Test */}
      <Stack.Screen name="firebase-test" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});