// src/utils/logoMapper.ts
/**
 * This utility provides direct mappings from team IDs to their Firebase Storage URLs
 * based on the known URL patterns in your Firestore database.
 * This avoids Firebase Storage API calls which might be causing issues.
 */

// The base URL for all team logos
const FIREBASE_STORAGE_BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/cifa-mobile-app.firebasestorage.app/o/Team%20Logos%2F';
const MEDIA_QUERY = '?alt=media';

// Mapping of team name/ID prefixes to exact logo filenames
const TEAM_LOGO_FILENAMES: Record<string, string> = {
  // These are taken directly from your Firestore data
  // Premier League teams
  '345': '345FC-logo.jpeg',
  'academy': 'Academy-logo.jpeg',
  'boddentown': 'BoddenTown-logo.png',
  'elite': 'Elite-logo.svg',
  'scholars': 'Scholars-logo.png',
  'future': 'future_sc.png',
  'roma': 'Roma-logo.jpeg',
  
  // Other teams can be added here
  'sunset': 'Sunset-logo.png', // This one might not be accurate, placeholder
  'latinos': 'Latinos-logo.png', // This one might not be accurate, placeholder
  'national': 'National-logo.png', // This one might not be accurate, placeholder
};

/**
 * Gets a direct Firebase Storage URL for a team logo based on team ID
 * @param teamId The team ID string (e.g., 'elite-mpl')
 * @returns A direct URL to the team logo, or null if not found
 */
export const getDirectTeamLogoUrl = (teamId: string): string | null => {
  if (!teamId) return null;
  
  // Extract the prefix before the hyphen
  const prefix = teamId.split('-')[0];
  
  // Look up in our mapping
  if (TEAM_LOGO_FILENAMES[prefix]) {
    const filename = TEAM_LOGO_FILENAMES[prefix];
    // Convert spaces to %20 for URLs
    const encodedFilename = encodeURIComponent(filename);
    return `${FIREBASE_STORAGE_BASE_URL}${encodedFilename}${MEDIA_QUERY}`;
  }
  
  return null;
};

/**
 * Gets a direct Firebase Storage URL for a team logo based on team name
 * Used as a fallback if team ID is not available
 * @param teamName The team name (e.g., 'Elite SC')
 * @returns A direct URL to the team logo, or null if not found
 */
export const getDirectTeamLogoUrlFromName = (teamName: string): string | null => {
  if (!teamName) return null;
  
  // Check for known patterns
  if (teamName.includes('345')) {
    return getDirectTeamLogoUrl('345-mpl');
  }
  
  if (teamName.includes('Academy')) {
    return getDirectTeamLogoUrl('academy-mpl');
  }
  
  if (teamName.includes('Bodden')) {
    return getDirectTeamLogoUrl('boddentown-mpl');
  }
  
  if (teamName.includes('Elite')) {
    return getDirectTeamLogoUrl('elite-mpl');
  }
  
  if (teamName.includes('Scholars')) {
    return getDirectTeamLogoUrl('scholars-mpl');
  }
  
  if (teamName.includes('Future')) {
    return getDirectTeamLogoUrl('future-mpl');
  }
  
  if (teamName.includes('Roma')) {
    return getDirectTeamLogoUrl('roma-mpl');
  }
  
  if (teamName.includes('Sunset')) {
    return getDirectTeamLogoUrl('sunset-mpl');
  }
  
  if (teamName.includes('Latinos')) {
    return getDirectTeamLogoUrl('latinos-mpl');
  }
  
  if (teamName.includes('National')) {
    return getDirectTeamLogoUrl('national');
  }
  
  return null;
};

/**
 * Get team logo URL from either team ID or name
 * @param teamId Optional team ID
 * @param teamName Optional team name
 * @returns A direct URL to the team logo, or null if not found
 */
export const getTeamLogoUrl = (teamId?: string, teamName?: string): string | null => {
  // Try with team ID first
  if (teamId) {
    const urlFromId = getDirectTeamLogoUrl(teamId);
    if (urlFromId) return urlFromId;
  }
  
  // Fall back to team name
  if (teamName) {
    return getDirectTeamLogoUrlFromName(teamName);
  }
  
  return null;
};