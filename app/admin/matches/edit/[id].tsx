// app/admin/matches/edit/[id].tsx
import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useGlobalSearchParams } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/src/hooks/useAuth';
import Header from '@/src/components/common/Header';
import { MatchForm } from '@/src/components/admin/MatchForm';
import { getMatchById, updateMatch, getTeamById } from '@/src/services/firebase/matches';

interface Match {
  id: string;
  leagueId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: any;
  time: string;
  venue: string;
  competition: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  featured?: boolean;
}

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

export default function EditMatchScreen() {
  const { user, isAdmin } = useAuth();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || !isAdmin) return;

    const loadMatch = async () => {
      try {
        const matchData = await getMatchById(id);
        if (matchData) {
          setMatch(matchData);
        } else {
          Alert.alert('Error', 'Match not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading match:', error);
        Alert.alert('Error', 'Failed to load match data');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [id, isAdmin]);

  const handleSubmit = async (formData: MatchFormData) => {
    if (!user || !isAdmin || !match) {
      Alert.alert('Error', 'Unauthorized access');
      return;
    }

    setSaving(true);
    try {
      // Get updated team names if teams changed
      let homeTeamName = match.homeTeamName;
      let awayTeamName = match.awayTeamName;

      if (formData.homeTeamId !== match.homeTeamId) {
        const homeTeam = await getTeamById(formData.homeTeamId);
        if (homeTeam) homeTeamName = homeTeam.name;
      }

      if (formData.awayTeamId !== match.awayTeamId) {
        const awayTeam = await getTeamById(formData.awayTeamId);
        if (awayTeam) awayTeamName = awayTeam.name;
      }

      // Convert Date to Firestore Timestamp
      const firestoreDate = Timestamp.fromDate(formData.date);

      // Prepare update data
      const updateData = {
        leagueId: formData.leagueId,
        homeTeamId: formData.homeTeamId,
        homeTeamName,
        awayTeamId: formData.awayTeamId,
        awayTeamName,
        date: firestoreDate, // Use Firestore Timestamp
        time: formData.time,
        venue: formData.venue,
        competition: formData.competition,
        status: formData.status,
        teams: [formData.homeTeamId, formData.awayTeamId],
        featured: formData.featured,
        ...(formData.homeScore !== undefined && { homeScore: formData.homeScore }),
        ...(formData.awayScore !== undefined && { awayScore: formData.awayScore }),
      };

      await updateMatch(match.id, updateData);
      
      Alert.alert(
        'Success',
        'Match updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating match:', error);
      Alert.alert(
        'Error',
        'Failed to update match. Please check all fields and try again.'
      );
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Header title="Edit Match" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading match data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!match) {
    return (
      <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Header title="Edit Match" showBack={true} />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Match not found</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Convert match data to form format
  const initialData: Partial<MatchFormData> = {
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    leagueId: match.leagueId,
    venue: match.venue,
    competition: match.competition,
    date: match.date?.toDate ? match.date.toDate() : new Date(match.date),
    time: match.time,
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    featured: match.featured || false,
  };

  return (
    <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Edit Match" showBack={true} />
        <MatchForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
          loading={saving}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});