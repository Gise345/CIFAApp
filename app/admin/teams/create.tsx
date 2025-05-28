// app/admin/teams/create.tsx
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
import ColorPicker from '../../../src/components/admin/ColorPicker';
import { firestore } from '../../../src/services/firebase/config';
import { useAuth } from '../../../src/hooks/useAuth';

export default function CreateTeamScreen() {
  const { user, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [division, setDivision] = useState('');
  const [type, setType] = useState<'club' | 'national'>('club');
  const [colorPrimary, setColorPrimary] = useState('#2563eb');
  const [colorSecondary, setColorSecondary] = useState('#1d4ed8');
  const [venue, setVenue] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page');
      router.back();
      return;
    }
  }, [isAdmin]);

  const handleSave = async () => {
    if (!name || !shortName || !division) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!firestore) {
      Alert.alert('Error', 'Database connection not available');
      return;
    }

    try {
      setSaving(true);
      
      const teamData = {
        name,
        shortName,
        division,
        type,
        colorPrimary,
        colorSecondary,
        venue: venue || undefined,
        foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
        description: description || undefined,
        website: website || undefined,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      };

      await addDoc(collection(firestore, 'teams'), teamData);
      
      Alert.alert('Success', 'Team created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Create Team" showBack={true} />
        
        <ScrollView style={styles.content}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Team Details</Text>
            
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
                  style={[styles.radioButton, type === 'club' && styles.radioButtonSelected]}
                  onPress={() => setType('club')}
                >
                  <View style={styles.radioCircle}>
                    {type === 'club' && <View style={styles.radioFilled} />}
                  </View>
                  <Text style={styles.radioLabel}>Club Team</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.radioButton, type === 'national' && styles.radioButtonSelected]}
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
                value={foundedYear}
                onChangeText={setFoundedYear}
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
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter team description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <Button
              title="Create Team"
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
  textArea: {
    minHeight: 80,
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
    marginTop: 20,
  },
});