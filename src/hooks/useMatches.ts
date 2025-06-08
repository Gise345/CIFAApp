// src/hooks/useMatches.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';
import { firestore } from '@/src/services/firebase/config';

interface Match {
  id: string;
  leagueId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: any;
  time: string;
  venue: string;
  competition: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  featured?: boolean;
}

interface UseMatchesOptions {
  status?: string;
  teamId?: string;
  leagueId?: string;
  competition?: string;
  pageSize?: number;
  realtime?: boolean;
}

interface UseMatchesReturn {
  matches: Match[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalCount: number;
}

// Cache for better performance
const matchesCache = new Map<string, { data: Match[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useMatches = (options: UseMatchesOptions = {}): UseMatchesReturn => {
  const {
    status,
    teamId,
    leagueId,
    competition,
    pageSize = 20,
    realtime = false
  } = options;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const initialLoadRef = useRef(true);

  // Check if firestore is available
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  // Create cache key based on options
  const getCacheKey = useCallback(() => {
    return `matches_${status || 'all'}_${teamId || 'all'}_${leagueId || 'all'}_${competition || 'all'}`;
  }, [status, teamId, leagueId, competition]);

  // Check cache first
  const getCachedData = useCallback(() => {
    const cacheKey = getCacheKey();
    const cached = matchesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [getCacheKey]);

  // Build query based on options
  const buildQuery = useCallback((isLoadMore = false) => {
    let baseQuery = query(
      collection(firestore!, 'matches'),
      orderBy('date', 'desc')
    );

    // Add filters
    if (status && status !== 'all') {
      baseQuery = query(baseQuery, where('status', '==', status));
    }

    if (teamId && teamId !== 'all') {
      baseQuery = query(baseQuery, where('teams', 'array-contains', teamId));
    }

    if (leagueId && leagueId !== 'all') {
      baseQuery = query(baseQuery, where('leagueId', '==', leagueId));
    }

    if (competition && competition !== 'all') {
      baseQuery = query(baseQuery, where('competition', '==', competition));
    }

    // Add pagination
    if (isLoadMore && lastDocRef.current) {
      baseQuery = query(baseQuery, startAfter(lastDocRef.current));
    }

    return query(baseQuery, limit(pageSize));
  }, [status, teamId, leagueId, competition, pageSize]);

  // Load matches with improved error handling
  const loadMatches = useCallback(async (isLoadMore = false, useCache = true) => {
    try {
      setError(null);
      
      if (!isLoadMore) {
        setLoading(true);
        lastDocRef.current = null;
        
        // Check cache for initial load
        if (useCache && initialLoadRef.current) {
          const cachedData = getCachedData();
          if (cachedData) {
            setMatches(cachedData);
            setLoading(false);
            setTotalCount(cachedData.length);
            initialLoadRef.current = false;
            return;
          }
        }
      }

      const matchesQuery = buildQuery(isLoadMore);
      
      // Use realtime listener or one-time fetch
      if (realtime && !isLoadMore) {
        // Clean up previous listener
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }

        unsubscribeRef.current = onSnapshot(
          matchesQuery,
          (snapshot) => {
            const matchesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Match));

            if (!isLoadMore) {
              setMatches(matchesData);
              setTotalCount(matchesData.length);
              
              // Cache the data
              const cacheKey = getCacheKey();
              matchesCache.set(cacheKey, {
                data: matchesData,
                timestamp: Date.now()
              });
            } else {
              setMatches(prev => [...prev, ...matchesData]);
            }

            // Update pagination
            if (snapshot.docs.length > 0) {
              lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
              setHasMore(snapshot.docs.length === pageSize);
            } else {
              setHasMore(false);
            }

            setLoading(false);
            initialLoadRef.current = false;
          },
          (error) => {
            console.error('Error in realtime matches listener:', error);
            setError('Failed to load matches');
            setLoading(false);
          }
        );
      } else {
        // One-time fetch with getDocs
        const snapshot = await getDocs(matchesQuery);
        
        const matchesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Match));

        if (isLoadMore) {
          setMatches(prev => [...prev, ...matchesData]);
        } else {
          setMatches(matchesData);
          setTotalCount(matchesData.length);
          
          // Cache the data
          const cacheKey = getCacheKey();
          matchesCache.set(cacheKey, {
            data: matchesData,
            timestamp: Date.now()
          });
        }

        // Update pagination
        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
          setHasMore(snapshot.docs.length === pageSize);
        } else {
          setHasMore(false);
        }

        setLoading(false);
        initialLoadRef.current = false;
      }
    } catch (err) {
      console.error('Error loading matches:', err);
      setError('Failed to load matches. Please try again.');
      setLoading(false);
    }
  }, [buildQuery, realtime, pageSize, getCacheKey, getCachedData]);

  // Load more matches for pagination
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadMatches(true, false);
    }
  }, [loading, hasMore, loadMatches]);

  // Refresh matches
  const refresh = useCallback(async () => {
    lastDocRef.current = null;
    setHasMore(true);
    await loadMatches(false, false);
  }, [loadMatches]);

  // Initial load and cleanup
  useEffect(() => {
    initialLoadRef.current = true;
    loadMatches(false, true);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [status, teamId, leagueId, competition, realtime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    matches,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount
  };
};

// Hook for getting specific match by ID
export const useMatch = (matchId: string) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId || !firestore) return;

    const loadMatch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const matchDoc = await getDoc(doc(firestore!, 'matches', matchId));
        
        if (matchDoc.exists()) {
          setMatch({ id: matchDoc.id, ...matchDoc.data() } as Match);
        } else {
          setError('Match not found');
        }
      } catch (err) {
        console.error('Error loading match:', err);
        setError('Failed to load match');
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  return { match, loading, error };
};

// Hook for live match updates
export const useLiveMatches = () => {
  return useMatches({ 
    status: 'live', 
    realtime: true,
    pageSize: 10 
  });
};

// Hook for upcoming matches
export const useUpcomingMatches = (limit: number = 5) => {
  return useMatches({ 
    status: 'scheduled', 
    pageSize: limit 
  });
};

// Hook for recent results
export const useRecentResults = (limit: number = 5) => {
  return useMatches({ 
    status: 'completed', 
    pageSize: limit 
  });
};

// Clear cache utility
export const clearMatchesCache = () => {
  matchesCache.clear();
};