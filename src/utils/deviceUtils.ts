// src/utils/deviceUtils.ts
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