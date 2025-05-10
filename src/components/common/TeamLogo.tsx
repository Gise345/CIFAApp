// src/components/common/TeamLogo.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface TeamLogoProps {
  teamId: string;
  teamName: string;
  teamCode?: string;
  logo?: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  colorPrimary?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  teamName,
  teamCode,
  logo,
  size = 'medium',
  showName = false,
  colorPrimary
}) => {
  // Get team initials if no code provided
  const getTeamInitials = (name: string): string => {
    if (!name) return '';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    
    // Return first letter of each word (up to 3)
    return words
      .slice(0, 3)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Get logo sizes based on size prop
  const getSize = (): { container: number, text: number } => {
    switch (size) {
      case 'small':
        return { container: 32, text: 12 };
      case 'large':
        return { container: 64, text: 20 };
      case 'medium':
      default:
        return { container: 48, text: 16 };
    }
  };

  const { container: containerSize, text: textSize } = getSize();
  const displayCode = teamCode || getTeamInitials(teamName);
  const backgroundColor = colorPrimary || '#2563eb'; // Default blue if no color provided

  return (
    <View style={[
      styles.container,
      showName && styles.containerWithName
    ]}>
      <View style={[
        styles.logoContainer,
        { 
          width: containerSize, 
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor
        }
      ]}>
        {logo ? (
          <Image 
            source={{ uri: logo }} 
            style={{ 
              width: containerSize - 4, 
              height: containerSize - 4,
              borderRadius: (containerSize - 4) / 2
            }}
            resizeMode="cover"
          />
        ) : (
          <Text style={[
            styles.logoText,
            { fontSize: textSize }
          ]}>
            {displayCode}
          </Text>
        )}
      </View>
      
      {showName && (
        <Text style={styles.teamName} numberOfLines={1}>
          {teamName}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerWithName: {
    marginBottom: 4,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 80,
  }
});

export default TeamLogo;