// app/admin/moderation/index.tsx
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
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  where,
  limit
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

interface ModerationItem {
  id: string;
  type: 'comment' | 'report' | 'message';
  content: string;
  author?: string;
  authorId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportReason?: string;
  createdAt: Timestamp | any;
  moderatedAt?: Timestamp | any;
  moderatedBy?: string;
}

export default function AdminModerationScreen() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterType, setFilterType] = useState<'all' | 'comment' | 'report' | 'message'>('all');

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    fetchModerationItems();
  }, [isAdmin]);

  const fetchModerationItems = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      // In a real app, you would have actual moderation collections
      // For now, we'll create some mock data
      const mockItems: ModerationItem[] = [
        {
          id: '1',
          type: 'comment',
          content: 'This referee is terrible! Completely biased against our team.',
          author: 'john_doe',
          authorId: 'user123',
          status: 'pending',
          severity: 'medium',
          reportReason: 'Inappropriate language',
          createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000))
        },
        {
          id: '2',
          type: 'report',
          content: 'User is posting spam comments on multiple match results',
          author: 'reporter_user',
          authorId: 'user456',
          status: 'pending',
          severity: 'high',
          reportReason: 'Spam',
          createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000))
        },
        {
          id: '3',
          type: 'message',
          content: 'Great match today! Both teams played well.',
          author: 'fan_user',
          authorId: 'user789',
          status: 'approved',
          severity: 'low',
          createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
          moderatedAt: Timestamp.fromDate(new Date(Date.now() - 23 * 60 * 60 * 1000)),
          moderatedBy: user?.uid
        }
      ];
      
      setItems(mockItems);
    } catch (error) {
      console.error('Error fetching moderation items:', error);
      Alert.alert('Error', 'Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchModerationItems();
    setRefreshing(false);
  };

  const handleModerate = async (itemId: string, action: 'approve' | 'reject' | 'hide') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'hidden';
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: newStatus as any,
              moderatedAt: Timestamp.now(),
              moderatedBy: user?.uid 
            }
          : item
      ));
      
      // In a real app, you would update the database here
      // await updateDoc(doc(firestore, 'moderation', itemId), {
      //   status: newStatus,
      //   moderatedAt: Timestamp.now(),
      //   moderatedBy: user?.uid
      // });
      
      Alert.alert('Success', `Item ${action}d successfully`);
    } catch (error) {
      console.error('Error moderating item:', error);
      Alert.alert('Error', 'Failed to moderate item');
    }
  };

  const handleDelete = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to permanently delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setItems(prev => prev.filter(item => item.id !== itemId));
              // In a real app: await deleteDoc(doc(firestore, 'moderation', itemId));
              Alert.alert('Success', 'Item deleted successfully');
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'Unknown';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge text="PENDING" variant="warning" />;
      case 'approved':
        return <Badge text="APPROVED" variant="success" />;
      case 'rejected':
        return <Badge text="REJECTED" variant="danger" />;
      case 'hidden':
        return <Badge text="HIDDEN" variant="secondary" />;
      default:
        return <Badge text={status} variant="secondary" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge text="CRITICAL" variant="danger" />;
      case 'high':
        return <Badge text="HIGH" variant="warning" />;
      case 'medium':
        return <Badge text="MEDIUM" variant="info" />;
      case 'low':
        return <Badge text="LOW" variant="success" />;
      default:
        return <Badge text={severity} variant="secondary" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return 'message-square';
      case 'report':
        return 'alert-triangle';
      case 'message':
        return 'message-circle';
      default:
        return 'help-circle';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Content Moderation" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading moderation queue...</Text>
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
        <Header title="Content Moderation" showBack={true} />
        
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
          {/* Stats Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <Card style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
              <Feather name="clock" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>
                {items.filter(item => item.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
              <Feather name="check-circle" size={20} color="#16a34a" />
              <Text style={styles.statValue}>
                {items.filter(item => item.status === 'approved').length}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
              <Feather name="x-circle" size={20} color="#dc2626" />
              <Text style={styles.statValue}>
                {items.filter(item => item.status === 'rejected').length}
              </Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#fce7f3' }]}>
              <Feather name="alert-triangle" size={20} color="#ec4899" />
              <Text style={styles.statValue}>
                {items.filter(item => item.severity === 'high' || item.severity === 'critical').length}
              </Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </Card>
          </ScrollView>

          {/* Search and Filters */}
          <Card style={styles.filtersCard}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search content or users..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      filterStatus === status && styles.filterButtonActive
                    ]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filterStatus === status && styles.filterButtonTextActive
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Type:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['all', 'comment', 'report', 'message'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      filterType === type && styles.filterButtonActive
                    ]}
                    onPress={() => setFilterType(type)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filterType === type && styles.filterButtonTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Card>

          {/* Moderation Items */}
          <Text style={styles.sectionTitle}>
            Moderation Queue ({filteredItems.length})
          </Text>
          
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="shield" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>
                All content is moderated or no items match your filters
              </Text>
            </View>
          ) : (
            filteredItems.map(item => (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemTypeContainer}>
                      <Feather name={getTypeIcon(item.type) as any} size={16} color="#6b7280" />
                      <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.itemAuthor}>by {item.author}</Text>
                    <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.badgeContainer}>
                    {getStatusBadge(item.status)}
                    {getSeverityBadge(item.severity)}
                  </View>
                </View>
                
                <Text style={styles.itemContent} numberOfLines={3}>
                  {item.content}
                </Text>
                
                {item.reportReason && (
                  <View style={styles.reportReason}>
                    <Feather name="flag" size={14} color="#ef4444" />
                    <Text style={styles.reportReasonText}>Reported for: {item.reportReason}</Text>
                  </View>
                )}
                
                {item.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleModerate(item.id, 'approve')}
                    >
                      <Feather name="check" size={16} color="#16a34a" />
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleModerate(item.id, 'reject')}
                    >
                      <Feather name="x" size={16} color="#ef4444" />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.hideButton]}
                      onPress={() => handleModerate(item.id, 'hide')}
                    >
                      <Feather name="eye-off" size={16} color="#6b7280" />
                      <Text style={styles.hideButtonText}>Hide</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {item.status !== 'pending' && (
                  <View style={styles.moderatedInfo}>
                    <Text style={styles.moderatedText}>
                      Moderated {formatDate(item.moderatedAt)} 
                      {item.moderatedBy === user?.uid ? ' by you' : ''}
                    </Text>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))
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
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  filtersCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 12,
    minWidth: 50,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  itemCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6b7280',
    marginLeft: 4,
  },
  itemAuthor: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  itemContent: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  reportReason: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  reportReasonText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  approveButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  approveButtonText: {
    fontSize: 12,
    color: '#16a34a',
    marginLeft: 4,
    fontWeight: '500',
  },
  rejectButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  hideButton: {
    backgroundColor: '#f9fafb',
    borderColor: '#6b7280',
  },
  hideButtonText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  moderatedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  moderatedText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 11,
    color: '#ef4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
});