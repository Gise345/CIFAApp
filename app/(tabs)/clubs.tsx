// app/(tabs)/clubs.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Firestore 
} from 'firebase/firestore';
import { Team } from '../../src/types/team';

// Simple Header component to avoid import issues
const SimpleHeader = ({ title }: { title: string }) => {
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>{title}</Text>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  }
});

// Simple Team Card component to avoid circular dependencies
const TeamCard = ({ team, onPress }: { team: Team, onPress: () => void }) => {
  const getTeamInitials = (name: string) => {
    if (!name) return '';
    const words = name.split(' ');
    return words.slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase();
  };

  return (
    <TouchableOpacity style={cardStyles.container} onPress={onPress}>
      <View 
        style={[
          cardStyles.logo, 
          { backgroundColor: team.colorPrimary || '#2563eb' }
        ]}
      >
        <Text style={cardStyles.initials}>{getTeamInitials(team.name)}</Text>
      </View>
      <Text style={cardStyles.name} numberOfLines={1}>{team.name}</Text>
      <Text style={cardStyles.division} numberOfLines={1}>{team.division}</Text>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    width: 90,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  initials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 2,
  },
  division: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});

// Simple TeamList component to avoid circular dependencies
const SimpleTeamList = ({ teams, onViewAll }: { teams: Team[], onViewAll?: () => void }) => {
  if (teams.length === 0) {
    return null;
  }

  // Limit to 11 teams
  const displayTeams = teams.slice(0, 11);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={listStyles.container}
    >
      {displayTeams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          onPress={() => router.push(`/teams/${team.id}`)}
        />
      ))}

      {teams.length > 5 && onViewAll && (
        <TouchableOpacity
          style={listStyles.viewAllCard}
          onPress={onViewAll}
        >
          <View style={listStyles.viewAllCircle}>
            <Feather name="chevron-right" size={24} color="#6b7280" />
          </View>
          <Text style={listStyles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const listStyles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  viewAllCard: {
    width: 90,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
});

// Mock data for immediate display
const mockTeams: Team[] = [
  {
    id: 'team1',
    name: 'Elite Sports Club',
    shortName: 'Elite SC',
    division: "Men's Premier League",
    type: 'club',
    colorPrimary: '#16a34a', // Green
  },
  {
    id: 'team2',
    name: 'Scholars International',
    shortName: 'Scholars',
    division: "Men's Premier League",
    type: 'club',
    colorPrimary: '#1e40af', // Blue
  },
  {
    id: 'team3',
    name: 'Bodden Town FC',
    shortName: 'Bodden Town',
    division: "Men's Premier League",
    type: 'club',
    colorPrimary: '#7e22ce', // Purple
  },
];

export default function ClubsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensTeams, setMensTeams] = useState<Team[]>([]);
  const [womensTeams, setWomensTeams] = useState<Team[]>([]);
  const [youthTeams, setYouthTeams] = useState<Team[]>([]);

  // Use setTimeout to avoid blocking the main thread
  useEffect(() => {
    // First show UI immediately with loading state
    const timeoutId = setTimeout(() => {
      // Use dynamic import to avoid blocking bundle load
      import('../../src/services/firebase/config').then(({ firestore }) => {
        if (!firestore) {
          setError('Firebase not properly initialized');
          setLoading(false);
          return;
        }

        // Safely proceed with typed firestore instance
        const fetchTeams = async (firestoreInstance: Firestore) => {
          try {
            
            // Mens teams
            const mensQuery = query(
              collection(firestoreInstance, 'teams'),
              where('type', '==', 'club'),
              where('division', '==', "Men's Premier League")
            );
            
            const mensSnapshot = await getDocs(mensQuery);
            const mensData = mensSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Team));
          
            
            // If no data from Firestore, use mock data
            if (mensData.length === 0) {
              setMensTeams(mockTeams);
            } else {
              setMensTeams(mensData);
            }
            
            try {
              const womensQuery = query(
                collection(firestoreInstance, 'teams'),
                where('type', '==', 'club'),
                where('division', '==', "Women's Premier League")
              );
              
              const womensSnapshot = await getDocs(womensQuery);
              const womensData = womensSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as Team));
              

              setWomensTeams(womensData);
            } catch (e) {
              console.error('Error fetching women\'s teams:', e);
            }
            
            // Youth teams
            try {
              const youthQuery = query(
                collection(firestoreInstance, 'teams'),
                where('type', '==', 'club'),
                where('division', '==', "Youth League")
              );
              
              const youthSnapshot = await getDocs(youthQuery);
              const youthData = youthSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as Team));
              
              setYouthTeams(youthData);
            } catch (e) {
              console.error('Error fetching youth teams:', e);
            }
            
            setLoading(false);
          } catch (err) {
            console.error('Error fetching teams:', err);
            // Fallback to mock data on error
            setMensTeams(mockTeams);
            setError('Some team data could not be loaded');
            setLoading(false);
          }
        };

        // Start fetching data with the typed Firestore instance
        fetchTeams(firestore);
      }).catch(err => {
        console.error('Error importing Firebase config:', err);
        setError('Failed to initialize Firebase');
        setLoading(false);
      });
    }, 100); // Small delay to allow UI to render first

    return () => clearTimeout(timeoutId);
  }, []);

  // Navigate to all men's teams
  const handleViewAllMensTeams = () => {
    router.push("/teams?type=club&division=Men's Premier League");
  };
  
  // Navigate to all women's teams
  const handleViewAllWomensTeams = () => {
    router.push("/teams?type=club&division=Women's Premier League");
  };
  
  // Navigate to all youth teams
  const handleViewAllYouthTeams = () => {
    router.push("/teams?type=club&division=Youth League");
  };
  
  return (
    <LinearGradient
      colors={['#0047AB', '#191970', '#041E42']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <SimpleHeader title="Football Clubs" />
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading teams...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View>
              {/* Men's Premier League Section */}
              {mensTeams.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Men's Premier League</Text>
                  <SimpleTeamList 
                    teams={mensTeams} 
                    onViewAll={handleViewAllMensTeams} 
                  />
                </View>
              )}
              
              {/* Women's Premier League Section */}
              {womensTeams.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Women's Premier League</Text>
                  <SimpleTeamList 
                    teams={womensTeams} 
                    onViewAll={handleViewAllWomensTeams} 
                  />
                </View>
              )}
              
              {/* Youth Teams Section */}
              {youthTeams.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Youth Teams</Text>
                  <SimpleTeamList 
                    teams={youthTeams} 
                    onViewAll={handleViewAllYouthTeams} 
                  />
                </View>
              )}
              
              {/* Show message if no teams found */}
              {mensTeams.length === 0 && womensTeams.length === 0 && youthTeams.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Feather name="users" size={32} color="#9ca3af" />
                  <Text style={styles.emptyText}>No teams found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
});