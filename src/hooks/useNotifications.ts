// CIFAMobileApp/src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  registerForPushNotifications,
  saveUserPushToken,
  updateNotificationPreferences,
  getUserNotifications,
  NotificationItem
} from '../services/firebase/notifications';
import { useAuth } from './useAuth';

interface NotificationPreferences {
  matchAlerts: boolean;
  news: boolean;
  teamUpdates: boolean;
  teamIds?: string[];
}

interface NotificationsState {
  loading: boolean;
  error: string | null;
  pushToken: string | null;
  notifications: NotificationItem[];
  preferences: NotificationPreferences | null;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationsState>({
    loading: false,
    error: null,
    pushToken: null,
    notifications: [],
    preferences: null
  });

  // Register for push notifications
  const setupPushNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const token = await registerForPushNotifications();
      setState(prev => ({ ...prev, pushToken: token, loading: false }));
      
      // Save token to user profile if logged in
      if (token && user?.uid) {
        await saveUserPushToken(token, user.uid);
      }
      
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set up push notifications';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, [user?.uid]);

  // Update notification preferences
  const updatePreferences = useCallback(async (preferences: NotificationPreferences) => {
    if (!user?.uid) {
      setState(prev => ({ 
        ...prev, 
        error: 'User not authenticated', 
        loading: false 
      }));
      return false;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await updateNotificationPreferences(user.uid, preferences);
      setState(prev => ({ 
        ...prev, 
        preferences, 
        loading: false 
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update notification preferences';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return false;
    }
  }, [user?.uid]);

  // Fetch user's notifications
  const fetchNotifications = useCallback(async (limit: number = 20) => {
    if (!user?.uid) {
      setState(prev => ({ 
        ...prev, 
        error: 'User not authenticated', 
        loading: false,
        notifications: [] 
      }));
      return [];
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const notifications = await getUserNotifications(user.uid, limit);
      setState(prev => ({ ...prev, notifications, loading: false }));
      return notifications;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, [user?.uid]);

  // Fetch user's notification preferences from Firestore
  const fetchPreferences = useCallback(async () => {
    if (!user?.uid) return null;
    
    try {
      // This would be implemented in a real app by fetching the user document
      // and extracting the notification preferences
      // For now, we'll set default preferences
      const defaultPreferences: NotificationPreferences = {
        matchAlerts: true,
        news: true,
        teamUpdates: true,
        teamIds: []
      };
      
      setState(prev => ({ ...prev, preferences: defaultPreferences }));
      return defaultPreferences;
    } catch (error) {
      return null;
    }
  }, [user?.uid]);

  // Set up push notifications and fetch initial data on mount
  useEffect(() => {
    if (user?.uid) {
      setupPushNotifications();
      fetchNotifications();
      fetchPreferences();
    }
  }, [user?.uid, setupPushNotifications, fetchNotifications, fetchPreferences]);

  return {
    ...state,
    setupPushNotifications,
    updatePreferences,
    fetchNotifications
  };
};

export default useNotifications;