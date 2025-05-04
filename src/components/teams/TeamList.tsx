// CIFAMobileApp/src/components/teams/TeamList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';

interface Team {
  id: string;
  name: string;
  shortName: string;
  division: string;
  colorPrimary: string;
  logo?: string;
}

interface TeamListProps {
  division?: string;
  limit?: number;
  onViewAll?: () => void;
}

const TeamList: React.FC<TeamListProps> = ({ 
  division,
  limit = 5,
  onViewAll
}) => {
  const router = useRouter();
  
  // Example team data - in production this would come from Firebase
  const teams: Team[] = [
    {
      id: 'team1',
      name: 'Elite Sports Club',
      shortName: 'Elite SC',
      division: "Men's Premier League",
      colorPrimary: '#16a34a', // Green
      logo: '/api/placeholder/100/100',
    },
    {
      id: 'team2',
      name: 'Scholars International',
      shortName: 'Scholars',
      division: "Men's Premier League",
      colorPrimary: '#1e40af', // Blue
      logo: '/api/placeholder/100/100',
    },
    {
      id: 'team3',
      name: 'Bodden Town FC',
      shortName: 'Bodden Town',
      division: "Men's Premier League",
      colorPrimary: '#7e22ce', // Purple
      logo: '/api/placeholder/100/100',
    },
    {
      id: 'team4',
      name: 'Future SC',
      shortName: 'Future',
      division: "Men's Premier League",
      colorPrimary: '#ca8a04', // Yellow
      logo: '/api/placeholder/100/100',
    },
    {
      id: 'team5',
      name: 'Roma United',
      shortName: 'Roma',
      division: "Men's Premier League",
      colorPrimary: '#be123c', // Red
      logo: '/api/placeholder/100/100',
    },
  ];
  
  // Filter teams by division if specified
  const filteredTeams = division 
    ? teams.filter(team => team.division === division)
    : teams;
    
  // Limit number of teams shown
  const limitedTeams = filteredTeams.slice(0, limit);
  
  const handleTeamPress = (teamId: string) => {
    // Use bracket syntax to navigate
    router.push(`/teams/${teamId}`);
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {limitedTeams.map((team) => (
        <TouchableOpacity 
          key={team.id}
          style={styles.teamCard}
          onPress={() => handleTeamPress(team.id)}
        >
          <View style={[styles.teamLogo, { backgroundColor: team.colorPrimary }]}>
            {team.logo ? (
              <Image source={{ uri: team.logo }} style={styles.logoImage} />
            ) : (
              <Text style={styles.teamInitials}>
                {team.shortName.substring(0, 3)}
              </Text>
            )}
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
          <Text style={styles.teamDivision} numberOfLines={1}>{team.division}</Text>
        </TouchableOpacity>
      ))}
      
      {onViewAll && (
        <TouchableOpacity 
          style={styles.viewAllCard}
          onPress={onViewAll}
        >
          <View style={styles.viewAllCircle}>
            <Text style={styles.viewAllPlus}>+</Text>
          </View>
          <Text style={styles.viewAllText}>View All Teams</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  teamCard: {
    width: 100,
    marginRight: 16,
    alignItems: 'center',
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teamInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  teamDivision: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  viewAllCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllPlus: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  viewAllText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default TeamList;