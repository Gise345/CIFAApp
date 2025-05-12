// CIFAMobileApp/src/components/tables/LeagueTable.tsx - Updated for TeamLogo compatibility
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Card from '../common/Card';
import Section from '../common/Section';
import LeagueTableRow from './LeagueTableRow';

// Updated Team interface to match what TeamLogo expects
interface Team {
  id: string;
  name: string;
  logo?: string;
  logoUrl?: string; // Added for TeamLogo compatibility
  position: number;
  played: number;
  goalDifference: string;
  points: number;
  color: string; // Used for the colorPrimary in TeamLogo
}

interface LeagueTableProps {
  leagueId: string;
  onViewFullTable?: () => void;
}

const LeagueTable: React.FC<LeagueTableProps> = ({ 
  leagueId, 
  onViewFullTable 
}) => {
  // This would come from Firebase in production based on leagueId
  const getLeagueData = (id: string) => {
    // Mock data structure
    const leagues: Record<string, {
      id: string;
      name: string;
      season: string;
      teams: Team[];
    }> = {
      'mensPremier': {
        id: 'mensPremier',
        name: "MEN'S PREMIER LEAGUE",
        season: '2024-25 Season',
        teams: [
          {
            id: 'elite-mpl',
            name: 'Elite SC',
            logo: '/path/to/logo',
            position: 1,
            played: 12,
            goalDifference: '+17',
            points: 28,
            color: '#16a34a', // Green
          },
          {
            id: 'scholars-mpl',
            name: 'Scholars',
            logo: '/path/to/logo',
            position: 2,
            played: 12,
            goalDifference: '+12',
            points: 24,
            color: '#1e40af', // Blue
          },
          {
            id: 'future-mpl',
            name: 'Future SC',
            logo: '/path/to/logo',
            position: 3,
            played: 12,
            goalDifference: '+8',
            points: 20,
            color: '#ca8a04', // Yellow/gold
          },
          {
            id: 'boddentown-mpl',
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
            id: 'scholars-wpl',
            name: 'Scholars',
            logo: '/path/to/logo',
            position: 1,
            played: 10,
            goalDifference: '+15',
            points: 24,
            color: '#1e40af', // Blue
          },
          {
            id: 'elite-wpl',
            name: 'Elite SC',
            logo: '/path/to/logo',
            position: 2,
            played: 10,
            goalDifference: '+12',
            points: 21,
            color: '#16a34a', // Green
          },
          {
            id: 'latinos-wpl',
            name: 'Latinos FC',
            logo: '/path/to/logo',
            position: 3,
            played: 10,
            goalDifference: '+5',
            points: 16,
            color: '#ca8a04', // Yellow/gold
          },
          {
            id: 'sunset-wpl',
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
            id: 'sunset-mfd',
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
            id: 'cayman-athletic-mfd',
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
            id: 'academy-mpl',
            name: 'Academy SC',
            logo: '/path/to/logo',
            position: 1,
            played: 6,
            goalDifference: '+12',
            points: 16,
            color: '#0ea5e9', // Light blue
          },
          {
            id: 'scholars-mpl',
            name: 'Scholars',
            logo: '/path/to/logo',
            position: 2,
            played: 6,
            goalDifference: '+8',
            points: 13,
            color: '#1e40af', // Blue
          },
          {
            id: 'boddentown-mpl',
            name: 'Bodden Town',
            logo: '/path/to/logo',
            position: 3,
            played: 6,
            goalDifference: '+5',
            points: 10,
            color: '#7e22ce', // Purple
          },
          {
            id: 'future-mpl',
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
            id: 'elite-mpl',
            name: 'Elite SC',
            logo: '/path/to/logo',
            position: 1,
            played: 6,
            goalDifference: '+14',
            points: 15,
            color: '#16a34a', // Green
          },
          {
            id: 'academy-mpl',
            name: 'Academy SC',
            logo: '/path/to/logo',
            position: 2,
            played: 6,
            goalDifference: '+10',
            points: 13,
            color: '#0ea5e9', // Light blue
          },
          {
            id: 'sunset-mpl',
            name: 'Sunset FC',
            logo: '/path/to/logo',
            position: 3,
            played: 6,
            goalDifference: '+2',
            points: 10,
            color: '#ef4444', // Red
          },
          {
            id: 'scholars-mpl',
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
    
    return leagues[id] || leagues['mensPremier'];
  };

  const leagueData = getLeagueData(leagueId);

  const handleViewFullTable = () => {
    if (onViewFullTable) {
      onViewFullTable();
    } else {
      // Navigate to full table view with the updated router API for SDK 53
      router.push(`/leagues/${leagueId}/standings`);
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