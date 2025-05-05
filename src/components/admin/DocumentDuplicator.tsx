// src/components/admin/DocumentDuplicator.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';import { useTeams } from '../../hooks/useTeams';
import { duplicateDocument, duplicateMultipleDocuments } from '../../utils/firestoreDuplicator';
import Card from '../common/Card';

type CollectionType = 'teams' | 'players' | 'matches' | 'news';

const DocumentDuplicator: React.FC = () => {
  const { teams, fetchTeams, loading: teamsLoading } = useTeams();
  
  const [selectedCollection, setSelectedCollection] = useState<CollectionType>('teams');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [destinationCollection, setDestinationCollection] = useState<string>('');
  const [newDocumentId, setNewDocumentId] = useState<string>('');
  const [useCustomId, setUseCustomId] = useState<boolean>(false);
  const [fieldsToModify, setFieldsToModify] = useState<string>('');
  const [duplicating, setDuplicating] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Load teams for selection
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // Collection options
  const collections: CollectionType[] = ['teams', 'players', 'matches', 'news'];
  
  // Handle field modifications parsing
  const parseFieldsToModify = (): Record<string, any> | null => {
    if (!fieldsToModify.trim()) return null;
    
    try {
      return JSON.parse(fieldsToModify);
    } catch (err) {
      setError('Invalid JSON for fields to modify. Please check the format.');
      return null;
    }
  };
  
  // Handle the duplication process
  const handleDuplicate = async () => {
    try {
      setError(null);
      setResult(null);
      setDuplicating(true);
      
      if (!selectedDocumentId) {
        throw new Error('Please select a document to duplicate');
      }
      
      if (!destinationCollection) {
        throw new Error('Please enter a destination collection');
      }
      
      const sourcePath = `${selectedCollection}/${selectedDocumentId}`;
      const parsedFields = parseFieldsToModify();
      
      if (error) return; // Stop if there was an error parsing fields
      
      // Perform the duplication
      const newId = await duplicateDocument(
        sourcePath,
        destinationCollection,
        useCustomId ? newDocumentId : undefined,
        parsedFields || undefined
      );
      
      setResult(`Document successfully duplicated! New ID: ${newId}`);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setDuplicating(false);
    }
  };
  
  // Render document selection based on collection type
  const renderDocumentSelection = () => {
    if (selectedCollection === 'teams' && teams.length > 0) {
      return (
        <ScrollView style={styles.selectContainer} nestedScrollEnabled>
          {teams.map(team => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.selectItem,
                selectedDocumentId === team.id && styles.selectedItem
              ]}
              onPress={() => setSelectedDocumentId(team.id)}
            >
              <Text style={styles.selectItemText}>{team.name}</Text>
              {selectedDocumentId === team.id && (
                <Feather name="check" size={18} color="#2563eb" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }
    
    // For other collections or if teams haven't loaded yet
    return (
      <View>
        <Text style={styles.label}>Document ID</Text>
        <TextInput
          style={styles.input}
          value={selectedDocumentId}
          onChangeText={setSelectedDocumentId}
          placeholder={`Enter ${selectedCollection} document ID to duplicate`}
        />
      </View>
    );
  };
  
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Document Duplicator</Text>
      
      {/* Collection selection */}
      <Text style={styles.label}>Source Collection</Text>
      <View style={styles.collectionSelector}>
        {collections.map(collection => (
          <TouchableOpacity
            key={collection}
            style={[
              styles.collectionButton,
              selectedCollection === collection && styles.selectedCollectionButton
            ]}
            onPress={() => {
              setSelectedCollection(collection);
              setSelectedDocumentId('');
            }}
          >
            <Text 
              style={[
                styles.collectionButtonText,
                selectedCollection === collection && styles.selectedCollectionText
              ]}
            >
              {collection}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Document selection */}
      <Text style={styles.label}>Select Document to Duplicate</Text>
      {teamsLoading && selectedCollection === 'teams' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.helperText}>Loading teams...</Text>
        </View>
      ) : (
        renderDocumentSelection()
      )}
      
      {/* Destination collection */}
      <Text style={styles.label}>Destination Collection</Text>
      <TextInput
        style={styles.input}
        value={destinationCollection}
        onChangeText={setDestinationCollection}
        placeholder="Enter destination collection name"
      />
      
      {/* Custom ID option */}
      <View style={styles.switchContainer}>
        <Switch
          value={useCustomId}
          onValueChange={setUseCustomId}
          trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
          thumbColor={useCustomId ? '#2563eb' : '#f4f4f5'}
        />
        <Text style={styles.switchLabel}>Use custom ID for new document</Text>
      </View>
      
      {/* Custom ID input (if enabled) */}
      {useCustomId && (
        <TextInput
          style={styles.input}
          value={newDocumentId}
          onChangeText={setNewDocumentId}
          placeholder="Enter custom ID for new document"
        />
      )}
      
      {/* Fields to modify */}
      <Text style={styles.label}>Fields to Modify (JSON format)</Text>
      <TextInput
        style={[styles.input, styles.jsonInput]}
        value={fieldsToModify}
        onChangeText={setFieldsToModify}
        placeholder='{"fieldName": "new value", "anotherField": 123}'
        multiline
      />
      <Text style={styles.helperText}>
        Enter fields to modify in JSON format. Leave empty to duplicate without changes.
      </Text>
      
      {/* Error display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Result display */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
      
      {/* Duplicate button */}
      <TouchableOpacity
        style={[styles.duplicateButton, duplicating && styles.disabledButton]}
        onPress={handleDuplicate}
        disabled={duplicating || !selectedDocumentId || !destinationCollection}
      >
        {duplicating ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Feather name="copy" size={18} color="white" style={styles.buttonIcon} />
            <Text style={styles.duplicateButtonText}>Duplicate Document</Text>
          </>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  collectionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  collectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCollectionButton: {
    backgroundColor: '#2563eb',
  },
  collectionButtonText: {
    color: '#4b5563',
    fontSize: 14,
  },
  selectedCollectionText: {
    color: 'white',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    color: '#111827',
  },
  jsonInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginBottom: 16,
  },
  selectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedItem: {
    backgroundColor: '#eff6ff',
  },
  selectItemText: {
    fontSize: 14,
    color: '#111827',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  resultText: {
    color: '#047857',
    fontSize: 14,
  },
  duplicateButton: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  duplicateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DocumentDuplicator;