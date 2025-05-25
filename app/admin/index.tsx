// CIFAMobileApp/app/admin/index.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '../../src/services/firebase/config';

import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import { useAuth } from '../../src/hooks/useAuth';

interface AdminMenuCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  color?: string;
  count?: number;
  subtitle?: string;
}

interface DashboardStats {
  totalNews: number;
  totalMatches: number;
  totalTeams: number;
  totalPlayers: number;
  recentNews: number;
  upcomingMatches: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalNews: 0,
    totalMatches: 0,
    totalTeams: 0,
    totalPlayers: 0,
    recentNews: 0,
    upcomingMatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Redirect if not admin
  useEffect(() => {
    if (user === null) {
      router.replace('/login');
    } else if (user && isAdmin === false) {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.back();
    }
  }, [user, isAdmin, router]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!firestore) return;
    
    try {
      // Get total counts
      const [newsSnapshot, matchesSnapshot, teamsSnapshot, playersSnapshot] = await Promise.all([
        getDocs(collection(firestore, 'news')),
        getDocs(collection(firestore, 'matches')),
        getDocs(collection(firestore, 'teams')),
        getDocs(collection(firestore, 'players'))
      ]);

      // Get recent news (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentNewsQuery = query(
        collection(firestore, 'news'),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const recentNewsSnapshot = await getDocs(recentNewsQuery);

      // Get upcoming matches
      const upcomingMatchesQuery = query(
        collection(firestore, 'matches'),
        where('date', '>=', Timestamp.now()),
        where('status', '==', 'scheduled')
      );
      const upcomingMatchesSnapshot = await getDocs(upcomingMatchesQuery);

      setStats({
        totalNews: newsSnapshot.size,
        totalMatches: matchesSnapshot.size,
        totalTeams: teamsSnapshot.size,
        totalPlayers: playersSnapshot.size,
        recentNews: recentNewsSnapshot.size,
        upcomingMatches: upcomingMatchesSnapshot.size
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats().finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  if (!isAdmin) {
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
        <Header title="Admin Dashboard" showBack={true} />
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
          {/* Welcome Section */}
          <Card style={styles.welcomeCard}>
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.displayName || 'Admin'}</Text>
              <Text style={styles.roleText}>Administrator</Text>
            </View>
            <View style={styles.welcomeIcon}>
              <Feather name="shield" size={32} color="#2563eb" />
            </View>
          </Card>

          {/* Statistics Overview */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
                <Feather name="file-text" size={20} color="#2563eb" />
              </View>
              <Text style={styles.statValue}>{stats.totalNews}</Text>
              <Text style={styles.statLabel}>Total Articles</Text>
              <Text style={styles.statSubtext}>{stats.recentNews} this week</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
                <Feather name="calendar" size={20} color="#16a34a" />
              </View>
              <Text style={styles.statValue}>{stats.totalMatches}</Text>
              <Text style={styles.statLabel}>Total Matches</Text>
              <Text style={styles.statSubtext}>{stats.upcomingMatches} upcoming</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <Feather name="users" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{stats.totalTeams}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fce7f3' }]}>
                <Feather name="user" size={20} color="#ec4899" />
              </View>
              <Text style={styles.statValue}>{stats.totalPlayers}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#dbeafe' }]}
              onPress={() => router.push('/admin/news/create')}
            >
              <Feather name="plus-circle" size={24} color="#2563eb" />
              <Text style={[styles.quickActionText, { color: '#2563eb' }]}>New Article</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#dcfce7' }]}
              onPress={() => router.push('/admin/matches/create')}
            >
              <Feather name="plus-circle" size={24} color="#16a34a" />
              <Text style={[styles.quickActionText, { color: '#16a34a' }]}>Add Match</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#fee2e2' }]}
              onPress={() => router.push('/admin/notifications/create')}
            >
              <Feather name="bell" size={24} color="#ef4444" />
              <Text style={[styles.quickActionText, { color: '#ef4444' }]}>Send Alert</Text>
            </TouchableOpacity>
          </View>

          {/* Management Sections */}
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.menuGrid}>
            <AdminMenuCard 
              title="News & Articles" 
              icon="file-text"
              subtitle="Manage articles and media"
              color="#2563eb"
              onPress={() => router.push('/admin/news')}
            />
            <AdminMenuCard 
              title="Matches" 
              icon="calendar"
              subtitle="Schedule and results"
              color="#16a34a"
              onPress={() => router.push('/admin/matches')}
            />
            <AdminMenuCard 
              title="Teams" 
              icon="users"
              subtitle="Teams and rosters"
              color="#f59e0b"
              onPress={() => router.push('/admin/teams')}
            />
            <AdminMenuCard 
              title="Players" 
              icon="user"
              subtitle="Player profiles"
              color="#ec4899"
              onPress={() => router.push('/admin/players')}
            />
            <AdminMenuCard 
              title="Leagues" 
              icon="award"
              subtitle="League management"
              color="#8b5cf6"
              onPress={() => router.push('/admin/leagues')}
            />
            <AdminMenuCard 
              title="Statistics" 
              icon="bar-chart-2"
              subtitle="Update stats"
              color="#06b6d4"
              onPress={() => router.push('/admin/stats')}
            />
            <AdminMenuCard 
              title="Notifications" 
              icon="bell"
              subtitle="Push notifications"
              color="#ef4444"
              onPress={() => router.push('/admin/notifications')}
            />
            <AdminMenuCard 
              title="Media Gallery" 
              icon="image"
              subtitle="Photos and videos"
              color="#10b981"
              onPress={() => router.push('/admin/media')}
            />
            <AdminMenuCard 
              title="Users" 
              icon="user-check"
              subtitle="User management"
              color="#6366f1"
              onPress={() => router.push('/admin/users')}
            />
            <AdminMenuCard 
              title="Settings" 
              icon="settings"
              subtitle="App configuration"
              color="#64748b"
              onPress={() => router.push('/admin/settings')}
            />
          </View>

          {/* Footer spacing */}
          <View style={styles.footer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Helper component for admin menu cards
const AdminMenuCard: React.FC<AdminMenuCardProps> = ({ 
  title, 
  icon, 
  onPress, 
  color = '#2563eb',
  count,
  subtitle 
}) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress}>
    <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
      <Feather name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.menuTitle}>{title}</Text>
    {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    {count !== undefined && (
      <View style={[styles.countBadge, { backgroundColor: color }]}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

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
  welcomeCard: {
    margin: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  roleText: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 4,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  menuCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: '1.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 120,
    position: 'relative',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    height: 40,
  },
});