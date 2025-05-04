import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import Section from '../common/Section';

interface Player {
  id: string;
  name: string;
  teamId: string;
  teamColor: string;
  goals: number;
  position: number;
}

interface TopScorersProps {
  categoryId: string;
  onViewAll?: () => void;
}

const TopScorers: React.FC<TopScorersProps> = ({ categoryId, onViewAll }) => {
  // This would come from Firebase in production based on categoryId
  const players: Player[] = [
    {
      id: 'player1',
      name: 'Mark Ebanks',
      teamId: 'elite',
      teamColor: '#16a34a', // Green
      goals: 12,
      position: 1,
    },
    {
      id: 'player2',
      name: 'Wesley Robinson',
      teamId: 'scholars',
      teamColor: '#1e40af', // Blue
      goals: 9,
      position: 2,
    },
    {
      id: 'player3',
      name: 'Theron Wood',
      teamId: 'elite',
      teamColor: '#16a34a', // Green
      goals: 8,
      position: 3,
    },
    {
      id: 'player4',
      name: 'Christopher Ebanks',
      teamId: 'future',
      teamColor: '#ca8a04', // Yellow/gold
      goals: 7,
      position: 4,
    },
    {
      id: 'player5',
      name: 'Jonah Ebanks',
      teamId: 'bodden',
      teamColor: '#7e22ce', // Purple
      goals: 6,
      position: 5,
    },
  ];

  return (
    <Section 
      title="TOP SCORERS" 
      viewAllText="Full List" 
      onViewAll={onViewAll}
      style={styles.section}
    >
      <Card style={styles.card}>
        {/* Table Header */}
        <View style={styles.header}>
          <Text style={[styles.headerText, styles.positionColumn]}>#</Text>
          <Text style={[styles.headerText, styles.playerColumn]}>Player</Text>
          <Text style={[styles.headerText, styles.teamColumn]}>Team</Text>
          <Text style={[styles.headerText, styles.goalsColumn]}>Goals</Text>
        </View>
        
        {/* Player Rows */}
        {players.map((player, index) => (
          <View 
            key={player.id} 
            style={[
              styles.row, 
              index < players.length - 1 && styles.borderBottom
            ]}
          >
            <Text style={[styles.text, styles.positionColumn, styles.positionText]}>
              {player.position}
            </Text>
            
            <View style={[styles.playerColumn, styles.playerInfo]}>
              <View style={styles.playerPhoto} />
              <Text style={styles.playerName}>{player.name}</Text>
            </View>
            
            <View style={[styles.teamColumn, styles.teamSection]}>
              <View 
                style={[
                  styles.teamCircle, 
                  { backgroundColor: player.teamColor }
                ]} 
              />
            </View>
            
            <Text style={[styles.text, styles.goalsColumn, styles.goalsText]}>
              {player.goals}
            </Text>
          </View>
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
    padding: 0,
    overflow: 'hidden',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  text: {
    fontSize: 12,
  },
  positionColumn: {
    flex: 1,
  },
  playerColumn: {
    flex: 7,
  },
  teamColumn: {
    flex: 2,
    alignItems: 'center',
  },
  goalsColumn: {
    flex: 2,
    textAlign: 'center',
  },
  positionText: {
    fontWeight: '500',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    marginRight: 8,
  },
  playerName: {
    fontSize: 12,
  },
  teamSection: {
    justifyContent: 'center',
  },
  teamCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  goalsText: {
    fontWeight: 'bold',
  },
});

export default TopScorers;