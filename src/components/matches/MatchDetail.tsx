// CIFAMobileApp/src/components/matches/MatchDetail.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TeamLogo from '../common/TeamLogo';

interface Team {
  id: string;
  name: string;
  code?: string;
  colorPrimary?: string;
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface MatchEvent {
  type: 'goal' | 'ownGoal' | 'yellowCard' | 'redCard' | 'substitution' | 'penalty';
  minute: number;
  playerId: string;
  playerName: string;
  teamId: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
}

interface MatchStatistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

interface LineupPlayer {
  playerId: string;
  name: string;
  number: number;
  position: string;
  isCaptain?: boolean;
}

interface MatchDetailProps {
  id: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  status: 'scheduled' | 'live' | 'completed';
  minute?: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  events?: MatchEvent[];
  stats?: MatchStatistics;
  homeLineup?: LineupPlayer[];
  awayLineup?: LineupPlayer[];
  homeSubs?: LineupPlayer[];
  awaySubs?: LineupPlayer[];
  onBack?: () => void;
}

const MatchDetail: React.FC<MatchDetailProps> = ({
  id,
  date,
  time,
  venue,
  competition,
  status,
  minute,
  homeTeam,
  awayTeam,
  homeScore = 0,
  awayScore = 0,
  events = [],
  stats,
  homeLineup = [],
  awayLineup = [],
  homeSubs = [],
  awaySubs = [],
  onBack,
}) => {
  const isLive = status === 'live';
  const isCompleted = status === 'completed';
  const hasResult = isLive || isCompleted;

  // Sort events by minute
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);

  // Filter events by type
  const getEventsByType = (type: string, teamId?: string) => {
    return sortedEvents.filter(event => 
      event.type === type && (teamId ? event.teamId === teamId : true)
    );
  };

