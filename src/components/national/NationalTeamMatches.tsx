// src/components/national/NationalTeamMatches.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { NationalTeamMatch } from '../../types/nationalTeam';
import Feather from '@expo/vector-icons/Feather';import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';

interface NationalTeamMatchesProps {
  matches: {
    upcoming: NationalTeamMatch[];
    past: NationalTeamMatch[];
  };
  loading: boolean;
  error: string | null;
  teamPrimaryColor: string;
}

const NationalTeamMatches: React.FC<NationalTeamMatchesProps> = ({
  matches,
  loading,
  error,
  teamPrimaryColor
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Get matches based on active tab
  const displayedMatches = activeTab === 'upcoming' ? matches.upcoming : matches.past;
  
  // Navigate to match details
  const handleMatchPress = (matchId: string) => {
    router.push(`/fixtures/${matchId}`);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={teamPrimaryColor} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-triangle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderMatchItem = ({ item }: { item: NationalTeamMatch }) => {
    const matchDate = parseISO(item.date);
    const formattedDate = format(matchDate, 'EEE, MMM d, yyyy');
    const formattedTime = format(matchDate, 'h:mm a');
    
    const isHome = item.homeTeam.name.includes('Cayman Islands');
    const isCompleted = item.status === 'completed';
    const isLive = item.status === 'live';
    
    // Format match status
    const getStatusText = () => {
      switch (item.status) {
        case 'live':
          return 'LIVE';
        case 'completed':
          return 'FT';
        case 'cancelled':
          return 'CANCELLED';
        case 'postponed':
          return 'POSTPONED';
        default:
          return formattedTime;
      }
    };
    
    // Get status badge style
    const getStatusStyle = () => {
      switch (item.status) {
        case 'live':
          return styles.liveStatus;
        case 'completed':
          return styles.completedStatus;
        case 'cancelled':
        case 'postponed':
          return styles.postponedStatus;
        default:
          return styles.scheduledStatus;
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => handleMatchPress(item.id)}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.competitionText}>{item.competition}</Text>
          {item.stage && <Text style={styles.stageText}> • {item.stage}</Text>}
        </View>
        
        <View style={styles.dateVenueContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.venueText}>{item.venue}, {item.city}</Text>
        </View>
        
        <View style={styles.teamsContainer}>
          {/* Home Team */}
          <View style={[styles.teamContainer, styles.homeTeam]}>
            <Text 
              style={[
                styles.teamName, 
                isHome && { fontWeight: 'bold', color: teamPrimaryColor }
              ]}
              numberOfLines={1}
            >
              {item.homeTeam.name}
            </Text>
          </View>
          
          {/* Score / Time */}
          <View style={styles.scoreContainer}>
            {(isCompleted || isLive) ? (
              <>
                <Text style={styles.scoreText}>
                  {item.homeTeam.score} - {item.awayTeam.score}
                </Text>
                <View style={[styles.statusBadge, getStatusStyle()]}>
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.vsText}>VS</Text>
                <View style={[styles.statusBadge, getStatusStyle()]}>
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </>
            )}
          </View>
          
          {/* Away Team */}
          <View style={[styles.teamContainer, styles.awayTeam]}>
            <Text 
              style={[
                styles.teamName, 
                !isHome && { fontWeight: 'bold', color: teamPrimaryColor }
              ]}
              numberOfLines={1}
            >
              {item.awayTeam.name}
            </Text>
          </View>
        </View>
        
        {item.events.length > 0 && isCompleted && (
          <View style={styles.eventsContainer}>
            {item.events.slice(0, 3).map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Feather 
                  name={
                    event.type === 'goal' || event.type === 'penalty' 
                      ? 'target' 
                      : event.type === 'yellowCard' 
                        ? 'square' 
                        : event.type === 'redCard' 
                          ? 'square' 
                          : 'user'
                  } 
                  size={12} 
                  color={
                    event.type === 'goal' || event.type === 'penalty' 
                      ? '#16a34a' 
                      : event.type === 'yellowCard' 
                        ? '#f59e0b' 
                        : event.type === 'redCard' 
                          ? '#ef4444' 
                          : '#6b7280'
                  } 
                  style={styles.eventIcon}
                />
                <Text style={styles.eventText}>{event.playerName} {event.minute}'</Text>
              </View>
            ))}
            {item.events.length > 3 && (
              <Text style={styles.moreEventsText}>+{item.events.length - 3} more</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && [styles.activeTab, { borderBottomColor: teamPrimaryColor }]
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'upcoming' && [styles.activeTabText, { color: teamPrimaryColor }]
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'past' && [styles.activeTab, { borderBottomColor: teamPrimaryColor }]
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'past' && [styles.activeTabText, { color: teamPrimaryColor }]
            ]}
          >
            Results
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Match List */}
      {displayedMatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather 
            name={activeTab === 'upcoming' ? 'calendar' : 'clock'} 
            size={48} 
            color="#9ca3af" 
          />
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' 
              ? 'No upcoming matches scheduled' 
              : 'No past match results available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedMatches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.matchList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
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
    marginTop: 10,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    fontWeight: '600',
  },
  matchList: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  competitionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  stageText: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateVenueContainer: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  venueText: {
    fontSize: 12,
    color: '#6b7280',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamContainer: {
    flex: 1,
  },
  homeTeam: {
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  awayTeam: {
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  teamName: {
    fontSize: 14,
    color: '#111827',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  vsText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  liveStatus: {
    backgroundColor: '#fee2e2',
  },
  completedStatus: {
    backgroundColor: '#ecfdf5',
  },
  postponedStatus: {
    backgroundColor: '#fef3c7',
  },
  scheduledStatus: {
    backgroundColor: '#eff6ff',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  eventsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventIcon: {
    marginRight: 6,
  },
  eventText: {
    fontSize: 12,
    color: '#4b5563',
  },
  moreEventsText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    alignSelf: 'center',
    marginTop: 4,
  },
});

export default NationalTeamMatches;