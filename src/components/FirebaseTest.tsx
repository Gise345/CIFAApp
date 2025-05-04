// CIFAMobileApp/src/components/FirebaseTest.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { firestore } from '../services/firebase/config';

const FirebaseTest = () => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [matchData, setMatchData] = useState<any[]>([]);
  const [leagueData, setLeagueData] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);

  // Test connection to Firestore
  const testConnection = async () => {
    setLoading(true);
    setConnected(null);
    setError(null);
    setTeamData([]);
    setPlayerData([]);
    setMatchData([]);
    setLeagueData([]);
    setNewsData([]);
    
    try {
      // Test teams collection
      const teamsQuery = query(collection(firestore, 'teams'), limit(3));
      const teamSnapshot = await getDocs(teamsQuery);
      const teams = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamData(teams);
      
      // Test players collection
      const playersQuery = query(collection(firestore, 'players'), limit(3));
      const playerSnapshot = await getDocs(playersQuery);
      const players = playerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayerData(players);
      
      // Test matches collection
      const matchesQuery = query(collection(firestore, 'matches'), limit(3));
      const matchSnapshot = await getDocs(matchesQuery);
      const matches = matchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatchData(matches);
      
      // Test leagues collection
      const leaguesQuery = query(collection(firestore, 'leagues'), limit(3));
      const leagueSnapshot = await getDocs(leaguesQuery);
      const leagues = leagueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeagueData(leagues);
      
      // Test news collection
      const newsQuery = query(collection(firestore, 'news'), limit(3));
      const newsSnapshot = await getDocs(newsQuery);
      const news = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsData(news);
      
      setConnected(true);
    } catch (err) {
      console.error("Firebase connection error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error connecting to Firebase');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Attempt connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  // Render data samples from each collection
  const renderDataSamples = () => {
    if (!connected) return null;
    
    return (
      <View style={styles.dataContainer}>
        {teamData.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Teams ({teamData.length})</Text>
            {teamData.map(team => (
              <Text key={team.id} style={styles.dataItem}>
                {team.name} - {team.division || 'Unknown Division'}
              </Text>
            ))}
          </View>
        )}
        
        {playerData.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Players ({playerData.length})</Text>
            {playerData.map(player => (
              <Text key={player.id} style={styles.dataItem}>
                {player.name} - {player.position || 'Unknown Position'}
              </Text>
            ))}
          </View>
        )}
        
        {matchData.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Matches ({matchData.length})</Text>
            {matchData.map(match => (
              <Text key={match.id} style={styles.dataItem}>
                {match.homeTeamName} vs {match.awayTeamName}
              </Text>
            ))}
          </View>
        )}
        
        {leagueData.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Leagues ({leagueData.length})</Text>
            {leagueData.map(league => (
              <Text key={league.id} style={styles.dataItem}>
                {league.name} - {league.season || 'Current Season'}
              </Text>
            ))}
          </View>
        )}
        
        {newsData.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>News ({newsData.length})</Text>
            {newsData.map(item => (
              <Text key={item.id} style={styles.dataItem}>
                {item.title}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Connecting to Firebase...</Text>
        </View>
      ) : connected === null ? (
        <Text style={styles.statusText}>Checking connection...</Text>
      ) : connected ? (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedText}>
            Successfully connected to Firebase!
          </Text>
          {renderDataSamples()}
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Connection failed</Text>
          <Text style={styles.errorDetails}>{error}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.retryButtonText}>
          {loading ? 'Connecting...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
  },
  connectedContainer: {
    marginVertical: 20,
  },
  connectedText: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorContainer: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#ef4444',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    marginTop: 20,
  },
  dataSection: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  dataItem: {
    fontSize: 14,
    marginBottom: 4,
    color: '#374151',
  },
});

export default FirebaseTest;