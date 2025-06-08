// src/components/admin/MatchForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Card from '@/src/components/common/Card';
import Button from '@/src/components/common/Button';
import { getTeams, getLeagues, getVenues } from '@/src/services/firebase/matches';

interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface League {
  id: string;
  name: string;
  shortName: string;
  type: string;
  division: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity?: number;
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

interface DropdownItem {
  id: string;
  name: string;
  subtitle?: string;
  icon?: string;
}

interface DropdownProps {
  label: string;
  placeholder: string;
  value: string;
  items: DropdownItem[];
  onSelect: (item: DropdownItem) => void;
  loading?: boolean;
  searchable?: boolean;
  icon?: string;
}

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
}

const COMPETITIONS = [
  { id: 'premier_league', name: 'Premier League', type: 'domestic' },
  { id: 'first_division', name: 'First Division', type: 'domestic' },
  { id: 'second_division', name: 'Second Division', type: 'domestic' },
  { id: 'womens_league', name: "Women's League", type: 'domestic' },
  { id: 'youth_league', name: 'Youth League', type: 'domestic' },
  { id: 'cup_competition', name: 'Cup Competition', type: 'cup' },
  { id: 'concacaf', name: 'CONCACAF', type: 'international' },
  { id: 'fifa_qualifier', name: 'FIFA World Cup Qualifier', type: 'international' },
  { id: 'nations_league', name: 'Nations League', type: 'international' },
  { id: 'friendly', name: 'International Friendly', type: 'international' },
];

const STATUS_OPTIONS = [
  { id: 'scheduled', name: 'Scheduled', icon: 'clock' },
  { id: 'live', name: 'Live', icon: 'play-circle' },
  { id: 'completed', name: 'Completed', icon: 'check-circle' },
  { id: 'postponed', name: 'Postponed', icon: 'pause-circle' },
  { id: 'cancelled', name: 'Cancelled', icon: 'x-circle' },
];

