// app/admin/_layout.tsx - Fixed Admin Layout for SDK 53
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
      <Stack.Screen name="index" />
      <Stack.Screen name="news/index" />
      <Stack.Screen name="news/create" />
      <Stack.Screen name="news/edit/[id]" />
      <Stack.Screen name="matches/index" />
      <Stack.Screen name="matches/create" />
      <Stack.Screen name="matches/edit/[id]" />
      <Stack.Screen name="teams/index" />
      <Stack.Screen name="teams/create" />
      <Stack.Screen name="teams/edit/[id]" />
      <Stack.Screen name="teams/[id]" />
      <Stack.Screen name="players/index" />
      <Stack.Screen name="players/create" />
      <Stack.Screen name="players/edit/[id]" />
      <Stack.Screen name="leagues/index" />
      <Stack.Screen name="leagues/create" />
      <Stack.Screen name="leagues/edit/[id]" />
      <Stack.Screen name="notifications/index" />
      <Stack.Screen name="notifications/create" />
      <Stack.Screen name="notifications/edit/[id]" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="analytics/index" />
      <Stack.Screen name="moderation/index" />
      <Stack.Screen name="security/index" />
      <Stack.Screen name="settings/index" />
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