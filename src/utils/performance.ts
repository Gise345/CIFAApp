// src/utils/performance.ts
import React from 'react';
import { useCallback, useMemo, useRef } from 'react';

/**
 * Custom logger that only logs in development
 */
export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error(...args);
    }
  },
  info: (...args: any[]) => {
    if (__DEV__) {
      console.info(...args);
    }
  }
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  renderCount.current += 1;

  return useMemo(() => ({
    renderCount: renderCount.current,
    logRender: () => {
      if (__DEV__ && renderCount.current > 10) {
        logger.warn(`${componentName} has rendered ${renderCount.current} times`);
      }
    },
    logPerformance: (operation: string) => {
      if (__DEV__) {
        const duration = Date.now() - startTime.current;
        if (duration > 100) {
          logger.warn(`${componentName} ${operation} took ${duration}ms`);
        }
      }
    }
  }), [componentName]);
};

/**
 * Optimized debounce hook
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps]
  );
};

/**
 * Optimized throttle hook
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
) => {
  const lastCall = useRef<number>(0);
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay, ...deps]
  );
};

/**
 * Memory management utilities
 */
export const memoryUtils = {
  // Clean up object references
  cleanup: (obj: any) => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        delete obj[key];
      });
    }
  },

  // Force garbage collection (development only)
  forceGC: () => {
    if (__DEV__ && (global as any).gc) {
      (global as any).gc();
    }
  },

  // Monitor memory usage
  getMemoryUsage: () => {
    if (__DEV__ && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }
};

/**
 * Image optimization utilities
 */
export const imageUtils = {
  // Get optimized image URL
  getOptimizedImageUrl: (url: string, width: number, height?: number) => {
    if (!url) return url;
    
    // Add your image optimization service URL here
    // For example, if using Cloudinary or similar service
    const params = height ? `w_${width},h_${height}` : `w_${width}`;
    return url.includes('cloudinary') ? 
      url.replace('/upload/', `/upload/${params}/`) : 
      url;
  },

  // Preload images (React Native compatible)
  preloadImage: (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { Image } = require('react-native');
      Image.prefetch(url)
        .then(() => resolve())
        .catch(reject);
    });
  }
};

/**
 * List rendering optimizations
 */
export const listUtils = {
  // Get item layout for FlatList optimization
  getItemLayout: (itemHeight: number) => (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),

  // Key extractor optimization
  keyExtractor: (item: any, index: number) => {
    return item.id || item._id || String(index);
  },

  // Render item optimization with React.memo
  renderItemOptimized: <T>(
    component: React.ComponentType<{ item: T; index: number }>
  ) => {
    const MemoizedComponent = React.memo(component);
    return function RenderItem({ item, index }: { item: T; index: number }) {
      return React.createElement(MemoizedComponent, { item, index });
    };
  }
};

/**
 * Network optimization
 */
export const networkUtils = {
  // Check network status (simplified for React Native)
  isOnline: () => {
    return true; // In React Native, use NetInfo library for actual network status
  },

  // Retry mechanism for failed requests
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError!;
  }
};

/**
 * Device optimization utilities
 */
import { Dimensions, Platform } from 'react-native';

export const deviceUtils = {
  // Get device dimensions
  getScreenDimensions: () => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  },

  // Check if device is tablet
  isTablet: () => {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = height / width;
    return Math.min(width, height) >= 768 && (aspectRatio > 1.2 && aspectRatio < 2.0);
  },

  // Get safe padding for different devices
  getSafePadding: () => {
    const { width } = Dimensions.get('window');
    if (width < 400) return 12; // Small phones
    if (width < 500) return 16; // Regular phones
    return 20; // Large phones/tablets
  },

  // Check platform capabilities
  supportsHapticFeedback: () => Platform.OS === 'ios',
  supportsBlur: () => Platform.OS === 'ios',
  supportsGradients: () => true,
};

/**
 * Bundle size optimization (React Native compatible)
 */
export const bundleUtils = {
  // Lazy load components
  lazyLoad: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(importFn);
  },

  // Dynamic imports for large libraries (simplified)
  loadLibrary: async <T>(moduleName: string): Promise<T> => {
    try {
      const module = require(moduleName);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load module: ${moduleName}`);
    }
  }
};