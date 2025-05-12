// CIFAMobileApp/src/components/tables/LeagueTableRow.tsx - Updated with TeamLogo
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import TeamLogo from '../common/TeamLogo';

interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  position: number;
  played: number;
  goalDifference: string;
  points: number;
  color: string;
}

interface LeagueTableRowProps {
  team: Team;
  isLast?: boolean;
}

const LeagueTableRow: React.FC<LeagueTableRowProps> = ({ team, isLast = false }) => {
  const handleTeamPress = () => {
    // Use the updated router.push method for SDK 53
    router.push(`/teams/${team.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={[styles.row, !isLast && styles.borderBottom]}
      onPress={handleTeamPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, styles.positionColumn, styles.positionText]}>
        {team.position}
      </Text>
      
      <View style={[styles.teamColumn, styles.teamInfo]}>
        {/* Replace the custom logo view with TeamLogo component */}
        <TeamLogo 
          teamId={team.id}
          teamName={team.name}
          size={16}
          colorPrimary={team.color}
          style={styles.teamLogoWrapper}
        />
        <Text style={styles.teamName}>{team.name}</Text>
      </View>
      
      <Text style={[styles.text, styles.playedColumn]}>
        {team.played}
      </Text>
      
      <Text style={[styles.text, styles.gdColumn]}>
        {team.goalDifference}
      </Text>
      
      <Text style={[styles.text, styles.pointsColumn, styles.pointsText]}>
        {team.points}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  text: {
    fontSize: 13,
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
  positionText: {
    fontWeight: '500',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogoWrapper: {
    marginRight: 8,
  },
  teamName: {
    fontSize: 13,
  },
  pointsText: {
    fontWeight: 'bold',
  },
});

export default LeagueTableRow;