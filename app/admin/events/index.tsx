// app/admin/events/index.tsx - Admin Events Management
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
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
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { format } from 'date-fns';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp | any;
  time: string;
  venue: string;
  type: 'match' | 'tournament' | 'meeting' | 'training' | 'other';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  participants?: string[];
  featured?: boolean;
}

export default function AdminEventsScreen() {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
    
    fetchEvents();
  }, [isAdmin]);

  const fetchEvents = async () => {
    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      setLoading(false);
      return;
    }
    
    try {
      const eventsQuery = query(
        collection(firestore, 'events'),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleCreateEvent = () => {
    router.push('/admin/events/create' as any);
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/admin/events/edit/${eventId}` as any);
  };

  const handleDeleteEvent = (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
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
              const eventDocRef = doc(firestore, 'events', event.id);
              await deleteDoc(eventDocRef);
              setEvents(prev => prev.filter(e => e.id !== event.id));
              Alert.alert('Success', 'Event deleted successfully');
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
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
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge text="ONGOING" variant="danger" />;
      case 'completed':
        return <Badge text="Completed" variant="success" />;
      case 'scheduled':
        return <Badge text="Scheduled" variant="info" />;
      case 'cancelled':
        return <Badge text="Cancelled" variant="secondary" />;
      default:
        return <Badge text={status} variant="secondary" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'match':
        return <Badge text="Match" variant="primary" />;
      case 'tournament':
        return <Badge text="Tournament" variant="warning" />;
      case 'meeting':
        return <Badge text="Meeting" variant="info" />;
      case 'training':
        return <Badge text="Training" variant="success" />;
      default:
        return <Badge text="Other" variant="secondary" />;
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Header title="Event Management" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading events...</Text>
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
        <Header title="Event Management" showBack={true} />
        
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
          {/* Header with Create Button */}
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Events ({events.length})</Text>
            <Button 
              title="Add Event" 
              onPress={handleCreateEvent}
              style={styles.createButton}
            />
          </View>
          
          {/* Stats Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <Card style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
              <Feather name="play" size={20} color="#dc2626" />
              <Text style={styles.statValue}>
                {events.filter(e => e.status === 'ongoing').length}
              </Text>
              <Text style={styles.statLabel}>Ongoing</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <Feather name="clock" size={20} color="#2563eb" />
              <Text style={styles.statValue}>
                {events.filter(e => e.status === 'scheduled').length}
              </Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
              <Feather name="check-circle" size={20} color="#16a34a" />
              <Text style={styles.statValue}>
                {events.filter(e => e.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
          </ScrollView>
          
          {/* Events List */}
          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No events found</Text>
              <Button 
                title="Add First Event" 
                onPress={handleCreateEvent}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            events.map(event => (
              <Card key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {formatDate(event.date)} • {event.time}
                    </Text>
                  </View>
                  <View style={styles.badgeContainer}>
                    {getStatusBadge(event.status)}
                    {getTypeBadge(event.type)}
                    {event.featured && (
                      <Badge text="FEATURED" variant="warning" style={styles.featuredBadge} />
                    )}
                  </View>
                </View>
                
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
                
                <Text style={styles.eventVenue}>📍 {event.venue}</Text>
                
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditEvent(event.id)}
                  >
                    <Feather name="edit-2" size={16} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteEvent(event)}
                  >
                    <Feather name="trash-2" size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
          
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
  createButton: {
    minWidth: 100,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statCard: {
    padding: 16,
    marginRight: 12,
    width: 100,
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
    minWidth: 140,
  },
  eventCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  featuredBadge: {
    marginTop: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventVenue: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  eventActions: {
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
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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