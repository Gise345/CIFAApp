// CIFAMobileApp/src/components/teams/TeamDetail.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from '../common/Card';
import Section from '../common/Section';

interface TeamDetailProps {
  teamId: string;
}

const TeamDetail: React.FC<TeamDetailProps> = ({ teamId }) => {
  // This would come from Firebase in production
  const getTeamData = (id: string) => {
    // Mock team data
    const teams = {
      'team1': {
        id: 'team1',
        name: 'Elite Sports Club',
        shortName: 'Elite SC',
        division: "Men's Premier League",
        founded: 1992,
        stadium: 'Ed Bush Stadium',
        colors: 'Green and White',
        coach: 'John Smith',
        description: 'Elite Sports Club is one of the premier football clubs in the Cayman Islands, known for their strong youth development program and competitive presence in the league.',
        colorPrimary: '#16a34a', // Green
        website: 'www.elitesc.ky',
        achievements: [
          '5x Premier League Champions',
          '3x FA Cup Winners',
          '2x Caribbean Club Shield Participants'
        ]
      },
      'team2': {
        id: 'team2',
        name: 'Scholars International',
        shortName: 'Scholars',
        division: "Men's Premier League",
        founded: 1995,
        stadium: 'Ed Bush Stadium',
        colors: 'Blue and White',
        coach: 'Mark Richards',
        description: 'Scholars International is a powerhouse in Cayman football, with a rich history of success both domestically and in regional competitions.',
        colorPrimary: '#1e40af', // Blue
        website: 'www.scholarsinternational.ky',
        achievements: [
          '7x Premier League Champions',
          '4x FA Cup Winners',
          'CONCACAF Champions League Participants'
        ]
      },
      'team3': {
        id: 'team3',
        name: 'Bodden Town FC',
        shortName: 'Bodden Town',
        division: "Men's Premier League",
        founded: 1998,
        stadium: 'Haig Bodden Stadium',
        colors: 'Purple and Black',
        coach: 'David Wilson',
        description: 'Bodden Town FC represents one of the historic districts of Grand Cayman, with strong community support and a focus on developing local talent.',
        colorPrimary: '#7e22ce', // Purple
        website: 'www.boddentownfc.ky',
        achievements: [
          '3x Premier League Champions',
          '2x FA Cup Winners',
          'Caribbean Club Championship Participants'
        ]
      },
      // Add more teams as needed
    };
    
    return teams[id as keyof typeof teams] || teams['team1'];
  };

  const team = getTeamData(teamId);

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View 
          style={[
            styles.teamLogoContainer, 
            { backgroundColor: team.colorPrimary }
          ]}
        >
          <Text style={styles.teamLogoText}>{team.shortName}</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.division}>{team.division}</Text>
        </View>
      </View>
      
      <Section title="TEAM INFO" style={styles.section}>
        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Founded:</Text>
            <Text style={styles.infoValue}>{team.founded}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Home Ground:</Text>
            <Text style={styles.infoValue}>{team.stadium}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Colors:</Text>
            <Text style={styles.infoValue}>{team.colors}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Head Coach:</Text>
            <Text style={styles.infoValue}>{team.coach}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website:</Text>
            <Text style={[styles.infoValue, styles.website]}>{team.website}</Text>
          </View>
        </Card>
      </Section>
      
      <Section title="ABOUT" style={styles.section}>
        <Card>
          <Text style={styles.description}>{team.description}</Text>
        </Card>
      </Section>
      
      <Section title="ACHIEVEMENTS" style={styles.section}>
        <Card>
          {team.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementRow}>
              <View style={styles.bullet} />
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </Card>
      </Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  teamLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teamLogoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  division: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  infoValue: {
    flex: 2,
    fontSize: 14,
    color: '#111827',
  },
  website: {
    color: '#2563eb',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginRight: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#111827',
  },
});

export default TeamDetail;