import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

import type { AppThemePreference } from '../lib/storage';
import { useAuth } from '../state/AuthContext';

export type ThemeColors = {
  primary: string;
  primaryHover: string;
  primaryText: string;
  secondary: string;
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  error: string;
  warning: string;
  highlight: string;
  success: string;
  successMuted: string;
  successText: string;
  badgeAccentBackground: string;
  badgeNeutralBackground: string;
  overlay: string;
  glowTop: string;
  glowBottom: string;
};

export type AppTheme = {
  id: AppThemePreference;
  label: string;
  description: string;
  preview: [string, string, string];
  colors: ThemeColors;
};

const defaultTheme: AppTheme = {
  id: 'default',
  label: 'Default',
  description: 'Current warm premium palette with champagne contrast.',
  preview: ['#171311', '#2a221e', '#d6b989'],
  colors: {
    primary: '#d6b989',
    primaryHover: '#b99664',
    primaryText: '#221912',
    secondary: '#92a784',
    background: '#171311',
    backgroundElevated: '#211b18',
    surface: '#2a221e',
    surfaceMuted: '#322924',
    border: '#473b34',
    borderStrong: '#5a4d44',
    textPrimary: '#f6f0e8',
    textSecondary: '#cfc0b1',
    textMuted: '#a49282',
    error: '#a96657',
    warning: '#c89656',
    highlight: '#f0debf',
    success: '#92a784',
    successMuted: '#344033',
    successText: '#d4e5ca',
    badgeAccentBackground: '#3d3125',
    badgeNeutralBackground: '#211b18',
    overlay: 'rgba(8, 6, 5, 0.52)',
    glowTop: '#2a241f',
    glowBottom: '#1f2420'
  }
};

const geoTheme: AppTheme = {
  id: 'geo-style',
  label: 'Geo Style',
  description: 'Darker competitive palette with green primary and sharper contrast.',
  preview: ['#121212', '#1E1E1E', '#00C853'],
  colors: {
    primary: '#00C853',
    primaryHover: '#009624',
    primaryText: '#04120a',
    secondary: '#2196F3',
    background: '#121212',
    backgroundElevated: '#181818',
    surface: '#1E1E1E',
    surfaceMuted: '#252525',
    border: '#2C2C2C',
    borderStrong: '#404040',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#8D8D8D',
    error: '#F44336',
    warning: '#FF9800',
    highlight: '#FFD600',
    success: '#00C853',
    successMuted: '#11321d',
    successText: '#d7ffe3',
    badgeAccentBackground: '#3c3510',
    badgeNeutralBackground: '#232323',
    overlay: 'rgba(4, 4, 4, 0.6)',
    glowTop: '#10231a',
    glowBottom: '#102232'
  }
};

export const appThemes: Record<AppThemePreference, AppTheme> = {
  default: defaultTheme,
  'geo-style': geoTheme
};

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

export const themeOptions = Object.values(appThemes).map((theme) => ({
  id: theme.id,
  label: theme.label,
  description: theme.description,
  preview: theme.preview
}));

const ThemeContext = createContext<AppTheme>(defaultTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  const { themePreference } = useAuth();
  const theme = useMemo(() => appThemes[themePreference] ?? defaultTheme, [themePreference]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
