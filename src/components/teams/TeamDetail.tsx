import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Card from '../common/Card';
import Section from '../common/Section';
import { getTeamById } from '../../services/firebase/teams';
import { Team } from '../../types/team';

interface TeamDetailProps {
  teamId: string;
}

const TeamDetail: React.FC<TeamDetailProps> = ({ teamId }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTeamData = async () => {
      if (team) {
        console.log("Team data received:", JSON.stringify(team, null, 2));
        console.log("Coach field:", team.coach);
      }
      try {
        setLoading(true);
        const teamData = await getTeamById(teamId);
        setTeam(teamData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team:', err);
        setError('Failed to load team details');
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [teamId]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>Loading team information...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!team) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Team not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View 
          style={[
            styles.teamLogoContainer, 
            { backgroundColor: team.colorPrimary || '#2563eb' }
          ]}
        >
          <Text style={styles.teamLogoText}>
            {getTeamInitials(team.name)}
          </Text>
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
            <Text style={styles.infoValue}>{team.foundedYear || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Home Ground:</Text>
            <Text style={styles.infoValue}>{team.venue || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Colors:</Text>
            <Text style={styles.infoValue}>{team.colors || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Head Coach:</Text>
            <Text style={styles.infoValue}>{team.coach || 'Unknown'}</Text>
          </View>
          {team.website && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website:</Text>
              <Text style={[styles.infoValue, styles.website]}>{team.website}</Text>
            </View>
          )}
        </Card>
      </Section>
      
      {team.description && (
        <Section title="ABOUT" style={styles.section}>
          <Card>
            <Text style={styles.description}>{team.description}</Text>
          </Card>
        </Section>
      )}
      
      {team.achievements && team.achievements.length > 0 && (
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
      )}
    </View>
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
  // Add to the existing styles
leagueName: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#111827',
  marginBottom: 4,
},
leagueSeason: {
  fontSize: 14,
  color: '#6b7280',
  marginBottom: 12,
},
standingInfo: {
  backgroundColor: '#f3f4f6',
  padding: 12,
  borderRadius: 8,
  marginTop: 8,
},
standingPosition: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#111827',
  marginBottom: 4,
},
standingStats: {
  fontSize: 14,
  color: '#4b5563',
  marginBottom: 4,
},
standingPoints: {
  fontSize: 16,
  fontWeight: '500',
  color: '#111827',
},
loadingContainer: {
  padding: 20,
  alignItems: 'center',
},
loadingText: {
  marginTop: 8,
  fontSize: 14,
  color: '#6b7280',
},
errorContainer: {
  padding: 20,
  alignItems: 'center',
},
errorText: {
  color: '#ef4444',
  fontSize: 14,
},
emptyContainer: {
  padding: 20,
  alignItems: 'center',
},
emptyText: {
  color: '#6b7280',
  fontSize: 14,
},
});

export default TeamDetail;