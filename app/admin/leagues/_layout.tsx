// app/admin/leagues/_layout.tsx
import { Stack } from 'expo-router/stack';
import { useAuth } from '../../../src/hooks/useAuth';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export default function AdminLeaguesLayout() {
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this area');
      router.replace('/admin/');
    }
  }, [isAdmin, loading]);

  if (!isAdmin && !loading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'League Management'
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          headerShown: false,
          title: 'Create League'
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false,
          title: 'Edit League'
        }} 
      />
    </Stack>
  );
}