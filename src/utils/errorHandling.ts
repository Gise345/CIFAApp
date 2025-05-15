// src/utils/errorHandling.ts
/**
 * Helper utility to handle API errors and provide consistent error messages
 */

/**
 * Process an error from an API call and return a standardized error message
 * @param error The error object thrown
 * @param context Optional context to add to the error message
 * @returns A user-friendly error message
 */
export const handleApiError = (error: any, context?: string): string => {
    console.error(`API Error${context ? ` (${context})` : ''}:`, error);
    
    // Extract error message if it exists
    let errorMessage = 'An unexpected error occurred.';
    
    if (error && error.message) {
      // Firebase errors often have a message property
      errorMessage = error.message;
      
      // Clean up common Firebase error messages
      if (errorMessage.includes('Firebase: Error')) {
        errorMessage = errorMessage.replace('Firebase: Error', 'Error');
      }
      
      // Handle network errors
      if (errorMessage.includes('network request failed')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      }
      
      // Handle permission errors
      if (errorMessage.includes('permission-denied') || errorMessage.includes('Permission denied')) {
        errorMessage = 'You do not have permission to access this data.';
      }
      
      // Handle not found errors
      if (errorMessage.includes('not-found') || errorMessage.includes('No document to update')) {
        errorMessage = 'The requested data could not be found.';
      }
    }
    
    // Add context if provided
    if (context) {
      errorMessage = `${errorMessage} Please try again or contact support if the issue persists.`;
    }
    
    return errorMessage;
  };
  
  /**
   * Utility to handle refreshing data with a loading state and error handling
   * @param loadingStateSetter Function to set loading state
   * @param errorStateSetter Function to set error state
   * @param fetchFunction Async function to fetch data
   */
  export const handleDataRefresh = async <T,>(
    loadingStateSetter: (state: boolean) => void,
    errorStateSetter: (error: string | null) => void,
    fetchFunction: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    loadingStateSetter(true);
    errorStateSetter(null);
    
    try {
      const result = await fetchFunction();
      loadingStateSetter(false);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error, context);
      errorStateSetter(errorMessage);
      loadingStateSetter(false);
      return null;
    }
  };