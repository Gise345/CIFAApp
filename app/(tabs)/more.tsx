// CIFAMobileApp/app/(tabs)/more.tsx
import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Header from '../../src/components/common/Header';

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="More" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="user" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>Team Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="bell" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>Notification Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="heart" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>Favorite Teams</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="settings" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>App Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="file-text" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>Terms & Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ABOUT</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="shield" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>About CIFA</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="video" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>Football TV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="award" size={20} color="#2563eb" style={styles.menuIcon} />
            <Text style={styles.menuText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>CIFA</Text>
          </View>
          <Text style={styles.appName}>CIFA Mobile App</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Cayman Islands Football Association</Text>
          <Text style={styles.developerText}>Created by Invovibe Tech Cayman</Text>
        </View>
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
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
    color: '#111827',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  developerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});