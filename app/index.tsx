// app/index.tsx - Fixed to prevent navigation before mounting
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Wait for component to mount before navigating
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Navigate to home after component is mounted
      router.replace('/(tabs)/');
    }
  }, [isMounted]);

  // Show loading while preparing to navigate
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0047AB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});