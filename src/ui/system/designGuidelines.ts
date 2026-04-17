import { controls, layout, radius, spacing } from './layout';
import { darkModeRules, semanticRoles } from './theme';
import { textRoles, textStyles, typography } from './typography';

export const designGuidelines = {
  spacingSystem: '4pt system across screens: 4, 8, 12, 16, 24, 32, 40.',
  hierarchy: {
    title: 'Largest bold text at the top of each section.',
    secondary: 'Lower contrast text for support and helper copy.',
    cta: 'Only one dominant primary action per surface.'
  },
  signifiers: {
    buttons: 'State changes rely on color, opacity, border emphasis, and subtle scale feedback.',
    inputs: 'Focus, error, and warning states are always communicated with border and helper text.'
  },
  darkMode: darkModeRules,
  semantics: semanticRoles,
  tokens: {
    spacing,
    radius,
    layout,
    controls,
    typography,
    textStyles,
    textRoles
  }
} as const;
