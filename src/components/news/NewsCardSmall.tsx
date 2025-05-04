import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

interface NewsCardSmallProps {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const NewsCardSmall: React.FC<NewsCardSmallProps> = ({
  id,
  title,
  category,
  imageUrl,
  onPress,
  style,
}) => {
  // For this mockup, we'll use placeholder images with different colors
  const getImagePlaceholder = () => {
    const colors = ['2563eb', '10b981', 'ef4444', 'f59e0b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `https://via.placeholder.com/200x120/${randomColor}/ffffff?text=CIFA`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImagePlaceholder() }} // Replace with imageUrl in production
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 80,
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 8,
  },
  category: {
    fontSize: 10,
    fontWeight: '500',
    color: '#2563eb',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default NewsCardSmall;