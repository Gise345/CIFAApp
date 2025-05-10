// src/components/common/TeamLogo.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface TeamLogoProps {
  teamId: string;
  teamName: string;
  teamCode?: string;
  logoUrl?: string;
  size?: 'small' | 'medium' | 'large';
  colorPrimary?: string;
  showName?: boolean;
}

const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  teamName,
  teamCode,
  logoUrl,
  size = 'medium',
  colorPrimary = '#2563eb',
  showName = false,
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Get team initials if no team code provided
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
  
  // Determine logo size based on prop
  const logoSize = {
    small: 32,
    medium: 48,
    large: 72,
  }[size];
  
  // Determine text size based on logo size
  const textSize = {
    small: 10,
    medium: 14,
    large: 20,
  }[size];
  
  // Display the team code or initials if no logo or error loading logo
  const displayCode = teamCode || getTeamInitials(teamName);
  
  // Handle image load error
  const handleImageError = () => {
    console.warn(`Error loading logo for team: ${teamName} (${teamId})`);
    setImageError(true);
  };
  
  return (
    <View style={[styles.container, showName && styles.containerWithName]}>
      <View 
        style={[
          styles.logoContainer, 
          { 
            width: logoSize, 
            height: logoSize, 
            borderRadius: logoSize / 2,
            backgroundColor: colorPrimary 
          }
        ]}
      >
        {logoUrl && !imageError ? (
          <Image 
            source={{ uri: logoUrl }}
            style={styles.logoUrl}
            resizeMode="contain"
            onError={handleImageError}
          />
        ) : (
          <Text 
            style={[
              styles.logoText, 
              { fontSize: textSize }
            ]}
          >
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
    marginBottom: 8,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoUrl: {
    width: '100%',
    height: '100%',
    borderRadius: 999, // Ensure the image stays within the circular container
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  teamName: {
    marginTop: 8,
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
    maxWidth: 80,
  },
});

export default TeamLogo;