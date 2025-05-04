import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import FirebaseTest from '../../src/components/FirebaseTest';

export default function FirebaseTestScreen() {
  return (
    <ScrollView style={styles.container}>
      <FirebaseTest />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});