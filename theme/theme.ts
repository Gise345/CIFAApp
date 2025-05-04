// CIFAMobileApp/theme/theme.ts
import Colors from './colors';

const Theme = {
  colors: {
    ...Colors.light,
    
    // Gradient colors
    gradients: {
      primary: {
        colors: ['#E50914', '#C41E3A'] as const, // Red 
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      secondary: {
        colors: ['#0047AB', '#191970'] as const, //  blue
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      dark: {
        colors: ['#0f0c29', '#302b63', '#24243e'] as const, // Dark blue gradient
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      match: {
        colors: ['#3a0ca3', '#4361ee'] as const, // Deep blue match gradient
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      feature: {
        colors: ['#7c3aed', '#3a0ca3'] as const, // Purple feature section
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
    },
    
    // Team colors
    teams: {
      cayman: '#ef4444', // Red
      scholars: '#1e40af', // Blue
      boddenTown: '#7e22ce', // Purple
      eliteSC: '#065f46', // Green
      futureSC: '#b45309', // Yellow/gold
      latinos: '#15803d', // Green
      academy: '#be123c', // Red
      cavalier: '#0369a1', // Blue
      avenger: '#b91c1c', // Red
      harbourView: '#1d4ed8', // Blue
    },
    
    // Section colors
    sections: {
      fixtures: '#111827', // Very dark blue
      teamUpdates: '#e1effe', // Light blue
      featuredMatch: '#2563eb', // Blue
      statistics: '#f3f4f6', // Light gray
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24,
      xxxl: 32,
    },
  },
};

export default Theme;