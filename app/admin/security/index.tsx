// app/admin/security/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

interface SecurityLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp | any;
  status: 'success' | 'failed' | 'blocked';
  details?: string;
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  passwordExpiry: number; // days
  maxLoginAttempts: number;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  requireEmailVerification: boolean;
  allowMultipleSessions: boolean;
  auditLogging: boolean;
}

export default function AdminSecurityScreen() {
  const { user, isAdmin } = useAuth();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorRequired: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    ipWhitelist: [],
    requireEmailVerification: true,
    allowMultipleSessions: true,
    auditLogging: true
  });

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    fetchSecurityData();
  }, [isAdmin]);

  const fetchSecurityData = async () => {
    try {
      // Mock security logs (in a real app, this would come from actual logs)
      const mockLogs: SecurityLog[] = [
        {
          id: '1',
          action: 'Login',
          userId: 'user123',
          userEmail: 'admin@cifa.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)),
          status: 'success'
        },
        {
          id: '2',
          action: 'Failed Login',
          userId: 'unknown',
          userEmail: 'hacker@example.com',
          ipAddress: '45.33.32.156',
          userAgent: 'curl/7.68.0',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
          status: 'blocked',
          details: 'Multiple failed login attempts'
        },
        {
          id: '3',
          action: 'Password Change',
          userId: 'user456',
          userEmail: 'user@example.com',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
          status: 'success'
        },
        {
          id: '4',
          action: 'Admin Access',
          userId: user?.uid || 'current_user',
          userEmail: user?.email || 'current@admin.com',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)),
          status: 'success'
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSecurityData();
    setRefreshing(false);
  };

  const updateSecuritySetting = async (key: keyof SecuritySettings, value: any) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // In a real app, you would save to Firebase here
      // await updateDoc(doc(firestore, 'settings', 'security'), { [key]: value });
      
      Alert.alert('Success', 'Security setting updated successfully');
    } catch (error) {
      console.error('Error updating security setting:', error);
      Alert.alert('Error', 'Failed to update security setting');
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Security Logs',
      'Are you sure you want to clear all security logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setLogs([]);
            Alert.alert('Success', 'Security logs cleared successfully');
          }
        }
      ]
    );
  };

  const handleExportLogs = () => {
    Alert.alert('Export Logs', 'Log export functionality will be available soon');
  };

  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'Unknown';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge text="SUCCESS" variant="success" />;
      case 'failed':
        return <Badge text="FAILED" variant="warning" />;
      case 'blocked':
        return <Badge text="BLOCKED" variant="danger" />;
      default:
        return <Badge text={status} variant="secondary" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'log-in';
      case 'failed login':
        return 'x-circle';
      case 'password change':
        return 'key';
      case 'admin access':
        return 'shield';
      default:
        return 'activity';
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Security Center" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading security data...</Text>
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
        <Header title="Security Center" showBack={true} />
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563eb"
            />
          }
        >
          {/* Security Overview */}
          <Text style={styles.sectionTitle}>Security Overview</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <Card style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
              <Feather name="shield" size={20} color="#16a34a" />
              <Text style={styles.statValue}>
                {logs.filter(log => log.status === 'success').length}
              </Text>
              <Text style={styles.statLabel}>Successful</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
              <Feather name="alert-triangle" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>
                {logs.filter(log => log.status === 'failed').length}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
              <Feather name="shield-off" size={20} color="#dc2626" />
              <Text style={styles.statValue}>
                {logs.filter(log => log.status === 'blocked').length}
              </Text>
              <Text style={styles.statLabel}>Blocked</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <Feather name="activity" size={20} color="#2563eb" />
              <Text style={styles.statValue}>{logs.length}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </Card>
          </ScrollView>

          {/* Security Settings */}
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>Require 2FA for all admin accounts</Text>
              </View>
              <Switch
                value={settings.twoFactorRequired}
                onValueChange={(value) => updateSecuritySetting('twoFactorRequired', value)}
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={settings.twoFactorRequired ? '#2563eb' : '#f4f4f5'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Email Verification</Text>
                <Text style={styles.settingDescription}>Require email verification for new accounts</Text>
              </View>
              <Switch
                value={settings.requireEmailVerification}
                onValueChange={(value) => updateSecuritySetting('requireEmailVerification', value)}
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={settings.requireEmailVerification ? '#2563eb' : '#f4f4f5'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Multiple Sessions</Text>
                <Text style={styles.settingDescription}>Allow users to be logged in on multiple devices</Text>
              </View>
              <Switch
                value={settings.allowMultipleSessions}
                onValueChange={(value) => updateSecuritySetting('allowMultipleSessions', value)}
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={settings.allowMultipleSessions ? '#2563eb' : '#f4f4f5'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Audit Logging</Text>
                <Text style={styles.settingDescription}>Log all administrative actions</Text>
              </View>
              <Switch
                value={settings.auditLogging}
                onValueChange={(value) => updateSecuritySetting('auditLogging', value)}
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={settings.auditLogging ? '#2563eb' : '#f4f4f5'}
              />
            </View>
          </Card>

          {/* Security Parameters */}
          <Card style={styles.parametersCard}>
            <Text style={styles.cardTitle}>Security Parameters</Text>
            
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Password Expiry</Text>
              <Text style={styles.parameterValue}>{settings.passwordExpiry} days</Text>
            </View>
            
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Max Login Attempts</Text>
              <Text style={styles.parameterValue}>{settings.maxLoginAttempts} attempts</Text>
            </View>
            
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Session Timeout</Text>
              <Text style={styles.parameterValue}>{settings.sessionTimeout} minutes</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editParametersButton}
              onPress={() => Alert.alert('Coming Soon', 'Parameter editing will be available soon')}
            >
              <Feather name="edit-2" size={16} color="#2563eb" />
              <Text style={styles.editParametersText}>Edit Parameters</Text>
            </TouchableOpacity>
          </Card>

          {/* Recent Security Events */}
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>Recent Security Events</Text>
            <View style={styles.logsActions}>
              <TouchableOpacity 
                style={styles.logAction}
                onPress={handleExportLogs}
              >
                <Feather name="download" size={16} color="#2563eb" />
                <Text style={styles.logActionText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logAction}
                onPress={handleClearLogs}
              >
                <Feather name="trash-2" size={16} color="#ef4444" />
                <Text style={[styles.logActionText, { color: '#ef4444' }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="shield" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No security events found</Text>
              <Text style={styles.emptySubtext}>Security events will appear here when they occur</Text>
            </View>
          ) : (
            logs.map(log => (
              <Card key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logInfo}>
                    <View style={styles.logAction}>
                      <Feather name={getActionIcon(log.action) as any} size={16} color="#6b7280" />
                      <Text style={styles.logActionTitle}>{log.action}</Text>
                    </View>
                    <Text style={styles.logUser}>{log.userEmail}</Text>
                    <Text style={styles.logTime}>{formatDate(log.timestamp)}</Text>
                  </View>
                  {getStatusBadge(log.status)}
                </View>
                
                <View style={styles.logDetails}>
                  <View style={styles.logDetailItem}>
                    <Text style={styles.logDetailLabel}>IP Address:</Text>
                    <Text style={styles.logDetailValue}>{log.ipAddress}</Text>
                  </View>
                  <View style={styles.logDetailItem}>
                    <Text style={styles.logDetailLabel}>User Agent:</Text>
                    <Text style={styles.logDetailValue} numberOfLines={1}>
                      {log.userAgent}
                    </Text>
                  </View>
                  {log.details && (
                    <View style={styles.logDetailItem}>
                      <Text style={styles.logDetailLabel}>Details:</Text>
                      <Text style={styles.logDetailValue}>{log.details}</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))
          )}
          
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statCard: {
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  parametersCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  parameterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  parameterLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  editParametersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  editParametersText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  logsActions: {
    flexDirection: 'row',
  },
  logAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  logActionText: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  logCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logInfo: {
    flex: 1,
  },
  logActionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  logUser: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  logDetails: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  logDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  logDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    minWidth: 80,
  },
  logDetailValue: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
  },
  footer: {
    height: 40,
  },
});