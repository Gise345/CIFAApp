// src/components/helpers/StatsScreenWrapper.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBoundary from '../common/ErrorBoundary';

interface StatsScreenWrapperProps {
  children: ReactNode;
}

/**
 * A wrapper component for stats screens that provides consistent styling and error handling
 */
const StatsScreenWrapper: React.FC<StatsScreenWrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default StatsScreenWrapper;