// app/favorites.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../src/components/common/Header';

export default function FavoritesScreen() {
  return (
    <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Favorite Teams" showBack={true} />
        <View style={styles.content}>
          <Text style={styles.comingSoonText}>Favorite Teams coming soon</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});