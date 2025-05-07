// src/components/admin/TeamImageUpload.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateTeamLogo } from '../../services/firebase/teams';
import { Feather } from '@expo/vector-icons';

interface TeamImageUploadProps {
  teamId: string;
  currentLogoUrl?: string;
  onSuccess?: (logoUrl: string) => void;
}

const TeamImageUpload: React.FC<TeamImageUploadProps> = ({ 
  teamId, 
  currentLogoUrl,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  
  // Get team initials for placeholder
  const getTeamInitials = (teamName: string): string => {
    if (!teamName) return '';
    
    const words = teamName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    
    // Return first letter of each word (up to 3)
    return words
      .slice(0, 3)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };
  
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
          // Update team logo
          await updateTeamLogo(teamId, imageUri);
          setLogoUrl(imageUri);
          if (onSuccess) onSuccess(imageUri);
          alert('Team logo updated successfully!');
        } catch (error) {
          console.error('Error updating logo:', error);
          alert('Failed to update team logo.');
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
      <View style={styles.imageContainer}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        ) : (
          <View style={styles.placeholder}>
            <Feather name="image" size={40} color="#9ca3af" />
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
        <Feather 
          name={logoUrl ? "edit-2" : "upload"} 
          size={16} 
          color="white"
          style={styles.buttonIcon}
        />
        <Text style={styles.uploadButtonText}>
          {logoUrl ? 'Change Logo' : 'Upload Logo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 60,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 6,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default TeamImageUpload;