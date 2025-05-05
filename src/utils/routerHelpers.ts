// CIFAMobileApp/src/utils/routerHelpers.ts

// This helper file contains functions to deal with Expo Router v3 parameters
// with TypeScript in SDK 53

/**
 * Helper function to safely get a parameter value from Expo Router path segments
 * Works with the new API in SDK 53
 */
export function getParamFromSegment(segments: Record<string, string | string[]>, paramName: string): string | null {
  const param = segments[paramName];
  
  if (!param) {
    return null;
  }
  
  if (Array.isArray(param)) {
    return param[0] || null;
  }
  
  return param;
}

/**
 * Helper function to get team ID from URL path in team detail screens
 * For use in the app/teams/[id]/ directory
 */
export function getTeamIdFromPath(segments: Record<string, string | string[]>): string | null {
  return getParamFromSegment(segments, 'id');
}

/**
 * Helper function to get player ID from URL path in player detail screens
 * For use in the app/players/[id].tsx file
 */
export function getPlayerIdFromPath(segments: Record<string, string | string[]>): string | null {
  return getParamFromSegment(segments, 'id');
}

/**
 * Helper function to get fixture ID from URL path in fixture detail screens
 * For use in the app/fixtures/[id].tsx file
 */
export function getFixtureIdFromPath(segments: Record<string, string | string[]>): string | null {
  return getParamFromSegment(segments, 'id');
}

/**
 * Helper function to get league ID from URL path in league screens
 * For use in the app/leagues/[id]/ directory
 */
export function getLeagueIdFromPath(segments: Record<string, string | string[]>): string | null {
  return getParamFromSegment(segments, 'id');
}