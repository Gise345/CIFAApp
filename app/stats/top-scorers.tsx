import React from 'react';
import { View, Text } from 'react-native';
import TopScorers from '../../src/components/tables/TopScorers';

// This is what's missing - you need to have a default export
export default function TopScorersScreen() {
  return (
    <View>
      <TopScorers categoryId="mensPremier" />
    </View>
  );
}