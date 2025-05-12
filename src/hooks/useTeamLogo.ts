// src/hooks/useTeamLogo.ts
import { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase/config';

/**
 * Custom hook for loading team logos with fallback options
 * @param teamName Name of the team
 * @param teamId Optional team ID for additional lookup options
 * @returns Object containing logo URL, loading state, and error state
 */
const useTeamLogo = (teamName: string, teamId?: string) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      if (!teamName || !storage) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        let url: string | null = null;
        
        // Try multiple filename formats based on the observed patterns
        const formats = [
          // 1. Try with team name (common format in team documents)
          // Format: "Team Logos/{TeamNameNoSpaces}-logo.{extension}"
          { path: `Team Logos/${teamName.replace(/\s+/g, '')}-logo.jpeg` },
          { path: `Team Logos/${teamName.replace(/\s+/g, '')}-logo.png` }, 
          { path: `Team Logos/${teamName.replace(/\s+/g, '')}-logo.svg` },
          
          // 2. Try with team name with spaces replaced by underscore
          { path: `Team Logos/${teamName.replace(/\s+/g, '_')}-logo.jpeg` },
          { path: `Team Logos/${teamName.replace(/\s+/g, '_')}-logo.png` },
          { path: `Team Logos/${teamName.replace(/\s+/g, '_')}-logo.svg` },
          
          // 3. Try with team ID prefix (if provided)
          ...(teamId ? [
            { path: `Team Logos/${teamId.split('-')[0]}-logo.jpeg` },
            { path: `Team Logos/${teamId.split('-')[0]}-logo.png` },
            { path: `Team Logos/${teamId.split('-')[0]}-logo.svg` }
          ] : []),
          
          // 4. Try with first part of team name (for clubs like "Academy Sports Club")
          { path: `Team Logos/${teamName.split(' ')[0]}-logo.jpeg` },
          { path: `Team Logos/${teamName.split(' ')[0]}-logo.png` },
          { path: `Team Logos/${teamName.split(' ')[0]}-logo.svg` }
        ];
        
        // Try each format sequentially until we find a match
        for (const format of formats) {
          try {
            const logoRef = ref(storage, format.path);
            url = await getDownloadURL(logoRef);
            if (url) break; // Stop trying once we find a URL
          } catch (e) {
            // Continue to the next format if this one fails
            continue;
          }
        }
        
        // If we found a URL, set it
        if (url) {
          setLogoUrl(url);
          setError(false);
        } else {
          // If all formats failed, set error
          setError(true);
        }
      } catch (err) {
        console.warn(`Error fetching logo for team: ${teamName}`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [teamName, teamId]);

  return { logoUrl, loading, error };
};

export default useTeamLogo;