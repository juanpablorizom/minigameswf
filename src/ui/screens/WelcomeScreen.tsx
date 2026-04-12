import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
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
  const [authMode, setAuthMode] = useState<'signUp' | 'signIn'>('signUp');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const canSubmit = Boolean(email.trim() && password.trim() && (authMode === 'signIn' || displayName.trim()));

  return (
    <AppScreen>
      <View style={styles.shell}>
      <View style={styles.hero}>
        <View style={styles.brandMark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.brandTop} />
          <View style={styles.brandBottom} />
        </View>
        <Text style={styles.eyebrow}>{t('auth.eyebrow')}</Text>
        <Text style={styles.title}>{t('auth.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('auth.quickAccessTitle')}</Text>
        <Text style={styles.cardCopy}>{t('auth.quickAccessCopy')}</Text>
        <AppButton
          label={t('auth.continueAsGuest')}
          onPress={() => onContinueAsGuest(displayName.trim())}
          disabled={!isSupabaseConfigured || isBusy}
        />
        <Text style={styles.helper}>{t('auth.guestHint')}</Text>
      </SurfaceCard>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>{t('auth.divider')}</Text>
        <View style={styles.dividerLine} />
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{authMode === 'signUp' ? t('auth.formTitle') : t('auth.formTitleSignIn')}</Text>
        <Text style={styles.cardCopy}>{t('auth.formSubtitle')}</Text>
        <Text style={styles.fieldLabel}>{t('auth.nameLabel')}</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('auth.displayNamePlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.fieldLabel}>{t('auth.emailLabel')}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.fieldLabel}>{t('auth.passwordLabel')}</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          secureTextEntry
        />
        <AppButton
          label={authMode === 'signUp' ? t('auth.primaryCta') : t('auth.primaryCtaSignIn')}
          onPress={() =>
            authMode === 'signUp'
              ? onSignUp(email.trim(), password, displayName.trim())
              : onSignIn(email.trim(), password)
          }
          disabled={!isSupabaseConfigured || isBusy || !canSubmit}
        />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleCopy}>{authMode === 'signUp' ? t('auth.signInPrompt') : t('auth.signUpPrompt')}</Text>
          <Pressable onPress={() => setAuthMode((current) => (current === 'signUp' ? 'signIn' : 'signUp'))}>
            <Text style={styles.toggleAction}>{authMode === 'signUp' ? t('auth.signInAction') : t('auth.signUpAction')}</Text>
          </Pressable>
        </View>
        <Text style={styles.terms}>{t('auth.terms')}</Text>
        {!isSupabaseConfigured ? <Text style={styles.notice}>{t('auth.supabaseMissing')}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>
      </View>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  shell: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: spacing.lg
  },
  hero: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm
  },
  brandMark: {
    width: 48,
    height: 48
  },
  brandTop: {
    position: 'absolute',
    width: 30,
    height: 18,
    borderRadius: 4,
    backgroundColor: theme.colors.textPrimary,
    transform: [{ rotate: '-45deg' }],
    top: 3,
    left: 0
  },
  brandBottom: {
    position: 'absolute',
    width: 16,
    height: 28,
    borderRadius: 4,
    backgroundColor: theme.colors.textMuted,
    transform: [{ rotate: '-45deg' }],
    top: 19,
    left: 24
  },
  eyebrow: {
    color: theme.colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: -1.4
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border
  },
  dividerLabel: {
    color: theme.colors.textMuted,
    fontSize: typography.section,
    fontWeight: '600'
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
  fieldLabel: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '600'
  },
  input: {
    minHeight: 60,
    borderRadius: radius.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    paddingHorizontal: spacing.md,
    fontSize: typography.body
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  toggleCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  toggleAction: {
    color: theme.colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
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
  },
  terms: {
    color: theme.colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 22,
    textAlign: 'center'
  }
  });
}