  const goals = getEventsByType('goal');
  const ownGoals = getEventsByType('ownGoal');
  const yellowCards = getEventsByType('yellowCard');
  const redCards = getEventsByType('redCard');

  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return 'target';
      case 'ownGoal':
        return 'target';
      case 'yellowCard':
        return 'square';
      case 'redCard':
        return 'square';
      case 'substitution':
        return 'refresh-cw';
      case 'penalty':
        return 'alert-circle';
      default:
        return 'activity';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Match Header */}
        <LinearGradient
          colors={['#0f172a', '#1e3a8a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Back Button */}
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          )}

          {/* Match Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.competition}>{competition}</Text>
            <Text style={styles.dateTime}>{date} • {time}</Text>
            <Text style={styles.venue}>{venue}</Text>
            
            {isLive && (
              <View style={styles.liveIndicatorContainer}>
                <View style={styles.liveIndicatorDot} />
                <Text style={styles.liveIndicatorText}>LIVE {minute}'</Text>
              </View>
            )}
          </View>

          {/* Teams and Score */}
          <View style={styles.matchContainer}>
            <View style={styles.teamContainer}>
              {/* Use TeamLogo component for home team */}
              <TeamLogo 
                teamId={homeTeam.id}
                teamName={homeTeam.name}
                teamCode={homeTeam.code}
                size="large"
                colorPrimary={homeTeam.colorPrimary || '#2563eb'}
              />
              <Text style={styles.teamName}>{homeTeam.name}</Text>
            </View>

            <View style={styles.scoreContainer}>
              {hasResult ? (
                <>
                  <Text style={styles.scoreText}>{homeScore}</Text>
                  <Text style={styles.scoreSeparator}>-</Text>
                  <Text style={styles.scoreText}>{awayScore}</Text>
                </>
              ) : (
                <Text style={styles.vsText}>VS</Text>
              )}
            </View>

            <View style={styles.teamContainer}>
              {/* Use TeamLogo component for away team */}
              <TeamLogo 
                teamId={awayTeam.id}
                teamName={awayTeam.name}
                teamCode={awayTeam.code}
                size="large"
                colorPrimary={awayTeam.colorPrimary || '#2563eb'}
              />
              <Text style={styles.teamName}>{awayTeam.name}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Match Events (if any) */}
        {sortedEvents.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Match Events</Text>
            <View style={styles.eventsContainer}>
              {sortedEvents.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <Text style={styles.eventMinute}>{event.minute}'</Text>
                  <Feather 
                    name={getEventIcon(event.type)} 
                    size={16} 
                    color={event.teamId === homeTeam.id ? homeTeam.colorPrimary || '#2563eb' : awayTeam.colorPrimary || '#2563eb'} 
                    style={styles.eventIcon} 
                  />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventPlayerName}>{event.playerName}</Text>
                    <Text style={styles.eventTeamName}>
                      {event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}
                    </Text>
                    {event.assistPlayerName && (
                      <Text style={styles.eventAssist}>Assist: {event.assistPlayerName}</Text>
                    )}
                  </View>
                  <Text style={styles.eventType}>
                    {event.type === 'goal' && 'Goal'}
                    {event.type === 'ownGoal' && 'Own Goal'}
                    {event.type === 'yellowCard' && 'Yellow Card'}
                    {event.type === 'redCard' && 'Red Card'}
                    {event.type === 'substitution' && 'Substitution'}
                    {event.type === 'penalty' && 'Penalty'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Match Statistics (if available) */}
        {stats && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Match Statistics</Text>
            <View style={styles.statsContainer}>
              {/* Possession */}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.possession.home}%</Text>
                <View style={styles.statBarContainer}>
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarLeft, 
                      { width: `${stats.possession.home}%`, backgroundColor: homeTeam.colorPrimary || '#2563eb' }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarRight, 
                      { width: `${stats.possession.away}%`, backgroundColor: awayTeam.colorPrimary || '#2563eb' }
                    ]} 
                  />
                </View>
                <Text style={styles.statValue}>{stats.possession.away}%</Text>
                <Text style={styles.statLabel}>Possession</Text>
              </View>

              {/* Shots */}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.shots.home}</Text>
                <View style={styles.statBarContainer}>
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarLeft, 
                      { 
                        width: `${(stats.shots.home / (stats.shots.home + stats.shots.away)) * 100}%`,
                        backgroundColor: homeTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarRight, 
                      { 
                        width: `${(stats.shots.away / (stats.shots.home + stats.shots.away)) * 100}%`,
                        backgroundColor: awayTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.statValue}>{stats.shots.away}</Text>
                <Text style={styles.statLabel}>Shots</Text>
              </View>

              {/* Shots on Target */}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.shotsOnTarget.home}</Text>
                <View style={styles.statBarContainer}>
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarLeft, 
                      { 
                        width: `${(stats.shotsOnTarget.home / (stats.shotsOnTarget.home + stats.shotsOnTarget.away || 1)) * 100}%`,
                        backgroundColor: homeTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarRight, 
                      { 
                        width: `${(stats.shotsOnTarget.away / (stats.shotsOnTarget.home + stats.shotsOnTarget.away || 1)) * 100}%`,
                        backgroundColor: awayTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.statValue}>{stats.shotsOnTarget.away}</Text>
                <Text style={styles.statLabel}>Shots on Target</Text>
              </View>

              {/* Corners */}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.corners.home}</Text>
                <View style={styles.statBarContainer}>
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarLeft, 
                      { 
                        width: `${(stats.corners.home / (stats.corners.home + stats.corners.away || 1)) * 100}%`,
                        backgroundColor: homeTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarRight, 
                      { 
                        width: `${(stats.corners.away / (stats.corners.home + stats.corners.away || 1)) * 100}%`,
                        backgroundColor: awayTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.statValue}>{stats.corners.away}</Text>
                <Text style={styles.statLabel}>Corners</Text>
              </View>

              {/* Fouls */}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.fouls.home}</Text>
                <View style={styles.statBarContainer}>
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarLeft, 
                      { 
                        width: `${(stats.fouls.home / (stats.fouls.home + stats.fouls.away || 1)) * 100}%`,
                        backgroundColor: homeTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.statBar, 
                      styles.statBarRight, 
                      { 
                        width: `${(stats.fouls.away / (stats.fouls.home + stats.fouls.away || 1)) * 100}%`,
                        backgroundColor: awayTeam.colorPrimary || '#2563eb'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.statValue}>{stats.fouls.away}</Text>
                <Text style={styles.statLabel}>Fouls</Text>
              </View>
            </View>
          </View>
        )}

        {/* Lineups */}
        {(homeLineup.length > 0 || awayLineup.length > 0) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Lineups</Text>
            <View style={styles.lineupsContainer}>
              {/* Home Team */}
              <View style={styles.lineupColumn}>
                <View style={styles.lineupTeamHeader}>
                  {/* Small TeamLogo for lineup header */}
                  <TeamLogo 
                    teamId={homeTeam.id}
                    teamName={homeTeam.name}
                    teamCode={homeTeam.code}
                    size="small"
                    colorPrimary={homeTeam.colorPrimary || '#2563eb'}
                  />
                  <Text style={styles.lineupTeamName}>{homeTeam.name}</Text>
                </View>
                
                {homeLineup.map((player, index) => (
                  <View key={index} style={styles.lineupPlayer}>
                    <Text style={styles.playerNumber}>{player.number}</Text>
                    <Text style={styles.playerName}>
                      {player.name} {player.isCaptain && '(C)'}
                    </Text>
                    <Text style={styles.playerPosition}>{player.position}</Text>
                  </View>
                ))}
                
                {homeSubs.length > 0 && (
                  <>
                    <Text style={styles.subsTitle}>Substitutes</Text>
                    {homeSubs.map((player, index) => (
                      <View key={index} style={styles.lineupPlayer}>
                        <Text style={styles.playerNumber}>{player.number}</Text>
                        <Text style={styles.playerName}>{player.name}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
              
              {/* Away Team */}
              <View style={styles.lineupColumn}>
                <View style={styles.lineupTeamHeader}>
                  {/* Small TeamLogo for lineup header */}
                  <TeamLogo 
                    teamId={awayTeam.id}
                    teamName={awayTeam.name}
                    teamCode={awayTeam.code}
                    size="small"
                    colorPrimary={awayTeam.colorPrimary || '#2563eb'}
                  />
                  <Text style={styles.lineupTeamName}>{awayTeam.name}</Text>
                </View>
                
                {awayLineup.map((player, index) => (
                  <View key={index} style={styles.lineupPlayer}>
                    <Text style={styles.playerNumber}>{player.number}</Text>
                    <Text style={styles.playerName}>
                      {player.name} {player.isCaptain && '(C)'}
                    </Text>
                    <Text style={styles.playerPosition}>{player.position}</Text>
                  </View>
                ))}
                
                {awaySubs.length > 0 && (
                  <>
                    <Text style={styles.subsTitle}>Substitutes</Text>
                    {awaySubs.map((player, index) => (
                      <View key={index} style={styles.lineupPlayer}>
                        <Text style={styles.playerNumber}>{player.number}</Text>
                        <Text style={styles.playerName}>{player.name}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 24,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  competition: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  venue: {
    fontSize: 12,
    color: '#94a3b8',
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 4,
  },
  liveIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  teamContainer: {
    flex: 2,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
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
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginHorizontal: 8,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  sectionContainer: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  eventsContainer: {
    padding: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  eventMinute: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    width: 30,
  },
  eventIcon: {
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventPlayerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  eventTeamName: {
    fontSize: 12,
    color: '#64748b',
  },
  eventAssist: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748b',
    marginTop: 2,
  },
  eventType: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  statsContainer: {
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    width: 30,
    textAlign: 'center',
  },
  statBarContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    marginHorizontal: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
  },
  statBarLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  statBarRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    width: 100,
    marginLeft: 8,
  },
  lineupsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  lineupColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  lineupTeamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lineupTeamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 8,
  },
  lineupPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  playerNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    width: 30,
  },
  playerName: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
  },
  playerPosition: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 4,
    width: 40,
  },
  subsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 8,
  },
});

export default MatchDetail;