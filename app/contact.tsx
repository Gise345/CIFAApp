// app/contact.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../src/components/common/Header';

export default function ContactScreen() {
  return (
    <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Contact Us" showBack={true} />
        <View style={styles.content}>
          <Text style={styles.comingSoonText}>Contact page coming soon</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});