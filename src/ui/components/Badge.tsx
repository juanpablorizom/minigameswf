import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '../theme';

type BadgeProps = {
  label: string;
  tone?: 'accent' | 'success' | 'neutral';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.badge, styles[`${tone}Badge`]]}>
      <Text style={[styles.label, styles[`${tone}Label`]]}>{label}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs
    },
    label: {
      fontSize: typography.caption,
      fontWeight: '700'
    },
    accentBadge: {
      backgroundColor: theme.colors.badgeAccentBackground
    },
    accentLabel: {
      color: theme.colors.highlight
    },
    successBadge: {
      backgroundColor: theme.colors.successMuted
    },
    successLabel: {
      color: theme.colors.successText
    },
    neutralBadge: {
      backgroundColor: theme.colors.badgeNeutralBackground
    },
    neutralLabel: {
      color: theme.colors.textSecondary
    }
  });
}
