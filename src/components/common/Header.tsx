// CIFAMobileApp/src/components/common/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  showMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  showNotification = false, 
  showMenu = false 
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
        )}
        
        {!showBack && title === 'CIFA' && (
          <View style={styles.logo}>
            <Text style={styles.logoText}>C</Text>
          </View>
        )}
        
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {showNotification && (
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={24} color="white" />
          </TouchableOpacity>
        )}
        
        {showMenu && (
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="menu" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    // backgroundColor: '#C41E3A', // Updated to midnight blue #191970
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#191970', // Updated to match header background
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 8,
  },
  iconButton: {
    marginLeft: 12,
  },
});

export default Header;