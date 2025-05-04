// CIFAMobileApp/src/components/news/NotificationForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Switch } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { createNotification, sendNotification } from '../../services/firebase/notifications';
import { getTeams } from '../../services/firebase/teams';
import { Timestamp } from 'firebase/firestore';

interface Team {
  id: string;
  name: string;
  type: 'national' | 'club';
  division: string;
}

interface NotificationFormProps {
  onSaveSuccess?: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onSaveSuccess }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');
  const [data, setData] = useState('');
  const [targetTeams, setTargetTeams] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams for selection
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const fetchedTeams = await getTeams();
        setTeams(fetchedTeams);
        setLoadingTeams(false);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setLoadingTeams(false);
      }
    };
    
    fetchTeams();
  }, []);

  const handleTargetTeamToggle = (teamId: string) => {
    if (targetTeams.includes(teamId)) {
      setTargetTeams(targetTeams.filter(id => id !== teamId));
    } else {
      setTargetTeams([...targetTeams, teamId]);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || scheduledDate;
    setShowDatePicker(Platform.OS === 'ios');
    
    // Only update the date portion, keep the time
    const newDate = new Date(scheduledDate);
    newDate.setFullYear(currentDate.getFullYear());
    newDate.setMonth(currentDate.getMonth());
    newDate.setDate(currentDate.getDate());
    
    setScheduledDate(newDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || scheduledDate;
    setShowTimePicker(Platform.OS === 'ios');
    
    // Only update the time portion, keep the date
    const newDate = new Date(scheduledDate);
    newDate.setHours(currentTime.getHours());
    newDate.setMinutes(currentTime.getMinutes());
    
    setScheduledDate(newDate);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!body.trim()) {
      setError('Message content is required');
      return false;
    }
    
    if (type === 'team' && targetTeams.length === 0) {
      setError('Please select at least one team');
      return false;
    }
    
    if (isScheduled) {
      const now = new Date();
      if (scheduledDate <= now) {
        setError('Scheduled time must be in the future');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      setError('You must be logged in to send notifications');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Parse data string to an object if provided
      let dataObject = {};
      if (data.trim()) {
        try {
          dataObject = JSON.parse(data);
        } catch (err) {
          setError('Invalid JSON in data field');
          setLoading(false);
          return;
        }
      }
      
      // Create notification
      const notificationId = await createNotification({
        title,
        body,
        type: type as 'match' | 'news' | 'team' | 'general',
        data: dataObject,
        targetTeams: type === 'team' ? targetTeams : undefined,
        scheduledFor: isScheduled ? Timestamp.fromDate(scheduledDate) : undefined,        
        createdBy: user.uid
      });
      
      // Send immediately if not scheduled
      if (!isScheduled) {
        await sendNotification(notificationId);
      }
      
      setLoading(false);
      Alert.alert(
        'Success', 
        isScheduled 
          ? 'Notification scheduled successfully' 
          : 'Notification sent successfully',
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (onSaveSuccess) {
                onSaveSuccess();
              } else {
                router.back();
              }
            } 
          }
        ]
      );
    } catch (err) {
      setLoading(false);
      console.error('Error sending notification:', err);
      setError('Failed to send notification. Please try again.');
    }
  };

  return (
    <KeyboardAwareScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter notification title"
            maxLength={100}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={styles.textArea}
            value={body}
            onChangeText={setBody}
            placeholder="Enter notification message"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.characterCount}>
            {body.length}/200 characters
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notification Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="General" value="general" />
              <Picker.Item label="Match Update" value="match" />
              <Picker.Item label="News" value="news" />
              <Picker.Item label="Team-specific" value="team" />
            </Picker>
          </View>
        </View>
        
        {type === 'team' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Teams *</Text>
            {loadingTeams ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <ScrollView style={styles.teamsScrollView}>
                {teams.map(team => (
                  <TouchableOpacity 
                    key={team.id}
                    style={styles.teamItem}
                    onPress={() => handleTargetTeamToggle(team.id)}
                  >
                    <View style={styles.checkboxContainer}>
                      <View 
                        style={[
                          styles.checkbox,
                          targetTeams.includes(team.id) && styles.checkboxChecked
                        ]}
                      >
                        {targetTeams.includes(team.id) && (
                          <Feather name="check" size={14} color="white" />
                        )}
                      </View>
                    </View>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamCategory}>
                      {team.type === 'national' ? 'National' : team.division}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data Payload (optional)</Text>
          <TextInput
            style={styles.jsonInput}
            value={data}
            onChangeText={setData}
            placeholder="Enter JSON data"
            multiline
            numberOfLines={4}
          />
          <Text style={styles.helperText}>
            Additional data in JSON format, e.g.,  {"{\"matchId\": \"123\"}"}
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Switch
              value={isScheduled}
              onValueChange={setIsScheduled}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={isScheduled ? '#2563eb' : '#f4f4f5'}
            />
            <Text style={styles.switchLabel}>
              Schedule for later
            </Text>
          </View>
        </View>
        
        {isScheduled && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Scheduled Date & Time</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={20} color="#2563eb" />
                <Text style={styles.dateTimeText}>
                  {scheduledDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Feather name="clock" size={20} color="#2563eb" />
                <Text style={styles.dateTimeText}>
                  {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button 
            title={isScheduled ? 'Schedule Notification' : 'Send Notification'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.sendButton}
          />
          
          <Button 
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  formContainer: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  jsonInput: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  teamsScrollView: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  teamCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 8,
  },
  timePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  buttonContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  sendButton: {
    flex: 2,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
  },
});

export default NotificationForm;