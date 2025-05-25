// CIFAMobileApp/app/notification-settings.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import { useAuth } from '../../../src/hooks/useAuth';
import { firestore } from '../../../src/services/firebase/config';

interface NotificationSettings {
  allNotifications: boolean;
  matchAlerts: {
    enabled: boolean;
    kickoffReminders: boolean;
    finalScores: boolean;
    liveUpdates: boolean;
  };
  news: {
    enabled: boolean;
    breakingNews: boolean;
    featuredArticles: boolean;
  };
  teamUpdates: {
    enabled: boolean;
    selectedTeams: string[];
    lineupAnnouncements: boolean;
    transfers: boolean;
  };
  pushSettings: {
    sound: boolean;
    vibration: boolean;
    showPreview: boolean;
  };
}

export default function NotificationSettingsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    allNotifications: true,
    matchAlerts: {
      enabled: true,
      kickoffReminders: true,
      finalScores: true,
      liveUpdates: false,
    },
    news: {
      enabled: true,
      breakingNews: true,
      featuredArticles: true,
    },
    teamUpdates: {
      enabled: true,
      selectedTeams: [],
      lineupAnnouncements: true,
      transfers: true,
    },
    pushSettings: {
      sound: true,
      vibration: true,
      showPreview: true,
    }
  });

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    
    loadSettings();
    checkNotificationPermissions();
  }, [user]);

  const checkNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive updates from CIFA.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const loadSettings = async () => {
    if (!user || !firestore) return;
    
    try {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.notificationSettings) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...userData.notificationSettings
          }));
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user || !firestore) return;
    
    try {
      setSaving(true);
      
      await updateDoc(doc(firestore, 'users', user.uid), {
        notificationSettings: settings,
        updatedAt: new Date()
      });
      
      Alert.alert('Success', 'Notification settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleMasterSwitch = () => {
    setSettings(prev => ({
      ...prev,
      allNotifications: !prev.allNotifications
    }));
  };

  const toggleCategory = (category: 'matchAlerts' | 'news' | 'teamUpdates') => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: !prev[category].enabled
      }
    }));
  };

  const toggleSubSetting = (
    category: 'matchAlerts' | 'news' | 'teamUpdates' | 'pushSettings',
    setting: string
  ) => {
    setSettings(prev => {
      const categorySettings = prev[category];
      
      // Type guard to ensure we have the right properties
      if (setting in categorySettings) {
        return {
          ...prev,
          [category]: {
            ...categorySettings,
            [setting]: !(categorySettings as any)[setting]
          }
        };
      }
      
      return prev;
    });
  };

  const renderToggle = (value: boolean) => (
    <View style={[styles.toggle, value && styles.toggleActive]}>
      <View style={[styles.toggleDot, value && styles.toggleDotActive]} />
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Notification Settings" showBack={true} />
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
        <Header title="Notification Settings" showBack={true} />
        
        <ScrollView style={styles.content}>
          {/* Master Toggle */}
          <Card style={styles.masterCard}>
            <TouchableOpacity 
              style={styles.masterToggle}
              onPress={toggleMasterSwitch}
            >
              <View>
                <Text style={styles.masterTitle}>All Notifications</Text>
                <Text style={styles.masterSubtitle}>
                  Turn on/off all notifications from CIFA
                </Text>
              </View>
              {renderToggle(settings.allNotifications)}
            </TouchableOpacity>
          </Card>

          {/* Match Alerts */}
          <Card style={styles.categoryCard}>
            <TouchableOpacity 
              style={styles.categoryHeader}
              onPress={() => toggleCategory('matchAlerts')}
            >
              <View style={styles.categoryInfo}>
                <Feather name="calendar" size={24} color="#2563eb" />
                <Text style={styles.categoryTitle}>Match Alerts</Text>
              </View>
              {renderToggle(settings.matchAlerts.enabled && settings.allNotifications)}
            </TouchableOpacity>
            
            {settings.matchAlerts.enabled && (
              <View style={styles.subSettings}>
                <TouchableOpacity 
                  style={styles.subSettingRow}
                  onPress={() => toggleSubSetting('matchAlerts', 'kickoffReminders')}
                  disabled={!settings.allNotifications}
                >
                  <Text style={styles.subSettingText}>Kickoff Reminders</Text>
                  {renderToggle(settings.matchAlerts.kickoffReminders && settings.allNotifications)}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.subSettingRow}
                  onPress={() => toggleSubSetting('matchAlerts', 'finalScores')}
                  disabled={!settings.allNotifications}
                >
                  <Text style={styles.subSettingText}>Final Scores</Text>
                  {renderToggle(settings.matchAlerts.finalScores && settings.allNotifications)}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.subSettingRow}
                  onPress={() => toggleSubSetting('matchAlerts', 'liveUpdates')}
                  disabled={!settings.allNotifications}
                >
                  <Text style={styles.subSettingText}>Live Match Updates</Text>
                  {renderToggle(settings.matchAlerts.liveUpdates && settings.allNotifications)}
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* News Updates */}
          <Card style={styles.categoryCard}>
            <TouchableOpacity 
              style={styles.categoryHeader}
              onPress={() => toggleCategory('news')}
            >
              <View style={styles.categoryInfo}>
                <Feather name="file-text" size={24} color="#16a34a" />
                <Text style={styles.categoryTitle}>News Updates</Text>
              </View>
              {renderToggle(settings.news.enabled && settings.allNotifications)}
            </TouchableOpacity>
            
            {settings.news.enabled && (
              <View style={styles.subSettings}>
                <TouchableOpacity 
                  style={styles.subSettingRow}
                  onPress={() => toggleSubSetting('news', 'breakingNews')}
                  disabled={!settings.allNotifications}
                >
                  <Text style={styles.subSettingText}>Breaking News</Text>
                  {renderToggle(settings.news.breakingNews && settings.allNotifications)}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.subSettingRow}
                  onPress={() => toggleSubSetting('news', 'featuredArticles')}
                  disabled={!settings.allNotifications}
                >
                  <Text style={styles.subSettingText}>Featured Articles</Text>
                  {renderToggle(settings.news.featuredArticles && settings.allNotifications)}
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Team Updates */}
          <Card style={styles.categoryCard}>
            <TouchableOpacity 
              style={styles.categoryHeader}
              onPress={() => toggleCategory('teamUpdates')}
            >
              <View style={styles.categoryInfo}>
                <Feather name="users" size={24} color="#f59e0b" />
                <Text style={styles.categoryTitle}>Team Updates</Text>
              </View>
              {renderToggle(settings.teamUpdates.enabled && settings.allNotifications)}
            </TouchableOpacity>
            
            {settings.teamUpdates.enabled && (
              <View style={styles.subSettings}>
                <TouchableOpacity 
                  style={styles.selectTeamsButton}
                  onPress={() => router.push('/notification-settings/teams')}
                >
                  <Text style={styles.selectTeamsText}>Select Teams to Follow</Text>
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>
                      {settings.teamUpdates.selectedTeams.length} selected
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#6b7280" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.subSettingRow}
                  onPress={() => toggleSubSetting('teamUpdates', 'lineupAnnouncements')}
                  disabled={!settings.allNotifications}
                >
                  <Text style={styles.subSettingText}>Lineup Announcements</Text>
                  {renderToggle(settings.teamUpdates.lineupAnnouncements && settings.allNotifications)}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.subSettingRow}
                  onPress={() => toggleSubSetting('teamUpdates', 'transfers')}
                  disabled={!settings.allNotifications}
                >
                  <Text style={styles.subSettingText}>Transfer News</Text>
                  {renderToggle(settings.teamUpdates.transfers && settings.allNotifications)}
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Push Notification Settings */}
          <Card style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <Feather name="bell" size={24} color="#ef4444" />
                <Text style={styles.categoryTitle}>Notification Preferences</Text>
              </View>
            </View>
            
            <View style={styles.subSettings}>
              <TouchableOpacity 
                style={styles.subSettingRow}
                onPress={() => toggleSubSetting('pushSettings', 'sound')}
                disabled={!settings.allNotifications}
              >
                <Text style={styles.subSettingText}>Sound</Text>
                {renderToggle(settings.pushSettings.sound && settings.allNotifications)}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.subSettingRow}
                onPress={() => toggleSubSetting('pushSettings', 'vibration')}
                disabled={!settings.allNotifications}
              >
                <Text style={styles.subSettingText}>Vibration</Text>
                {renderToggle(settings.pushSettings.vibration && settings.allNotifications)}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.subSettingRow}
                onPress={() => toggleSubSetting('pushSettings', 'showPreview')}
                disabled={!settings.allNotifications}
              >
                <Text style={styles.subSettingText}>Show Preview</Text>
                {renderToggle(settings.pushSettings.showPreview && settings.allNotifications)}
              </TouchableOpacity>
            </View>
          </Card>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Feather name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </>
            )}
          </TouchableOpacity>

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
  masterCard: {
    margin: 16,
    padding: 0,
  },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  masterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  masterSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryCard: {
    margin: 16,
    marginTop: 0,
    padding: 0,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  subSettings: {
    paddingVertical: 8,
  },
  subSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subSettingText: {
    fontSize: 15,
    color: '#374151',
  },
  selectTeamsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectTeamsText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  selectedBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedBadgeText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    height: 40,
  },
});