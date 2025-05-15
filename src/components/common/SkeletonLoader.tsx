// src/components/common/SkeletonLoader.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * A skeleton loader component for displaying loading placeholders
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      })
    ).start();
  }, [animation]);

  const backgroundColor = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#f3f4f6', '#e5e7eb', '#f3f4f6'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

/**
 * A component that displays multiple skeleton loaders stacked vertically
 */
export const SkeletonRows: React.FC<{
  rows?: number;
  rowHeight?: number;
  rowWidth?: number | string;
  rowStyle?: any;
  spacing?: number;
  containerStyle?: any;
}> = ({
  rows = 3,
  rowHeight = 20,
  rowWidth = '100%',
  rowStyle,
  spacing = 8,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={rowWidth}
          height={rowHeight}
          style={[
            { marginBottom: index < rows - 1 ? spacing : 0 },
            rowStyle,
          ]}
        />
      ))}
    </View>
  );
};

/**
 * A skeleton loader for team stats items
 */
export const TeamStatsRowSkeleton: React.FC<{ count?: number }> = ({ 
  count = 3 
}) => {
  return (
    <View style={styles.statsSection}>
      <SkeletonLoader width={120} height={24} style={styles.titleSkeleton} />
      
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.statRow}>
          <View style={styles.statHeader}>
            <SkeletonLoader width={24} height={24} borderRadius={12} />
            <SkeletonLoader 
              width={120} 
              height={16} 
              style={styles.teamNameSkeleton} 
            />
            <SkeletonLoader width={40} height={16} />
          </View>
          <SkeletonLoader 
            width="100%" 
            height={8} 
            style={styles.barSkeleton} 
          />
        </View>
      ))}
    </View>
  );
};

/**
 * A skeleton loader for the top scorers table
 */
export const TopScorersSkeleton: React.FC<{ count?: number }> = ({ 
  count = 5 
}) => {
  return (
    <View style={styles.scorersSection}>
      <SkeletonLoader width={120} height={24} style={styles.titleSkeleton} />
      
      <View style={styles.scorersHeader}>
        <SkeletonLoader width="100%" height={16} />
      </View>
      
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.scorerRow}>
          <SkeletonLoader width={20} height={20} style={styles.positionSkeleton} />
          <View style={styles.playerInfoSkeleton}>
            <SkeletonLoader width={32} height={32} borderRadius={16} />
            <SkeletonLoader 
              width={100} 
              height={16} 
              style={styles.playerNameSkeleton} 
            />
          </View>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width={20} height={20} style={styles.goalsSkeleton} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#f3f4f6',
  },
  container: {
    width: '100%',
  },
  statsSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  titleSkeleton: {
    marginBottom: 16,
  },
  statRow: {
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamNameSkeleton: {
    flex: 1,
    marginHorizontal: 8,
  },
  barSkeleton: {
    marginTop: 4,
  },
  scorersSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  scorersHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  positionSkeleton: {
    marginRight: 8,
  },
  playerInfoSkeleton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  playerNameSkeleton: {
    marginLeft: 8,
  },
  goalsSkeleton: {
    marginLeft: 8,
  },
});

export default SkeletonLoader;