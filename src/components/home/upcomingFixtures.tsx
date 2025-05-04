// CIFAMobileApp/src/components/home/upcomingFixtures.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import FixtureItem from '../matches/FixtureItem';

interface UpcomingFixturesProps {
  onViewAll?: () => void;
}

const UpcomingFixtures: React.FC<UpcomingFixturesProps> = ({ onViewAll }) => {
  // This would come from Firebase in production
  const fixtures = [
    {
      id: 'fixture1',
      date: 'SAT, 19 APR',
      time: '7:00 PM',
      competition: "MEN'S PREMIER LEAGUE",
      homeTeam: {
        id: 'scholars',
        name: 'Scholars FC',
        code: 'SCH',
        primaryColor: '#1e40af',
      },
      awayTeam: {
        id: 'latinos',
        name: 'Latinos FC',
        code: 'LAT',
        primaryColor: '#15803d',
      },
      venue: 'Truman Bodden Sports Complex',
    },
    {
      id: 'fixture2',
      date: 'SUN, 20 APR',
      time: '5:00 PM',
      competition: "WOMEN'S PREMIER LEAGUE",
      homeTeam: {
        id: 'elite',
        name: 'Elite SC',
        code: 'ELT',
        primaryColor: '#15803d',
      },
      awayTeam: {
        id: 'scholars',
        name: 'Scholars',
        code: 'SCH',
        primaryColor: '#1e40af',
      },
      venue: 'Ed Bush Stadium',
    },
  ];

  return (
    <LinearGradient
      colors={['#C41E3A','#0047AB', '#191970', '#041E42']} // Dark blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Fixtures</Text>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all fixtures</Text>
          <Feather name="chevron-right" size={16} color="#B9A2FF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.fixturesContainer}>
        {fixtures.map(fixture => (
          <FixtureItem 
            key={fixture.id} 
            fixture={fixture} 
            showVenue={true}
          />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#B9A2FF', // Light purple
    marginRight: 4,
  },
  fixturesContainer: {
    paddingVertical: 8,
  },
});

export default UpcomingFixtures;