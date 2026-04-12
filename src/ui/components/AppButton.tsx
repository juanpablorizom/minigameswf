import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '../theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  leftSlot?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', leftSlot, disabled = false, loading = false }: AppButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, styles[variant], isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={styles[`${variant}Label`].color} /> : null}
      {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    base: {
      minHeight: 54,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.99 }]
    },
    disabled: {
      opacity: 0.45
    },
    primary: {
      backgroundColor: theme.colors.primary
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    label: {
      fontSize: typography.body,
      fontWeight: '700'
    },
    primaryLabel: {
      color: theme.colors.primaryText
    },
    secondaryLabel: {
      color: theme.colors.textPrimary
    },
    ghostLabel: {
      color: theme.colors.textSecondary
    },
    leftSlot: {
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
