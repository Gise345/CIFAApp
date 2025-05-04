// CIFAMobileApp/src/constants/LeagueTypes.ts

export type LeagueType = 'mens' | 'womens' | 'boys' | 'girls';

export interface LeagueCategory {
  id: string;
  label: string;
  type: LeagueType;
  division?: string;
  ageGroup?: string;
  color?: string;
}

export const LEAGUE_CATEGORIES: LeagueCategory[] = [
  {
    id: 'mens-premier',
    label: "Men's Premier League",
    type: 'mens',
    division: 'Premier',
    color: '#2563eb' // Blue
  },
  {
    id: 'womens-premier',
    label: "Women's Premier League",
    type: 'womens',
    division: 'Premier',
    color: '#db2777' // Pink
  },
  {
    id: 'mens-first',
    label: "Men's First Division",
    type: 'mens',
    division: 'First',
    color: '#4338ca' // Indigo
  },
  {
    id: 'boys-u17',
    label: "Boys U-17",
    type: 'boys',
    ageGroup: 'U-17',
    color: '#059669' // Green
  },
  {
    id: 'girls-u17',
    label: "Girls U-17",
    type: 'girls',
    ageGroup: 'U-17',
    color: '#d946ef' // Fuchsia
  },
  {
    id: 'boys-u15',
    label: "Boys U-15",
    type: 'boys',
    ageGroup: 'U-15',
    color: '#65a30d' // Lime
  },
  {
    id: 'girls-u15',
    label: "Girls U-15",
    type: 'girls',
    ageGroup: 'U-15',
    color: '#c026d3' // Purple
  }
];

export const getLeagueCategoryById = (id: string): LeagueCategory | undefined => {
  return LEAGUE_CATEGORIES.find(category => category.id === id);
};

export const getLeagueCategoryByTypeAndDivision = (
  type: LeagueType, 
  division?: string, 
  ageGroup?: string
): LeagueCategory | undefined => {
  return LEAGUE_CATEGORIES.find(category => 
    category.type === type && 
    category.division === division && 
    category.ageGroup === ageGroup
  );
};