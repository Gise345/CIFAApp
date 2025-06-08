// src/components/news/NewsForm.tsx - Improved NewsForm Component
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Timestamp } from 'firebase/firestore';

import { useAuth } from '../../hooks/useAuth';
import { createNewsArticle, updateNewsArticle } from '../../services/firebase/news';
import Button from '../common/Button';

interface NewsFormProps {
  existingArticle?: any;
  onSaveSuccess?: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ existingArticle, onSaveSuccess }) => {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState(existingArticle?.title || '');
  const [body, setBody] = useState(existingArticle?.body || '');
  const [summary, setSummary] = useState(existingArticle?.summary || '');
  const [category, setCategory] = useState(existingArticle?.category || 'GENERAL');
  const [tags, setTags] = useState<string[]>(existingArticle?.tags || []);
  const [featured, setFeatured] = useState(existingArticle?.featured || false);
  const [mediaUrls, setMediaUrls] = useState<string[]>(existingArticle?.mediaUrls || []);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [mediaImages, setMediaImages] = useState<any[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<any>(null);

  // Categories for news articles
  const categories = [
    'GENERAL',
    'NATIONAL TEAM',
    "MEN'S PREMIER LEAGUE",
    "WOMEN'S PREMIER LEAGUE",
    'YOUTH FOOTBALL',
    'COACHING & DEVELOPMENT',
    'TRANSFERS'
  ];

  useEffect(() => {
    // Request media permissions
    const requestPermissions = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'We need access to your photo library to add images to articles.'
          );
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (title.length > 100) {
      setError('Title must be less than 100 characters');
      return false;
    }
    
    if (!body.trim()) {
      setError('Content is required');
      return false;
    }
    
    if (body.length < 50) {
      setError('Content must be at least 50 characters long');
      return false;
    }
    
    if (!category) {
      setError('Category is required');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    console.log('Form submit started...');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to publish news');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Submitting article:', { title, category, featured });
      
      // Convert image objects to blobs for Firebase if we have them
      let thumbnailBlob: Blob | undefined = undefined;
      let mediaBlobs: Blob[] | undefined = undefined;
      
      if (thumbnailImage) {
        try {
          const response = await fetch(thumbnailImage.uri);
          thumbnailBlob = await response.blob();
        } catch (error) {
          console.error('Error converting thumbnail to blob:', error);
          // Continue without thumbnail
        }
      }
      
      if (mediaImages.length > 0) {
        try {
          mediaBlobs = await Promise.all(
            mediaImages.map(async (image: any) => {
              const response = await fetch(image.uri);
              return response.blob();
            })
          );
        } catch (error) {
          console.error('Error converting media images to blobs:', error);
          // Continue without additional media
        }
      }
      
      // Prepare article data
      const articleData = {
        title: title.trim(),
        body: body.trim(),
        summary: summary.trim() || '',
        author: user.displayName || user.email || 'CIFA Staff',
        date: existingArticle?.date || Timestamp.fromDate(new Date()),
        category,
        tags,
        featured,
        mediaUrls: existingArticle?.mediaUrls || [],
        thumbnailUrl: existingArticle?.thumbnailUrl || ''
      };

      if (existingArticle) {
        // Update existing article
        console.log('Updating existing article:', existingArticle.id);
        await updateNewsArticle(
          existingArticle.id,
          articleData,
          thumbnailBlob,
          mediaBlobs
        );
      } else {
        // Create new article
        console.log('Creating new article...');
        await createNewsArticle(
          articleData,
          thumbnailBlob,
          mediaBlobs
        );
      }
      
      setLoading(false);
      
      Alert.alert(
        'Success', 
        `Article ${existingArticle ? 'updated' : 'published'} successfully`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (onSaveSuccess) {
                onSaveSuccess();
              } else {
                router.back();
              }
            } 
          }
        ]
      );
    } catch (err) {
      setLoading(false);
      console.error('Error saving article:', err);
      setError('Failed to save article. Please try again.');
      Alert.alert('Error', 'Failed to save article. Please try again.');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  const pickThumbnailImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setThumbnailImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', 'Failed to pick thumbnail image.');
    }
  };

  const pickMediaImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setMediaImages([...mediaImages, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images.');
    }
  };

  return (
    <KeyboardAwareScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter article title"
            maxLength={100}
            editable={!loading}
          />
          <Text style={styles.helperText}>
            {title.length}/100 characters
          </Text>
        </View>
        
        {/* Summary */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Summary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={summary}
            onChangeText={setSummary}
            placeholder="Brief summary of the article (optional)"
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
          />
          <Text style={styles.helperText}>
            Optional brief summary that will appear in article previews ({summary.length}/200)
          </Text>
        </View>
        
        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
              enabled={!loading}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Featured Article Toggle */}
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Featured Article</Text>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={featured ? '#2563eb' : '#f4f4f5'}
              disabled={loading}
            />
          </View>
          <Text style={styles.helperText}>
            {featured ? 'This article will be featured prominently' : 'Feature this article on the homepage'}
          </Text>
        </View>
        
        {/* Content */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.contentTextArea]}
            value={body}
            onChangeText={setBody}
            placeholder="Write your article content here..."
            multiline
            numberOfLines={15}
            textAlignVertical="top"
            editable={!loading}
          />
          <Text style={styles.helperText}>
            Article content ({body.length} characters, minimum 50 required)
          </Text>
        </View>
        
        {/* Tags */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag"
              onSubmitEditing={addTag}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={addTag}
              disabled={loading || !tagInput.trim()}
            >
              <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity 
                    onPress={() => removeTag(index)}
                    style={styles.removeTagButton}
                    disabled={loading}
                  >
                    <Feather name="x" size={12} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.helperText}>
            Add relevant tags to help categorize your article
          </Text>
        </View>
        
        {/* Media Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Media</Text>
          
          {/* Thumbnail */}
          <View style={styles.mediaSection}>
            <Text style={styles.mediaLabel}>Thumbnail Image</Text>
            <TouchableOpacity 
              style={styles.mediaPickerButton}
              onPress={pickThumbnailImage}
              disabled={loading}
            >
              <Feather name="image" size={16} color="white" />
              <Text style={styles.mediaPickerText}>
                {thumbnailImage ? 'Change Thumbnail' : 'Select Thumbnail'}
              </Text>
            </TouchableOpacity>
            {thumbnailImage && (
              <Text style={styles.mediaInfo}>✓ Thumbnail selected</Text>
            )}
          </View>
          
          {/* Additional Images */}
          <View style={styles.mediaSection}>
            <Text style={styles.mediaLabel}>Additional Images</Text>
            <TouchableOpacity 
              style={styles.mediaPickerButton}
              onPress={pickMediaImages}
              disabled={loading}
            >
              <Feather name="camera" size={16} color="white" />
              <Text style={styles.mediaPickerText}>Add Images</Text>
            </TouchableOpacity>
            {mediaImages.length > 0 && (
              <Text style={styles.mediaInfo}>✓ {mediaImages.length} image(s) selected</Text>
            )}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            title={loading ? 'Publishing...' : (existingArticle ? 'Update Article' : 'Publish Article')}
            onPress={handleSubmit}
            loading={loading}
            style={styles.publishButton}
            disabled={loading}
          />
          
          <Button 
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
            disabled={loading}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  formContainer: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  contentTextArea: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    fontSize: 14,
  },
  addTagButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    color: '#4b5563',
    marginRight: 6,
  },
  removeTagButton: {
    padding: 2,
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  mediaPickerButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  mediaPickerText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 14,
  },
  mediaInfo: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  publishButton: {
    backgroundColor: '#2563eb',
  },
  cancelButton: {
    borderColor: '#d1d5db',
  },
});

export default NewsForm;