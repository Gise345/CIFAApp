import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updatePlayerPhoto } from '../../services/firebase/players';

interface PlayerImageUploadProps {
  playerId: string;
  currentPhotoUrl?: string;
  onSuccess?: (photoUrl: string) => void;
}

const PlayerImageUpload: React.FC<PlayerImageUploadProps> = ({ 
  playerId, 
  currentPhotoUrl,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  
  const selectImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('We need media library permissions to select an image.');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        setLoading(true);
        try {
          // Update player photo
          await updatePlayerPhoto(playerId, imageUri);
          setPhotoUrl(imageUri);
          if (onSuccess) onSuccess(imageUri);
          alert('Player photo updated successfully!');
        } catch (error) {
          console.error('Error updating photo:', error);
          alert('Failed to update player photo.');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      alert('Failed to select image.');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player Photo</Text>
      
      <View style={styles.imageContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={selectImage}
        disabled={loading}
      >
        <Text style={styles.uploadButtonText}>
          {photoUrl ? 'Change Photo' : 'Upload Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default PlayerImageUpload;