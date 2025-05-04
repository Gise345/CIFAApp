// CIFAMobileApp/src/components/home/LiveStreamButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface LiveStreamButtonProps {
  onPress?: () => void;
}

const LiveStreamButton: React.FC<LiveStreamButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={['#d72660', '#9e1c40']} // Pink gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <Feather name="video" size={24} color="white" style={styles.icon} />
            <Text style={styles.text}>LIVE STREAM</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradient: {
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.5,
  },
});

export default LiveStreamButton;