// src/constants/LeagueTypes.ts - Updated to reorder leagues

export type LeagueType = 'mens' | 'womens' | 'boys' | 'girls';

export interface LeagueCategory {
  id: string;
  label: string;
  type: LeagueType;
  division?: string;
  ageGroup?: string;
  color?: string;
  order?: number; // Added for explicit ordering
}

// These are predefined categories that can be used as fallbacks if no leagues
// are found in Firestore. They should have unique IDs.
export const LEAGUE_CATEGORIES: LeagueCategory[] = [
  // Men's Premier League (1st)
  {
    id: 'mens-premier-league',
    label: "Men's Premier League",
    type: 'mens',
    division: 'Premier',
    color: '#2563eb', // Blue
    order: 1
  },
  {
    id: 'cayman-mens-premier-league',
    label: "CIFA Men's Premier League",
    type: 'mens',
    division: 'Premier',
    color: '#2563eb', // Blue
    order: 1
  },
  // Women's Premier League (2nd)
  {
    id: 'womens-premier-league',
    label: "Women's Premier League",
    type: 'womens',
    division: 'Premier',
    color: '#db2777', // Pink
    order: 2
  },
  // Men's First Division (3rd)
  {
    id: 'mens-first-division',
    label: "Men's First Division",
    type: 'mens',
    division: 'First',
    color: '#4338ca', // Indigo
    order: 3
  },
  // Youth Divisions (4th)
  {
    id: 'boys-u17-league',
    label: "Boys U-17",
    type: 'boys',
    ageGroup: 'U-17',
    color: '#059669', // Green
    order: 4
  },
  {
    id: 'girls-u17-league',
    label: "Girls U-17",
    type: 'girls',
    ageGroup: 'U-17',
    color: '#d946ef', // Fuchsia
    order: 4
  },
  {
    id: 'boys-u15-league',
    label: "Boys U-15",
    type: 'boys',
    ageGroup: 'U-15',
    color: '#65a30d', // Lime
    order: 4
  },
  {
    id: 'girls-u15-league',
    label: "Girls U-15",
    type: 'girls',
    ageGroup: 'U-15',
    color: '#c026d3', // Purple
    order: 4
  },
  // Championship Premier Leagues (Men) (5th)
  {
    id: 'mens-championship-league',
    label: "Men's Championship League",
    type: 'mens',
    division: 'Championship',
    color: '#0891b2', // Cyan
    order: 5
  },
  // Championship Premier Leagues (Women) (6th)
  {
    id: 'womens-championship-league',
    label: "Women's Championship League",
    type: 'womens',
    division: 'Championship',
    color: '#be185d', // Rose
    order: 6
  }
];

// Get sorted league categories in the specified order
export const getSortedLeagueCategories = (): LeagueCategory[] => {
  return [...LEAGUE_CATEGORIES].sort((a, b) => (a.order || 999) - (b.order || 999));
};

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