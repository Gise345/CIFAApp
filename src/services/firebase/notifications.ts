import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    orderBy,
    limit,
    Timestamp 
  } from 'firebase/firestore';
  import { firestore } from './config';
  import type { Firestore } from 'firebase/firestore';
  import * as Device from 'expo-device';
  import * as Notifications from 'expo-notifications';
  import { Platform } from 'react-native';
  
  
  export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    type: 'match' | 'news' | 'team' | 'general';
    targetUsers?: string[]; // Optional array of user IDs to target
    targetTeams?: string[]; // Optional array of team IDs to target
    sentAt?: Timestamp;
    scheduledFor?: Timestamp;
    status: 'draft' | 'scheduled' | 'sent' | 'failed';
    createdBy: string;
    createdAt?: any;
  }
  
  /**
   * Register for push notifications
   */
  export const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.log('Push notifications not available on emulator/simulator');
      return null;
    }
  
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
  
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
  
    // Get the token
    let token;
    try {
      if (Platform.OS === 'android') {
        // This is for Expo projects
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        token = (await Notifications.getDevicePushTokenAsync()).data;
      }
      console.log('Push token:', token);
      
      // Save the token to Firestore
      await saveUserPushToken(token);
      
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  };
  
  /**
   * Save user push token to Firestore
   */
  export const saveUserPushToken = async (token: string, userId?: string): Promise<void> => {
    try {
      if (!token) return;
      if (!firestore) {
        throw new Error('Firestore is not initialized');
      }
      const tokensCollection = collection(firestore as Firestore, 'pushTokens');
      const q = query(tokensCollection, where('token', '==', token));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Token doesn't exist, add it
        await addDoc(tokensCollection, {
          token,
          userId: userId || null,
          deviceType: Platform.OS,
          createdAt: Timestamp.now(),
          lastActive: Timestamp.now()
        });
      } else {
        // Token exists, update lastActive and userId if provided
        const docRef = doc(firestore as Firestore, 'pushTokens', querySnapshot.docs[0].id);
        const updateData: any = { lastActive: Timestamp.now() };
        
        if (userId) {
          updateData.userId = userId;
        }
        
        await updateDoc(docRef, updateData);
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };
  
  /**
   * Updates a user's subscription preferences
   */
  export const updateNotificationPreferences = async (
    userId: string, 
    preferences: {
      matchAlerts: boolean;
      news: boolean;
      teamUpdates: boolean;
      teamIds?: string[]; // Teams the user wants updates for
    }
  ): Promise<void> => {
    try {
      if (!firestore) {
        throw new Error('Firestore is not initialized');
      }
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        notificationSettings: preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  };
  
  /**
   * Get notifications for a user
   */
  export const getUserNotifications = async (userId: string, limit_num: number = 20): Promise<NotificationItem[]> => {
    try {
      // Get user data to check team preferences
      if (!firestore) {
        throw new Error('Firestore is not initialized');
      }
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const favoriteTeams = userData.favoriteTeams || [];
      
      // Get general notifications
      const generalQuery = query(
        collection(firestore, 'notifications'),
        where('type', '==', 'general'),
        where('status', '==', 'sent'),
        orderBy('sentAt', 'desc'),
        limit(limit_num)
      );
      
      const generalSnapshot = await getDocs(generalQuery);
      const generalNotifications = generalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NotificationItem));
      
      // Get team-specific notifications for user's favorite teams
      let teamNotifications: NotificationItem[] = [];
      if (favoriteTeams.length > 0) {
        const teamQuery = query(
          collection(firestore, 'notifications'),
          where('type', '==', 'team'),
          where('targetTeams', 'array-contains-any', favoriteTeams),
          where('status', '==', 'sent'),
          orderBy('sentAt', 'desc'),
          limit(limit_num)
        );
        
        const teamSnapshot = await getDocs(teamQuery);
        teamNotifications = teamSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as NotificationItem));
      }
      
      // Get user-specific notifications
      const userQuery = query(
        collection(firestore, 'notifications'),
        where('targetUsers', 'array-contains', userId),
        where('status', '==', 'sent'),
        orderBy('sentAt', 'desc'),
        limit(limit_num)
      );
      
      const userSnapshot = await getDocs(userQuery);
      const userNotifications = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NotificationItem));
      
      // Combine all notifications, sort by sentAt, and limit
      const allNotifications = [...generalNotifications, ...teamNotifications, ...userNotifications];
      allNotifications.sort((a, b) => {
        // Default to 0 if sentAt is undefined
        const aTime = a.sentAt?.toMillis() || 0;
        const bTime = b.sentAt?.toMillis() || 0;
        return bTime - aTime;
      });
      
      // Remove duplicates by id
      const uniqueNotifications = Array.from(
        new Map(allNotifications.map(item => [item.id, item])).values()
      );
      
      return uniqueNotifications.slice(0, limit_num);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Create a new notification
   */
  export const createNotification = async (notification: Omit<NotificationItem, 'id' | 'status' | 'sentAt'>): Promise<string> => {
    try {
      if (!firestore) {
        throw new Error('Firestore is not initialized');
      }
      const notificationData = {
        ...notification,
        status: notification.scheduledFor ? 'scheduled' : 'draft',
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(firestore, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Update a notification
   */
  export const updateNotification = async (notificationId: string, notificationData: Partial<NotificationItem>): Promise<void> => {
    try {
      const notificationRef = doc(firestore!, 'notifications', notificationId);
      
      // Check if notification can be updated
      const notificationDoc = await getDoc(notificationRef);
      if (!notificationDoc.exists()) {
        throw new Error('Notification not found');
      }
      
      const currentStatus = notificationDoc.data().status;
      if (currentStatus === 'sent') {
        throw new Error('Cannot update a notification that has already been sent');
      }
      
      await updateDoc(notificationRef, {
        ...notificationData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Send a notification
   */
  export const sendNotification = async (notificationId: string): Promise<void> => {
    try {
      if (!firestore) {
        throw new Error('Firestore is not initialized');
      }
      const notificationRef = doc(firestore!, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (!notificationDoc.exists()) {
        throw new Error('Notification not found');
      }
      
      const notification = notificationDoc.data() as NotificationItem;
      
      if (notification.status === 'sent') {
        throw new Error('Notification already sent');
      }
      
      // In a real implementation, you would use Firebase Cloud Messaging or Expo's push notification service
      // This is a simplified implementation
      console.log('Sending notification:', notification);
      
      // Update the notification status
      await updateDoc(notificationRef, {
        status: 'sent',
        sentAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Delete a notification
   */
  export const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      const notificationRef = doc(firestore!, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (!notificationDoc.exists()) {
        throw new Error('Notification not found');
      }
      
      const currentStatus = notificationDoc.data().status;
      if (currentStatus === 'sent') {
        throw new Error('Cannot delete a notification that has already been sent');
      }
      
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };