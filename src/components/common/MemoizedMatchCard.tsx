// src/components/common/MemoizedMatchCard.tsx
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import Card from './Card';
import Badge from './Badge';

interface Match {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  date: any;
  venue: string;
  competition: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
}

interface MatchCardProps {
  match: Match;
  onPress: (matchId: string) => void;
  onEdit?: (matchId: string) => void;
  onDelete?: (match: Match) => void;
  showActions?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onPress,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const formatDate = useCallback((timestamp: any): string => {
    try {
      if (!timestamp) return 'Unknown';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Unknown';
    }
  }, []);

  const formatTime = useCallback((timestamp: any): string => {
    try {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'h:mm a');
    } catch (error) {
      return '';
    }
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig: Record<string, { text: string; variant: 'danger' | 'success' | 'info' | 'warning' | 'secondary' }> = {
      live: { text: 'LIVE', variant: 'danger' },
      completed: { text: 'FT', variant: 'success' },
      scheduled: { text: 'Scheduled', variant: 'info' },
      postponed: { text: 'Postponed', variant: 'warning' },
      cancelled: { text: 'Cancelled', variant: 'secondary' }
    };
    
    const config = statusConfig[status] || { text: status, variant: 'secondary' as const };
    return <Badge text={config.text} variant={config.variant} />;
  }, []);

  return (
    <Card style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchDate}>{formatDate(match.date)}</Text>
          <Text style={styles.matchTime}>{formatTime(match.date)}</Text>
        </View>
        {getStatusBadge(match.status)}
      </View>
      
      <View style={styles.teamsContainer}>
        <View style={styles.teamSection}>
          <Text style={styles.teamName} numberOfLines={1}>{match.homeTeamName}</Text>
          {match.status === 'completed' && (
            <Text style={styles.score}>{match.homeScore || 0}</Text>
          )}
        </View>
        
        <Text style={styles.versus}>VS</Text>
        
        <View style={styles.teamSection}>
          <Text style={styles.teamName} numberOfLines={1}>{match.awayTeamName}</Text>
          {match.status === 'completed' && (
            <Text style={styles.score}>{match.awayScore || 0}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.matchDetails}>
        <Text style={styles.venue} numberOfLines={1}>
          <Feather name="map-pin" size={12} color="#666" /> {match.venue}
        </Text>
        <Text style={styles.competition} numberOfLines={1}>
          {match.competition}
        </Text>
      </View>
      
      {showActions && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => onEdit?.(match.id)}
          >
            <Feather name="edit-2" size={16} color="#2563eb" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDelete?.(match)}
          >
            <Feather name="trash-2" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MemoizedMatchCard = React.memo(MatchCard, (prevProps, nextProps) => {
  return (
    prevProps.match.id === nextProps.match.id &&
    prevProps.match.status === nextProps.match.status &&
    prevProps.match.homeScore === nextProps.match.homeScore &&
    prevProps.match.awayScore === nextProps.match.awayScore &&
    prevProps.showActions === nextProps.showActions
  );
});

const styles = {
  matchCard: {
    marginBottom: 12,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchDate: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  matchTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  teamsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  teamSection: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#2563eb',
    marginLeft: 8,
  },
  versus: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 12,
    fontWeight: '500' as const,
  },
  matchDetails: {
    marginBottom: 12,
  },
  venue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  competition: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic' as const,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  editButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
};