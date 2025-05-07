// app/admin/teams/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { router, useGlobalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Team } from '../../../src/types/team';
import { getTeamById, updateTeam } from '../../../src/services/firebase/teams';
import TeamImageUpload from '../../../src/components/admin/TeamImageupload';
import ColorPicker from '../../../src/components/admin/ColorPicker';
import LeagueSelector from '../../../src/components/admin/LeagueSelector';
import { useAuth } from '../../../src/hooks/useAuth';


export default function TeamEditScreen() {
  // Get team ID from route params using useGlobalSearchParams (SDK 53 compatible)
  const params = useGlobalSearchParams();
  const teamId = params.id as string;
  const { isAdmin } = useAuth();

  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [division, setDivision] = useState('');
  const [type, setType] = useState<'club' | 'national'>('club');
  const [colorPrimary, setColorPrimary] = useState('#2563eb'); // Default blue
  const [colorSecondary, setColorSecondary] = useState('#1d4ed8'); // Default darker blue
  const [venue, setVenue] = useState('');
  const [foundedYear, setFoundedYear] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [leagueId, setLeagueId] = useState<string | undefined>(undefined);
  
  // Load team data
  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      Alert.alert('Unauthorized', 'You do not have permission to edit teams');
      router.back();
      return;
    }
    
    // Load team data when component mounts
    if (teamId) {
      loadTeamData();
    }
  }, [isAdmin, teamId]);
  
  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const teamData = await getTeamById(teamId);
      
      if (!teamData) {
        setError('Team not found');
        setLoading(false);
        return;
      }
      
      // Set team data
      setTeam(teamData);
      
      // Set form fields
      setName(teamData.name || '');
      setShortName(teamData.shortName || '');
      setDivision(teamData.division || '');
      setType(teamData.type || 'club');
      setColorPrimary(teamData.colorPrimary || '#2563eb');
      setColorSecondary(teamData.colorSecondary || '#1d4ed8');
      setVenue(teamData.venue || '');
      setFoundedYear(teamData.foundedYear);
      setDescription(teamData.description || '');
      setWebsite(teamData.website || '');
      setLeagueId(teamData.leagueId);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading team:', error);
      setError('Failed to load team data');
      setLoading(false);
    }
  };
  
  // Save team data
  const saveTeam = async () => {
    try {
      // Validate required fields
      if (!name || !shortName || !division || !type) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }
      
      setSaving(true);
      
      const teamData: Partial<Team> = {
        name,
        shortName,
        division,
        type,
        colorPrimary,
        colorSecondary,
        venue,
        foundedYear: foundedYear ? parseInt(String(foundedYear)) : undefined,
        description,
        website,
        leagueId,
      };
      
      // Use the updateTeam function from firebase service
      await updateTeam(teamId, teamData);
      
      setSaving(false);
      
      // Show success message
      Alert.alert(
        'Success',
        'Team updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team');
      setSaving(false);
      
      // Show error message
      Alert.alert('Error', 'Failed to update team');
    }
  };
  
  // Handle logo upload success
  const handleLogoUploadSuccess = (logoUrl: string) => {
    // We don't need to do anything here as the upload function already updates Firestore
    console.log('Logo uploaded successfully:', logoUrl);
  };
  
  // Handle league selection
  const handleLeagueSelect = (league: any) => {
    setLeagueId(league.id);
  };
  
  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[colorPrimary, '#041E42']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Team</Text>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorPrimary} />
          <Text style={styles.loadingText}>Loading team data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={32} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadTeamData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Team Logo Upload */}
          {teamId && (
            <TeamImageUpload
              teamId={teamId}
              currentLogoUrl={team?.logo}
              onSuccess={handleLogoUploadSuccess}
            />
          )}
          
          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Team Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter team name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Short Name *</Text>
              <TextInput
                style={styles.input}
                value={shortName}
                onChangeText={setShortName}
                placeholder="Enter short name (e.g. MUN, ARS)"
                placeholderTextColor="#9ca3af"
                maxLength={5}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Team Type *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    type === 'club' && styles.radioButtonSelected
                  ]}
                  onPress={() => setType('club')}
                >
                  <View style={styles.radioCircle}>
                    {type === 'club' && <View style={styles.radioFilled} />}
                  </View>
                  <Text style={styles.radioLabel}>Club Team</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    type === 'national' && styles.radioButtonSelected
                  ]}
                  onPress={() => setType('national')}
                >
                  <View style={styles.radioCircle}>
                    {type === 'national' && <View style={styles.radioFilled} />}
                  </View>
                  <Text style={styles.radioLabel}>National Team</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Division *</Text>
              <TextInput
                style={styles.input}
                value={division}
                onChangeText={setDivision}
                placeholder="Enter division"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
          
          {/* Team Colors Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Colors</Text>
            
            <ColorPicker
              selectedColor={colorPrimary}
              onColorChange={setColorPrimary}
              label="Primary Color"
            />
            
            <ColorPicker
              selectedColor={colorSecondary}
              onColorChange={setColorSecondary}
              label="Secondary Color"
            />
          </View>
          
          {/* Team Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Home Venue</Text>
              <TextInput
                style={styles.input}
                value={venue}
                onChangeText={setVenue}
                placeholder="Enter home venue"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Founded Year</Text>
              <TextInput
                style={styles.input}
                value={foundedYear ? String(foundedYear) : ''}
                onChangeText={(text) => {
                  const yearValue = text.trim() === '' ? undefined : parseInt(text);
                  setFoundedYear(isNaN(yearValue as number) ? undefined : yearValue);
                }}
                placeholder="Enter founded year"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="Enter website URL"
                placeholderTextColor="#9ca3af"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            
            <LeagueSelector
              selectedLeagueId={leagueId}
              onLeagueSelect={handleLeagueSelect}
            />
          </View>
          
          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Team Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter team description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveTeam}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 25,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radioButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 14,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});