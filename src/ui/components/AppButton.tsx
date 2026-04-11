import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  leftSlot?: ReactNode;
};

export function AppButton({ label, onPress, variant = 'primary', leftSlot }: AppButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed]}>
      {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  primary: {
    backgroundColor: colors.accent
  },
  secondary: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5a4d44'
  },
  label: {
    fontSize: typography.body,
    fontWeight: '700'
  },
  primaryLabel: {
    color: '#221912'
  },
  secondaryLabel: {
    color: colors.textPrimary
  },
  ghostLabel: {
    color: colors.textSecondary
  },
  leftSlot: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
