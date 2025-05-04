// CIFAMobileApp/src/components/matches/FixtureItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Team {
  id: string;
  name: string;
  code: string;
  logo?: string;
  primaryColor: string;
}

interface Fixture {
  id: string;
  date: string;
  time: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  venue?: string;
  status?: 'scheduled' | 'live' | 'completed';
  homeScore?: number;
  awayScore?: number;
}

interface FixtureItemProps {
  fixture: Fixture;
  onPress?: () => void;
  showVenue?: boolean;
}

const FixtureItem: React.FC<FixtureItemProps> = ({
  fixture,
  onPress,
  showVenue = false,
}) => {
  const isLive = fixture.status === 'live';
  const isCompleted = fixture.status === 'completed';
  const hasScores = isLive || isCompleted;

  // Placeholder for team logos
  const getLogoPlaceholder = (teamId: string, teamCode: string, color: string) => {
    return (
      <View style={[styles.teamLogoContainer, { backgroundColor: color }]}>
        <Text style={styles.teamLogoText}>{teamCode}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#111827', '#1e2a4a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Text style={styles.metaText}>
          {fixture.date} • {fixture.time} • {fixture.competition}
        </Text>
        
        <View style={styles.teamsContainer}>
          <View style={styles.teamContainer}>
            {fixture.homeTeam.logo ? (
              <Image 
                source={{ uri: fixture.homeTeam.logo }} 
                style={styles.teamLogo} 
                resizeMode="contain"
              />
            ) : (
              getLogoPlaceholder(
                fixture.homeTeam.id, 
                fixture.homeTeam.code, 
                fixture.homeTeam.primaryColor
              )
            )}
            <Text style={styles.teamName}>{fixture.homeTeam.name}</Text>
          </View>
          
          {hasScores ? (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                {fixture.homeScore} - {fixture.awayScore}
              </Text>
              {isLive && <Text style={styles.liveIndicator}>LIVE</Text>}
            </View>
          ) : (
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.timeText}>{fixture.time}</Text>
            </View>
          )}
          
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{fixture.awayTeam.name}</Text>
            {fixture.awayTeam.logo ? (
              <Image 
                source={{ uri: fixture.awayTeam.logo }} 
                style={styles.teamLogo} 
                resizeMode="contain"
              />
            ) : (
              getLogoPlaceholder(
                fixture.awayTeam.id, 
                fixture.awayTeam.code, 
                fixture.awayTeam.primaryColor
              )
            )}
          </View>
        </View>
        
        {(showVenue && fixture.venue) && (
          <Text style={styles.venueText}>{fixture.venue}</Text>
        )}
        
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
            <Text style={styles.detailsButtonText}>View details</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamContainerReverse: {
    justifyContent: 'flex-end',
  },
  teamLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  teamLogoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  teamLogoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    flex: 1,
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  liveIndicator: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 4,
  },
  venueText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '500',
  },
});

export default FixtureItem;