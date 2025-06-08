// src/utils/navigationDebug.ts - Navigation Debug Utility for SDK 52
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Debug utility for navigation issues in Expo SDK 52
 */
export class NavigationDebugger {
  static logNavigation(action: string, route: string, params?: any) {
    console.log(`[NAVIGATION] ${action}:`, {
      route,
      params,
      timestamp: new Date().toISOString()
    });
  }

  static safeNavigate(route: string, options?: { replace?: boolean; fallback?: string }) {
    this.logNavigation('ATTEMPTING', route);
    
    try {
      if (options?.replace) {
        router.replace(route as any);
      } else {
        router.push(route as any);
      }
      this.logNavigation('SUCCESS', route);
    } catch (error) {
      this.logNavigation('ERROR', route);
      console.error('Primary navigation failed:', error);
      
      // Try alternative navigation methods
      this.tryFallbackNavigation(route, options);
    }
  }

  private static tryFallbackNavigation(route: string, options?: { replace?: boolean; fallback?: string }) {
    try {
      this.logNavigation('FALLBACK_ATTEMPT', route);
      
      // Method 2: Try with different router method
      if (options?.replace) {
        router.push(route as any);
      } else {
        router.replace(route as any);
      }
      
      this.logNavigation('FALLBACK_SUCCESS', route);
    } catch (error2) {
      console.error('Fallback navigation failed:', error2);
      
      // Method 3: Try with navigate if available
      try {
        this.logNavigation('NAVIGATE_ATTEMPT', route);
        // @ts-ignore - SDK compatibility
        router.navigate(route);
        this.logNavigation('NAVIGATE_SUCCESS', route);
      } catch (error3) {
        console.error('Navigate method failed:', error3);
        
        // Final fallback - show error
        if (options?.fallback) {
          Alert.alert(
            'Navigation Error',
            `Unable to navigate to ${route}. ${options.fallback}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Navigation Error',
            `Unable to navigate to ${route}. Please try again or contact support.`,
            [{ text: 'OK' }]
          );
        }
      }
    }
  }

  static goBack() {
    try {
      this.logNavigation('BACK', 'previous');
      router.back();
    } catch (error) {
      console.error('Back navigation failed:', error);
      Alert.alert('Navigation Error', 'Unable to go back. Please use the app navigation.');
    }
  }

  static checkRouterState() {
    try {
      console.log('[NAVIGATION] Router state check:', {
        // Add other router state properties as available in SDK 52
      });
    } catch (error) {
      console.error('Router state check failed:', error);
    }
  }
}

// Convenience functions for common navigation patterns
export const navigateToCreateNews = () => {
  NavigationDebugger.safeNavigate('/admin/news/create', {
    fallback: 'Try refreshing the app and accessing the admin panel again.'
  });
};

export const navigateToEditNews = (id: string) => {
  NavigationDebugger.safeNavigate(`/admin/news/edit/${id}`, {
    fallback: 'Try refreshing the app and accessing the admin panel again.'
  });
};

export const navigateToAdminNews = () => {
  NavigationDebugger.safeNavigate('/admin/news', {
    fallback: 'Try accessing the admin panel from the main menu.'
  });
};

export const navigateToAdmin = () => {
  NavigationDebugger.safeNavigate('/admin', {
    fallback: 'Try logging out and logging back in as an admin.'
  });
};

export const safeGoBack = () => {
  NavigationDebugger.goBack();
};

// Export the debugger for direct use
export default NavigationDebugger;