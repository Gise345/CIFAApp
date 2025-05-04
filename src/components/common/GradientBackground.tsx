// CIFAMobileApp/src/components/common/GradientBackground.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  children: ReactNode;
  style?: any;
  variant?: 'primary' | 'secondary' | 'dark' | 'match' | 'feature';
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  variant = 'primary',
}) => {
  // Get the gradient colors based on the variant
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#E50914', '#C41E3A'] as const; // Red gradient
      case 'secondary':
        return ['#0047AB', '#191970'] as const; // blue
      case 'dark':
        return ['#0f0c29', '#302b63', '#24243e'] as const; // Dark blue gradient
      case 'match':
        return ['#3a0ca3', '#4361ee'] as const; // Deep blue match gradient
      case 'feature':
        return ['#7c3aed', '#3a0ca3'] as const; // Purple feature section
      default:
        return ['#d72660', '#7c3aed', '#3a0ca3', '#4361ee'] as const;
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;