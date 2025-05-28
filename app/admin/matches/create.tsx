// app/admin/matches/create.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import Header from '../../../src/components/common/Header';
import Card from '../../../src/components/common/Card';
import Button from '../../../src/components/common/Button';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

export default function CreateMatchScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [competition, setCompetition] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);


  useEffect(() => {
  // Only check auth after loading is complete
  if (!authLoading) {
    console.log('Create Match Screen - Auth Check:', {
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
    }
  }
}, [authLoading, user, isAdmin]);

  const handleSave = async () => {
    if (!homeTeam || !awayTeam || !date || !time || !venue || !competition) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      return;
    }

    try {
      setSaving(true);
      
      const matchData = {
        leagueId: leagueId || 'default',
        homeTeamId: homeTeam.toLowerCase().replace(/\s+/g, '-'),
        homeTeamName: homeTeam,
        awayTeamId: awayTeam.toLowerCase().replace(/\s+/g, '-'),
        awayTeamName: awayTeam,
        date: new Date(date + 'T' + time),
        time,
        venue,
        competition,
        status: 'scheduled',
        featured: false,
        teams: [homeTeam.toLowerCase().replace(/\s+/g, '-'), awayTeam.toLowerCase().replace(/\s+/g, '-')],
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      };

      await addDoc(collection(firestore, 'matches'), matchData);
      
      Alert.alert('Success', 'Match created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'Failed to create match');
    } finally {
      setSaving(false);
    }
  };

  
   if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Create Match" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Checking permissions...</Text>
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
        <Header title="Create Match" showBack={true} />
        
        <ScrollView style={styles.content}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Match Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Home Team *</Text>
              <TextInput
                style={styles.input}
                value={homeTeam}
                onChangeText={setHomeTeam}
                placeholder="Enter home team name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Away Team *</Text>
              <TextInput
                style={styles.input}
                value={awayTeam}
                onChangeText={setAwayTeam}
                placeholder="Enter away team name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Venue *</Text>
              <TextInput
                style={styles.input}
                value={venue}
                onChangeText={setVenue}
                placeholder="Enter venue name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Competition *</Text>
              <TextInput
                style={styles.input}
                value={competition}
                onChangeText={setCompetition}
                placeholder="Enter competition name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>League ID</Text>
              <TextInput
                style={styles.input}
                value={leagueId}
                onChangeText={setLeagueId}
                placeholder="Enter league ID (optional)"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <Button
              title="Create Match"
              onPress={handleSave}
              loading={saving}
              style={styles.saveButton}
            />
          </Card>
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
  formCard: {
    margin: 16,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    marginTop: 20,
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
}
});