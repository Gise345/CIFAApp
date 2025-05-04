// CIFAMobileApp/src/components/news/NewsCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

interface NewsCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  timeAgo?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  category,
  imageUrl,
  timeAgo,
  onPress,
  style,
}) => {
  // For this mockup, we'll use a placeholder image
  const imagePlaceholder = 'https://via.placeholder.com/400x200/2563eb/ffffff?text=CIFA+News';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imagePlaceholder }} // Replace with imageUrl in production
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {timeAgo && <Text style={styles.timeAgo}>{timeAgo}</Text>}
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
    height: 140,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 10,
    color: '#6b7280',
  },
});

export default NewsCard;