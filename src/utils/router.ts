// CIFAMobileApp/src/utils/router.ts
import * as ExpoRouter from 'expo-router';

// Export the router instance
export const router = ExpoRouter.router;

// Type-safe wrapper for params with SDK 53 compatibility
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  // Get dynamic segments from URL path
  const segments = ExpoRouter.useSegments();
  const dynamicSegment = segments ? segments[segments.length - 1] : '';
  
  try {
    // Try to use the SDK 53 method first
    // @ts-ignore - SDK 53 type definitions are evolving
    const params = ExpoRouter.useGlobalSearchParams();
    
    // If we have an ID from the dynamic segment, add it to params
    const result = {...params};
    if (dynamicSegment && !result.id) {
      result.id = dynamicSegment;
    }
    
    return result as T;
  } catch (error) {
    console.warn('Error using params in SDK 53:', error);
    // Return at least the ID from segments if available
    return { id: dynamicSegment } as unknown as T;
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