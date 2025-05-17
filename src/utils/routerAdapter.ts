// src/utils/routerAdapter.ts - Compatibility utility for Expo Router v3
import { router } from 'expo-router';

/**
 * Adapter for router.push to handle different versions of Expo Router
 * @param path Path or object with pathname and params
 */
export const routerNavigate = (
  path: string | { pathname: string; params?: Record<string, string | number> }
): void => {
  try {
    if (typeof path === 'string') {
      // String path navigation
      router.push(path);
    } else {
      // Object-based navigation - convert to query string
      const { pathname, params } = path;
      
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
        const queryString = queryParams.toString();
        const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(fullPath);
      } else {
        router.push(pathname);
      }
    }
  } catch (error) {
    console.error('Navigation error:', error);
    
    // Last resort fallback 
    try {
      if (typeof path === 'string') {
        window.location.href = path;
      } else {
        window.location.href = path.pathname;
      }
    } catch (fallbackError) {
      console.error('Fallback navigation failed:', fallbackError);
    }
  }
};

/**
 * Get a parameter from the params object safely
 * @param params Router params object
 * @param name Parameter name
 * @returns Parameter value or null
 */
export const getParam = (params: any, name: string): string | null => {
  if (!params) return null;
  
  // Check if parameter exists directly
  if (params[name] !== undefined) {
    const value = params[name];
    
    // Handle array case
    if (Array.isArray(value)) {
      return value[0] || null;
    }
    
    return String(value);
  }
  
  return null;
};