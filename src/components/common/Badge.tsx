import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBadge;
      case 'secondary':
        return styles.secondaryBadge;
      case 'success':
        return styles.successBadge;
      case 'danger':
        return styles.dangerBadge;
      case 'warning':
        return styles.warningBadge;
      case 'info':
        return styles.infoBadge;
      default:
        return styles.primaryBadge;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'success':
        return styles.successText;
      case 'danger':
        return styles.dangerText;
      case 'warning':
        return styles.warningText;
      case 'info':
        return styles.infoText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '500',
  },
  primaryBadge: {
    backgroundColor: '#2563eb',
  },
  secondaryBadge: {
    backgroundColor: '#64748b',
  },
  successBadge: {
    backgroundColor: '#10b981',
  },
  dangerBadge: {
    backgroundColor: '#ef4444',
  },
  warningBadge: {
    backgroundColor: '#f59e0b',
  },
  infoBadge: {
    backgroundColor: '#3b82f6',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  successText: {
    color: 'white',
  },
  dangerText: {
    color: 'white',
  },
  warningText: {
    color: 'white',
  },
  infoText: {
    color: 'white',
  },
});

export default Badge;