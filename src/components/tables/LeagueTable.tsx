// CIFAMobileApp/src/components/tables/LeagueTable.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '../common/Card';
import Section from '../common/Section';
import LeagueTableRow from './LeagueTableRow';

interface LeagueTableProps {
  leagueId: string;
  onViewFullTable?: () => void;
}

const LeagueTable: React.FC<LeagueTableProps> = ({ 
  leagueId, 
  onViewFullTable 
}) => {
  const router = useRouter();
  
  // This would come from Firebase in production based on leagueId
  const getLeagueData = (id: string) => {
    // Mock data structure
    const leagues = {
      'mensPremier': {
        id: 'mensPremier',
        name: "MEN'S PREMIER LEAGUE",
        season: '2024-25 Season',
        teams: [
          {
            id: 'elite',
            name: 'Elite SC',
            logo: '/path/to/logo',
            position: 1,
            played: 12,
            goalDifference: '+17',
            points: 28,
            color: '#16a34a', // Green
          },
          {
            id: 'scholars',
            name: 'Scholars',
            logo: '/path/to/logo',
            position: 2,
            played: 12,
            goalDifference: '+12',
            points: 24,
            color: '#1e40af', // Blue
          },
          {
            id: 'future',
            name: 'Future SC',
            logo: '/path/to/logo',
            position: 3,
            played: 12,
            goalDifference: '+8',
            points: 20,
            color: '#ca8a04', // Yellow/gold
          },
          {
            id: 'bodden',
            name: 'Bodden',
            logo: '/path/to/logo',
            position: 4,
            played: 12,
            goalDifference: '+5',
            points: 18,
            color: '#7e22ce', // Purple
          },
        ],
      },
      'womensPremier': {
        id: 'womensPremier',
        name: "WOMEN'S PREMIER LEAGUE",
        season: '2024-25 Season',
        teams: [
          {
            id: 'scholars-women',
            name: 'Scholars',
            logo: '/path/to/logo',
            position: 1,
            played: 10,
            goalDifference: '+15',
            points: 24,
            color: '#1e40af', // Blue
          },
          {
            id: 'elite-women',
            name: 'Elite SC',
            logo: '/path/to/logo',
            position: 2,
            played: 10,
            goalDifference: '+12',
            points: 21,
            color: '#16a34a', // Green
          },
          {
            id: 'latinos-women',
            name: 'Latinos FC',
            logo: '/path/to/logo',
            position: 3,
            played: 10,
            goalDifference: '+5',
            points: 16,
            color: '#ca8a04', // Yellow/gold
          },
          {
            id: 'sunset-women',
            name: 'Sunset FC',
            logo: '/path/to/logo',
            position: 4,
            played: 10,
            goalDifference: '-3',
            points: 12,
            color: '#ef4444', // Red
          },
        ],
      },
      'mensFirstDiv': {
        id: 'mensFirstDiv',
        name: "MEN'S FIRST DIVISION",
        season: '2024-25 Season',
        teams: [
          {
            id: 'sunset',
            name: 'Sunset FC',
            logo: '/path/to/logo',
            position: 1,
            played: 8,
            goalDifference: '+10',
            points: 18,
            color: '#ef4444', // Red
          },
          {
            id: 'east-end',
            name: 'East End United',
            logo: '/path/to/logo',
            position: 2,
            played: 8,
            goalDifference: '+7',
            points: 16,
            color: '#84cc16', // Lime green
          },
          {
            id: 'north-side',
            name: 'North Side SC',
            logo: '/path/to/logo',
            position: 3,
            played: 8,
            goalDifference: '+4',
            points: 14,
            color: '#0ea5e9', // Light blue
          },
          {
            id: 'cayman-athletic',
            name: 'Cayman Athletic',
            logo: '/path/to/logo',
            position: 4,
            played: 8,
            goalDifference: '-2',
            points: 10,
            color: '#a3e635', // Yellow-green
          },
        ],
      },
      'youthU17': {
        id: 'youthU17',
        name: "YOUTH U-17 LEAGUE",
        season: '2024-25 Season',
        teams: [
          {
            id: 'academy-u17',
            name: 'Academy SC',
            logo: '/path/to/logo',
            position: 1,
            played: 6,
            goalDifference: '+12',
            points: 16,
            color: '#0ea5e9', // Light blue
          },
          {
            id: 'scholars-u17',
            name: 'Scholars',
            logo: '/path/to/logo',
            position: 2,
            played: 6,
            goalDifference: '+8',
            points: 13,
            color: '#1e40af', // Blue
          },
          {
            id: 'bodden-u17',
            name: 'Bodden Town',
            logo: '/path/to/logo',
            position: 3,
            played: 6,
            goalDifference: '+5',
            points: 10,
            color: '#7e22ce', // Purple
          },
          {
            id: 'future-u17',
            name: 'Future SC',
            logo: '/path/to/logo',
            position: 4,
            played: 6,
            goalDifference: '-4',
            points: 7,
            color: '#ca8a04', // Yellow/gold
          },
        ],
      },
      'youthU15': {
        id: 'youthU15',
        name: "YOUTH U-15 LEAGUE",
        season: '2024-25 Season',
        teams: [
          {
            id: 'elite-u15',
            name: 'Elite SC',
            logo: '/path/to/logo',
            position: 1,
            played: 6,
            goalDifference: '+14',
            points: 15,
            color: '#16a34a', // Green
          },
          {
            id: 'academy-u15',
            name: 'Academy SC',
            logo: '/path/to/logo',
            position: 2,
            played: 6,
            goalDifference: '+10',
            points: 13,
            color: '#0ea5e9', // Light blue
          },
          {
            id: 'sunset-u15',
            name: 'Sunset FC',
            logo: '/path/to/logo',
            position: 3,
            played: 6,
            goalDifference: '+2',
            points: 10,
            color: '#ef4444', // Red
          },
          {
            id: 'scholars-u15',
            name: 'Scholars',
            logo: '/path/to/logo',
            position: 4,
            played: 6,
            goalDifference: '-5',
            points: 6,
            color: '#1e40af', // Blue
          },
        ],
      },
    };
    
    return leagues[id as keyof typeof leagues] || leagues['mensPremier'];
  };

  const leagueData = getLeagueData(leagueId);

  const handleViewFullTable = () => {
    if (onViewFullTable) {
      onViewFullTable();
    } else {
      // Navigate to full table view
      router.push({
        pathname: "/leagues/[id]/standings",
        params: { id: leagueId }
      });
    }
  };

  return (
    <Section 
      title="LEAGUE TABLE" 
      viewAllText="Full Table" 
      onViewAll={handleViewFullTable}
      style={styles.section}
    >
      <Card padding="medium" style={styles.card}>
        {/* League header with season */}
        <View style={styles.leagueHeader}>
          <Text style={styles.leagueName}>{leagueData.name}</Text>
          <Text style={styles.leagueSeason}>{leagueData.season}</Text>
        </View>

        {/* Table Headers */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.positionColumn]}>#</Text>
          <Text style={[styles.headerText, styles.teamColumn]}>Team</Text>
          <Text style={[styles.headerText, styles.playedColumn]}>P</Text>
          <Text style={[styles.headerText, styles.gdColumn]}>GD</Text>
          <Text style={[styles.headerText, styles.pointsColumn]}>PTS</Text>
        </View>

        {/* Team Rows */}
        {leagueData.teams.map((team, index) => (
          <LeagueTableRow 
            key={team.id}
            team={team}
            isLast={index === leagueData.teams.length - 1}
          />
        ))}
      </Card>
    </Section>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    padding: 8,
  },
  leagueHeader: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  leagueSeason: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  positionColumn: {
    flex: 1,
  },
  teamColumn: {
    flex: 5,
  },
  playedColumn: {
    flex: 2,
    textAlign: 'center',
  },
  gdColumn: {
    flex: 2,
    textAlign: 'center',
  },
  pointsColumn: {
    flex: 2,
    textAlign: 'center',
  },
});

export default LeagueTable;