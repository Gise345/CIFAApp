import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface TeamLogoProps {
  teamId: string;
  teamName?: string;
  teamCode: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  colorPrimary?: string;
  colorSecondary?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  teamName,
  teamCode,
  size = 'medium',
  showName = false,
  colorPrimary = '#ef4444', // Default red
  colorSecondary = 'white',
}) => {
  // These would be replaced with images from Firebase storage in production
  // Using text placeholders for now
  
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 24,
          innerSize: 20,
          fontSize: 8,
          nameSize: 10,
        };
      case 'medium':
        return {
          containerSize: 40,
          innerSize: 34,
          fontSize: 12,
          nameSize: 12,
        };
      case 'large':
        return {
          containerSize: 64,
          innerSize: 56,
          fontSize: 18,
          nameSize: 14,
        };
      default:
        return {
          containerSize: 40,
          innerSize: 34,
          fontSize: 12,
          nameSize: 12,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <View style={[styles.teamLogoWrapper, showName && styles.withName]}>
      <View
        style={[
          styles.logoOuterContainer,
          {
            width: sizeStyle.containerSize,
            height: sizeStyle.containerSize,
            borderRadius: sizeStyle.containerSize / 2,
            backgroundColor: colorSecondary,
          },
        ]}
      >
        <View
          style={[
            styles.logoInnerContainer,
            {
              width: sizeStyle.innerSize,
              height: sizeStyle.innerSize,
              borderRadius: sizeStyle.innerSize / 2,
              backgroundColor: colorPrimary,
            },
          ]}
        >
          <Text
            style={[
              styles.logoText,
              { fontSize: sizeStyle.fontSize, color: colorSecondary },
            ]}
          >
            {teamCode}
          </Text>
        </View>
      </View>
      
      {showName && teamName && (
        <Text style={[styles.teamName, { fontSize: sizeStyle.nameSize }]}>
          {teamName}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  teamLogoWrapper: {
    alignItems: 'center',
  },
  withName: {
    marginBottom: 4,
  },
  logoOuterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoInnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
  },
  teamName: {
    marginTop: 4,
    textAlign: 'center',
    color: '#111827',
  },
});

export default TeamLogo;