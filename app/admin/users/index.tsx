// CIFAMobileApp/app/admin/users/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal
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
  where,
  limit,
  Timestamp
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Timestamp | any;
  lastActive?: Timestamp | any;
  favoriteTeams?: string[];
  notificationSettings?: {
    matchAlerts?: boolean;
    news?: boolean;
    teamUpdates?: boolean;
    emailNotifications?: boolean;
  };
  isActive: boolean;
}

export default function AdminUsersScreen() {
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);


  useEffect(() => {
  // Only check auth after loading is complete
  if (!authLoading) {
    console.log('Admin Users Screen - Auth Check:', {
      user: currentUser?.email,
      isAdmin,
      authLoading
    });
    
    if (!users) {
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
      fetchUsers();
    }
  }
}, [authLoading, users, isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users]);

  const fetchUsers = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      const usersQuery = query(
        collection(firestore, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        const now = new Date().getTime();
        const lastActiveTime = data.lastActive 
          ? (data.lastActive.toDate ? data.lastActive.toDate().getTime() : new Date(data.lastActive).getTime())
          : 0;
        
        return {
          id: doc.id,
          email: data.email || '',
          name: data.name || 'Unknown User',
          role: data.role || 'user',
          createdAt: data.createdAt,
          lastActive: data.lastActive,
          favoriteTeams: data.favoriteTeams || [],
          notificationSettings: data.notificationSettings || {},
          isActive: lastActiveTime > 0 && (now - lastActiveTime) < 7 * 24 * 60 * 60 * 1000 // Active within 7 days
        } as UserData;
      });
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      return;
    }

    if (userId === currentUser?.uid) {
      Alert.alert('Error', 'You cannot change your own role');
      return;
    }
    
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    Alert.alert(
      'Change User Role',
      `Are you sure you want to change this user's role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            if (!firestore) {
              Alert.alert('Error', 'Database connection lost');
              return;
            }
            
            try {
              const userDocRef = doc(firestore, 'users', userId);
              await updateDoc(userDocRef, {
                role: newRole,
                updatedAt: Timestamp.now()
              });
              
              // Update local state
              setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, role: newRole as 'admin' | 'user' } : user
              ));
              
              Alert.alert('Success', `User role updated to ${newRole}`);
            } catch (error) {
              console.error('Error updating user role:', error);
              Alert.alert('Error', 'Failed to update user role');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      return;
    }

    if (userId === currentUser?.uid) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }
    
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!firestore) {
              Alert.alert('Error', 'Database connection lost');
              return;
            }
            
            try {
              const userDocRef = doc(firestore, 'users', userId);
              await deleteDoc(userDocRef);
              setUsers(prev => prev.filter(user => user.id !== userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'Never';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleViewUserProfile = (userId: string) => {
    // Navigate to user profile or details page
    router.push(`/admin/users/${userId}`);
  };

  const renderUserModal = () => {
    if (!selectedUser) return null;
    
    return (
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{selectedUser.name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{selectedUser.email}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role</Text>
                <Badge 
                  text={selectedUser.role.toUpperCase()} 
                  variant={selectedUser.role === 'admin' ? 'danger' : 'primary'} 
                />
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Badge 
                  text={selectedUser.isActive ? 'Active' : 'Inactive'} 
                  variant={selectedUser.isActive ? 'success' : 'secondary'} 
                />
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Joined</Text>
                <Text style={styles.detailValue}>{formatDate(selectedUser.createdAt)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Active</Text>
                <Text style={styles.detailValue}>{formatDate(selectedUser.lastActive)}</Text>
              </View>
              
              {selectedUser.favoriteTeams && selectedUser.favoriteTeams.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Favorite Teams</Text>
                  <Text style={styles.detailValue}>{selectedUser.favoriteTeams.length} teams</Text>
                </View>
              )}

              {selectedUser.notificationSettings && (
                <View style={styles.notificationSettings}>
                  <Text style={styles.settingsTitle}>Notification Settings</Text>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Match Alerts</Text>
                    <Text style={styles.settingValue}>
                      {selectedUser.notificationSettings.matchAlerts ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>News Updates</Text>
                    <Text style={styles.settingValue}>
                      {selectedUser.notificationSettings.news ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Team Updates</Text>
                    <Text style={styles.settingValue}>
                      {selectedUser.notificationSettings.teamUpdates ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                title="Change Role"
                onPress={() => {
                  setShowUserModal(false);
                  handleToggleUserRole(selectedUser.id, selectedUser.role);
                }}
                style={styles.modalButton}
              />
              <Button
                title="Delete User"
                onPress={() => {
                  setShowUserModal(false);
                  handleDeleteUser(selectedUser.id, selectedUser.name);
                }}
                variant="danger"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="User Management" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }
  // Don't render if not admin
if (!isAdmin || !hasCheckedAuth) {
  return null;
}

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="User Management" showBack={true} />
        
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {users.filter(u => u.role === 'admin').length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {users.filter(u => u.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            <TouchableOpacity
              style={[styles.filterButton, filterRole === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterRole('all')}
            >
              <Text style={[styles.filterText, filterRole === 'all' && styles.filterTextActive]}>
                All Users
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterRole === 'admin' && styles.filterButtonActive]}
              onPress={() => setFilterRole('admin')}
            >
              <Text style={[styles.filterText, filterRole === 'admin' && styles.filterTextActive]}>
                Admins
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterRole === 'user' && styles.filterButtonActive]}
              onPress={() => setFilterRole('user')}
            >
              <Text style={[styles.filterText, filterRole === 'user' && styles.filterTextActive]}>
                Regular Users
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Users List */}
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
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>
                {searchQuery || filterRole !== 'all' ? 'No users match your criteria' : 'No users found'}
              </Text>
              {searchQuery && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredUsers.map(user => (
              <Card key={user.id} style={styles.userCard}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                >
                  <View style={styles.userInfo}>
                    <View style={[
                      styles.userAvatar,
                      { backgroundColor: user.role === 'admin' ? '#ef4444' : '#2563eb' }
                    ]}>
                      <Text style={styles.userAvatarText}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <View style={styles.userMeta}>
                        <Badge 
                          text={user.role.toUpperCase()} 
                          variant={user.role === 'admin' ? 'danger' : 'primary'} 
                          style={styles.roleBadge}
                        />
                        {user.isActive && (
                          <Badge 
                            text="ACTIVE" 
                            variant="success" 
                            style={styles.statusBadge}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.userStats}>
                    <Text style={styles.userStatText}>
                      Joined {formatDate(user.createdAt)}
                    </Text>
                    <Text style={styles.userStatText}>
                      Last active {formatDate(user.lastActive)}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewUserProfile(user.id)}
                  >
                    <Feather name="eye" size={18} color="#2563eb" />
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleToggleUserRole(user.id, user.role)}
                    disabled={user.id === currentUser?.uid}
                  >
                    <Feather name="shield" size={18} color="#f59e0b" />
                    <Text style={[
                      styles.actionButtonText,
                      user.id === currentUser?.uid && styles.disabledText
                    ]}>
                      Make {user.role === 'admin' ? 'User' : 'Admin'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(user.id, user.name)}
                    disabled={user.id === currentUser?.uid}
                  >
                    <Feather name="trash-2" size={18} color="#ef4444" />
                    <Text style={[
                      styles.actionButtonText, 
                      styles.deleteButtonText,
                      user.id === currentUser?.uid && styles.disabledText
                    ]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
          
          {/* Footer spacing */}
          <View style={styles.footer} />
        </ScrollView>
        
        {renderUserModal()}
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
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    maxHeight: 40,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  filterText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#1e3a8a',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  userCard: {
    margin: 16,
    marginBottom: 8,
    padding: 0,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    padding: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
  },
  roleBadge: {
    marginRight: 6,
  },
  statusBadge: {
    marginRight: 6,
  },
  userStats: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  userStatText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  actionButtons: {
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
  deleteButton: {
    borderRightWidth: 0,
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  disabledText: {
    color: '#9ca3af',
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  notificationSettings: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});