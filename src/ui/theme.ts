import type { AppThemePreference } from '../lib/storage';

export const colors = {
  background: '#171311',
  backgroundElevated: '#211b18',
  panel: '#2a221e',
  panelMuted: '#322924',
  border: '#473b34',
  textPrimary: '#f6f0e8',
  textSecondary: '#cfc0b1',
  textMuted: '#a49282',
  accent: '#d6b989',
  accentStrong: '#b99664',
  accentSoft: '#f0debf',
  success: '#92a784',
  successMuted: '#344033',
  danger: '#a96657',
  overlay: 'rgba(8, 6, 5, 0.52)'
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999
} as const;

export const typography = {
  micro: 11,
  caption: 13,
  body: 15,
  section: 18,
  title: 28,
  hero: 40
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 6
  }
};

export const themeOptions: {
  id: AppThemePreference;
  label: string;
  description: string;
  preview: [string, string, string];
}[] = [
  {
    id: 'warm-night',
    label: 'Warm Night',
    description: 'Current dark foundation with champagne contrast.',
    preview: ['#171311', '#2a221e', '#d6b989']
  },
  {
    id: 'sunset-pop',
    label: 'Sunset Pop',
    description: 'A more vibrant direction with warmer highlights for the next visual pass.',
    preview: ['#1a1110', '#39211a', '#e19a6d']
  },
  {
    id: 'olive-pulse',
    label: 'Olive Pulse',
    description: 'Keeps the dark base but pushes active states toward a livelier social tone.',
    preview: ['#151513', '#223026', '#9cb07f']
  }
];
