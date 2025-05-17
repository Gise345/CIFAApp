// src/utils/navigation.ts
import { router } from 'expo-router';

/**
 * Navigation utility for the CIFA Mobile App
 * Provides consistent navigation throughout the app
 */

// Main tabs
export const navigateToHome = () => {
  router.push('/');
};

export const navigateToStats = () => {
  router.push('/stats');
};

export const navigateToClubs = () => {
  router.push('/clubs');
};

export const navigateToNational = () => {
  router.push('/national');
};

export const navigateToNews = () => {
  router.push('/news');
};

export const navigateToMore = () => {
  router.push('/more');
};

// Stats and League Routes
export const navigateToLeagueStats = (leagueId: string) => {
  router.push(`/stats?leagueId=${leagueId}`);
};

export const navigateToLeagueStandings = (leagueId: string) => {
  router.push(`/leagues/${leagueId}/standings`);
};

export const navigateToLeagueFixtures = (leagueId: string) => {
  router.push(`/leagues/${leagueId}/fixtures`);
};

export const navigateToTopScorers = (categoryId: string) => {
  router.push(`/stats/top-scorers?categoryId=${categoryId}`);
};

export const navigateToTeamStats = (categoryId: string) => {
  router.push(`/stats/team-stats-detail?categoryId=${categoryId}`);
};

// Team Routes
export const navigateToTeamProfile = (teamId: string) => {
  router.push(`/teams/${teamId}`);
};

export const navigateToTeamFixtures = (teamId: string) => {
  router.push(`/teams/${teamId}/fixtures`);
};

export const navigateToTeamSquad = (teamId: string) => {
  router.push(`/teams/${teamId}/squad`);
};

export const navigateToTeamStatsPage = (teamId: string) => {
  router.push(`/teams/${teamId}/stats`);
};

// Match and Fixture Routes
export const navigateToFixtureDetails = (fixtureId: string) => {
  router.push(`/fixtures/${fixtureId}`);
};

export const navigateToLiveMatch = (matchId: string) => {
  router.push(`/matches/live/${matchId}`);
};

// Player Routes
export const navigateToPlayerProfile = (playerId: string) => {
  router.push(`/players/${playerId}`);
};

// News Routes
export const navigateToNewsArticle = (newsId: string) => {
  router.push(`/news/${newsId}`);
};

// Return to previous screen
export const goBack = () => {
  router.back();
};

// Utility for building route params
export const buildQueryParams = (params: Record<string, string | number | boolean>) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  return queryParams.toString();
};