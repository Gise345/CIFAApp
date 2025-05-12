// CIFAMobileApp/src/components/matches/LiveMatch.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import TeamLogo from '../common/TeamLogo';

interface Team {
  id: string;
  name: string;
  code?: string;
  logo?: string;
  colorPrimary?: string;
}

interface MatchEvent {
  type: 'goal' | 'ownGoal' | 'yellowCard' | 'redCard' | 'substitution' | 'penalty';
  minute: number;
  playerId: string;
  playerName: string;
  teamId: string;
}

interface LiveMatchProps {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  venue?: string;
  competition?: string;
  events?: MatchEvent[];
  onPress?: () => void;
}

const LiveMatch: React.FC<LiveMatchProps> = ({
  id,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute,
  venue,
  competition,
  events,
  onPress,
}) => {
  // Extract the latest events
  const latestEvents = events 
    ? [...events].sort((a, b) => b.minute - a.minute).slice(0, 3) 
    : [];

  // Function to get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return 'target';
      case 'yellowCard':
        return 'square';
      case 'redCard':
        return 'square';
      case 'substitution':
        return 'refresh-cw';
      case 'penalty':
        return 'alert-circle';
      case 'ownGoal':
        return 'target';
      default:
        return 'activity';
    }
  };

  // Function to get event color
  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal':
        return '#16a34a';
      case 'yellowCard':
        return '#eab308';
      case 'redCard':
        return '#ef4444';
      case 'ownGoal':
        return '#ef4444';
      default:
        return '#60a5fa';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <LinearGradient
        colors={['#0f172a', '#1e3a8a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Live Indicator */}
        <View style={styles.liveContainer}>
          <View style={styles.liveIndicator} />
          <Text style={styles.liveText}>LIVE</Text>
          <Text style={styles.minuteText}>{minute}'</Text>
        </View>

        {/* Match Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.competition}>{competition}</Text>
          {venue && <Text style={styles.venue}>{venue}</Text>}
        </View>

        {/* Teams and Score */}
        <View style={styles.matchContainer}>
          <View style={styles.teamContainer}>
            {/* Use TeamLogo component for home team */}
            <TeamLogo 
              teamId={homeTeam.id}
              teamName={homeTeam.name}
              teamCode={homeTeam.code}
              size="medium"
              colorPrimary={homeTeam.colorPrimary || '#2563eb'}
            />
            <Text style={styles.teamName}>{homeTeam.name}</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{homeScore}</Text>
            <Text style={styles.scoreSeparator}>-</Text>
            <Text style={styles.scoreText}>{awayScore}</Text>
          </View>

          <View style={styles.teamContainer}>
            {/* Use TeamLogo component for away team */}
            <TeamLogo 
              teamId={awayTeam.id}
              teamName={awayTeam.name}
              teamCode={awayTeam.code}
              size="medium"
              colorPrimary={awayTeam.colorPrimary || '#2563eb'}
            />
            <Text style={styles.teamName}>{awayTeam.name}</Text>
          </View>
        </View>

        {/* Latest Events */}
        {latestEvents.length > 0 && (
          <View style={styles.eventsContainer}>
            {latestEvents.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Feather 
                  name={getEventIcon(event.type)} 
                  size={14} 
                  color={getEventColor(event.type)} 
                  style={styles.eventIcon} 
                />
                <Text style={styles.eventMinute}>{event.minute}'</Text>
                <Text style={styles.eventText}>
                  {event.playerName} 
                  {event.type === 'goal' && ' scores!'}
                  {event.type === 'ownGoal' && ' (own goal)'}
                  {event.type === 'yellowCard' && ' receives yellow card'}
                  {event.type === 'redCard' && ' receives red card'}
                  {event.type === 'substitution' && ' substituted'}
                  {event.type === 'penalty' && ' scores penalty'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Watch Button */}
        <TouchableOpacity style={styles.watchButton} onPress={onPress}>
          <Feather name="eye" size={16} color="white" style={styles.watchIcon} />
          <Text style={styles.watchText}>Watch Match</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 16,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ef4444',
    marginRight: 6,
  },
  minuteText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  infoContainer: {
    marginBottom: 16,
  },
  competition: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  venue: {
    fontSize: 12,
    color: '#94a3b8',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 2,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  scoreContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreSeparator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginHorizontal: 8,
  },
  eventsContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIcon: {
    marginRight: 8,
  },
  eventMinute: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginRight: 8,
    width: 24,
  },
  eventText: {
    fontSize: 12,
    color: 'white',
    flex: 1,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.7)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  watchIcon: {
    marginRight: 8,
  },
  watchText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});

export default LiveMatch;