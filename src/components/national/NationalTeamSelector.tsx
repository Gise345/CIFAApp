// src/components/national/NationalTeamSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

type TeamType = 'mens' | 'womens' | 'youth-u17' | 'youth-u20';

interface NationalTeamSelectorProps {
  activeTeam: TeamType;
  onTeamChange: (team: TeamType) => void;
}

const NationalTeamSelector: React.FC<NationalTeamSelectorProps> = ({
  activeTeam,
  onTeamChange
}) => {
  const teams: { type: TeamType; label: string }[] = [
    { type: 'mens', label: "Men's Team" },
    { type: 'womens', label: "Women's Team" },
    { type: 'youth-u17', label: "U-17 Team" },
    { type: 'youth-u20', label: "U-20 Team" }
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {teams.map(team => (
          <TouchableOpacity
            key={team.type}
            style={[
              styles.teamButton,
              activeTeam === team.type && styles.activeTeamButton
            ]}
            onPress={() => onTeamChange(team.type)}
          >
            <Text
              style={[
                styles.teamText,
                activeTeam === team.type && styles.activeTeamText
              ]}
            >
              {team.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  teamButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeTeamButton: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  teamText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  activeTeamText: {
    color: '#111827',
  }
});

export default NationalTeamSelector;