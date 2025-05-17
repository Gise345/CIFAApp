// src/utils/statsNavigationHelper.ts
import { router } from 'expo-router';

/**
 * Helper utility for navigating to different statistical sections in the app
 */
export const navigateToTopScorers = (categoryId: string) => {
  router.push(`/stats/top-scorers?categoryId=${categoryId}`);
};

export const navigateToTeamStats = (categoryId: string) => {
  router.push(`/stats/team-stats-detail?categoryId=${categoryId}`);
};

export const navigateToLeagueTable = (leagueId: string) => {
  router.push(`/leagues/${leagueId}/standings`);
};

export const navigateToFixturesResults = (categoryId: string) => {
  router.push(`/stats/fixtures-results?categoryId=${categoryId}`);
};

export const navigateToMatchDetail = (matchId: string) => {
  router.push(`/fixtures/${matchId}`);
};

export const navigateToTeamDetail = (teamId: string) => {
  router.push(`/teams/${teamId}`);
};

export const navigateToPlayerDetail = (playerId: string) => {
  router.push(`/players/${playerId}`);
};

/**
 * Go back to main stats page
 */
export const backToStats = () => {
  router.push('/stats');
};

/**
 * Navigate back in the stack
 */
export const goBack = () => {
  router.back();
};