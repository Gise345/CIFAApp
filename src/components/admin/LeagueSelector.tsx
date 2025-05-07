// src/components/admin/LeagueSelector.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../../services/firebase/config';

// Define League interface
interface League {
  id: string;
  name: string;
  shortName: string;
  season: string;
  type: 'mens' | 'womens' | 'boys' | 'girls';
  division: string;
  ageGroup?: string;
  isActive: boolean;
}

interface LeagueSelectorProps {
  selectedLeagueId?: string;
  onLeagueSelect: (league: League) => void;
  label?: string;
  placeholder?: string;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedLeagueId,
  onLeagueSelect,
  label = 'League',
  placeholder = 'Select a league'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  
  // Load leagues from Firestore
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if firestore is initialized
        if (!firestore) {
          throw new Error('Firestore is not initialized');
        }
        
        // Create a query to get active leagues ordered by name
        const leaguesCollection = collection(firestore, 'leagues');
        const leaguesQuery = query(
          leaguesCollection,
          where('isActive', '==', true),
          orderBy('name')
        );
        
        const snapshot = await getDocs(leaguesQuery);
        
        const leaguesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as League));
        
        setLeagues(leaguesData);
        
        // If selectedLeagueId is provided, find and set the selected league
        if (selectedLeagueId) {
          const selected = leaguesData.find(league => league.id === selectedLeagueId);
          if (selected) {
            setSelectedLeague(selected);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading leagues:', error);
        setError('Failed to load leagues');
        setLoading(false);
      }
    };
    
    loadLeagues();
  }, [selectedLeagueId]);
  
  const openModal = () => {
    setModalVisible(true);
  };
  
  const closeModal = () => {
    setModalVisible(false);
  };
  
  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league);
    onLeagueSelect(league);
    closeModal();
  };
  
  // Function to get the background color based on league type
  const getLeagueColor = (leagueType: string): string => {
    switch (leagueType) {
      case 'mens':
        return '#2563eb'; // Blue
      case 'womens':
        return '#db2777'; // Pink
      case 'boys':
        return '#16a34a'; // Green
      case 'girls':
        return '#a855f7'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };
  
  // Render a league item
  const renderLeagueItem = ({ item }: { item: League }) => (
    <TouchableOpacity
      style={styles.leagueItem}
      onPress={() => handleLeagueSelect(item)}
    >
      <View 
        style={[
          styles.leagueTypeBadge, 
          { backgroundColor: getLeagueColor(item.type) }
        ]}
      >
        <Text style={styles.leagueTypeText}>{item.type.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.leagueInfo}>
        <Text style={styles.leagueName}>{item.name}</Text>
        <Text style={styles.leagueSeason}>{item.season}</Text>
      </View>
      
      {selectedLeague?.id === item.id && (
        <Feather name="check" size={20} color="#2563eb" />
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* League selector button */}
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={openModal}
      >
        {selectedLeague ? (
          <View style={styles.selectedLeagueContainer}>
            <View 
              style={[
                styles.leagueTypeBadge, 
                { backgroundColor: getLeagueColor(selectedLeague.type) }
              ]}
            >
              <Text style={styles.leagueTypeText}>
                {selectedLeague.type.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.selectedLeagueText}>{selectedLeague.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>{placeholder}</Text>
        )}
        <Feather name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>
      
      {/* Leagues modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select League</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading leagues...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : leagues.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="alert-circle" size={24} color="#9ca3af" />
                <Text style={styles.emptyText}>No leagues available</Text>
              </View>
            ) : (
              <FlatList
                data={leagues}
                renderItem={renderLeagueItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.leagueList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#111827',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: '#9ca3af',
  },
  selectedLeagueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLeagueText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  leagueList: {
    paddingBottom: 20,
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  leagueTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leagueTypeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  leagueSeason: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default LeagueSelector;