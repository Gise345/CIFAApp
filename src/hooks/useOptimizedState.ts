// src/hooks/useOptimizedState.ts
import { useCallback, useRef, useState } from 'react';

/**
 * Optimized state hook that prevents unnecessary updates
 */
export const useOptimizedState = <T>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  const previousValueRef = useRef<T>(initialValue);

  const setOptimizedState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevState)
        : newValue;
      
      // Only update if value actually changed
      if (JSON.stringify(nextState) !== JSON.stringify(previousValueRef.current)) {
        previousValueRef.current = nextState;
        return nextState;
      }
      
      return prevState;
    });
  }, []);

  return [state, setOptimizedState] as const;
};

/**
 * Hook for managing loading states efficiently
 */
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => {
      if (prev[key] === isLoading) return prev;
      return { ...prev, [key]: isLoading };
    });
  }, []);

  const isLoading = useCallback((key: string) => loadingStates[key] || false, [loadingStates]);

  const isAnyLoading = useCallback(() => Object.values(loadingStates).some(Boolean), [loadingStates]);

  return { setLoading, isLoading, isAnyLoading };
};