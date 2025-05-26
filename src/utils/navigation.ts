// src/utils/navigation.ts - Fixed for SDK 53
import { router } from 'expo-router';

/**
 * Navigation utility for the CIFA Mobile App
 * Provides consistent navigation throughout the app with SDK 53 compatibility
 */

// Safe navigation wrapper
const safeNavigate = (route: string) => {
  try {
    router.push(route as any);
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback navigation
    try {
      router.replace(route as any);
    } catch (fallbackError) {
      console.error('Fallback navigation also failed:', fallbackError);
    }
  }
};

// Main tabs
export const navigateToHome = () => {
  safeNavigate('/(tabs)/');
};

export const navigateToStats = () => {
  safeNavigate('/(tabs)/stats');
};

export const navigateToClubs = () => {
  safeNavigate('/(tabs)/clubs');
};

export const navigateToNational = () => {
  safeNavigate('/(tabs)/national');
};

export const navigateToNews = () => {
  safeNavigate('/(tabs)/news');
};

export const navigateToMore = () => {
  safeNavigate('/(tabs)/more');
};

// Admin routes
export const navigateToAdmin = () => {
  safeNavigate('/admin');
};

export const navigateToAdminNews = () => {
  safeNavigate('/admin/news');
};

export const navigateToAdminMatches = () => {
  safeNavigate('/admin/matches');
};

export const navigateToAdminTeams = () => {
  safeNavigate('/admin/teams');
};

export const navigateToAdminUsers = () => {
  safeNavigate('/admin/users');
};

export const navigateToAdminNotifications = () => {
  safeNavigate('/admin/notifications');
};

export const navigateToFirebaseTest = () => {
  safeNavigate('/admin/firebase-test');
};

// Auth routes
export const navigateToLogin = () => {
  safeNavigate('/(auth)/login');
};

export const navigateToRegister = () => {
  safeNavigate('/(auth)/register');
};

// Profile and settings
export const navigateToProfile = () => {
  safeNavigate('/profile');
};

export const navigateToNotificationSettings = () => {
  safeNavigate('/notification-settings');
};

// Stats and League Routes
export const navigateToLeagueStats = (leagueId: string) => {
  safeNavigate(`/stats?leagueId=${leagueId}`);
};

export const navigateToLeagueStandings = (leagueId: string) => {
  safeNavigate(`/leagues/${leagueId}/standings`);
};

export const navigateToLeagueFixtures = (leagueId: string) => {
  safeNavigate(`/leagues/${leagueId}/fixtures`);
};

export const navigateToTopScorers = (categoryId: string) => {
  safeNavigate(`/stats/top-scorers?categoryId=${categoryId}`);
};

export const navigateToTeamStats = (categoryId: string) => {
  safeNavigate(`/stats/team-stats-detail?categoryId=${categoryId}`);
};

// Team Routes
export const navigateToTeamProfile = (teamId: string) => {
  safeNavigate(`/teams/${teamId}`);
};

export const navigateToTeamFixtures = (teamId: string) => {
  safeNavigate(`/teams/${teamId}/fixtures`);
};

export const navigateToTeamSquad = (teamId: string) => {
  safeNavigate(`/teams/${teamId}/squad`);
};

export const navigateToTeamStatsPage = (teamId: string) => {
  safeNavigate(`/teams/${teamId}/stats`);
};

// Match and Fixture Routes
export const navigateToFixtureDetails = (fixtureId: string) => {
  safeNavigate(`/fixtures/${fixtureId}`);
};

export const navigateToLiveMatch = (matchId: string) => {
  safeNavigate(`/matches/live/${matchId}`);
};

// Player Routes
export const navigateToPlayerProfile = (playerId: string) => {
  safeNavigate(`/players/${playerId}`);
};

// News Routes
export const navigateToNewsArticle = (newsId: string) => {
  safeNavigate(`/news/${newsId}`);
};

// Return to previous screen
export const goBack = () => {
  try {
    router.back();
  } catch (error) {
    console.error('Back navigation error:', error);
    // Fallback to home
    navigateToHome();
  }
};

// Replace current route
export const replaceRoute = (route: string) => {
  try {
    router.replace(route as any);
  } catch (error) {
    console.error('Replace navigation error:', error);
  }
};

// Utility for building route params
export const buildQueryParams = (params: Record<string, string | number | boolean>) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  return queryParams.toString();
};