import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors, radius, spacing, typography } from '../theme';

type WelcomeScreenProps = {
  initialName: string;
  onContinue: (name: string) => void;
  onContinueAsGuest: () => void;
};

export function WelcomeScreen({ initialName, onContinue, onContinueAsGuest }: WelcomeScreenProps) {
  const [name, setName] = useState(initialName);

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Badge label="JUNTADA" tone="accent" />
        <Text style={styles.eyebrow}>Social Game Night</Text>
        <Text style={styles.title}>Bring the room together before the first round even starts.</Text>
        <Text style={styles.subtitle}>
          Join fast, host cleanly, invite friends, line up games, and keep the whole night moving through one polished flow.
        </Text>
        <View style={styles.visualBlock}>
          <View style={styles.visualRow}>
            <View style={styles.visualCardLarge}>
              <Text style={styles.visualLabel}>Private rooms</Text>
              <Text style={styles.visualValue}>Friends in fast</Text>
            </View>
            <View style={styles.visualColumn}>
              <View style={styles.visualCardSmall}>
                <Text style={styles.visualTiny}>3 curated rounds</Text>
              </View>
              <View style={[styles.visualCardSmall, styles.visualCardSuccess]}>
                <Text style={styles.visualTiny}>Warm social pacing</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Enter the lobby</Text>
        <Text style={styles.cardCopy}>Pick the name your friends will see when you drop into a room.</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your display name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <AppButton label="Continue" onPress={() => onContinue(name.trim() || 'Guest Player')} />
        <AppButton label="Continue as Guest" onPress={onContinueAsGuest} variant="secondary" />
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.previewHeader}>
          <Text style={styles.sectionTitle}>What’s ready now</Text>
          <Badge label="Shell MVP" tone="success" />
        </View>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>Private rooms with host controls and invite code</Text>
          <Text style={styles.featureItem}>Mini game selection with realistic pacing</Text>
          <Text style={styles.featureItem}>Gameplay shell and clean results podium</Text>
        </View>
      </SurfaceCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
    paddingTop: spacing.md
  },
  eyebrow: {
    color: colors.accentSoft,
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -1.4
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24
  },
  visualBlock: {
    marginTop: spacing.sm
  },
  visualRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  visualCardLarge: {
    flex: 1,
    minHeight: 150,
    borderRadius: 26,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    justifyContent: 'space-between'
  },
  visualColumn: {
    width: 118,
    gap: spacing.sm
  },
  visualCardSmall: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'flex-end'
  },
  visualCardSuccess: {
    backgroundColor: '#263028',
    borderColor: '#465544'
  },
  visualLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  visualValue: {
    color: colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700',
    lineHeight: 24
  },
  visualTiny: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
    lineHeight: 18
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  cardCopy: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    fontSize: typography.body
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  featureList: {
    gap: spacing.sm
  },
  featureItem: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  }
});
