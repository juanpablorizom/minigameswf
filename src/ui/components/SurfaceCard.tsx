import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { layout, radius } from '../system/layout';
import { useTheme } from '../theme';

export function SurfaceCard({ children }: PropsWithChildren) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return <View style={styles.card}>{children}</View>;
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : theme.colors.surface,
      borderRadius: radius.xl,
      borderWidth: 2,
      borderColor: theme.colors.border,
      padding: layout.cardPadding,
      gap: layout.groupGap
    }
  });
}
