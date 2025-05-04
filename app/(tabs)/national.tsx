import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/common/Header';

export default function NationalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="National Team" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.teamHeader}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>CAY</Text>
            </View>
          </View>
          <Text style={styles.teamName}>CAYMAN ISLANDS</Text>
          <Text style={styles.teamSubtitle}>National Football Team</Text>
        </View>
        {/* Content will be populated with national team components */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  teamHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});