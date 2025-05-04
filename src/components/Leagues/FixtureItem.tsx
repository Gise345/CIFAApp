// CIFAMobileApp/src/components/leagues/FixtureItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';

import { LeagueFixture } from '../../services/firebase/leagues';
import TeamLogo from '../common/TeamLogo';

interface FixtureItemProps {
  fixture: LeagueFixture;
  showVenue?: boolean;
  showLeague?: boolean;
  onPress?: () => void;
}

const FixtureItem: React.FC<FixtureItemProps> = ({
  fixture,
  showVenue = true,
  showLeague = true,
  onPress
}) => {
  const isCompleted = fixture.status === 'completed';
  const isLive = fixture.status === 'live';
  const hasScores = isCompleted || isLive;
  
  // Format match date and time
  const formatMatchDate = (date: Date): string => {
    return format(date, 'h:mm a');
  };
  
  // Determine match status text
  const getStatusText = (): string => {
    switch (fixture.status) {
      case 'live':
        return 'LIVE';
      case 'completed':
        return 'FT';
      case 'postponed':
        return 'POSTPONED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return formatMatchDate(fixture.date.toDate());
    }
  };
  
  // Get status text color
  const getStatusColor = (): string => {
    switch (fixture.status) {
      case 'live':
        return '#ef4444'; // Red for live matches
      case 'postponed':
      case 'cancelled':
        return '#f59e0b'; // Amber for postponed/cancelled
      default:
        return '#6b7280'; // Gray for normal status
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Match Info (Date, Time, League) */}
      {showLeague && (
        <View style={styles.matchInfo}>
          <Text style={styles.leagueText}>{fixture.leagueId}</Text>
        </View>
      )}
      
      {/* Teams Section */}
      <View style={styles.teamsContainer}>
        {/* Home Team */}
        <View style={styles.teamContainer}>
          <TeamLogo 
            teamId={fixture.homeTeamId}
            teamName={fixture.homeTeamName}
            teamCode={getTeamInitials(fixture.homeTeamName)}
            size="small"
          />
          <Text style={styles.teamName} numberOfLines={1}>
            {fixture.homeTeamName}
          </Text>
        </View>
        
        {/* Score/Time */}
        <View style={styles.scoreContainer}>
          {hasScores ? (
            <Text style={styles.scoreText}>
              {fixture.homeScore} - {fixture.awayScore}
            </Text>
          ) : (
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>vs</Text>
            </View>
          )}
          
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          
          {isLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        
        {/* Away Team */}
        <View style={[styles.teamContainer, styles.awayTeam]}>
          <Text style={styles.teamName} numberOfLines={1}>
            {fixture.awayTeamName}
          </Text>
          <TeamLogo 
            teamId={fixture.awayTeamId}
            teamName={fixture.awayTeamName}
            teamCode={getTeamInitials(fixture.awayTeamName)}
            size="small"
          />
        </View>
      </View>
      
      {/* Venue */}
      {showVenue && fixture.venue && (
        <View style={styles.venueContainer}>
          <Feather name="map-pin" size={12} color="#6b7280" style={styles.venueIcon} />
          <Text style={styles.venueText}>{fixture.venue}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Helper function to get team initials
const getTeamInitials = (teamName: string): string => {
  if (!teamName) return '';
  
  const words = teamName.split(' ');
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: 'white',
  },
  matchInfo: {
    marginBottom: 8,
  },
  leagueText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  awayTeam: {
    justifyContent: 'flex-end',
  },
  teamName: {
    fontSize: 14,
    color: '#111827',
    marginHorizontal: 8,
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  liveIndicator: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  liveText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueIcon: {
    marginRight: 4,
  },
  venueText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default FixtureItem;