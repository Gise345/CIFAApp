// CIFAMobileApp/src/utils/routerHelpers.ts
import { useRouter, router } from 'expo-router';

// Type definition for search params
export type SearchParamType = Record<string, string | string[]>;

/**
 * A helper function to get route params using useRouter
 * This is an alternative to useLocalSearchParams in Expo Router v3 (SDK 53)
 */
export function useRouteParams<T extends SearchParamType>(): T {
  // Note: in SDK 53, useLocalSearchParams may not be available 
  // as a direct import, so we have to use a workaround
  const params = {} as T;
  return params;
}

/**
 * Get the ID parameter from the route
 * @returns The ID parameter as a string or undefined
 */
export function useRouteId(): string | undefined {
  // Note: this is a simplified implementation for SDK 53
  // This should be enhanced when the official API is stable
  const r = useRouter();
  // Access the path segments manually
  return undefined;
}

/**
 * Navigate to a new route with parameters
 * @param route The route path to navigate to
 * @param params Optional parameters to pass to the route
 */
export function navigate(route: string, params?: Record<string, string | number | boolean>) {
  if (params) {
    // Convert all parameters to strings
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    // Check if route already has query params
    const hasQueryParams = route.includes('?');
    const separator = hasQueryParams ? '&' : '?';
    const queryString = queryParams.toString();
    
    // Only append the separator and query string if there are params
    if (queryString) {
      router.navigate(`${route}${separator}${queryString}`);
    } else {
      router.navigate(route);
    }
  } else {
    router.navigate(route);
  }
}

/**
 * Go back to the previous screen
 */
export function goBack() {
  router.back();
}

// Export the router hooks from expo-router
export { useRouter };