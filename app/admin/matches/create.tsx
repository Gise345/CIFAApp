// app/admin/matches/create.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/src/hooks/useAuth';
import Header from '@/src/components/common/Header';
import { MatchForm } from '@/src/components/admin/MatchForm';
import { createMatch, getTeamById } from '@/src/services/firebase/matches';

interface MatchFormData {
  homeTeamId: string;
  awayTeamId: string;
  leagueId: string;
  venue: string;
  competition: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  featured: boolean;
}

export default function CreateMatchScreen() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: MatchFormData) => {
    if (!user || !isAdmin) {
      Alert.alert('Error', 'Unauthorized access');
      return;
    }

    setLoading(true);
    try {
      // Get team names for the match
      const homeTeam = await getTeamById(formData.homeTeamId);
      const awayTeam = await getTeamById(formData.awayTeamId);
      
      if (!homeTeam || !awayTeam) {
        throw new Error('Selected teams not found');
      }

      // Convert Date to Firestore Timestamp
      const firestoreDate = Timestamp.fromDate(formData.date);

      // Prepare match data for Firestore
      const matchData = {
        leagueId: formData.leagueId,
        homeTeamId: formData.homeTeamId,
        homeTeamName: homeTeam.name,
        awayTeamId: formData.awayTeamId,
        awayTeamName: awayTeam.name,
        date: firestoreDate, // Use Firestore Timestamp
        time: formData.time,
        venue: formData.venue,
        competition: formData.competition,
        status: formData.status,
        teams: [formData.homeTeamId, formData.awayTeamId], // For querying
        featured: formData.featured,
        ...(formData.homeScore !== undefined && { homeScore: formData.homeScore }),
        ...(formData.awayScore !== undefined && { awayScore: formData.awayScore }),
      };

      await createMatch(matchData);
      
      Alert.alert(
        'Success',
        'Match created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert(
        'Error',
        'Failed to create match. Please check all fields and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Create Match" showBack={true} />
        <MatchForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
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
});