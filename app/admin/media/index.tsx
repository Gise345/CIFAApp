// app/admin/media/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Button from '../../../src/components/common/Button';
import { useAuth } from '../../../src/hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  description?: string;
  tags: string[];
  uploadedAt: Date;
  uploadedBy: string;
  size: number; // in bytes
}

export default function AdminMediaScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);


  useEffect(() => {
  // Only check auth after loading is complete
  if (!authLoading) {
    console.log('Admin Media Screen - Auth Check:', {
      user: user?.email,
      isAdmin,
      authLoading
    });
    
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to access this page');
      router.replace('/(auth)/login');
      return;
    }
    
    if (isAdmin === false) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    if (isAdmin === true) {
      setHasCheckedAuth(true);
      fetchMedia();
    }
  }
}, [authLoading, user, isAdmin]);

  const fetchMedia = async () => {
    try {
      // Mock media data
      const mockMedia: MediaItem[] = [
        {
          id: '1',
          url: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=Match+Highlight',
          type: 'image',
          title: 'Match Highlight - Final Goal',
          description: 'Final goal of the championship match',
          tags: ['match', 'goal', 'highlight'],
          uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          uploadedBy: 'admin',
          size: 1024000
        },
        {
          id: '2',
          url: 'https://via.placeholder.com/300x200/16a34a/ffffff?text=Team+Photo',
          type: 'image',
          title: 'Team Championship Photo',
          description: 'Official team photo after winning the championship',
          tags: ['team', 'championship', 'photo'],
          uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          uploadedBy: 'admin',
          size: 2048000
        },
        {
          id: '3',
          url: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Stadium+View',
          type: 'image',
          title: 'Stadium Aerial View',
          description: 'Aerial view of the main stadium',
          tags: ['stadium', 'venue', 'aerial'],
          uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          uploadedBy: 'admin',
          size: 1536000
        }
      ];
      
      setMedia(mockMedia);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMedia();
    setRefreshing(false);
  };

  const handleUploadMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to upload files.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        
        // Mock upload process
        setTimeout(() => {
          const newMedia: MediaItem = {
            id: Date.now().toString(),
            url: result.assets[0].uri,
            type: result.assets[0].type === 'video' ? 'video' : 'image',
            title: `New ${result.assets[0].type || 'image'}`,
            description: 'Uploaded via admin panel',
            tags: ['new', 'upload'],
            uploadedAt: new Date(),
            uploadedBy: user?.email || 'admin',
            size: result.assets[0].fileSize || 1000000
          };
          
          setMedia(prev => [newMedia, ...prev]);
          setUploading(false);
          Alert.alert('Success', 'Media uploaded successfully');
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload media');
    }
  };

  const handleDeleteMedia = (mediaId: string, title: string) => {
    Alert.alert(
      'Delete Media',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setMedia(prev => prev.filter(item => item.id !== mediaId));
            Alert.alert('Success', 'Media deleted successfully');
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Media Gallery" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading media...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Media Gallery" showBack={true} />
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563eb"
            />
          }
        >
          {/* Header with Upload Button */}
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Media Library ({media.length})</Text>
            <Button 
              title="Upload Media" 
              onPress={handleUploadMedia}
              loading={uploading}
              style={styles.uploadButton}
            />
          </View>
          
          {/* Stats Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <Feather name="image" size={20} color="#2563eb" />
              <Text style={styles.statValue}>
                {media.filter(item => item.type === 'image').length}
              </Text>
              <Text style={styles.statLabel}>Images</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
              <Feather name="video" size={20} color="#16a34a" />
              <Text style={styles.statValue}>
                {media.filter(item => item.type === 'video').length}
              </Text>
              <Text style={styles.statLabel}>Videos</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
              <Feather name="hard-drive" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>
                {formatFileSize(media.reduce((total, item) => total + item.size, 0))}
              </Text>
              <Text style={styles.statLabel}>Total Size</Text>
            </Card>
          </ScrollView>
          
          {/* Media Grid */}
          {media.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="image" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No media found</Text>
              <Button 
                title="Upload First Media" 
                onPress={handleUploadMedia}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            <View style={styles.mediaGrid}>
              {media.map(item => (
                <Card key={item.id} style={styles.mediaCard}>
                  <View style={styles.mediaImageContainer}>
                    <Image source={{ uri: item.url }} style={styles.mediaImage} />
                    {item.type === 'video' && (
                      <View style={styles.videoOverlay}>
                        <Feather name="play" size={24} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.mediaInfo}>
                    <Text style={styles.mediaTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.mediaDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <View style={styles.mediaTags}>
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <View key={index} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.mediaMetadata}>
                      <Text style={styles.mediaDate}>{formatDate(item.uploadedAt)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.mediaActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => Alert.alert('Coming Soon', 'Edit functionality will be available soon')}
                    >
                      <Feather name="edit-2" size={16} color="#2563eb" />
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteMedia(item.id, item.title)}
                    >
                      <Feather name="trash-2" size={16} color="#ef4444" />
                      <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}
          
          <View style={styles.footer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  uploadButton: {
    minWidth: 120,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statCard: {
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 160,
  },
  mediaGrid: {
    padding: 16,
  },
  mediaCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  mediaImageContainer: {
    position: 'relative',
    height: 200,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    padding: 16,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  mediaDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  mediaTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  mediaMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mediaSize: {
    fontSize: 12,
    color: '#9ca3af',
  },
  mediaDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  mediaActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteText: {
    color: '#ef4444',
  },
  footer: {
    height: 40,
  },
});