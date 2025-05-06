import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Card from '../common/Card';
import Section from '../common/Section';
import { useStats } from '../../hooks/useStats';
import { TopScorer } from '../../services/firebase/stats';
import { Feather } from '@expo/vector-icons';

interface TopScorersProps {
  categoryId: string;
  limit?: number;
  onViewAll?: () => void;
}

const TopScorers: React.FC<TopScorersProps> = ({ 
  categoryId, 
  limit = 5,
  onViewAll 
}) => {
  const { fetchTopScorers, loading, error } = useStats();
  const [scorers, setScorers] = useState<TopScorer[]>([]);

  useEffect(() => {
    const loadTopScorers = async () => {
      const data = await fetchTopScorers(categoryId, limit);
      setScorers(data);
    };
    
    loadTopScorers();
  }, [categoryId, limit, fetchTopScorers]);

  // Loading state
  if (loading && scorers.length === 0) {
    return (
      <Section 
        title="TOP SCORERS" 
        viewAllText="Full List" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading top scorers...</Text>
          </View>
        </Card>
      </Section>
    );
  }

  // Error state
  if (error) {
    return (
      <Section 
        title="TOP SCORERS" 
        viewAllText="Full List" 
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

  // Empty state
  if (scorers.length === 0) {
    return (
      <Section 
        title="TOP SCORERS" 
        viewAllText="Full List" 
        onViewAll={onViewAll}
        style={styles.section}
      >
        <Card style={styles.card}>
          <View style={styles.emptyContainer}>
            <Feather name="users" size={24} color="#9ca3af" />
            <Text style={styles.emptyText}>No top scorers data available</Text>
          </View>
        </Card>
      </Section>
    );
  }

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
        {scorers.map((player) => (
          <View 
            key={player.id} 
            style={[
              styles.row, 
              player.position < scorers.length && styles.borderBottom
            ]}
          >
            <Text style={[styles.text, styles.positionColumn, styles.positionText]}>
              {player.position}
            </Text>
            
            <View style={[styles.playerColumn, styles.playerInfo]}>
              <View style={styles.playerPhoto} />
              <Text style={styles.playerName}>{player.playerName}</Text>
            </View>
            
            <View style={[styles.teamColumn, styles.teamSection]}>
              <View 
                style={[
                  styles.teamCircle, 
                  { backgroundColor: player.teamColor || '#6b7280' }
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

export default TopScorers;