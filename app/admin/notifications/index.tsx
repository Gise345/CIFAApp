// CIFAMobileApp/app/admin/notifications/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Link from 'expo-router/link';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';


import { useAuth } from '../../../src/hooks/useAuth';
import { NotificationItem, deleteNotification, sendNotification } from '../../../src/services/firebase/notifications';
import { getDocs, collection, query, orderBy, where, limit, Timestamp, getFirestore } from 'firebase/firestore';
import Header from '../../../src/components/common/Header';
import Button from '../../../src/components/common/Button';
import Badge from '../../../src/components/common/Badge';

export default function AdminNotificationsScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authorized
  useEffect(() => {
    if (user === null) {
      // Not logged in, redirect to login
      router.replace('/login');
    } else if (isAdmin === false) {
      // Logged in but not admin
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.back();
    }
  }, [user, isAdmin, router]);

  // Load notifications on mount
  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
    }
  }, [isAdmin]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get notifications from Firestore
      const db = getFirestore();
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NotificationItem));
      
      setNotifications(notificationsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Send a scheduled notification now
  const handleSendNow = async (notificationId: string) => {
    try {
      setActionLoading(true);
      await sendNotification(notificationId);
      
      // Refresh the list
      await loadNotifications();
      setActionLoading(false);
    } catch (err) {
      console.error('Error sending notification:', err);
      setActionLoading(false);
      Alert.alert('Error', 'Failed to send notification.');
    }
  };

  // Delete notification
  const handleDeleteNotification = (notification: NotificationItem) => {
    // Check if notification can be deleted (not already sent)
    if (notification.status === 'sent') {
      Alert.alert('Cannot Delete', 'Notifications that have already been sent cannot be deleted.');
      return;
    }
    
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this notification? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await deleteNotification(notification.id);
              
              // Refresh the list
              await loadNotifications();
              setActionLoading(false);
            } catch (err) {
              console.error('Error deleting notification:', err);
              setActionLoading(false);
              Alert.alert('Error', 'Failed to delete notification.');
            }
          }
        }
      ]
    );
  };

  // Get badge style based on notification status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge text="Sent" variant="success" />;
      case 'scheduled':
        return <Badge text="Scheduled" variant="info" />;
      case 'draft':
        return <Badge text="Draft" variant="secondary" />;
      case 'failed':
        return <Badge text="Failed" variant="danger" />;
      default:
        return <Badge text={status} variant="secondary" />;
    }
  };

  // Get badge style based on notification type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'match':
        return <Badge text="Match" variant="primary" />;
      case 'news':
        return <Badge text="News" variant="info" />;
      case 'team':
        return <Badge text="Team" variant="warning" />;
      case 'general':
        return <Badge text="General" variant="secondary" />;
      default:
        return <Badge text={type} variant="secondary" />;
    }
  };

  // Render each notification in the list
  const renderNotification = ({ item }: { item: NotificationItem }) => {
    return (
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Text 
            style={styles.notificationTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View style={styles.badgeContainer}>
            {getStatusBadge(item.status)}
            <View style={styles.badgeSpacer} />
            {getTypeBadge(item.type)}
          </View>
        </View>
        
        <Text 
          style={styles.notificationBody}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        
        <View style={styles.notificationMeta}>
          {item.sentAt && (
            <Text style={styles.metaText}>
              Sent: {formatDate(item.sentAt)}
            </Text>
          )}
          {item.scheduledFor && item.status !== 'sent' && (
            <Text style={styles.metaText}>
              Scheduled: {formatDate(item.scheduledFor)}
            </Text>
          )}
          {!item.sentAt && !item.scheduledFor && (
            <Text style={styles.metaText}>
              Created: {formatDate(item.createdAt || new Date())}
            </Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          {item.status === 'scheduled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.sendButton]}
              onPress={() => handleSendNow(item.id)}
              disabled={actionLoading}
            >
              <Feather name="send" size={16} color="#047857" />
              <Text style={styles.sendButtonText}>Send Now</Text>
            </TouchableOpacity>
          )}
          
          {item.status !== 'sent' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteNotification(item)}
              disabled={actionLoading}
            >
              <Feather name="trash-2" size={16} color="#dc2626" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing && notifications.length === 0) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Manage Notifications" showBack={true} />
          <View style={styles.content}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Render screen
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Manage Notifications" showBack={true} />
        <View style={styles.content}>
          {actionLoading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
          
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Notifications</Text>
            <Link href="/admin/notifications/create" asChild>
              <Button 
                title="Create New" 
                onPress={() => {}}
                style={styles.createButton}
              />
            </Link>
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={40} color="#ef4444" />
              <Text style={styles.errorText}>Failed to load notifications</Text>
              <Button 
                title="Retry" 
                onPress={loadNotifications}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Feather name="bell" size={40} color="#6b7280" />
                  <Text style={styles.emptyText}>No notifications found</Text>
                  <Link href="/admin/notifications/create" asChild>
                    <Button 
                      title="Create First Notification" 
                      onPress={() => {}}
                      style={styles.emptyButton}
                    />
                  </Link>
                </View>
              )}
            />
          )}
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
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    minWidth: 100,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 180,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSpacer: {
    width: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  notificationMeta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#ecfdf5',
  },
  sendButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
});