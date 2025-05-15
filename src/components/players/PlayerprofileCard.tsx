// src/components/players/PlayerProfileCard.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getPlayerPhotoURL } from '../../services/firebase/storage';
import TeamLogo from '../common/TeamLogo';

interface PlayerProfileCardProps {
  playerId: string;
  name: string;
  number?: number;
  position?: string;
  teamId: string;
  teamName: string;
  stats?: {
    goals?: number;
    assists?: number;
    appearances?: number;
    cleanSheets?: number;
    [key: string]: any;
  };
  onPress?: () => void;
}

const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({
  playerId,
  name,
  number,
  position,
  teamId,
  teamName,
  stats,
  onPress
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch player photo
  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        if (!playerId) {
          setLoading(false);
          return;
        }
        
        const url = await getPlayerPhotoURL(playerId, name);
        if (url) {
          setPhotoUrl(url);
        }
      } catch (err) {
        console.warn(`Could not load photo for player ${name}:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhoto();
  }, [playerId, name]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/players/${playerId}`);
    }
  };

  const getPositionAbbreviation = (pos?: string) => {
    if (!pos) return '';
    
    switch (pos.toLowerCase()) {
      case 'goalkeeper':
        return 'GK';
      case 'defender':
        return 'DEF';
      case 'midfielder':
        return 'MID';
      case 'forward':
        return 'FWD';
      default:
        return pos.substring(0, 3).toUpperCase();
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.playerInfo}>
        {/* Player Photo */}
        <View style={styles.photoContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : photoUrl && !error ? (
            <Image 
              source={{ uri: photoUrl }} 
              style={styles.playerPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderText}>
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          
          {number && (
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{number}</Text>
            </View>
          )}
        </View>
        
        {/* Player Details */}
        <View style={styles.details}>
          <Text style={styles.playerName}>{name}</Text>
          
          <View style={styles.teamRow}>
            <TeamLogo
              teamId={teamId}
              teamName={teamName}
              size={16}
              style={styles.teamLogo}
            />
            <Text style={styles.teamName}>{teamName}</Text>
            
            {position && (
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>
                  {getPositionAbbreviation(position)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Player Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          {stats.goals !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.goals}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
          )}
          
          {stats.assists !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.assists}</Text>
              <Text style={styles.statLabel}>Assists</Text>
            </View>
          )}
          
          {stats.appearances !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.appearances}</Text>
              <Text style={styles.statLabel}>Apps</Text>
            </View>
          )}
          
          {stats.cleanSheets !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.cleanSheets}</Text>
              <Text style={styles.statLabel}>Clean sheets</Text>
            </View>
          )}
        </View>
      )}
      
      <Feather 
        name="chevron-right" 
        size={18} 
        color="#9ca3af" 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerPhoto: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  numberBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  details: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    marginRight: 4,
  },
  teamName: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  positionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginLeft: 8,
  },
  positionText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4b5563',
  },
  statsContainer: {
    flexDirection: 'row',
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default PlayerProfileCard;