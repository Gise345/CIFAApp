// app/(tabs)/more.tsx - Fixed Admin Portal Navigation
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../src/components/common/Header';
import { useAuth } from '../../src/hooks/useAuth';
import Card from '../../src/components/common/Card';

export default function MoreScreen() {
  const { user, authUser, isAdmin, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const safeNavigate = (route: string) => {
    try {
      console.log('Navigating to:', route);
      router.push(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to the requested page.');
    }
  };

  const handleSignIn = () => {
    safeNavigate('/(auth)/login');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              await signOut();
              // Stay on the same page, just update the UI
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setSigningOut(false);
            }
          }
        }
      ]
    );
  };

  const handleAdminPortal = () => {
    console.log('Admin portal clicked');
    console.log('User:', user?.email);
    console.log('Is Admin:', isAdmin);
    
    if (!user) {
      Alert.alert('Login Required', 'Please log in first.');
      handleSignIn();
      return;
    }
    
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      return;
    }
    
    // Force navigation to admin portal
    try {
      console.log('Navigating to admin portal...');
      router.push('/admin/' as any);
    } catch (error) {
      console.error('Admin portal navigation error:', error);
      // Try alternative navigation method
      try {
        router.replace('/admin/' as any);
      } catch (fallbackError) {
        console.error('Fallback admin navigation also failed:', fallbackError);
        Alert.alert('Navigation Error', 'Could not access admin portal. Please try again.');
      }
    }
  };

  const handleProfile = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to view your profile.');
      handleSignIn();
      return;
    }
    safeNavigate('/profile');
  };

  const handleNotificationSettings = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to manage notification settings.');
      handleSignIn();
      return;
    }
    safeNavigate('/notification-settings');
  };

  const handleFavoriteTeams = () => {
    safeNavigate('/favorites');
  };

  const handleAboutCIFA = () => {
    safeNavigate('/about');
  };

  const handleContactUs = () => {
    safeNavigate('/contact');
  };

  const handlePrivacyPolicy = () => {
    safeNavigate('/privacy-policy');
  };

  const handleTerms = () => {
    safeNavigate('/terms');
  };

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="More" />
        <ScrollView style={styles.scrollView}>
          {/* User Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ACCOUNT</Text>
            
            {user ? (
              <>
                {/* User Profile Card */}
                <Card style={styles.profileCard}>
                  <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {authUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>
                        {authUser?.displayName || 'User'}
                      </Text>
                      <Text style={styles.profileEmail}>
                        {authUser?.email}
                      </Text>
                      {isAdmin && (
                        <View style={styles.adminBadge}>
                          <Feather name="shield" size={12} color="white" />
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>

                <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
                  <Feather name="user" size={20} color="#2563eb" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Profile</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>

                {/* Admin Portal - Only visible to admins */}
                {isAdmin && (
                  <TouchableOpacity 
                    style={[styles.menuItem, styles.adminMenuItem]} 
                    onPress={handleAdminPortal}
                  >
                    <Feather name="shield" size={20} color="#ef4444" style={styles.menuIcon} />
                    <Text style={[styles.menuText, styles.adminMenuText]}>Admin Portal</Text>
                    <Feather name="chevron-right" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.menuItem} onPress={handleNotificationSettings}>
                  <Feather name="bell" size={20} color="#2563eb" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Notification Settings</Text>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={handleSignOut}
                  disabled={signingOut}
                >
                  <Feather name="log-out" size={20} color="#ef4444" style={styles.menuIcon} />
                  <Text style={[styles.menuText, { color: '#ef4444' }]}>
                    {signingOut ? 'Signing Out...' : 'Sign Out'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                  <LinearGradient
                    colors={['#2563eb', '#1d4ed8']}
                    style={styles.signInGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Feather name="log-in" size={20} color="white" />
                    <Text style={styles.signInText}>Sign In / Register</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <Text style={styles.signInDescription}>
                  Sign in to access your profile, save favorite teams, and get personalized notifications
                </Text>
              </>
            )}
          </View>
          
          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>APP</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleFavoriteTeams}>
              <Feather name="heart" size={20} color="#2563eb" style={styles.menuIcon} />
              <Text style={styles.menuText}>Favorite Teams</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="settings" size={20} color="#2563eb" style={styles.menuIcon} />
              <Text style={styles.menuText}>App Settings</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
              <Feather name="file-text" size={20} color="#2563eb" style={styles.menuIcon} />
              <Text style={styles.menuText}>Terms & Conditions</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
              <Feather name="lock" size={20} color="#2563eb" style={styles.menuIcon} />
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ABOUT</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleAboutCIFA}>
              <Feather name="shield" size={20} color="#2563eb" style={styles.menuIcon} />
              <Text style={styles.menuText}>About CIFA</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="video" size={20} color="#2563eb" style={styles.menuIcon} />
              <Text style={styles.menuText}>Football TV</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleContactUs}>
              <Feather name="mail" size={20} color="#2563eb" style={styles.menuIcon} />
              <Text style={styles.menuText}>Contact Us</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          {/* Debug Info for Admin (only show in development) */}
          {__DEV__ && user && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>DEBUG INFO</Text>
              <Text style={styles.debugText}>User Email: {user.email}</Text>
              <Text style={styles.debugText}>Is Admin: {isAdmin ? 'Yes' : 'No'}</Text>
              <Text style={styles.debugText}>User ID: {user.uid}</Text>
            </View>
          )}
          
          {/* Footer */}
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  profileCard: {
    marginBottom: 12,
    padding: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  signInButton: {
    marginBottom: 12,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  signInText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  signInDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  adminMenuItem: {
    backgroundColor: '#fef2f2',
    marginHorizontal: -15,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  adminMenuText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
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