import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type AccountScreenProps = {
  isGuest: boolean;
  displayName: string | null;
  username: string | null;
  email: string | null;
  isBusy: boolean;
  notice: string | null;
  onSaveDisplayName: (displayName: string) => void;
  onLinkWithEmail: (email: string) => void;
};

export function AccountScreen({
  isGuest,
  displayName,
  username,
  email,
  isBusy,
  notice,
  onSaveDisplayName,
  onLinkWithEmail
}: AccountScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const initials = (displayName ?? username ?? email ?? '?').slice(0, 2).toUpperCase();
  const [nextDisplayName, setNextDisplayName] = useState(displayName ?? '');
  const [linkEmail, setLinkEmail] = useState('');

  useEffect(() => {
    setNextDisplayName(displayName ?? '');
  }, [displayName]);

  const canSaveName = Boolean(nextDisplayName.trim()) && nextDisplayName.trim() !== (displayName ?? '').trim();
  const canLinkEmail = Boolean(linkEmail.trim());

  return (
    <AppScreen title={t('account.title')} subtitle={t('account.subtitle')}>
      <SurfaceCard>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{initials}</Text>
          </View>
          <View style={styles.profileMeta}>
            <View style={styles.titleRow}>
              <Text style={styles.profileValue}>{displayName || username || t('common.guest')}</Text>
              {isGuest ? <Badge label={t('account.guestBadge')} tone="neutral" /> : null}
            </View>
            {username ? <Text style={styles.profileSubvalue}>@{username}</Text> : null}
            {email ? <Text style={styles.profileSubvalue}>{email}</Text> : null}
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('account.accountData')}</Text>
        <Text style={styles.helper}>{t('account.accountDataHint')}</Text>

        <Text style={styles.fieldLabel}>{t('account.displayName')}</Text>
        <TextInput
          value={nextDisplayName}
          onChangeText={setNextDisplayName}
          placeholder={t('account.displayNamePlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('account.username')}</Text>
          <Text style={styles.detailValue}>@{username || t('common.guest')}</Text>
        </View>

        {email ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('account.email')}</Text>
            <Text style={styles.detailValue}>{email}</Text>
          </View>
        ) : null}

        <AppButton label={t('account.saveName')} onPress={() => onSaveDisplayName(nextDisplayName)} disabled={!canSaveName || isBusy} />
      </SurfaceCard>

      {isGuest ? (
        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t('account.linkAccountSection')}</Text>
          <Text style={styles.helper}>{t('account.linkAccountHint')}</Text>

          <Text style={styles.fieldLabel}>{t('account.email')}</Text>
          <TextInput
            value={linkEmail}
            onChangeText={setLinkEmail}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <AppButton label={t('account.linkWithEmail')} onPress={() => onLinkWithEmail(linkEmail.trim())} disabled={!canLinkEmail || isBusy} />
        </SurfaceCard>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    profileHeader: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'center'
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    avatarLabel: {
      color: theme.colors.highlight,
      fontSize: typography.title,
      fontWeight: '800'
    },
    profileMeta: {
      flex: 1,
      gap: spacing.xs
    },
    titleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      alignItems: 'center'
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '800',
      letterSpacing: -0.4
    },
    profileValue: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      lineHeight: 26,
      fontWeight: '800'
    },
    profileSubvalue: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 24
    },
    helper: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 24,
      maxWidth: 760
    },
    fieldLabel: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    input: {
      minHeight: 58,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.lg,
      color: theme.colors.textPrimary,
      fontSize: typography.body
    },
    detailRow: {
      gap: spacing.xs
    },
    detailLabel: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      textTransform: 'uppercase',
      letterSpacing: 1.1
    },
    detailValue: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      lineHeight: 22
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18,
      paddingHorizontal: spacing.lg
    }
  });
}
