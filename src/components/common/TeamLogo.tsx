// src/components/common/TeamLogo.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getTeamById } from '../../services/firebase/teams';

interface TeamLogoProps {
  teamId: string;
  teamName?: string;
  teamCode?: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  colorPrimary?: string;
  colorSecondary?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  teamName: propTeamName,
  teamCode: propTeamCode,
  size = 'medium',
  showName = false,
  colorPrimary: propColorPrimary,
  colorSecondary = 'white',
}) => {
  const [teamData, setTeamData] = useState<{
    name: string;
    logo?: string;
    colorPrimary?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch team data if not provided through props
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) return;
      
      try {
        console.log(`TeamLogo: Fetching team data for ID ${teamId}`);
        const team = await getTeamById(teamId);
        
        if (team) {
          console.log(`TeamLogo: Team found - ${team.name}`);
          console.log(`TeamLogo: Logo URL - ${team.logo || 'No logo available'}`);
          setTeamData(team);
        } else {
          console.log(`TeamLogo: No team found with ID ${teamId}`);
        }
      } catch (error) {
        console.error('TeamLogo: Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we need to
    if (!propTeamName || !propColorPrimary) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [teamId, propTeamName, propColorPrimary]);

  // Use props if provided, otherwise use fetched data
  const teamName = propTeamName || teamData?.name || '';
  const logoUrl = teamData?.logo;
  const teamCode = propTeamCode || getTeamInitials(teamName);
  const colorPrimary = propColorPrimary || teamData?.colorPrimary || '#2563eb';

  // Generate team initials if code not provided
  function getTeamInitials(name: string): string {
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
  }

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

  // Render logo if available
  if (logoUrl && !loading) {
    return (
      <View style={[styles.teamLogoWrapper, showName && styles.withName]}>
        <Image 
          source={{ uri: logoUrl }} 
          style={{
            width: sizeStyle.containerSize,
            height: sizeStyle.containerSize,
            borderRadius: sizeStyle.containerSize / 2,
          }}
          resizeMode="cover"
          onLoad={() => console.log(`TeamLogo: Image loaded successfully - ${logoUrl}`)}
          onError={(e) => console.error(`TeamLogo: Error loading image - ${e.nativeEvent.error}`)}
        />
        
        {showName && teamName && (
          <Text style={[styles.teamName, { fontSize: sizeStyle.nameSize }]}>
            {teamName}
          </Text>
        )}
      </View>
    );
  }

  // Render placeholder with initials
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