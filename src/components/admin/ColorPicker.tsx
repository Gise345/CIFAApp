// src/components/admin/ColorPicker.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onColorChange,
  label = 'Select Color'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Predefined colors for teams
  const teamColors = [
    // Reds
    '#ef4444', // Red
    '#dc2626', // Dark red
    '#b91c1c', // Darker red
    '#991b1b', // Even darker red
    '#7f1d1d', // Darkest red
    
    // Blues
    '#3b82f6', // Blue
    '#2563eb', // Dark blue
    '#1d4ed8', // Darker blue
    '#1e40af', // Even darker blue
    '#1e3a8a', // Darkest blue
    
    // Greens
    '#22c55e', // Green
    '#16a34a', // Dark green
    '#15803d', // Darker green
    '#166534', // Even darker green
    '#14532d', // Darkest green
    
    // Yellows/Golds
    '#eab308', // Yellow
    '#ca8a04', // Dark yellow
    '#a16207', // Darker yellow
    '#854d0e', // Even darker yellow
    '#713f12', // Darkest yellow
    
    // Purples
    '#a855f7', // Purple
    '#9333ea', // Dark purple
    '#7e22ce', // Darker purple
    '#6b21a8', // Even darker purple
    '#581c87', // Darkest purple
    
    // Oranges
    '#f97316', // Orange
    '#ea580c', // Dark orange
    '#c2410c', // Darker orange
    '#9a3412', // Even darker orange
    '#7c2d12', // Darkest orange
    
    // Teals/Cyans
    '#06b6d4', // Cyan
    '#0891b2', // Dark cyan
    '#0e7490', // Darker cyan
    '#155e75', // Even darker cyan
    '#164e63', // Darkest cyan
    
    // Pinks
    '#ec4899', // Pink
    '#db2777', // Dark pink
    '#be185d', // Darker pink
    '#9d174d', // Even darker pink
    '#831843', // Darkest pink
  ];
  
  const openModal = () => {
    setModalVisible(true);
  };
  
  const closeModal = () => {
    setModalVisible(false);
  };
  
  const handleColorSelect = (color: string) => {
    onColorChange(color);
    closeModal();
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Color preview */}
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={openModal}
      >
        <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
        <Text style={styles.colorText}>{selectedColor}</Text>
        <Feather name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>
      
      {/* Color picker modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Team Color</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.colorGrid}>
              {teamColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorItem
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  {selectedColor === color && (
                    <Feather name="check" size={24} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  colorText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  colorItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default ColorPicker;