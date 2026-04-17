import type { AppTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonState = 'default' | 'hover' | 'pressed' | 'disabled' | 'loading';
export type InputState = 'default' | 'focus' | 'error' | 'warning' | 'disabled';

type ControlPalette = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
};

export const semanticRoles = {
  primary: 'Main brand action and the strongest CTA on a screen.',
  secondary: 'Alternative actions and low-emphasis surfaces.',
  success: 'Positive confirmation and completed states.',
  error: 'Destructive actions and blocking failures.',
  warning: 'Risk, attention, or incomplete action states.'
} as const;

export const darkModeRules = {
  depth: 'Use lighter surfaces over darker backgrounds instead of shadows.',
  saturation: 'Keep accent colors slightly desaturated to preserve readability.',
  borders: 'Use soft border contrast and avoid pure white outlines.'
} as const;

export function getButtonPalette(theme: AppTheme, variant: ButtonVariant, state: ButtonState): ControlPalette {
  const base: Record<ButtonVariant, ControlPalette> = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      textColor: theme.colors.primaryText
    },
    secondary: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border,
      textColor: theme.colors.textPrimary
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      textColor: theme.colors.textSecondary
    }
  };

  if (state === 'disabled' || state === 'loading') {
    return {
      ...base[variant],
      textColor: variant === 'primary' ? theme.colors.primaryText : theme.colors.textMuted
    };
  }

  if (state === 'hover') {
    if (variant === 'primary') {
      return {
        backgroundColor: theme.colors.primaryHover,
        borderColor: theme.colors.primaryHover,
        textColor: theme.colors.primaryText
      };
    }

    return {
      ...base[variant],
      backgroundColor: theme.colors.backgroundElevated,
      borderColor: theme.colors.borderStrong,
      textColor: theme.colors.textPrimary
    };
  }

  if (state === 'pressed') {
    if (variant === 'primary') {
      return {
        backgroundColor: theme.colors.primaryHover,
        borderColor: theme.colors.primaryHover,
        textColor: theme.colors.primaryText
      };
    }

    return {
      ...base[variant],
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.borderStrong,
      textColor: theme.colors.textPrimary
    };
  }

  return base[variant];
}

export function getInputPalette(theme: AppTheme, state: InputState): ControlPalette {
  const base: ControlPalette = {
    backgroundColor: theme.colors.backgroundElevated,
    borderColor: theme.colors.border,
    textColor: theme.colors.textPrimary
  };

  if (state === 'focus') {
    return {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      textColor: theme.colors.textPrimary
    };
  }

  if (state === 'error') {
    return {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.error,
      textColor: theme.colors.textPrimary
    };
  }

  if (state === 'warning') {
    return {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.warning,
      textColor: theme.colors.textPrimary
    };
  }

  if (state === 'disabled') {
    return {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      textColor: theme.colors.textMuted
    };
  }

  return base;
}
