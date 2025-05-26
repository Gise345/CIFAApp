// app/_layout.tsx - Fixed Root Layout (Remove non-existent routes)
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import FirebaseProvider from '../src/providers/FirebaseProvider';


export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <FirebaseProvider>
      <RootLayoutNav />
    </FirebaseProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        {/* Only include routes that actually exist */}
        <Stack.Screen name="highlights" />
        <Stack.Screen name="fixtures/[id]" />
        <Stack.Screen name="leagues/[id]/fixtures" />
        <Stack.Screen name="leagues/[id]/results" />
        <Stack.Screen name="leagues/[id]/standings" />
        <Stack.Screen name="news/[id]" />
        <Stack.Screen name="players/[id]" />
        <Stack.Screen name="stats/fixtures-results" />
        <Stack.Screen name="stats/team-stats-detail" />
        <Stack.Screen name="stats/team-stats" />
        <Stack.Screen name="stats/top-scorers" />
        <Stack.Screen name="teams/[id]" />
      </Stack>
    </ThemeProvider>
  );
}