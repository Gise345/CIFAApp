// app/admin/index.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions
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
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { firestore } from '../../src/services/firebase/config';
import { LineChart } from 'react-native-chart-kit';

import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import { useAuth } from '../../src/hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNews: number;
  totalMatches: number;
  totalTeams: number;
  totalPlayers: number;
  recentNews: number;
  upcomingMatches: number;
  liveMatches: number;
  completedMatches: number;
  totalNotifications: number;
  engagementRate: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNews: 0,
    totalMatches: 0,
    totalTeams: 0,
    totalPlayers: 0,
    recentNews: 0,
    upcomingMatches: 0,
    liveMatches: 0,
    completedMatches: 0,
    totalNotifications: 0,
    engagementRate: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 50],
      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
      strokeWidth: 2
    }]
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  
  // Redirect if not admin
  useEffect(() => {
  // Only check auth after loading is complete
  if (!authLoading) {
    console.log('Admin Dashboard - Auth Check:', {
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
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.back();
      return;
    }
    
    if (isAdmin === true) {
      setHasCheckedAuth(true);
    }
  }
}, [authLoading, user, isAdmin]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!firestore) return;
    
    try {
      // Get collection counts using getCountFromServer for better performance
      const [
        usersCount,
        newsCount,
        matchesCount,
        teamsCount,
        playersCount,
        notificationsCount
      ] = await Promise.all([
        getCountFromServer(collection(firestore, 'users')),
        getCountFromServer(collection(firestore, 'news')),
        getCountFromServer(collection(firestore, 'matches')),
        getCountFromServer(collection(firestore, 'teams')),
        getCountFromServer(collection(firestore, 'players')),
        getCountFromServer(collection(firestore, 'notifications'))
      ]);

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsersQuery = query(
        collection(firestore, 'users'),
        where('lastActive', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);

      // Get recent news (last 7 days)
      const recentNewsQuery = query(
        collection(firestore, 'news'),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const recentNewsSnapshot = await getDocs(recentNewsQuery);

      // Get match statistics
      const now = Timestamp.now();
      const [upcomingMatchesSnapshot, liveMatchesSnapshot, completedMatchesSnapshot] = await Promise.all([
        getDocs(query(
          collection(firestore, 'matches'),
          where('date', '>=', now),
          where('status', '==', 'scheduled')
        )),
        getDocs(query(
          collection(firestore, 'matches'),
          where('status', '==', 'live')
        )),
        getDocs(query(
          collection(firestore, 'matches'),
          where('status', '==', 'completed'),
          orderBy('date', 'desc'),
          limit(50)
        ))
      ]);

      // Calculate engagement rate (simplified)
      const engagementRate = activeUsersSnapshot.size > 0 
        ? Math.round((activeUsersSnapshot.size / usersCount.data().count) * 100)
        : 0;

      setStats({
        totalUsers: usersCount.data().count,
        activeUsers: activeUsersSnapshot.size,
        totalNews: newsCount.data().count,
        totalMatches: matchesCount.data().count,
        totalTeams: teamsCount.data().count,
        totalPlayers: playersCount.data().count,
        recentNews: recentNewsSnapshot.size,
        upcomingMatches: upcomingMatchesSnapshot.size,
        liveMatches: liveMatchesSnapshot.size,
        completedMatches: completedMatchesSnapshot.size,
        totalNotifications: notificationsCount.data().count,
        engagementRate
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
  if (isAdmin === true && hasCheckedAuth) {
    fetchDashboardStats().finally(() => setLoading(false));
  }
}, [isAdmin, hasCheckedAuth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  // Navigation functions - existing routes
  const navigateToNews = () => router.push('/admin/news/' as any);
  const navigateToMatches = () => router.push('/admin/matches/' as any);
  const navigateToTeams = () => router.push('/admin/teams/' as any);
  const navigateToPlayers = () => router.push('/admin/players/' as any);
  const navigateToUsers = () => router.push('/admin/users/' as any);
  const navigateToNotifications = () => router.push('/admin/notifications/' as any);
  const navigateToLeagues = () => router.push('/admin/leagues/' as any);

  // Navigation functions - new routes to be created
  const navigateToEvents = () => router.push('/admin/events/' as any);
  const navigateToAnalytics = () => router.push('/admin/analytics/' as any);
  const navigateToModeration = () => router.push('/admin/moderation/' as any);
  const navigateToSecurity = () => router.push('/admin/security/' as any);
  const navigateToSettings = () => router.push('/admin/settings/' as any);
  const navigateToMedia = () => router.push('/admin/media/' as any);
  const navigateToEmails = () => router.push('/admin/emails/' as any);
  const navigateToRoles = () => router.push('/admin/roles/' as any);

  // Quick actions
  const navigateToCreateNews = () => router.push('/admin/news/create' as any);
  const navigateToCreateMatch = () => router.push('/admin/matches/create' as any);
  const navigateToCreateNotification = () => router.push('/admin/notifications/create' as any);

  const adminSections = [
    {
      title: 'Content Management',
      icon: 'file-text',
      color: '#2563eb',
      description: 'Upload, edit, and schedule content',
      onPress: navigateToNews,
      items: [
        { label: 'News Articles', route: navigateToNews, icon: 'file-text' },
        { label: 'Media Gallery', route: navigateToMedia, icon: 'image' },
        { label: 'Videos', route: () => Alert.alert('Coming Soon', 'Video management will be available soon'), icon: 'video' }
      ]
    },
    {
      title: 'Stats & Data',
      icon: 'bar-chart-2',
      color: '#16a34a',
      description: 'Update scores and statistics',
      onPress: navigateToMatches,
      items: [
        { label: 'Match Results', route: navigateToMatches, icon: 'calendar' },
        { label: 'Player Stats', route: navigateToPlayers, icon: 'user' },
        { label: 'Team Standings', route: navigateToTeams, icon: 'users' },
        { label: 'Leagues', route: navigateToLeagues, icon: 'award' }
      ]
    },
    {
      title: 'Event Management',
      icon: 'calendar',
      color: '#f59e0b',
      description: 'Manage schedules and fixtures',
      onPress: navigateToEvents,
      items: [
        { label: 'Match Schedule', route: navigateToMatches, icon: 'calendar' },
        { label: 'Fixtures', route: navigateToMatches, icon: 'list' },
        { label: 'Events', route: navigateToEvents, icon: 'flag' }
      ]
    },
    {
      title: 'User Management',
      icon: 'users',
      color: '#8b5cf6',
      description: 'Manage accounts and permissions',
      onPress: navigateToUsers,
      items: [
        { label: 'All Users', route: navigateToUsers, icon: 'users' },
        { label: 'Roles & Permissions', route: navigateToRoles, icon: 'shield' },
        { label: 'User Activity', route: navigateToAnalytics, icon: 'activity' }
      ]
    },
    {
      title: 'Communication',
      icon: 'bell',
      color: '#ef4444',
      description: 'Send notifications and updates',
      onPress: navigateToNotifications,
      items: [
        { label: 'Push Notifications', route: navigateToNotifications, icon: 'bell' },
        { label: 'Email Campaigns', route: navigateToEmails, icon: 'mail' },
        { label: 'Announcements', route: navigateToNotifications, icon: 'speaker' }
      ]
    },
    {
      title: 'Analytics',
      icon: 'trending-up',
      color: '#06b6d4',
      description: 'View engagement and performance',
      onPress: navigateToAnalytics,
      items: [
        { label: 'User Analytics', route: navigateToAnalytics, icon: 'pie-chart' },
        { label: 'Content Performance', route: navigateToAnalytics, icon: 'bar-chart' },
        { label: 'App Usage', route: navigateToAnalytics, icon: 'activity' }
      ]
    },
    {
      title: 'Moderation',
      icon: 'shield',
      color: '#10b981',
      description: 'Review and moderate content',
      onPress: navigateToModeration,
      items: [
        { label: 'Comments', route: navigateToModeration, icon: 'message-square' },
        { label: 'Reports', route: navigateToModeration, icon: 'alert-triangle' },
        { label: 'Chat Messages', route: navigateToModeration, icon: 'message-circle' }
      ]
    },
    {
      title: 'Security',
      icon: 'lock',
      color: '#6366f1',
      description: 'Manage security settings',
      onPress: navigateToSecurity,
      items: [
        { label: 'Access Control', route: navigateToSecurity, icon: 'key' },
        { label: 'Audit Logs', route: navigateToSecurity, icon: 'file-text' },
        { label: 'Security Settings', route: navigateToSettings, icon: 'settings' }
      ]
    }
  ];

  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Admin Dashboard" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>
            {authLoading ? 'Checking permissions...' : 'Loading dashboard...'}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Don't render if not admin
if (!isAdmin || !hasCheckedAuth) {
  return null;
}

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Admin Dashboard" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
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
            <View style={styles.welcomeStats}>
              <View style={styles.welcomeStat}>
                <Text style={styles.welcomeStatValue}>{stats.activeUsers}</Text>
                <Text style={styles.welcomeStatLabel}>Active Users</Text>
              </View>
              <View style={styles.welcomeStat}>
                <Text style={styles.welcomeStatValue}>{stats.engagementRate}%</Text>
                <Text style={styles.welcomeStatLabel}>Engagement</Text>
              </View>
            </View>
          </Card>

          {/* Live Activity Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weekly User Activity</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#2563eb'
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </Card>

          {/* Key Metrics */}
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsContainer}
          >
            <Card style={[styles.metricCard, { backgroundColor: '#dbeafe' }]}>
              <Feather name="users" size={24} color="#2563eb" />
              <Text style={styles.metricValue}>{stats.totalUsers}</Text>
              <Text style={styles.metricLabel}>Total Users</Text>
            </Card>
            
            <Card style={[styles.metricCard, { backgroundColor: '#dcfce7' }]}>
              <Feather name="calendar" size={24} color="#16a34a" />
              <Text style={styles.metricValue}>{stats.totalMatches}</Text>
              <Text style={styles.metricLabel}>Matches</Text>
              <Text style={styles.metricSubtext}>{stats.liveMatches} live</Text>
            </Card>
            
            <Card style={[styles.metricCard, { backgroundColor: '#fef3c7' }]}>
              <Feather name="file-text" size={24} color="#f59e0b" />
              <Text style={styles.metricValue}>{stats.totalNews}</Text>
              <Text style={styles.metricLabel}>Articles</Text>
              <Text style={styles.metricSubtext}>{stats.recentNews} this week</Text>
            </Card>
            
            <Card style={[styles.metricCard, { backgroundColor: '#fce7f3' }]}>
              <Feather name="bell" size={24} color="#ec4899" />
              <Text style={styles.metricValue}>{stats.totalNotifications}</Text>
              <Text style={styles.metricLabel}>Notifications</Text>
            </Card>
          </ScrollView>

          {/* Management Sections */}
          <Text style={styles.sectionTitle}>Management Tools</Text>
          {adminSections.map((section, index) => (
            <Card key={index} style={styles.sectionCard}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={section.onPress}
              >
                <View style={[styles.sectionIcon, { backgroundColor: `${section.color}15` }]}>
                  <Feather name={section.icon as any} size={24} color={section.color} />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionCardTitle}>{section.title}</Text>
                  <Text style={styles.sectionDescription}>{section.description}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.sectionItem}
                    onPress={item.route}
                  >
                    <Feather name={item.icon as any} size={16} color="#6b7280" />
                    <Text style={styles.sectionItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ))}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#dbeafe' }]}
              onPress={navigateToCreateNews}
            >
              <Feather name="plus-circle" size={24} color="#2563eb" />
              <Text style={[styles.quickActionText, { color: '#2563eb' }]}>New Article</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#dcfce7' }]}
              onPress={navigateToCreateMatch}
            >
              <Feather name="plus-circle" size={24} color="#16a34a" />
              <Text style={[styles.quickActionText, { color: '#16a34a' }]}>Add Match</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#fee2e2' }]}
              onPress={navigateToCreateNotification}
            >
              <Feather name="bell" size={24} color="#ef4444" />
              <Text style={[styles.quickActionText, { color: '#ef4444' }]}>Send Alert</Text>
            </TouchableOpacity>
          </View>

          {/* Footer spacing */}
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
  welcomeStats: {
    alignItems: 'flex-end',
  },
  welcomeStat: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  welcomeStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  welcomeStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  metricCard: {
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionItems: {
    paddingVertical: 8,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  sectionItemText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
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
  footer: {
    height: 40,
  },
});