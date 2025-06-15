import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: 8 };
      case 'medium':
        return { padding: 12 };
      case 'large':
        return { padding: 16 };
      default:
        return { padding: 12 };
    }
  };

  const renderContent = () => {
    if (typeof children === 'string' || typeof children === 'number') {
      return <Text>{children}</Text>;
    }
    return children;
  };

  return (
    <View style={[styles.card, getPaddingStyle(), style]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 12,
  },
});

export default Card;
