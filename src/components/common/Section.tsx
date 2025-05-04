import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

interface SectionProps {
  title: string;
  children: ReactNode;
  viewAllText?: string;
  onViewAll?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  viewAllText = 'View all',
  onViewAll,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>{viewAllText}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 12,
    color: '#2563eb',
  },
});

export default Section;