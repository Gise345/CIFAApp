// src/components/stats/LeagueFixturesResults.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  SectionList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';

import Card from '../common/Card';
import Section from '../common/Section';
import TeamLogo from '../common/TeamLogo';
import { getFixturesByLeague, LeagueFixture } from '../../services/firebase/leagues';

interface LeagueFixturesResultsProps {
  leagueId: string;
  maxItems?: number;
  showHeader?: boolean;
  onViewAll?: () => void;
}

interface SectionData {
  title: string;
  data: LeagueFixture[];
}

const LeagueFixturesResults: React.FC<LeagueFixturesResultsProps> = ({
  leagueId,
  maxItems = 5,
  showHeader = true,
  onViewAll
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<LeagueFixture[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    loadFixturesAndResults();
  }, [leagueId]);

  const loadFixturesAndResults = async () => {
    if (!leagueId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get both scheduled and completed fixtures
      const allFixtures = await getFixturesByLeague(leagueId);
      setFixtures(allFixtures);
      
      // Process the data into sections
      processSections(allFixtures, maxItems);
    } catch (err) {
      console.error('Error loading fixtures and results:', err);
      setError('Failed to load fixtures and results');
    } finally {
      setLoading(false);
    }
  };

  const processSections = (fixtureData: LeagueFixture[], limit: number) => {
    // Get current date for comparison
    const now = new Date();
    
    // Split fixtures into upcoming and results
    const upcomingFixtures = fixtureData
      .filter(f => f.status === 'scheduled' && new Date(f.date?.toDate?.() || f.date) > now)
      .sort((a, b) => {
        const dateA = new Date(a.date?.toDate?.() || a.date);
        const dateB = new Date(b.date?.toDate?.() || b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit);
    
    const recentResults = fixtureData
      .filter(f => f.status === 'completed')
      .sort((a, b) => {
        const dateA = new Date(a.date?.toDate?.() || a.date);
        const dateB = new Date(b.date?.toDate?.() || b.date);
        return dateB.getTime() - dateA.getTime(); // Descending for most recent first
      })
      .slice(0, limit);
    
    const sectionData: SectionData[] = [];
    
    if (upcomingFixtures.length > 0) {
      sectionData.push({
        title: 'Upcoming Fixtures',
        data: upcomingFixtures
      });
    }
    
    if (recentResults.length > 0) {
      sectionData.push({
        title: 'Recent Results',
        data: recentResults
      });
    }
    
    setSections(sectionData);
  };

  const handleFixturePress = (fixtureId: string) => {
    router.push(`/fixtures/${fixtureId}`);
  };

  const formatMatchDate = (date: any): string => {
    try {
      // Handle different date formats
      const dateObj = date?.toDate ? date.toDate() : new Date(date);
      return format(dateObj, 'EEE, dd MMM yyyy');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  const renderFixtureItem = ({ item }: { item: LeagueFixture }) => {
    const isCompleted = item.status === 'completed';
    
    return (
      <TouchableOpacity 
        style={styles.fixtureItem}
        onPress={() => handleFixturePress(item.id)}
      >
        <Text style={styles.fixtureDate}>{formatMatchDate(item.date)}</Text>
        
        <View style={styles.matchRow}>
          <View style={styles.teamSection}>
            <TeamLogo
              teamId={item.homeTeamId}
              teamName={item.homeTeamName}
              size={24}
              style={styles.teamLogo}
            />
            <Text style={styles.teamName} numberOfLines={1}>{item.homeTeamName}</Text>
          </View>
          
          <View style={styles.scoreSection}>
            {isCompleted ? (
              <Text style={styles.scoreText}>
                {item.homeScore} - {item.awayScore}
              </Text>
            ) : (
              <Text style={styles.matchTime}>{item.time || (typeof item.date?.toDate === 'function' ? 
                item.date.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '15:00')}</Text>
            )}
          </View>
          
          <View style={styles.teamSection}>
            <TeamLogo
              teamId={item.awayTeamId}
              teamName={item.awayTeamName}
              size={24}
              style={styles.teamLogo}
            />
            <Text style={styles.teamName} numberOfLines={1}>{item.awayTeamName}</Text>
          </View>
        </View>
        
        <Text style={styles.venueText}>{item.venue}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Section 
        title="FIXTURES & RESULTS" 
        viewAllText="View All" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading fixtures and results...</Text>
          </View>
        </Card>
      </Section>
    );
  }

  if (error) {
    return (
      <Section 
        title="FIXTURES & RESULTS" 
        viewAllText="View All" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      </Section>
    );
  }

  if (sections.length === 0) {
    return (
      <Section 
        title="FIXTURES & RESULTS" 
        viewAllText="View All" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={24} color="#9ca3af" />
            <Text style={styles.emptyText}>No fixtures or results available</Text>
          </View>
        </Card>
      </Section>
    );
  }

  const content = (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => item.id || `fixture-${index}`}
      renderItem={renderFixtureItem}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
      )}
      stickySectionHeadersEnabled={false}
    />
  );

  // If we're not showing the header, just return the content
  if (!showHeader) {
    return <Card style={styles.card}>{content}</Card>;
  }

  // Otherwise wrap in Section
  return (
    <Section 
      title="FIXTURES & RESULTS" 
      viewAllText="View All" 
      onViewAll={onViewAll}
      style={styles.section}
    >
      <Card style={styles.card}>
        {content}
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
  },
  sectionHeader: {
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  fixtureItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fixtureDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  teamSection: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    marginRight: 8,
  },
  teamName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  scoreSection: {
    flex: 1,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  matchTime: {
    fontSize: 14,
    color: '#2563eb',
  },
  venueText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default LeagueFixturesResults;