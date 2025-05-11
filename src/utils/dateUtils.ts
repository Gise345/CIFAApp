// src/utils/dateUtils.ts
import { format, formatDistance, parseISO } from 'date-fns';

/**
 * Safely converts any date format (Firestore Timestamp, Date, string, number) to a JavaScript Date
 */
export const convertToDate = (dateValue: any): Date => {
  if (!dateValue) {
    return new Date(); // Return current date as fallback
  }
  
  // For Firestore Timestamp objects with toDate method
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // For standard Date objects
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // For string date representations
  if (typeof dateValue === 'string') {
    try {
      return parseISO(dateValue);
    } catch (e) {
      console.warn('Invalid date string format:', dateValue);
      return new Date(dateValue); // Fallback to standard Date constructor
    }
  }
  
  // For number timestamps (milliseconds)
  if (typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // Return current date if format is unknown
  console.warn('Unknown date format:', dateValue);
  return new Date();
};

/**
 * Safely converts any date format to milliseconds
 */
export const getMillis = (dateValue: any): number => {
  return convertToDate(dateValue).getTime();
};

/**
 * Formats a date in the common date format (e.g., "May 5, 2025")
 */
export const formatDate = (dateValue: any): string => {
  try {
    const date = convertToDate(dateValue);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a time from a date (e.g., "3:30 PM")
 */
export const formatTime = (dateValue: any): string => {
  try {
    const date = convertToDate(dateValue);
    return format(date, 'h:mm a');
  } catch (error) {
    console.warn('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Formats a date and time together (e.g., "May 5, 2025 at 3:30 PM")
 */
export const formatDateTime = (dateValue: any): string => {
  try {
    const date = convertToDate(dateValue);
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  } catch (error) {
    console.warn('Error formatting date and time:', error);
    return 'Invalid date';
  }
};

/**
 * Returns a relative time string (e.g., "2 days ago", "in 3 hours")
 */
export const formatRelativeTime = (dateValue: any): string => {
  try {
    const date = convertToDate(dateValue);
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return 'Unknown time';
  }
};

/**
 * Formats a date for API requests (ISO format)
 */
export const formatForApi = (dateValue: any): string => {
  try {
    const date = convertToDate(dateValue);
    return date.toISOString();
  } catch (error) {
    console.warn('Error formatting date for API:', error);
    return new Date().toISOString();
  }
};