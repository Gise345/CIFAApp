// src/types/nationalTeam.ts

export interface NationalTeam {
    id: string;
    name: string;
    shortName: string;
    type: string; // 'mens', 'womens', 'youth-u17', 'youth-u20'
    logoUrl: string | null;
    bannerUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    homeVenue: string;
    coach: string;
    confederation: string;
    worldRanking: number | null;
    confederationRanking: number | null;
    bio: string;
    achievements: string[];
    stats: {
      matches: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
    }
  }
  
  export interface NationalTeamPlayer {
    id: string;
    name: string;
    shortName: string;
    photoUrl: string | null;
    position: string;
    jerseyNumber: number;
    dateOfBirth: string;
    club: string | null;
    height: number | null;
    weight: number | null;
    caps: number;
    goals: number;
    isCaptain: boolean;
  }
  
  export interface TeamInMatch {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
    score: number | null;
  }
  
  export interface MatchEvent {
    type: 'goal' | 'ownGoal' | 'penalty' | 'missedPenalty' | 'yellowCard' | 'redCard' | 'substitution';
    minute: number;
    teamId: string;
    playerId: string;
    playerName: string;
    secondPlayerId?: string; // For substitutions or assists
    secondPlayerName?: string;
  }
  
  export interface NationalTeamMatch {
    id: string;
    competition: string;
    stage: string;
    date: string;
    venue: string;
    city: string;
    country: string;
    homeTeam: TeamInMatch;
    awayTeam: TeamInMatch;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed';
    events: MatchEvent[];
  }