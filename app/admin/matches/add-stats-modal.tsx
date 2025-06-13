// app/admin/matches/add-stats-modal.tsx - Add Match Stats Modal
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../../../src/services/firebase/config';

import Card from '../../../src/components/common/Card';

interface AddMatchStatsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface MatchStatsForm {
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  venue: string;
  league: string;
  season: string;
  referee: string;
  attendance: string;
  homeStats: {
    possession: string;
    shots: string;
    shotsOnTarget: string;
    corners: string;
    fouls: string;
    yellowCards: string;
    redCards: string;
    passes: string;
    passAccuracy: string;
    offsides: string;
  };
  awayStats: {
    possession: string;
    shots: string;
    shotsOnTarget: string;
    corners: string;
    fouls: string;
    yellowCards: string;
    redCards: string;
    passes: string;
    passAccuracy: string;
    offsides: string;
  };
}

const AddMatchStatsModal: React.FC<AddMatchStatsModalProps> = ({
  visible,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MatchStatsForm>({
    homeTeam: '',
    awayTeam: '',
    homeScore: '',
    awayScore: '',
    venue: '',
    league: 'Premier Division',
    season: '2024-25',
    referee: '',
    attendance: '',
    homeStats: {
      possession: '50',
      shots: '0',
      shotsOnTarget: '0',
      corners: '0',
      fouls: '0',
      yellowCards: '0',
      redCards: '0',
      passes: '0',
      passAccuracy: '0',
      offsides: '0'
    },
    awayStats: {
      possession: '50',
      shots: '0',
      shotsOnTarget: '0',
      corners: '0',
      fouls: '0',
      yellowCards: '0',
      redCards: '0',
      passes: '0',
      passAccuracy: '0',
      offsides: '0'
    }
  });

  const handleSave = async () => {
    if (!formData.homeTeam || !formData.awayTeam) {
      Alert.alert('Error', 'Please enter both team names');
      return;
    }

    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      return;
    }

    setLoading(true);

    try {
      const matchData = {
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        homeScore: parseInt(formData.homeScore) || 0,
        awayScore: parseInt(formData.awayScore) || 0,
        venue: formData.venue,
        league: formData.league,
        season: formData.season,
        referee: formData.referee,
        attendance: parseInt(formData.attendance) || 0,
        status: 'completed',
        date: Timestamp.now(),
        homeStats: {
          possession: parseInt(formData.homeStats.possession) || 0,
          shots: parseInt(formData.homeStats.shots) || 0,
          shotsOnTarget: parseInt(formData.homeStats.shotsOnTarget) || 0,
          corners: parseInt(formData.homeStats.corners) || 0,
          fouls: parseInt(formData.homeStats.fouls) || 0,
          yellowCards: parseInt(formData.homeStats.yellowCards) || 0,
          redCards: parseInt(formData.homeStats.redCards) || 0,
          passes: parseInt(formData.homeStats.passes) || 0,
          passAccuracy: parseInt(formData.homeStats.passAccuracy) || 0,
          offsides: parseInt(formData.homeStats.offsides) || 0
        },
        awayStats: {
          possession: parseInt(formData.awayStats.possession) || 0,
          shots: parseInt(formData.awayStats.shots) || 0,
          shotsOnTarget: parseInt(formData.awayStats.shotsOnTarget) || 0,
          corners: parseInt(formData.awayStats.corners) || 0,
          fouls: parseInt(formData.awayStats.fouls) || 0,
          yellowCards: parseInt(formData.awayStats.yellowCards) || 0,
          redCards: parseInt(formData.awayStats.redCards) || 0,
          passes: parseInt(formData.awayStats.passes) || 0,
          passAccuracy: parseInt(formData.awayStats.passAccuracy) || 0,
          offsides: parseInt(formData.awayStats.offsides) || 0
        },
        events: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(firestore, 'matches'), matchData);
      
      Alert.alert('Success', 'Match statistics added successfully!');
      onSave();
      onClose();
      
      // Reset form
      setFormData({
        homeTeam: '',
        awayTeam: '',
        homeScore: '',
        awayScore: '',
        venue: '',
        league: 'Premier Division',
        season: '2024-25',
        referee: '',
        attendance: '',
        homeStats: {
          possession: '50', shots: '0', shotsOnTarget: '0', corners: '0',
          fouls: '0', yellowCards: '0', redCards: '0', passes: '0',
          passAccuracy: '0', offsides: '0'
        },
        awayStats: {
          possession: '50', shots: '0', shotsOnTarget: '0', corners: '0',
          fouls: '0', yellowCards: '0', redCards: '0', passes: '0',
          passAccuracy: '0', offsides: '0'
        }
      });

    } catch (error) {
      console.error('Error adding match stats:', error);
      Alert.alert('Error', 'Failed to add match statistics');
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateStatsField = (team: 'homeStats' | 'awayStats', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [team]: { ...prev[team], [field]: value }
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient
        colors={['#0047AB', '#191970', '#041E42']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Match Statistics</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={loading}
              style={[styles.saveButton, loading && styles.disabledButton]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Basic Match Info */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Match Information</Text>
              
              <View style={styles.teamsRow}>
                <View style={styles.teamInput}>
                  <Text style={styles.label}>Home Team</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.homeTeam}
                    onChangeText={(value) => updateFormField('homeTeam', value)}
                    placeholder="Enter home team"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.label}>Score</Text>
                  <View style={styles.scoreInputs}>
                    <TextInput
                      style={styles.scoreInput}
                      value={formData.homeScore}
                      onChangeText={(value) => updateFormField('homeScore', value)}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                    <Text style={styles.scoreSeparator}>-</Text>
                    <TextInput
                      style={styles.scoreInput}
                      value={formData.awayScore}
                      onChangeText={(value) => updateFormField('awayScore', value)}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.teamInput}>
                  <Text style={styles.label}>Away Team</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.awayTeam}
                    onChangeText={(value) => updateFormField('awayTeam', value)}
                    placeholder="Enter away team"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Venue</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.venue}
                    onChangeText={(value) => updateFormField('venue', value)}
                    placeholder="Stadium name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>League</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.league}
                    onChangeText={(value) => updateFormField('league', value)}
                    placeholder="League name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Referee</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.referee}
                    onChangeText={(value) => updateFormField('referee', value)}
                    placeholder="Referee name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Attendance</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.attendance}
                    onChangeText={(value) => updateFormField('attendance', value)}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </Card>

            {/* Home Team Stats */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>{formData.homeTeam || 'Home Team'} Statistics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Possession %</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.homeStats.possession}
                    onChangeText={(value) => updateStatsField('homeStats', 'possession', value)}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Shots</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.homeStats.shots}
                    onChangeText={(value) => updateStatsField('homeStats', 'shots', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Shots on Target</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.homeStats.shotsOnTarget}
                    onChangeText={(value) => updateStatsField('homeStats', 'shotsOnTarget', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Corners</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.homeStats.corners}
                    onChangeText={(value) => updateStatsField('homeStats', 'corners', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Fouls</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.homeStats.fouls}
                    onChangeText={(value) => updateStatsField('homeStats', 'fouls', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Yellow Cards</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.homeStats.yellowCards}
                    onChangeText={(value) => updateStatsField('homeStats', 'yellowCards', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </Card>

            {/* Away Team Stats */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>{formData.awayTeam || 'Away Team'} Statistics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Possession %</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.awayStats.possession}
                    onChangeText={(value) => updateStatsField('awayStats', 'possession', value)}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Shots</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.awayStats.shots}
                    onChangeText={(value) => updateStatsField('awayStats', 'shots', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Shots on Target</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.awayStats.shotsOnTarget}
                    onChangeText={(value) => updateStatsField('awayStats', 'shotsOnTarget', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Corners</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.awayStats.corners}
                    onChangeText={(value) => updateStatsField('awayStats', 'corners', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Fouls</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.awayStats.fouls}
                    onChangeText={(value) => updateStatsField('awayStats', 'fouls', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.statInput}>
                  <Text style={styles.label}>Yellow Cards</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.awayStats.yellowCards}
                    onChangeText={(value) => updateStatsField('awayStats', 'yellowCards', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  teamInput: {
    flex: 1,
  },
  scoreContainer: {
    marginHorizontal: 16,
    alignItems: 'center',
  },
  scoreInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInput: {
    width: 50,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    textAlign: 'center',
    fontSize: 16,
    color: '#111827',
  },
  scoreSeparator: {
    marginHorizontal: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
    marginRight: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statInput: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#111827',
  },
});

export default AddMatchStatsModal;