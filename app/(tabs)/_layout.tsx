// CIFAMobileApp/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons  } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: '#191970', // Dark blue background
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#E50914', // Red for active tabs
        tabBarInactiveTintColor: '#90A4ED', // Light purple for inactive tabs
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -5,
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: "Clubs",
          tabBarIcon: ({ color }) => <Feather name="shield" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="national"
        options={{
          title: "National",
          tabBarIcon: ({ color }) => <Feather name="award" size={22} color={color} />,
        }}
      />
      
      <Tabs.Screen 
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color }) => (
            <Feather name="file-text" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => <Feather name="menu" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}