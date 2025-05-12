// src/utils/teamUtils.ts

/**
 * Utility functions for team data
 */

/**
 * Get team logo URL from Firebase Storage
 * @param teamId Team ID
 * @returns URL string or null if not available
 */
export const getTeamLogoUrl = (teamId: string): string | null => {
    if (!teamId) return null;
    
    // This pattern should match your Firebase Storage setup
    // Modify the URL pattern to match your actual Firebase project and storage structure
    return `https://firebasestorage.googleapis.com/v0/b/cifa-mobile-app.appspot.com/o/teams%2F${teamId}%2Flogo.jpg?alt=media`;
  };
  
  /**
   * Get team initials from team name
   * @param teamName Name of the team
   * @returns Initials string
   */
  export const getTeamInitials = (teamName: string): string => {
    if (!teamName) return '';
    
    const words = teamName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    
    // Return first letter of each word (up to 3)
    return words
      .slice(0, 3)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  /**
   * Generate a team color from team name (for consistent colors)
   * @param teamName Team name
   * @returns Hex color string
   */
  export const getTeamColor = (teamName: string): string => {
    const colors = [
      '#2563eb', // Blue
      '#16a34a', // Green
      '#7e22ce', // Purple
      '#ca8a04', // Yellow/gold
      '#ef4444', // Red
      '#0891b2', // Cyan
      '#9333ea', // Indigo
      '#f97316', // Orange
      '#14b8a6', // Teal
      '#84cc16', // Lime
    ];
    
    // Simple hash function to get consistent index
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };