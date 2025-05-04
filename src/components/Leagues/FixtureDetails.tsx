// CIFAMobileApp/src/components/leagues/FixtureDetails.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { useLeagues } from '../../hooks/useLeagues';
import { LeagueFixture, MatchEvent } from '../../services/firebase/leagues';
import TeamLogo from '../common/TeamLogo';
import Card from '../common/Card';

interface FixtureDetailsProps {
  fixtureId: string;
}

const FixtureDetails: React.FC<FixtureDetailsProps> = ({ fixtureId }) => {
  const { fetchFixtureById, selectedFixture, loading, error } = useLeagues();
  const [activeTab, setActiveTab] = useState<'summary' | 'stats' | 'lineup'>('summary');

  useEffect(() => {
    if (fixtureId) {
      fetchFixtureById(fixtureId);
    }
  }, [fixtureId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </View>
    );
  }

  if (error || !selectedFixture) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={32} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load match details</Text>
      </View>
    );
  }

  const fixture = selectedFixture;
  const matchDate = fixture.date.toDate();
  const isUpcoming = fixture.status === 'scheduled';
  const isLive = fixture.status === 'live';
  const isCompleted = fixture.status === 'completed';
  const hasStats = fixture.stats && (isLive || isCompleted);

  // Format date and time
  const formatMatchDate = (date: Date): string => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const formatMatchTime = (date: Date): string => {
    return format(date, 'h:mm a');
  };

  // Filter events by team
  const getTeamEvents = (teamId: string): MatchEvent[] => {
    if (!fixture.events) return [];
    return fixture.events.filter(event => event.teamId === teamId);
  };

  const homeTeamEvents = getTeamEvents(fixture.homeTeamId);
  const awayTeamEvents = getTeamEvents(fixture.awayTeamId);

  // Render event icon
  const renderEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Feather name="target" size={16} color="#059669" />;
      case 'ownGoal':
        return <Feather name="target" size={16} color="#ef4444" />;
      case 'penalty':
        return <Feather name="target" size={16} color="#2563eb" />;
      case 'missedPenalty':
        return <Feather name="x-circle" size={16} color="#ef4444" />;
      case 'yellowCard':
        return <View style={[styles.card, styles.yellowCard]} />;
      case 'redCard':
        return <View style={[styles.card, styles.redCard]} />;
      case 'substitution':
        return <Feather name="refresh-cw" size={16} color="#6b7280" />;
      default:
        return null;
    }
  };

  // Render match events
  const renderEvents = (events: MatchEvent[]) => {
    if (events.length === 0) return null;

    return events.map((event, index) => (
      <View key={`${event.type}-${event.minute}-${index}`} style={styles.eventItem}>
        <Text style={styles.eventMinute}>{event.minute}'</Text>
        <View style={styles.eventIcon}>
          {renderEventIcon(event.type)}
        </View>
        <Text style={styles.eventPlayerName}>{event.playerName}</Text>
        {event.type === 'substitution' && event.secondPlayerName && (
          <Text style={styles.eventSecondaryText}>
            for {event.secondPlayerName}
          </Text>
        )}
      </View>
    ));
  };

  // Render match stats
  const renderStats = () => {
    if (!fixture.stats) return null;

    const { homeTeam, awayTeam } = fixture.stats;
    
    const statItems = [
      { label: 'Possession', home: `${homeTeam.possession}%`, away: `${awayTeam.possession}%` },
      { label: 'Shots', home: homeTeam.shots, away: awayTeam.shots },
      { label: 'Shots on Target', home: homeTeam.shotsOnTarget, away: awayTeam.shotsOnTarget },
      { label: 'Corners', home: homeTeam.corners, away: awayTeam.corners },
      { label: 'Fouls', home: homeTeam.fouls, away: awayTeam.fouls },
      { label: 'Yellow Cards', home: homeTeam.yellowCards, away: awayTeam.yellowCards },
      { label: 'Red Cards', home: homeTeam.redCards, away: awayTeam.redCards },
      { label: 'Offsides', home: homeTeam.offsides, away: awayTeam.offsides },
    ];

    return (
      <View style={styles.statsContainer}>
        {statItems.map((item, index) => (
          <View key={`stat-${index}`} style={styles.statRow}>
            <Text style={styles.statValue}>{item.home}</Text>
            <View style={styles.statLabelContainer}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <View style={styles.statBarContainer}>
                <View 
                  style={[
                    styles.statBarHome, 
                    { flex: parseInt(String(item.home)) || 1 }
                  ]} 
                />
                <View 
                  style={[
                    styles.statBarAway, 
                    { flex: parseInt(String(item.away)) || 1 }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.statValue}>{item.away}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#0A1172', '#2F4CB3']} // Dark blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* Date and Time */}
        <Text style={styles.dateText}>{formatMatchDate(matchDate)}</Text>
        
        {/* Status Badge */}
        <View style={getStatusBadgeStyle(fixture.status)}>
          <Text style={styles.statusText}>
            {fixture.status === 'scheduled' ? formatMatchTime(matchDate) : 
             fixture.status === 'live' ? 'LIVE' : 
             fixture.status === 'completed' ? 'FULL TIME' : 
             fixture.status.toUpperCase()}
          </Text>
        </View>
        
        {/* Teams and Score */}
        <View style={styles.teamsContainer}>
          {/* Home Team */}
          <View style={styles.teamContainer}>
            <TeamLogo 
              teamId={fixture.homeTeamId}
              teamName={fixture.homeTeamName}
              teamCode={getTeamInitials(fixture.homeTeamName)}
              size="large"
              showName
            />
          </View>
          
          {/* Score */}
          <View style={styles.scoreContainer}>
            {isUpcoming ? (
              <Text style={styles.vsText}>VS</Text>
            ) : (
              <Text style={styles.scoreText}>
                {fixture.homeScore} - {fixture.awayScore}
              </Text>
            )}
          </View>
          
          {/* Away Team */}
          <View style={styles.teamContainer}>
            <TeamLogo 
              teamId={fixture.awayTeamId}
              teamName={fixture.awayTeamName}
              teamCode={getTeamInitials(fixture.awayTeamName)}
              size="large"
              showName
            />
          </View>
        </View>
        
        {/* Venue */}
        <View style={styles.venueContainer}>
          <Feather name="map-pin" size={14} color="white" style={styles.venueIcon} />
          <Text style={styles.venueText}>{fixture.venue}</Text>
        </View>
      </LinearGradient>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            Summary
          </Text>
        </TouchableOpacity>
        
        {hasStats && (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Stats
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'lineup' && styles.activeTab]}
          onPress={() => setActiveTab('lineup')}
        >
          <Text style={[styles.tabText, activeTab === 'lineup' && styles.activeTabText]}>
            Lineups
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'summary' && (
          <Card>
            <View style={styles.eventsContainer}>
              <View style={styles.teamEventsColumn}>
                {renderEvents(homeTeamEvents)}
              </View>
              <View style={styles.timelineColumn}>
                <View style={styles.timeline}></View>
              </View>
              <View style={styles.teamEventsColumn}>
                {renderEvents(awayTeamEvents)}
              </View>
            </View>
            
            {homeTeamEvents.length === 0 && awayTeamEvents.length === 0 && (
              <View style={styles.noEventsContainer}>
                <Feather name="clock" size={24} color="#9ca3af" />
                <Text style={styles.noEventsText}>
                  {isUpcoming 
                    ? 'Match has not started yet' 
                    : 'No events recorded for this match'}
                </Text>
              </View>
            )}
          </Card>
        )}
        
        {activeTab === 'stats' && hasStats && (
          <Card>
            {renderStats()}
          </Card>
        )}
        
        {activeTab === 'lineup' && (
          <Card>
            <View style={styles.noEventsContainer}>
              <Feather name="users" size={24} color="#9ca3af" />
              <Text style={styles.noEventsText}>
                Lineup information not available
              </Text>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
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

// Get status badge style based on match status
const getStatusBadgeStyle = (status: string) => {
  let backgroundColor;
  
  switch (status) {
    case 'live':
      backgroundColor = '#ef4444'; // Red
      break;
    case 'completed':
      backgroundColor = '#10b981'; // Green
      break;
    case 'postponed':
    case 'cancelled':
      backgroundColor = '#f59e0b'; // Amber
      break;
    default:
      backgroundColor = '#6b7280'; // Gray
  }
  
  return [styles.statusBadge, { backgroundColor }];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  dateText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 2,
    alignItems: 'center',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scoreText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  vsText: {
    color: 'white',
    fontSize: 20,
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
    color: 'white',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  eventsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  teamEventsColumn: {
    flex: 1,
  },
  timelineColumn: {
    width: 20,
    alignItems: 'center',
  },
  timeline: {
    width: 2,
    backgroundColor: '#e5e7eb',
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  eventMinute: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
    marginRight: 8,
    width: 24,
  },
  eventIcon: {
    marginRight: 8,
  },
  card: {
    width: 12,
    height: 16,
    borderRadius: 2,
  },
  yellowCard: {
    backgroundColor: '#fcd34d',
  },
  redCard: {
    backgroundColor: '#ef4444',
  },
  eventPlayerName: {
    fontSize: 14,
    color: '#111827',
    marginRight: 4,
  },
  eventSecondaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noEventsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  statLabelContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  statBarContainer: {
    height: 6,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarHome: {
    height: '100%',
    backgroundColor: '#2563eb', // Blue for home team
  },
  statBarAway: {
    height: '100%',
    backgroundColor: '#ef4444', // Red for away team
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
  },
});

export default FixtureDetails;