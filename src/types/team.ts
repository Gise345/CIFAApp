// CIFAMobileApp/src/types/team.ts

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  type: 'national' | 'club';
  division: string;
  colorPrimary?: string;
  colorSecondary?: string;
  venue?: string;
  foundedYear?: number;
  description?: string;
  leagueId?: string;
  website?: string;
  achievements?: string[];
  socialLinks?: {
    [platform: string]: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  teamId: string;
  photoUrl?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  nationality?: string;
  bio?: string;
  age?: number;
  createdAt?: any;
  updatedAt?: any;
}