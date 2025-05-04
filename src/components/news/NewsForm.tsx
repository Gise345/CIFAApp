// CIFAMobileApp/src/components/news/NewsForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Switch } from 'react-native-gesture-handler';

import Button from '../common/Button';
import { NewsArticle } from '../../services/firebase/news';
import { createNewsArticle, updateNewsArticle } from '../../services/firebase/news';
import { useAuth } from '../../hooks/useAuth';
import { Timestamp } from 'firebase/firestore';

interface NewsFormProps {
  existingArticle?: NewsArticle;
  onSaveSuccess?: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ existingArticle, onSaveSuccess }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState(existingArticle?.title || '');
  const [body, setBody] = useState(existingArticle?.body || '');
  const [summary, setSummary] = useState(existingArticle?.summary || '');
  const [category, setCategory] = useState(existingArticle?.category || 'GENERAL');
  const [tags, setTags] = useState<string[]>(existingArticle?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [featured, setFeatured] = useState(existingArticle?.featured || false);
  
  const [thumbnailImage, setThumbnailImage] = useState<any>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(existingArticle?.thumbnailUrl || '');
  const [mediaImages, setMediaImages] = useState<any[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>(existingArticle?.mediaUrls || []);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request permission for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to select images.');
        }
      }
    })();
  }, []);

  const pickThumbnailImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setThumbnailImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickMediaImages = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setMediaImages([...mediaImages, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const removeMediaImage = (index: number) => {
    const updatedImages = [...mediaImages];
    updatedImages.splice(index, 1);
    setMediaImages(updatedImages);
  };

  const removeMediaUrl = (index: number) => {
    const updatedUrls = [...mediaUrls];
    updatedUrls.splice(index, 1);
    setMediaUrls(updatedUrls);
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

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!body.trim()) {
      setError('Content is required');
      return false;
    }
    
    if (!category) {
      setError('Category is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      setError('You must be logged in to publish news');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert image objects to blobs for Firebase
      let thumbnailBlob = null;
      let mediaBlobs = null;
      
      if (thumbnailImage) {
        const response = await fetch(thumbnailImage.uri);
        thumbnailBlob = await response.blob();
      }
      
      if (mediaImages.length > 0) {
        mediaBlobs = await Promise.all(
          mediaImages.map(async (image: any) => {
            const response = await fetch(image.uri);
            return response.blob();
          })
        );
      }
      
      if (existingArticle) {
        // Update existing article
        await updateNewsArticle(
          existingArticle.id,
          {
            title,
            body,
            summary,
            category,
            tags,
            featured,
            mediaUrls
          },
          thumbnailBlob || undefined, // Convert null to undefined
          mediaBlobs || undefined
        );
      } else {
        // Create new article
        await createNewsArticle(
          {
            title,
            body,
            summary,
            author: user.displayName || 'CIFA Staff',
            date: Timestamp.fromDate(new Date()),
            category,
            tags,
            featured,
            mediaUrls: [],
            thumbnailUrl: ''
          },
          thumbnailBlob || undefined,
          mediaBlobs || undefined
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
    }
  };

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

  return (
    <KeyboardAwareScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter article title"
            maxLength={100}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Summary</Text>
          <TextInput
            style={styles.input}
            value={summary}
            onChangeText={setSummary}
            placeholder="Brief summary of the article"
            maxLength={200}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.helperText}>
            Optional brief summary that will appear in article previews
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Featured Article</Text>
          <View style={styles.switchContainer}>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={featured ? '#2563eb' : '#f4f4f5'}
            />
            <Text style={styles.switchLabel}>
              {featured ? 'This article will be featured' : 'This article will not be featured'}
            </Text>
          </View>
          <Text style={styles.helperText}>
            Featured articles appear prominently on the home screen
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Thumbnail Image</Text>
          <View style={styles.imagePickerContainer}>
            {thumbnailImage || thumbnailUrl ? (
              <View style={styles.thumbnailContainer}>
                <Image 
                  source={{ 
                    uri: thumbnailImage ? thumbnailImage.uri : thumbnailUrl 
                  }} 
                  style={styles.thumbnailPreview} 
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => {
                    setThumbnailImage(null);
                    setThumbnailUrl('');
                  }}
                >
                  <Feather name="x" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.imagePicker}
                onPress={pickThumbnailImage}
              >
                <Feather name="image" size={24} color="#6b7280" />
                <Text style={styles.imagePickerText}>Select Thumbnail</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={styles.textArea}
            value={body}
            onChangeText={setBody}
            placeholder="Write your article content here..."
            multiline
            numberOfLines={10}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag"
            />
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={addTag}
            >
              <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity 
                  style={styles.removeTagButton}
                  onPress={() => removeTag(index)}
                >
                  <Feather name="x" size={12} color="#4b5563" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Media Gallery</Text>
          <TouchableOpacity 
            style={styles.mediaPickerButton}
            onPress={pickMediaImages}
          >
            <Feather name="plus" size={20} color="white" />
            <Text style={styles.mediaPickerText}>Add Images</Text>
          </TouchableOpacity>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaGallery}
          >
            {mediaUrls.map((url, index) => (
              <View key={`url-${index}`} style={styles.mediaItem}>
                <Image source={{ uri: url }} style={styles.mediaImage} />
                <TouchableOpacity 
                  style={styles.removeMediaButton}
                  onPress={() => removeMediaUrl(index)}
                >
                  <Feather name="trash-2" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            {mediaImages.map((image, index) => (
              <View key={`image-${index}`} style={styles.mediaItem}>
                <Image source={{ uri: image.uri }} style={styles.mediaImage} />
                <TouchableOpacity 
                  style={styles.removeMediaButton}
                  onPress={() => removeMediaImage(index)}
                >
                  <Feather name="trash-2" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title={existingArticle ? 'Update Article' : 'Publish Article'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.publishButton}
          />
          
          <Button 
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
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
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    fontSize: 16,
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
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  imagePickerContainer: {
    marginBottom: 12,
  },
  imagePicker: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 6,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 6,
    overflow: 'hidden',
  },
  thumbnailPreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    fontSize: 16,
  },
  addTagButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  addTagButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    color: '#4b5563',
    marginRight: 4,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPickerButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  mediaPickerText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  mediaGallery: {
    paddingBottom: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  publishButton: {
    flex: 2,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
  }
});
export default NewsForm;