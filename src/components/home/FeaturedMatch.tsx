// CIFAMobileApp/src/components/home/FeaturedMatch.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface TeamProps {
  id: string;
  name: string;
  code: string;
  logo?: string;
  primaryColor: string;
}

interface FeaturedMatchProps {
  onPress?: () => void;
  viewDetailsLabel?: string;
}

const FeaturedMatch: React.FC<FeaturedMatchProps> = ({ 
  onPress,
  viewDetailsLabel = "View details" 
}) => {
  // This would come from Firebase in production
  const matchData = {
    id: 'match001',
    homeTeam: {
      id: 'elite',
      name: 'Elite SC',
      code: 'ELT',
      primaryColor: '#065f46',
    },
    awayTeam: {
      id: 'future',
      name: 'Future SC',
      code: 'FSC',
      primaryColor: '#b45309',
    },
    time: '19:30',
    date: 'Wed 1 May',
    competition: "MEN'S PREMIER LEAGUE",
    venue: 'Truman Bodden Sports Complex',
    notification: 'Starting lineup announced',
  };

  // Team logo component
  const TeamLogo: React.FC<{ team: TeamProps }> = ({ team }) => (
    <View style={styles.teamContainer}>
      <View style={styles.logoOuterContainer}>
        <View 
          style={[
            styles.logoInnerContainer, 
            { backgroundColor: team.primaryColor }
          ]}
        >
          <Text style={styles.teamCode}>{team.code}</Text>
        </View>
      </View>
      <Text style={styles.teamName}>{team.name}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#C41E3A', '#191970', '#041E42']} // Dark blue to purple gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.featuredText}>FEATURED MATCH • {matchData.date}</Text>
      
      <View style={styles.matchContainer}>
        <TeamLogo team={matchData.homeTeam as TeamProps} />
        
        <View style={styles.scoreContainer}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.timeText}>{matchData.time}</Text>
        </View>
        
        <TeamLogo team={matchData.awayTeam as TeamProps} />
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>{viewDetailsLabel}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.notificationBanner}>
        <View style={styles.notificationLeft}>
          <Feather name="bell" size={14} color="white" style={styles.notificationIcon} />
          <Text style={styles.notificationText}>{matchData.notification}</Text>
        </View>
        <TouchableOpacity style={styles.viewSmallButton} onPress={onPress}>
          <Text style={styles.viewSmallButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  featuredText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  matchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  teamContainer: {
    alignItems: 'center',
  },
  logoOuterContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoInnerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCode: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  teamName: {
    color: 'white',
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  vsText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#FFD1E3', // Light pink
    fontSize: 14,
    fontWeight: '500',
  },
  notificationBanner: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 6,
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
  },
  viewSmallButton: {
    backgroundColor: '#FFD1E3', // Light pink
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewSmallButtonText: {
    color: '#3a0ca3', // Deep purple
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FeaturedMatch;