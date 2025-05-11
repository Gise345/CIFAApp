// src/utils/router.ts - Fixed for SDK 53
import * as ExpoRouter from 'expo-router';

// Export the router instance directly
export const router = ExpoRouter.router;

// Type-safe wrapper for params with SDK 53 compatibility
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  try {
    // Try to use the SDK 53 method first (global search params)
    // @ts-ignore - SDK 53 type definitions may be evolving
    const params = ExpoRouter.useGlobalSearchParams();
    return params as T;
  } catch (error) {
    console.warn('Error using global params in SDK 53:', error);
    
    // Fallback to useLocalSearchParams if available
    try {
      // @ts-ignore - SDK 53 type definitions are evolving
      const localParams = ExpoRouter.useLocalSearchParams();
      return localParams as T;
    } catch (e) {
      console.warn('Error using local params in SDK 53:', e);
      return {} as T;
    }
  }
}

// Get a parameter value safely
export function getParam(params: Record<string, string | string[] | undefined>, name: string): string | null {
  const value = params[name];
  
  if (value === undefined) {
    return null;
  }
  
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  
  return value;
}

// Safe navigation methods for SDK 53
export function goToTeam(teamId: string): void {
  try {
    // Use the string-based navigation which is more compatible
    router.push(`/teams/${teamId}`);
  } catch (error) {
    console.error('Error navigating to team:', error);
    // Fallback to basic push
    try {
      // @ts-ignore - For SDK 53 compatibility
      router.push({
        pathname: '/teams/[id]',
        params: { id: teamId }
      });
    } catch (e) {
      console.error('Fallback navigation failed:', e);
    }
  }
}

export function goToPlayer(playerId: string): void {
  try {
    router.push(`/players/${playerId}`);
  } catch (error) {
    console.error('Error navigating to player:', error);
  }
}

export function goToFixture(fixtureId: string): void {
  try {
    router.push(`/fixtures/${fixtureId}`);
  } catch (error) {
    console.error('Error navigating to fixture:', error);
  }
}

export function goToLeague(leagueId: string): void {
  try {
    router.push(`/leagues/${leagueId}`);
  } catch (error) {
    console.error('Error navigating to league:', error);
  }
}

export function goBack(): void {
  try {
    router.back();
  } catch (error) {
    console.error('Error navigating back:', error);
  }
}