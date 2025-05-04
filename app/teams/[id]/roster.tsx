// CIFAMobileApp/app/teams/[id]/roster.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import TeamRoster from '../../../src/components/teams/TeamRoster';
import { useTeams } from '../../../src/hooks/useTeams';

export default function TeamRosterScreen() {
  const { id } = useLocalSearchParams();
  const teamId = Array.isArray(id) ? id[0] : id;
  
  const { selectedTeam, loadTeamData } = useTeams();
  const [refreshing, setRefreshing] = useState(false);
  const [activePosition, setActivePosition] = useState<string | null>(null);
  
  // Positions that can be filtered
  const positions = ["All", "Goalkeepers", "Defenders", "Midfielders", "Forwards"];
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (teamId) {
      await loadTeamData(teamId);
    }
    setRefreshing(false);
  };
  
  return (
    <LinearGradient
      colors={[selectedTeam?.colorPrimary || '#2563eb', '#191970', '#041E42']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* Squad Title */}
        <View style={styles.headerSection}>
          <Text style={styles.teamName}>{selectedTeam?.name || 'Team'}</Text>
          <Text style={styles.squadTitle}>Squad</Text>
        </View>
        
        {/* Position Filter */}
        <View style={styles.positionFilter}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {positions.map(position => (
              <TouchableOpacity
                key={position}
                style={[
                  styles.positionTab,
                  (position === 'All' && activePosition === null) || activePosition === position
                    ? styles.activePositionTab
                    : {}
                ]}
                onPress={() => setActivePosition(position === 'All' ? null : position)}
              >
                <Text 
                  style={[
                    styles.positionTabText,
                    (position === 'All' && activePosition === null) || activePosition === position
                      ? styles.activePositionTabText
                      : {}
                  ]}
                >
                  {position}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Player List */}
        <View style={styles.rosterContainer}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <TeamRoster teamId={teamId} />
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  headerSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  teamName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  squadTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  positionFilter: {
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 8,
  },
  positionTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activePositionTab: {
    backgroundColor: 'white',
  },
  positionTabText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  activePositionTabText: {
    color: '#2563eb',
  },
  rosterContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});