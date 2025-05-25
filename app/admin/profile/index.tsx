// CIFAMobileApp/app/profile/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Button from '../../../src/components/common/Button';
import { useAuth } from '../../../src/hooks/useAuth';
import { auth, firestore, storage } from '../../../src/services/firebase/config';

interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  favoriteTeams: string[];
  notificationSettings: {
    matchAlerts: boolean;
    news: boolean;
    teamUpdates: boolean;
  };
}

export default function ProfileScreen() {
  const { user, authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile fields
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phoneNumber: '',
    favoriteTeams: [],
    notificationSettings: {
      matchAlerts: true,
      news: true,
      teamUpdates: true
    }
  });
  
  // Password change fields
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user || !firestore) return;
    
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          name: userData.name || user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          phoneNumber: userData.phoneNumber || '',
          favoriteTeams: userData.favoriteTeams || [],
          notificationSettings: userData.notificationSettings || {
            matchAlerts: true,
            news: true,
            teamUpdates: true
          }
        });
      } else {
        // Set default values from auth user
        setProfile({
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          phoneNumber: '',
          favoriteTeams: [],
          notificationSettings: {
            matchAlerts: true,
            news: true,
            teamUpdates: true
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a photo.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      await uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    if (!user || !storage) return;
    
    try {
      setSaving(true);
      
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(snapshot.ref);
      
      // Update auth profile
      await updateProfile(user, { photoURL });
      
      // Update local state
      setProfile(prev => ({ ...prev, photoURL }));
      
      Alert.alert('Success', 'Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !firestore) return;
    
    try {
      setSaving(true);
      
      // Update auth profile
      if (profile.name !== user.displayName) {
        await updateProfile(user, { displayName: profile.name });
      }
      
      // Update email if changed
      if (profile.email !== user.email && profile.email) {
        await updateEmail(user, profile.email);
      }
      
      // Update Firestore document
      await updateDoc(doc(firestore, 'users', user.uid), {
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        favoriteTeams: profile.favoriteTeams,
        notificationSettings: profile.notificationSettings,
        updatedAt: new Date()
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign in again to update your email';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    if (!user) return;
    if (!auth) {
      Alert.alert('Error', 'Authentication service not available');
      return;
    }
    
    try {
      setSaving(true);
      
      // Re-authenticate user first
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, user.email!, currentPassword);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      
      Alert.alert('Success', 'Password updated successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Profile" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Profile" showBack={true} />
        
        <ScrollView style={styles.content}>
          {/* Profile Photo Section */}
          <Card style={styles.photoCard}>
            <TouchableOpacity onPress={handlePickImage} disabled={saving}>
              <View style={styles.photoContainer}>
                {profile.photoURL ? (
                  <Image source={{ uri: profile.photoURL }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoInitial}>
                      {profile.name.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.photoEditButton}>
                  <Feather name="camera" size={20} color="white" />
                </View>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
            
            {!isEditing && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Feather name="edit-2" size={16} color="#2563eb" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Profile Form */}
          {isEditing && (
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={profile.name}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your name"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={profile.email}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={profile.phoneNumber}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, phoneNumber: text }))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.buttonRow}>
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  loading={saving}
                  style={styles.saveButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsEditing(false);
                    loadUserProfile();
                  }}
                  variant="outline"
                  style={styles.cancelButton}
                />
              </View>
            </Card>
          )}

          {/* Notification Settings */}
          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => setProfile(prev => ({
                ...prev,
                notificationSettings: {
                  ...prev.notificationSettings,
                  matchAlerts: !prev.notificationSettings.matchAlerts
                }
              }))}
            >
              <View style={styles.settingInfo}>
                <Feather name="bell" size={20} color="#2563eb" />
                <Text style={styles.settingText}>Match Alerts</Text>
              </View>
              <View style={[
                styles.toggle,
                profile.notificationSettings.matchAlerts && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleDot,
                  profile.notificationSettings.matchAlerts && styles.toggleDotActive
                ]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => setProfile(prev => ({
                ...prev,
                notificationSettings: {
                  ...prev.notificationSettings,
                  news: !prev.notificationSettings.news
                }
              }))}
            >
              <View style={styles.settingInfo}>
                <Feather name="file-text" size={20} color="#2563eb" />
                <Text style={styles.settingText}>News Updates</Text>
              </View>
              <View style={[
                styles.toggle,
                profile.notificationSettings.news && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleDot,
                  profile.notificationSettings.news && styles.toggleDotActive
                ]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => setProfile(prev => ({
                ...prev,
                notificationSettings: {
                  ...prev.notificationSettings,
                  teamUpdates: !prev.notificationSettings.teamUpdates
                }
              }))}
            >
              <View style={styles.settingInfo}>
                <Feather name="users" size={20} color="#2563eb" />
                <Text style={styles.settingText}>Team Updates</Text>
              </View>
              <View style={[
                styles.toggle,
                profile.notificationSettings.teamUpdates && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleDot,
                  profile.notificationSettings.teamUpdates && styles.toggleDotActive
                ]} />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Password Change */}
          <Card style={styles.passwordCard}>
            <TouchableOpacity
              style={styles.passwordHeader}
              onPress={() => setShowPasswordForm(!showPasswordForm)}
            >
              <View style={styles.passwordHeaderLeft}>
                <Feather name="lock" size={20} color="#ef4444" />
                <Text style={styles.passwordTitle}>Change Password</Text>
              </View>
              <Feather 
                name={showPasswordForm ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6b7280" 
              />
            </TouchableOpacity>
            
            {showPasswordForm && (
              <View style={styles.passwordForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Current Password</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    secureTextEntry
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    secureTextEntry
                  />
                </View>
                
                <Button
                  title="Update Password"
                  onPress={handleChangePassword}
                  loading={saving}
                  variant="danger"
                />
              </View>
            )}
          </Card>

          {/* Footer spacing */}
          <View style={styles.footer} />
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
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  saveButton: {
    flex: 2,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#2563eb',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleDotActive: {
    transform: [{ translateX: 20 }],
  },
  passwordCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  passwordForm: {
    marginTop: 16,
  },
  footer: {
    height: 40,
  },
});