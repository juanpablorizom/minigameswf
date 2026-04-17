import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, shadows, spacing, useTheme } from '../theme';

export function SurfaceCard({ children }: PropsWithChildren) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return <View style={styles.card}>{children}</View>;
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: spacing.lg,
      gap: spacing.md,
      ...(theme.mode === 'light' ? shadows.lightCard : null)
    }
  });
}
