// src/components/common/TeamLogo.tsx - Complete mapping for all teams
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase/config';

// Complete mapping for all teams based on your Firestore data
const TEAM_LOGO_MAPPINGS: Record<string, string> = {
  // Teams with existing logos in Firebase Storage
  "345": "Team Logos/345FC-logo.jpeg",
  "academy": "Team Logos/Academy-logo.jpeg",
  "boddentown": "Team Logos/BoddenTown-logo.png",
  "elite": "Team Logos/Elite-logo.svg",
  "future": "Team Logos/future_sc.png",
  "roma": "Team Logos/Roma-logo.jpeg",
  "scholars": "Team Logos/Scholars-logo.png",
  
  // Teams without logos - suggested naming patterns
  "cayman": "Team Logos/Cayman-logo.png",
  "caymanbrac": "Team Logos/Caymanbrac-logo.png",
  "eastend": "Team Logos/Eastend-logo.png",
  "fusion": "Team Logos/Fusion-logo.png",
  "latinos": "Team Logos/Latinos-logo.png",
  "sunset": "Team Logos/Sunset-logo.png",
  "tigers": "Team Logos/Tigers-logo.png",
  
  // Add any additional teams here if needed
  "national": "Team Logos/National-logo.png"
};

interface TeamLogoProps {
  teamId: string;
  teamName: string;
  teamCode?: string;
  size?: 'small' | 'medium' | 'large' | number;
  showName?: boolean;
  colorPrimary?: string;
  style?: any;
}

const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  teamName,
  teamCode,
  size = 'medium',
  showName = false,
  colorPrimary = '#2563eb',
  style
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        if (!storage) {
          console.error('Firebase Storage not initialized');
          setError(true);
          setLoading(false);
          return;
        }

        let url: string | null = null;
        let logPath = '';

        // Extract team prefix from ID
        const prefix = teamId.split('-')[0];

        // Try to get the logo using the mapping
        if (TEAM_LOGO_MAPPINGS[prefix]) {
          try {
            logPath = TEAM_LOGO_MAPPINGS[prefix];
            const logoRef = ref(storage, logPath);
            url = await getDownloadURL(logoRef);
          } catch (e) {
            // If fails, try other approaches
            console.log(`Failed to load mapped logo for ${teamName} (${teamId}): ${logPath}`);
          }
        }
        
        // If the mapping didn't work, try direct team name approach
        if (!url && teamName) {
          try {
            // Try to create path from team name
            const firstWord = teamName.trim().split(' ')[0];
            if (firstWord) {
              const possiblePaths = [
                `Team Logos/${firstWord}-logo.jpeg`,
                `Team Logos/${firstWord}-logo.png`,
                `Team Logos/${firstWord}-logo.svg`
              ];
              
              for (const path of possiblePaths) {
                try {
                  logPath = path;
                  const logoRef = ref(storage, path);
                  url = await getDownloadURL(logoRef);
                  if (url) break;
                } catch (e) {
                  // Continue to next path
                }
              }
            }
          } catch (e) {
            // Continue to next approach
          }
        }
        
        // Special case handling for teams with known special formats
        if (!url) {
          const specialCases = [
            { pattern: '345', path: 'Team Logos/345FC-logo.jpeg' },
            { pattern: 'Bodden', path: 'Team Logos/BoddenTown-logo.png' },
            { pattern: 'Elite', path: 'Team Logos/Elite-logo.svg' },
            { pattern: 'Scholars', path: 'Team Logos/Scholars-logo.png' },
            { pattern: 'Academy', path: 'Team Logos/Academy-logo.jpeg' },
            { pattern: 'Future', path: 'Team Logos/future_sc.png' },
            { pattern: 'Roma', path: 'Team Logos/Roma-logo.jpeg' }
          ];
          
          for (const { pattern, path } of specialCases) {
            if (teamName.includes(pattern)) {
              try {
                logPath = path;
                const logoRef = ref(storage, path);
                url = await getDownloadURL(logoRef);
                if (url) break;
              } catch (e) {
                // Continue to next pattern
              }
            }
          }
        }

        if (url) {
          console.log(`Found logo for ${teamName} (${teamId}) at ${logPath}`);
          setLogoUrl(url);
          setError(false);
        } else {
          // If still no URL, we've failed to find a logo
          console.warn(`No logo found for team: ${teamName} (${teamId})`);
          setError(true);
        }
      } catch (err) {
        console.error(`Error fetching logo for team: ${teamName}`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [teamId, teamName]);

  // Get team initials for placeholder
  const getTeamInitials = (name: string): string => {
    if (!name) return '';
    
    // Use teamCode if provided
    if (teamCode) return teamCode;
    
    const words = name.trim().split(' ');
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

  // Determine size dimensions
  const getSizeDimensions = (): {
    width: number,
    height: number,
    fontSize: number,
    textMargin: number
  } => {
    // If size is a number, use it directly
    if (typeof size === 'number') {
      return {
        width: size,
        height: size,
        fontSize: Math.max(Math.floor(size / 3), 12),
        textMargin: Math.max(Math.floor(size / 12), 4)
      };
    }
    
    // Otherwise use predefined sizes
    switch (size) {
      case 'small':
        return { width: 32, height: 32, fontSize: 12, textMargin: 2 };
      case 'large':
        return { width: 64, height: 64, fontSize: 20, textMargin: 6 };
      case 'medium':
      default:
        return { width: 48, height: 48, fontSize: 16, textMargin: 4 };
    }
  };

  const { width, height, fontSize, textMargin } = getSizeDimensions();
  const code = teamCode || getTeamInitials(teamName);
  const backgroundColor = colorPrimary || '#2563eb'; // Default blue

  return (
    <View style={[styles.container, showName && styles.containerWithName, style]}>
      <View style={[
        styles.logoCircle, 
        { width, height, borderRadius: width / 2, backgroundColor }
      ]}>
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : logoUrl && !error ? (
          <Image 
            source={{ uri: logoUrl }} 
            style={styles.logo}
            resizeMode="contain"
            onError={() => {
              console.error(`Failed to load image from URL: ${logoUrl}`);
              setError(true);
            }}
          />
        ) : (
          <Text style={[styles.logoText, { fontSize }]}>{code}</Text>
        )}
      </View>
      
      {showName && (
        <Text 
          style={[styles.teamName, { marginTop: textMargin, maxWidth: width * 1.5 }]} 
          numberOfLines={1}
        >
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
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '90%',
    height: '90%',
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#111827',
  },
});

export default TeamLogo;