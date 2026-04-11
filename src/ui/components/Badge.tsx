import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type BadgeProps = {
  label: string;
  tone?: 'accent' | 'success' | 'neutral';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`${tone}Badge`]]}>
      <Text style={[styles.label, styles[`${tone}Label`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#3d3125'
  },
  accentLabel: {
    color: colors.accentSoft
  },
  successBadge: {
    backgroundColor: colors.successMuted
  },
  successLabel: {
    color: '#d4e5ca'
  },
  neutralBadge: {
    backgroundColor: colors.backgroundElevated
  },
  neutralLabel: {
    color: colors.textSecondary
  }
});
