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
  family: 'neutral' | 'legacy';
  mode: 'light' | 'dark';
  colors: ThemeColors;
};

type ThemeOption = {
  id: AppThemePreference;
  preview: [string, string, string];
};

const neutralLightTheme: AppTheme = {
  id: 'neutral-light',
  family: 'neutral',
  mode: 'light',
  colors: {
    primary: '#171717',
    primaryHover: '#2b2b2b',
    primaryText: '#F4F0E8',
    secondary: '#727272',
    background: '#ECE7DD',
    backgroundElevated: '#E4DDD2',
    surface: '#F6F2EA',
    surfaceMuted: '#ECE6DB',
    border: '#D1C8BB',
    borderStrong: '#BBB1A3',
    textPrimary: '#171717',
    textSecondary: '#5D584F',
    textMuted: '#847D72',
    error: '#B24B44',
    warning: '#A97120',
    highlight: '#111111',
    success: '#346A50',
    successMuted: '#E6F1EA',
    successText: '#204633',
    badgeAccentBackground: '#E8E0D4',
    badgeNeutralBackground: '#EEE9E0',
    overlay: 'rgba(14, 14, 14, 0.08)',
    glowTop: 'transparent',
    glowBottom: 'transparent'
  }
};

const neutralDarkTheme: AppTheme = {
  id: 'neutral-dark',
  family: 'neutral',
  mode: 'dark',
  colors: {
    primary: '#F2EFE7',
    primaryHover: '#E2DCCE',
    primaryText: '#121212',
    secondary: '#A6A097',
    background: '#0E0F0E',
    backgroundElevated: '#141615',
    surface: '#181B19',
    surfaceMuted: '#202422',
    border: '#2B2F2C',
    borderStrong: '#3A3F3B',
    textPrimary: '#F4F2EC',
    textSecondary: '#CBC7BE',
    textMuted: '#98948A',
    error: '#D46B64',
    warning: '#D29A47',
    highlight: '#F6F2E7',
    success: '#85B598',
    successMuted: '#1C2A22',
    successText: '#D9EBDD',
    badgeAccentBackground: '#252822',
    badgeNeutralBackground: '#1E211F',
    overlay: 'rgba(4, 5, 4, 0.64)',
    glowTop: 'transparent',
    glowBottom: 'transparent'
  }
};

const legacyDarkTheme: AppTheme = {
  id: 'legacy-dark',
  family: 'legacy',
  mode: 'dark',
  colors: {
    primary: '#D6B989',
    primaryHover: '#B99664',
    primaryText: '#221912',
    secondary: '#92A784',
    background: '#171311',
    backgroundElevated: '#211B18',
    surface: '#2A221E',
    surfaceMuted: '#322924',
    border: '#473B34',
    borderStrong: '#5A4D44',
    textPrimary: '#F6F0E8',
    textSecondary: '#CFC0B1',
    textMuted: '#A49282',
    error: '#A96657',
    warning: '#C89656',
    highlight: '#F0DEBF',
    success: '#92A784',
    successMuted: '#344033',
    successText: '#D4E5CA',
    badgeAccentBackground: '#3D3125',
    badgeNeutralBackground: '#211B18',
    overlay: 'rgba(8, 6, 5, 0.52)',
    glowTop: 'transparent',
    glowBottom: 'transparent'
  }
};

export const appThemes: Record<AppThemePreference, AppTheme> = {
  'neutral-light': neutralLightTheme,
  'neutral-dark': neutralDarkTheme,
  'legacy-dark': legacyDarkTheme
};

export const themeOptions: ThemeOption[] = [
  { id: 'neutral-light', preview: ['#ECE7DD', '#F6F2EA', '#171717'] },
  { id: 'neutral-dark', preview: ['#0E0F0E', '#181B19', '#F2EFE7'] },
  { id: 'legacy-dark', preview: ['#171311', '#2A221E', '#D6B989'] }
];

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40
} as const;

export const radius = {
  sm: 14,
  md: 20,
  lg: 28,
  pill: 999
} as const;

export const typography = {
  micro: 11,
  caption: 13,
  body: 16,
  section: 20,
  title: 34,
  hero: 52
} as const;

export const shadows = {
  lightCard: {
    shadowColor: '#0E0E0E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 5
  }
} as const;

const ThemeContext = createContext<AppTheme>(neutralLightTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  const { themePreference } = useAuth();
  const theme = useMemo(() => appThemes[themePreference] ?? neutralLightTheme, [themePreference]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