// Custom Dropdown Component
const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  value,
  items,
  onSelect,
  loading = false,
  searchable = true,
  icon
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    if (searchable && searchTerm) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items, searchable]);

  const selectedItem = items.find(item => item.id === value);

  const handleSelect = (item: DropdownItem) => {
    onSelect(item);
    setModalVisible(false);
    setSearchTerm('');
  };

  const renderItem = ({ item }: { item: DropdownItem }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        value === item.id && styles.dropdownItemSelected
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.dropdownItemContent}>
        <Text style={[
          styles.dropdownItemText,
          value === item.id && styles.dropdownItemTextSelected
        ]}>
          {item.name}
        </Text>
        {item.subtitle && (
          <Text style={styles.dropdownItemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {value === item.id && (
        <Feather name="check" size={20} color="#2563eb" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          !selectedItem && styles.dropdownButtonEmpty
        ]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <View style={styles.dropdownButtonContent}>
          {icon && (
            <Feather 
              name={icon as any} 
              size={20} 
              color={selectedItem ? "#333" : "#999"} 
              style={styles.dropdownIcon} 
            />
          )}
          <Text style={[
            styles.dropdownButtonText,
            !selectedItem && styles.dropdownButtonPlaceholder
          ]}>
            {selectedItem ? selectedItem.name : placeholder}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <Feather name="chevron-down" size={20} color="#666" />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#999"
              />
            </View>
          )}

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.dropdownList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

// Custom Time Picker Component
const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ');
      const [hour, minute] = time.split(':').map(Number);
      setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period || (hour >= 12 ? 'PM' : 'AM'));
    }
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    
    const displayTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
    onChange(displayTime);
    setModalVisible(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="clock" size={20} color="#333" style={styles.timeIcon} />
        <Text style={styles.timeButtonText}>
          {value || 'Select time'}
        </Text>
        <Feather name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.timeModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerColumn}>
              <Text style={styles.timeColumnLabel}>Hour</Text>
              <FlatList
                data={hours}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timeItem,
                      selectedHour === item && styles.timeItemSelected
                    ]}
                    onPress={() => setSelectedHour(item)}
                  >
                    <Text style={[
                      styles.timeItemText,
                      selectedHour === item && styles.timeItemTextSelected
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.timeList}
              />
            </View>

            <View style={styles.timePickerColumn}>
              <Text style={styles.timeColumnLabel}>Minute</Text>
              <FlatList
                data={minutes}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timeItem,
                      selectedMinute === item && styles.timeItemSelected
                    ]}
                    onPress={() => setSelectedMinute(item)}
                  >
                    <Text style={[
                      styles.timeItemText,
                      selectedMinute === item && styles.timeItemTextSelected
                    ]}>
                      {item.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.timeList}
              />
            </View>

            <View style={styles.timePickerColumn}>
              <Text style={styles.timeColumnLabel}>Period</Text>
              {['AM', 'PM'].map(period => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.timeItem,
                    selectedPeriod === period && styles.timeItemSelected
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[
                    styles.timeItemText,
                    selectedPeriod === period && styles.timeItemTextSelected
                  ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.timeModalFooter}>
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              variant="outline"
              style={styles.timeModalButton}
            />
            <Button
              title="Confirm"
              onPress={handleConfirm}
              style={styles.timeModalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Main Match Form Component
interface MatchFormProps {
  initialData?: Partial<MatchFormData>;
  onSubmit: (data: MatchFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

export const MatchForm: React.FC<MatchFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false
}) => {
  const [formData, setFormData] = useState<MatchFormData>({
    homeTeamId: '',
    awayTeamId: '',
    leagueId: '',
    venue: '',
    competition: '',
    date: new Date(),
    time: '',
    status: 'scheduled',
    featured: false,
    ...initialData
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, leaguesData, venuesData] = await Promise.all([
          getTeams(),
          getLeagues(),
          getVenues()
        ]);

        setTeams(teamsData);
        setLeagues(leaguesData);
        setVenues(venuesData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.homeTeamId) newErrors.homeTeam = 'Home team is required';
    if (!formData.awayTeamId) newErrors.awayTeam = 'Away team is required';
    if (formData.homeTeamId === formData.awayTeamId) {
      newErrors.awayTeam = 'Away team must be different from home team';
    }
    if (!formData.leagueId) newErrors.league = 'League is required';
    if (!formData.venue) newErrors.venue = 'Venue is required';
    if (!formData.competition) newErrors.competition = 'Competition is required';
    if (!formData.time) newErrors.time = 'Time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save match');
    }
  };

  const updateFormData = (field: keyof MatchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Convert data for dropdowns
  const teamItems: DropdownItem[] = teams.map(team => ({
    id: team.id,
    name: team.name,
    subtitle: team.shortName
  }));

  const leagueItems: DropdownItem[] = leagues.map(league => ({
    id: league.id,
    name: league.name,
    subtitle: `${league.type} - ${league.division}`
  }));

  const venueItems: DropdownItem[] = venues.map(venue => ({
    id: venue.id,
    name: venue.name,
    subtitle: venue.location
  }));

  const competitionItems: DropdownItem[] = COMPETITIONS.map(comp => ({
    id: comp.id,
    name: comp.name,
    subtitle: comp.type
  }));

  const statusItems: DropdownItem[] = STATUS_OPTIONS.map(status => ({
    id: status.id,
    name: status.name,
    icon: status.icon
  }));

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading form data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>
          {isEditing ? 'Edit Match' : 'Create New Match'}
        </Text>

        {/* Team Selection */}
        <View style={styles.teamsRow}>
          <View style={styles.teamColumn}>
            <CustomDropdown
              label="Home Team"
              placeholder="Select home team"
              value={formData.homeTeamId}
              items={teamItems.filter(item => item.id !== formData.awayTeamId)}
              onSelect={(item) => updateFormData('homeTeamId', item.id)}
              icon="home"
            />
            {errors.homeTeam && <Text style={styles.errorText}>{errors.homeTeam}</Text>}
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.teamColumn}>
            <CustomDropdown
              label="Away Team"
              placeholder="Select away team"
              value={formData.awayTeamId}
              items={teamItems.filter(item => item.id !== formData.homeTeamId)}
              onSelect={(item) => updateFormData('awayTeamId', item.id)}
              icon="users"
            />
            {errors.awayTeam && <Text style={styles.errorText}>{errors.awayTeam}</Text>}
          </View>
        </View>

        {/* League Selection */}
        <CustomDropdown
          label="League"
          placeholder="Select league"
          value={formData.leagueId}
          items={leagueItems}
          onSelect={(item) => updateFormData('leagueId', item.id)}
          icon="award"
        />
        {errors.league && <Text style={styles.errorText}>{errors.league}</Text>}

        {/* Competition Selection */}
        <CustomDropdown
          label="Competition"
          placeholder="Select competition"
          value={formData.competition}
          items={competitionItems}
          onSelect={(item) => updateFormData('competition', item.id)}
          icon="trophy"
        />
        {errors.competition && <Text style={styles.errorText}>{errors.competition}</Text>}

        {/* Venue Selection */}
        <CustomDropdown
          label="Venue"
          placeholder="Select venue"
          value={formData.venue}
          items={venueItems}
          onSelect={(item) => updateFormData('venue', item.id)}
          icon="map-pin"
        />
        {errors.venue && <Text style={styles.errorText}>{errors.venue}</Text>}

        {/* Date and Time */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.fieldLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Feather name="calendar" size={20} color="#333" style={styles.dateIcon} />
              <Text style={styles.dateButtonText}>
                {format(formData.date, 'MMM dd, yyyy')}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.timeColumn}>
            <TimePicker
              label="Time"
              value={formData.time}
              onChange={(time) => updateFormData('time', time)}
            />
            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>
        </View>

        {/* Status Selection */}
        <CustomDropdown
          label="Status"
          placeholder="Select status"
          value={formData.status}
          items={statusItems}
          onSelect={(item) => updateFormData('status', item.id)}
          searchable={false}
          icon="activity"
        />

        {/* Featured Toggle */}
        <View style={styles.fieldContainer}>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => updateFormData('featured', !formData.featured)}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Featured Match</Text>
              <Text style={styles.toggleDescription}>
                This match will be highlighted on the home screen
              </Text>
            </View>
            <View style={[
              styles.toggle,
              formData.featured && styles.toggleActive
            ]}>
              <View style={[
                styles.toggleThumb,
                formData.featured && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Score inputs for live/completed matches */}
        {(formData.status === 'live' || formData.status === 'completed') && (
          <View style={styles.scoresRow}>
            <View style={styles.scoreColumn}>
              <Text style={styles.fieldLabel}>Home Score</Text>
              <TextInput
                style={styles.scoreInput}
                value={formData.homeScore?.toString() || ''}
                onChangeText={(value) => updateFormData('homeScore', parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.scoreColumn}>
              <Text style={styles.fieldLabel}>Away Score</Text>
              <TextInput
                style={styles.scoreInput}
                value={formData.awayScore?.toString() || ''}
                onChangeText={(value) => updateFormData('awayScore', parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={isEditing ? 'Update Match' : 'Create Match'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </Card>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              updateFormData('date', selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  teamColumn: {
    flex: 1,
  },
  vsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateColumn: {
    flex: 1,
  },
  timeColumn: {
    flex: 1,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  scoreColumn: {
    flex: 1,
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dropdownButtonEmpty: {
    borderColor: '#ccc',
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownButtonPlaceholder: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#eff6ff',
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#2563eb',
  },
  dropdownItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Date picker styles
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  // Time picker styles
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  timeIcon: {
    marginRight: 8,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  timeModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  timePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  timePickerColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeColumnLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  timeList: {
    maxHeight: 200,
  },
  timeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  timeItemSelected: {
    backgroundColor: '#2563eb',
  },
  timeItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeItemTextSelected: {
    color: 'white',
  },
  timeModalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timeModalButton: {
    flex: 1,
  },
  // Toggle styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#2563eb',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});