// src/components/news/NewsCard.tsx - Fixed to Display Real Images
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NewsCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl?: string; // Made optional since it might not always be present
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
  // Render image with fallback
  const renderImage = () => {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image load error for article:', id, error.nativeEvent.error);
          }}
        />
      );
    } else {
      // Fallback placeholder when no image is available
      return (
        <View style={styles.imagePlaceholder}>
          <Feather name="image" size={32} color="#9ca3af" />
          <Text style={styles.placeholderText}>CIFA News</Text>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7} 
      style={[styles.container, style]}
    >
      <View style={styles.imageContainer}>
        {renderImage()}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title} numberOfLines={3}>{title}</Text>
        {timeAgo && <Text style={styles.timeAgo}>{timeAgo}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default NewsCard;