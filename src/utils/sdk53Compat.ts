// CIFAMobileApp/src/utils/sdk53Compat.ts
// This file provides compatibility functions for Expo SDK 53 changes

import * as ExpoRouter from 'expo-router';

/**
 * Compatible version of useLocalSearchParams for SDK 53
 * This handles the API changes in Expo Router v3
 */
export function useLocalSearchParams<T extends Record<string, string> = Record<string, string>>(): T {
  try {
    // In SDK 53, useLocalSearchParams might be unavailable or have a different API
    // This try/catch ensures we recover gracefully if the API changes
    
    // @ts-ignore - SDK 53 type definitions are evolving
    const params = ExpoRouter.useGlobalSearchParams();
    return params as T;
  } catch (error) {
    console.warn('Error using SDK 53 router params:', error);
    return {} as T;
  }
}

/**
 * Makes navigation API compatible with SDK 53
 */
export function navigateSafely(path: string | { pathname: string, params?: Record<string, string> }): void {
  try {
    if (typeof path === 'string') {
      // String paths are usually safer
      ExpoRouter.router.push(path);
    } else {
      // For object-style navigation, convert to query string
      const { pathname, params } = path;
      
      if (!params || Object.keys(params).length === 0) {
        ExpoRouter.router.push(pathname);
        return;
      }
      
      // Build query string
      const queryParams = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const fullPath = `${pathname}?${queryParams}`;
      ExpoRouter.router.push(fullPath);
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Try alternate approach if first fails
    try {
      if (typeof path === 'string') {
        // @ts-ignore - fallback for web
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = path;
        }
      } else {
        // @ts-ignore - fallback for web
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = path.pathname;
        }
      }
    } catch (e) {
      console.error('Failed to navigate:', e);
    }
  }
}