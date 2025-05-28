// app/admin/analytics/index.tsx
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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  userGrowth: number[];
  contentViews: number[];
  engagementRates: number[];
  topContent: Array<{ name: string; views: number; color: string }>;
  deviceTypes: Array<{ name: string; population: number; color: string; legendFontColor: string; legendFontSize: number }>;
}

export default function AdminAnalyticsScreen() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [20, 45, 28, 80, 99, 43, 50],
    contentViews: [120, 150, 89, 200, 180, 220, 195],
    engagementRates: [65, 72, 68, 85, 78, 90, 82],
    topContent: [
      { name: 'News Articles', views: 2150, color: '#2563eb' },
      { name: 'Match Results', views: 1890, color: '#16a34a' },
      { name: 'Team Profiles', views: 1420, color: '#f59e0b' },
      { name: 'Player Stats', views: 1120, color: '#ef4444' },
      { name: 'League Tables', views: 890, color: '#8b5cf6' }
    ],
    deviceTypes: [
      { name: 'Mobile', population: 68, color: '#2563eb', legendFontColor: '#374151', legendFontSize: 14 },
      { name: 'Tablet', population: 22, color: '#16a34a', legendFontColor: '#374151', legendFontSize: 14 },
      { name: 'Desktop', population: 10, color: '#f59e0b', legendFontColor: '#374151', legendFontSize: 14 }
    ]
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalViews: 0,
    avgSessionTime: '0m',
    bounceRate: '0%',
    newUsers: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    fetchAnalytics();
  }, [isAdmin, selectedPeriod]);

  const fetchAnalytics = async () => {
    if (!firestore) {
      setLoading(false);
      return;
    }

    try {
      // Get basic stats
      const [usersCount, newsCount, matchesCount] = await Promise.all([
        getCountFromServer(collection(firestore, 'users')),
        getCountFromServer(collection(firestore, 'news')),
        getCountFromServer(collection(firestore, 'matches'))
      ]);

      // Calculate date range based on selected period
      const daysAgo = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get active users in the selected period
      const activeUsersQuery = query(
        collection(firestore, 'users'),
        where('lastActive', '>=', Timestamp.fromDate(startDate))
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);

      // Generate mock analytics data (in a real app, this would come from actual analytics)
      const mockStats = {
        totalUsers: usersCount.data().count,
        activeUsers: activeUsersSnapshot.size,
        totalViews: Math.floor(Math.random() * 10000) + 5000,
        avgSessionTime: `${Math.floor(Math.random() * 10) + 3}m`,
        bounceRate: `${Math.floor(Math.random() * 30) + 20}%`,
        newUsers: Math.floor(Math.random() * 100) + 50
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const chartConfig = {
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
      r: '4',
      strokeWidth: '2',
      stroke: '#2563eb'
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Analytics" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
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
        <Header title="Analytics" showBack={true} />
        
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
          {/* Period Selector */}
          <Card style={styles.periodCard}>
            <Text style={styles.periodTitle}>Time Period</Text>
            <View style={styles.periodSelector}>
              {(['7d', '30d', '90d'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive
                    ]}
                  >
                    {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              <Feather name="activity" size={24} color="#16a34a" />
              <Text style={styles.metricValue}>{stats.activeUsers}</Text>
              <Text style={styles.metricLabel}>Active Users</Text>
            </Card>
            
            <Card style={[styles.metricCard, { backgroundColor: '#fef3c7' }]}>
              <Feather name="eye" size={24} color="#f59e0b" />
              <Text style={styles.metricValue}>{stats.totalViews}</Text>
              <Text style={styles.metricLabel}>Total Views</Text>
            </Card>
            
            <Card style={[styles.metricCard, { backgroundColor: '#fce7f3' }]}>
              <Feather name="clock" size={24} color="#ec4899" />
              <Text style={styles.metricValue}>{stats.avgSessionTime}</Text>
              <Text style={styles.metricLabel}>Avg Session</Text>
            </Card>
            
            <Card style={[styles.metricCard, { backgroundColor: '#f3e8ff' }]}>
              <Feather name="trending-down" size={24} color="#8b5cf6" />
              <Text style={styles.metricValue}>{stats.bounceRate}</Text>
              <Text style={styles.metricLabel}>Bounce Rate</Text>
            </Card>
          </ScrollView>

          {/* User Growth Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>User Growth</Text>
            <LineChart
              data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                  data: analytics.userGrowth.slice(0, 4),
                  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`
                }]
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card>

          {/* Content Performance */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Content Performance</Text>
            <BarChart
              data={{
                labels: ['News', 'Matches', 'Teams', 'Players'],
                datasets: [{
                  data: analytics.contentViews.slice(0, 4)
                }]
              }}
              width={screenWidth - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`
              }}
              style={styles.chart}
            />
          </Card>

          {/* Device Types */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Device Types</Text>
            <PieChart
              data={analytics.deviceTypes}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Card>

          {/* Top Content */}
          <Card style={styles.topContentCard}>
            <Text style={styles.chartTitle}>Top Content</Text>
            {analytics.topContent.map((item, index) => (
              <View key={index} style={styles.contentItem}>
                <View style={styles.contentRank}>
                  <Text style={styles.contentRankText}>{index + 1}</Text>
                </View>
                <View style={styles.contentInfo}>
                  <Text style={styles.contentName}>{item.name}</Text>
                  <View style={styles.contentBar}>
                    <View 
                      style={[
                        styles.contentBarFill, 
                        { 
                          width: `${(item.views / analytics.topContent[0].views) * 100}%`,
                          backgroundColor: item.color
                        }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.contentViews}>{item.views}</Text>
              </View>
            ))}
          </Card>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#dbeafe' }]}
              onPress={() => Alert.alert('Coming Soon', 'Export functionality will be available soon')}
            >
              <Feather name="download" size={24} color="#2563eb" />
              <Text style={[styles.quickActionText, { color: '#2563eb' }]}>Export Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#dcfce7' }]}
              onPress={() => Alert.alert('Coming Soon', 'Custom reports will be available soon')}
            >
              <Feather name="file-text" size={24} color="#16a34a" />
              <Text style={[styles.quickActionText, { color: '#16a34a' }]}>Custom Report</Text>
            </TouchableOpacity>
          </View>

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
  periodCard: {
    margin: 16,
    padding: 16,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2563eb',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 8,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  chartCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  topContentCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentRankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentInfo: {
    flex: 1,
    marginRight: 12,
  },
  contentName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  contentBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  contentBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  contentViews: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
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