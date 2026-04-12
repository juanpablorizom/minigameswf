import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { radius, spacing, typography, useTheme } from '../theme';

type WelcomeScreenProps = {
  isBusy: boolean;
  isInsForgeConfigured: boolean;
  notice: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, displayName: string) => void;
  onSignInWithGoogle: () => void;
  onContinueAsGuest: (displayName: string) => void;
};

export function WelcomeScreen({
  isBusy,
  isInsForgeConfigured,
  notice,
  onSignIn,
  onSignUp,
  onSignInWithGoogle,
  onContinueAsGuest
}: WelcomeScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [guestDisplayName, setGuestDisplayName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [signUpDisplayName, setSignUpDisplayName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const canLogIn = Boolean(loginEmail.trim() && loginPassword.trim());
  const canSignUp = Boolean(signUpDisplayName.trim() && signUpEmail.trim() && signUpPassword.trim());

  return (
    <AppScreen>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <View style={styles.brandMark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.brandTop} />
            <View style={styles.brandBottom} />
          </View>
          <Text style={styles.title}>{t('auth.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
        </View>

        <View style={styles.providerStack}>
          <AppButton
            label={t('auth.continueAsGuest')}
            onPress={() => onContinueAsGuest(guestDisplayName.trim())}
            variant="secondary"
            disabled={isBusy}
            leftSlot={
              <View style={styles.providerIconGuest}>
                <GuestMark />
              </View>
            }
          />
          <AppButton
            label={t('auth.continueWithGoogle')}
            onPress={onSignInWithGoogle}
            variant="secondary"
            disabled={isBusy}
            leftSlot={
              <View style={styles.providerIconGoogle}>
                <GoogleMark />
              </View>
            }
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>{t('auth.divider')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>{t('auth.formTitleSignIn')}</Text>
          <Text style={styles.formSubtitle}>{t('auth.formSubtitleSignIn')}</Text>

          <Text style={styles.fieldLabel}>{t('auth.emailLabel')}</Text>
          <TextInput
            value={loginEmail}
            onChangeText={setLoginEmail}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.fieldLabel}>{t('auth.passwordLabel')}</Text>
          <TextInput
            value={loginPassword}
            onChangeText={setLoginPassword}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry
            autoComplete="password"
          />

          <AppButton
            label={t('auth.primaryCtaSignIn')}
            onPress={() => onSignIn(loginEmail.trim(), loginPassword)}
            disabled={isBusy || !canLogIn}
          />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleCopy}>{t('auth.signUpPrompt')}</Text>
            <Pressable onPress={() => setIsSignUpOpen(true)} hitSlop={8}>
              <Text style={styles.toggleAction}>{t('auth.signUpAction')}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.terms}>{t('auth.terms')}</Text>
        <Text style={styles.helper}>{t('auth.guestHint')}</Text>
        {!isInsForgeConfigured ? <Text style={styles.notice}>{t('auth.insforgeMissing')}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </View>

      <Modal visible={isSignUpOpen} transparent animationType="fade" onRequestClose={() => setIsSignUpOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsSignUpOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('auth.modalTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('auth.modalSubtitle')}</Text>

            <AppButton
              label={t('auth.continueWithGoogle')}
              onPress={onSignInWithGoogle}
              variant="secondary"
              disabled={isBusy}
              leftSlot={
                <View style={styles.providerIconGoogle}>
                  <GoogleMark />
                </View>
              }
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>{t('auth.divider')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.fieldLabel}>{t('auth.nameLabel')}</Text>
            <TextInput
              value={signUpDisplayName}
              onChangeText={setSignUpDisplayName}
              placeholder={t('auth.displayNamePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              autoComplete="name"
            />

            <Text style={styles.fieldLabel}>{t('auth.emailLabel')}</Text>
            <TextInput
              value={signUpEmail}
              onChangeText={setSignUpEmail}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Text style={styles.fieldLabel}>{t('auth.passwordLabel')}</Text>
            <TextInput
              value={signUpPassword}
              onChangeText={setSignUpPassword}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry
              autoComplete="password-new"
            />

            <AppButton
              label={t('auth.primaryCta')}
              onPress={() => onSignUp(signUpEmail.trim(), signUpPassword, signUpDisplayName.trim())}
              disabled={isBusy || !canSignUp}
            />

            <Pressable onPress={() => setIsSignUpOpen(false)} hitSlop={8}>
              <Text style={styles.modalClose}>{t('auth.modalClose')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

function GuestMark() {
  return (
    <View style={iconStyles.guestMark}>
      <View style={iconStyles.guestHead} />
      <View style={iconStyles.guestBody} />
    </View>
  );
}

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        fill="#EA4335"
        d="M12.24 10.285V14.4h5.88c-.257 1.322-1.767 3.88-5.88 3.88-3.536 0-6.416-2.928-6.416-6.52s2.88-6.52 6.416-6.52c2.014 0 3.36.86 4.133 1.604l2.817-2.72C17.38 2.44 14.983 1.5 12.24 1.5 6.99 1.5 2.727 5.76 2.727 11s4.263 9.5 9.513 9.5C17.73 20.5 21.36 16.64 21.36 11.2c0-.638-.069-1.12-.153-1.615H12.24z"
      />
      <Path
        fill="#FBBC05"
        d="M3.824 6.776l3.387 2.484c.916-1.815 2.81-3.02 5.029-3.02 2.014 0 3.36.86 4.133 1.604l2.817-2.72C17.38 2.44 14.983 1.5 12.24 1.5c-3.65 0-6.75 2.082-8.416 5.276z"
      />
      <Path
        fill="#34A853"
        d="M12.24 20.5c2.67 0 4.912-.882 6.55-2.39l-3.117-2.55c-.835.583-1.953.99-3.433.99-2.61 0-4.828-1.762-5.62-4.136L3.45 15.8C5.1 19.034 8.32 20.5 12.24 20.5z"
      />
      <Path
        fill="#4285F4"
        d="M21.207 9.585H12.24V13.7h5.88c-.257 1.322-1.029 2.447-2.447 3.297l3.117 2.55c1.81-1.67 2.57-4.133 2.57-7.847 0-.638-.069-1.12-.153-1.615z"
      />
    </Svg>
  );
}

const iconStyles = StyleSheet.create({
  guestMark: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  guestHead: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: '#F6F0E8'
  },
  guestBody: {
    width: 12,
    height: 7,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#F6F0E8',
    marginTop: 2
  }
});

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    shell: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      gap: spacing.lg,
      paddingTop: spacing.md
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
    providerStack: {
      gap: spacing.md
    },
    providerIconGuest: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center'
    },
    providerIconGoogle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center'
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
    formBlock: {
      gap: spacing.md
    },
    formTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      fontWeight: '700'
    },
    formSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 24
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
    terms: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      lineHeight: 22,
      textAlign: 'center'
    },
    helper: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      lineHeight: 20,
      textAlign: 'center'
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18,
      textAlign: 'center'
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.72)'
    },
    modalCard: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md
    },
    modalTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      fontWeight: '800'
    },
    modalSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    modalClose: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '600',
      textAlign: 'center'
    }
  });
}
