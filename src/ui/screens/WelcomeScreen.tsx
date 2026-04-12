import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type WelcomeScreenProps = {
  isBusy: boolean;
  isSupabaseConfigured: boolean;
  notice: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, displayName: string) => void;
  onContinueAsGuest: (displayName: string) => void;
};

export function WelcomeScreen({ isBusy, isSupabaseConfigured, notice, onSignIn, onSignUp, onContinueAsGuest }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Badge label={t('auth.badge')} tone="accent" />
        <Text style={styles.eyebrow}>{t('auth.eyebrow')}</Text>
        <Text style={styles.title}>{t('auth.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
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
        <Text style={styles.sectionTitle}>{t('auth.primaryCardTitle')}</Text>
        <Text style={styles.cardCopy}>{t('auth.primaryCardCopy')}</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('auth.displayNamePlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          secureTextEntry
        />
        <AppButton label={t('auth.signIn')} onPress={() => onSignIn(email.trim(), password)} disabled={!isSupabaseConfigured || isBusy} />
        <AppButton
          label={t('auth.signUp')}
          onPress={() => onSignUp(email.trim(), password, displayName.trim())}
          variant="secondary"
          disabled={!isSupabaseConfigured || isBusy}
        />
        <AppButton label={t('auth.continueAsGuest')} onPress={() => onContinueAsGuest(displayName.trim())} variant="ghost" disabled={!isSupabaseConfigured || isBusy} />
        <Text style={styles.helper}>{t('auth.guestHint')}</Text>
        {!isSupabaseConfigured ? <Text style={styles.notice}>{t('auth.supabaseMissing')}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.previewHeader}>
          <Text style={styles.sectionTitle}>{t('auth.continueBlockTitle')}</Text>
          <Badge label="Shell MVP" tone="success" />
        </View>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>{t('auth.continueBlockCopy')}</Text>
        </View>
      </SurfaceCard>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  hero: {
    gap: spacing.md,
    paddingTop: spacing.md
  },
  eyebrow: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -1.4
  },
  subtitle: {
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: spacing.md,
    justifyContent: 'flex-end'
  },
  visualCardSuccess: {
    backgroundColor: theme.colors.successMuted,
    borderColor: theme.colors.success
  },
  visualLabel: {
    color: theme.colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  visualValue: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700',
    lineHeight: 24
  },
  visualTiny: {
    color: theme.colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
    lineHeight: 18
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  cardCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
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
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  notice: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    lineHeight: 18
  },
  helper: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  }
  });
}
