// src/utils/storageUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple logger for development
const logger = {
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error(...args);
    }
  }
};

interface StorageItem<T> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

export const storageUtils = {
  // Set item with optional TTL
  setItem: async <T>(key: string, value: T, ttl?: number): Promise<void> => {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        ...(ttl && { ttl })
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      logger.error('Error setting storage item:', error);
    }
  },

  // Get item with TTL check
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const itemStr = await AsyncStorage.getItem(key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      logger.error('Error getting storage item:', error);
      return null;
    }
  },

  // Remove item
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing storage item:', error);
    }
  },

  // Clear all expired items
  clearExpired: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const now = Date.now();
      
      for (const key of keys) {
        const itemStr = await AsyncStorage.getItem(key);
        if (itemStr) {
          try {
            const item: StorageItem<any> = JSON.parse(itemStr);
            if (item.ttl && now - item.timestamp > item.ttl) {
              await AsyncStorage.removeItem(key);
            }
          } catch {
            // Invalid JSON, remove it
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      logger.error('Error clearing expired items:', error);
    }
  },

  // Get storage statistics
  getStats: async (): Promise<{ keys: number; size: number }> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length; // Simplified size calculation
        }
      }
      
      return { keys: keys.length, size: totalSize };
    } catch (error) {
      logger.error('Error getting storage stats:', error);
      return { keys: 0, size: 0 };
    }
  }
};