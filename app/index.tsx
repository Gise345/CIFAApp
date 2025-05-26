// app/index.tsx - Entry point that goes directly to home
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Always redirect to home page first
    // Users can login/register from the More tab
    router.replace('/(tabs)/');
  }, []);

  // Return null while redirecting
  return null;
}