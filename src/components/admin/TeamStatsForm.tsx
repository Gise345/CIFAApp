// src/components/admin/TeamStatsForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../services/firebase/config';
import { useTeams } from '../../hooks/useTeams';

interface TeamStatsFormProps {
  teamId: string;
  leagueId?: string;
  onSave?: () => void;
}

const TeamStatsForm: React.FC<TeamStatsFormProps> = ({ 
  teamId, 
  leagueId = 'default',
  onSave 
}) => {
  const { fetchTeamById } = useTeams();
  
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    matches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    points: 0,
    season: '2024-25'
  });
  
  // Load team data and existing stats if available
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team data
        const teamData = await fetchTeamById(teamId);
        setTeam(teamData);
        
        // Check if stats already exist for this team and league
        if (firestore) {
          const statsRef = doc(firestore, 'teamStats', `${teamId}-${leagueId}`);
          const statsDoc = await getDoc(statsRef);
          
          if (statsDoc.exists()) {
            const data = statsDoc.data();
            setStats({
              matches: data.matches || 0,
              wins: data.wins || 0,
              draws: data.draws || 0,
              losses: data.losses || 0,
              goalsFor: data.goalsFor || 0,
              goalsAgainst: data.goalsAgainst || 0,
              cleanSheets: data.cleanSheets || 0,
              points: data.points || 0,
              season: data.season || '2024-25'
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading team data:', err);
        setError('Failed to load team data');
        setLoading(false);
      }
    };
    
    loadData();
  }, [teamId, leagueId]);
  
  // Update stat field
  const updateStat = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setStats(prev => ({ ...prev, [field]: numValue }));
  };
  
  // Calculate goal difference and win percentage
  const goalDifference = stats.goalsFor - stats.goalsAgainst;
  const winPercentage = stats.matches > 0 
    ? Math.round((stats.wins / stats.matches) * 100) 
    : 0;
  
  // Generate form based on results
  const generateForm = () => {
    const form: string[] = [];
    
    // Add wins
    for (let i = 0; i < Math.min(stats.wins, 5); i++) {
      form.push('W');
    }
    
    // Add draws if space remains
    if (form.length < 5) {
      for (let i = 0; i < Math.min(stats.draws, 5 - form.length); i++) {
        form.push('D');
      }
    }
    
    // Add losses if space remains
    if (form.length < 5) {
      for (let i = 0; i < Math.min(stats.losses, 5 - form.length); i++) {
        form.push('L');
      }
    }
    
    return form;
  };
  
  // Save team stats to Firestore
  const saveStats = async () => {
    if (!team || !firestore) {
      Alert.alert('Error', 'Team data or Firestore not available');
      return;
    }
    
    try {
      setSaving(true);
      
      const form = generateForm();
      const statData = {
        teamId,
        teamName: team.name,
        leagueId,
        season: stats.season,
        matches: stats.matches,
        wins: stats.wins,
        draws: stats.draws,
        losses: stats.losses,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalDifference,
        cleanSheets: stats.cleanSheets,
        winPercentage,
        form,
        points: stats.points,
        lastUpdated: serverTimestamp()
      };
      
      const docId = `${teamId}-${leagueId}`;
      
      // Check if document already exists
      const statsRef = doc(firestore, 'teamStats', docId);
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        // Update existing document
        await updateDoc(statsRef, statData);
      } else {
        // Create new document with custom ID
        await updateDoc(doc(firestore, 'teamStats', docId), statData);
      }
      
      setSaving(false);
      Alert.alert('Success', 'Team stats saved successfully');
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Error saving team stats:', err);
      setSaving(false);
      Alert.alert('Error', 'Failed to save team stats');
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Loading team data...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.leagueName}>League: {leagueId}</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Matches Played</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.matches.toString()}
              onChangeText={(value) => updateStat('matches', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Wins</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.wins.toString()}
              onChangeText={(value) => updateStat('wins', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Draws</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.draws.toString()}
              onChangeText={(value) => updateStat('draws', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Losses</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.losses.toString()}
              onChangeText={(value) => updateStat('losses', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Goals For</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.goalsFor.toString()}
              onChangeText={(value) => updateStat('goalsFor', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Goals Against</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.goalsAgainst.toString()}
              onChangeText={(value) => updateStat('goalsAgainst', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Clean Sheets</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.cleanSheets.toString()}
              onChangeText={(value) => updateStat('cleanSheets', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Points</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.points.toString()}
              onChangeText={(value) => updateStat('points', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Season</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={stats.season}
              onChangeText={(value) => setStats(prev => ({ ...prev, season: value }))}
            />
          </View>
        </View>
        
        <View style={styles.calculatedStats}>
          <Text style={styles.calculatedLabel}>Goal Difference:</Text>
          <Text style={styles.calculatedValue}>{goalDifference}</Text>
        </View>
        
        <View style={styles.calculatedStats}>
          <Text style={styles.calculatedLabel}>Win Percentage:</Text>
          <Text style={styles.calculatedValue}>{winPercentage}%</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveStats}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Team Stats</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  leagueName: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  labelContainer: {
    flex: 2,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  calculatedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  calculatedLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  calculatedValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default TeamStatsForm;