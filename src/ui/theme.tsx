import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

import type { AppThemePreference } from '../lib/storage';
import { useAuth } from '../state/AuthContext';
import { radius, spacing } from './system/layout';
import { typography } from './system/typography';

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
  family: 'neutral' | 'legacy' | 'accent';
  mode: 'light' | 'dark';
  colors: ThemeColors;
};

type ThemeOption = {
  id: AppThemePreference;
  emphasis: 'light' | 'dark' | 'accent';
  preview: [string, string, string];
};

const neutralLightTheme: AppTheme = {
  id: 'neutral-light',
  family: 'neutral',
  mode: 'light',
  colors: {
    primary: '#C4622A',
    primaryHover: '#A94F1F',
    primaryText: '#FFF8EF',
    secondary: '#8B8072',
    background: '#F4F0E8',
    backgroundElevated: '#E8E1D4',
    surface: '#EDE7DA',
    surfaceMuted: '#E7DFD1',
    border: '#CCC5B8',
    borderStrong: '#B8AE9E',
    textPrimary: '#1A1714',
    textSecondary: '#6F655B',
    textMuted: '#AFA697',
    error: '#B24B44',
    warning: '#A97120',
    highlight: '#C4622A',
    success: '#346A50',
    successMuted: '#E6F1EA',
    successText: '#204633',
    badgeAccentBackground: '#F0D6C4',
    badgeNeutralBackground: '#ECE5D8',
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

const greenTheme: AppTheme = {
  id: 'green',
  family: 'accent',
  mode: 'dark',
  colors: {
    primary: '#CBE8D6',
    primaryHover: '#B5D7C2',
    primaryText: '#10241A',
    secondary: '#92AA9A',
    background: '#0D1411',
    backgroundElevated: '#131D18',
    surface: '#17241D',
    surfaceMuted: '#1D2D24',
    border: '#294036',
    borderStrong: '#355348',
    textPrimary: '#EEF7F1',
    textSecondary: '#C6D6CB',
    textMuted: '#93A79A',
    error: '#D9736A',
    warning: '#D1A357',
    highlight: '#BDE2C8',
    success: '#7BC495',
    successMuted: '#183024',
    successText: '#DCF2E4',
    badgeAccentBackground: '#203229',
    badgeNeutralBackground: '#18251F',
    overlay: 'rgba(5, 10, 8, 0.62)',
    glowTop: 'transparent',
    glowBottom: 'transparent'
  }
};

const goldTheme: AppTheme = {
  id: 'gold',
  family: 'accent',
  mode: 'dark',
  colors: {
    primary: '#E7D0A2',
    primaryHover: '#D9BC84',
    primaryText: '#23190A',
    secondary: '#B4A485',
    background: '#12100C',
    backgroundElevated: '#1A1611',
    surface: '#201B15',
    surfaceMuted: '#292219',
    border: '#43382A',
    borderStrong: '#5B4B37',
    textPrimary: '#F7F1E6',
    textSecondary: '#D9CDBB',
    textMuted: '#A79783',
    error: '#CF786B',
    warning: '#D5A04E',
    highlight: '#E3C27A',
    success: '#A6BE7F',
    successMuted: '#2B3422',
    successText: '#E4EDD5',
    badgeAccentBackground: '#33281B',
    badgeNeutralBackground: '#221C15',
    overlay: 'rgba(10, 8, 5, 0.62)',
    glowTop: 'transparent',
    glowBottom: 'transparent'
  }
};

const lightBlueTheme: AppTheme = {
  id: 'light-blue',
  family: 'accent',
  mode: 'light',
  colors: {
    primary: '#23455B',
    primaryHover: '#315D76',
    primaryText: '#F4F8FB',
    secondary: '#64849A',
    background: '#E9EFF2',
    backgroundElevated: '#DFE7EC',
    surface: '#F8FBFC',
    surfaceMuted: '#EDF4F7',
    border: '#CBD7DF',
    borderStrong: '#B3C2CC',
    textPrimary: '#173040',
    textSecondary: '#516674',
    textMuted: '#7A8E9B',
    error: '#B85F58',
    warning: '#B98539',
    highlight: '#203E53',
    success: '#3E7C68',
    successMuted: '#E6F1ED',
    successText: '#1F4B3D',
    badgeAccentBackground: '#E2EBF0',
    badgeNeutralBackground: '#EEF4F7',
    overlay: 'rgba(8, 16, 22, 0.08)',
    glowTop: 'transparent',
    glowBottom: 'transparent'
  }
};

const darkGreenTheme: AppTheme = {
  id: 'dark-green',
  family: 'accent',
  mode: 'dark',
  colors: {
    primary: '#CFE0B4',
    primaryHover: '#B9D091',
    primaryText: '#141C0D',
    secondary: '#A4B08E',
    background: '#0B110A',
    backgroundElevated: '#101711',
    surface: '#141D15',
    surfaceMuted: '#1A261C',
    border: '#2A392B',
    borderStrong: '#384C39',
    textPrimary: '#F1F6EB',
    textSecondary: '#CAD3C2',
    textMuted: '#95A08D',
    error: '#D06E67',
    warning: '#C89A4C',
    highlight: '#CBDF9F',
    success: '#97C27B',
    successMuted: '#213120',
    successText: '#E3F0D8',
    badgeAccentBackground: '#233021',
    badgeNeutralBackground: '#182017',
    overlay: 'rgba(5, 8, 5, 0.64)',
    glowTop: 'transparent',
    glowBottom: 'transparent'
  }
};

export const appThemes: Record<AppThemePreference, AppTheme> = {
  'neutral-light': neutralLightTheme,
  'neutral-dark': neutralDarkTheme,
  'legacy-dark': legacyDarkTheme,
  green: greenTheme,
  gold: goldTheme,
  'light-blue': lightBlueTheme,
  'dark-green': darkGreenTheme
};

export const themeOptions: ThemeOption[] = [
  { id: 'neutral-light', emphasis: 'light', preview: ['#F4F0E8', '#F1EBDD', '#C4622A'] },
  { id: 'green', emphasis: 'accent', preview: ['#0D1411', '#17241D', '#CBE8D6'] },
  { id: 'gold', emphasis: 'accent', preview: ['#12100C', '#201B15', '#E7D0A2'] },
  { id: 'light-blue', emphasis: 'light', preview: ['#E9EFF2', '#F8FBFC', '#23455B'] },
  { id: 'dark-green', emphasis: 'dark', preview: ['#0B110A', '#141D15', '#CFE0B4'] },
  { id: 'legacy-dark', emphasis: 'accent', preview: ['#171311', '#2A221E', '#D6B989'] }
];

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

export { spacing, radius, typography };
