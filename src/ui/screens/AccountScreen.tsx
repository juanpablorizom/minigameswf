import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type AccountScreenProps = {
  isGuest: boolean;
  displayName: string | null;
  username: string | null;
  email: string | null;
  linkedProviderLabel: string | null;
  isBusy: boolean;
  notice: string | null;
  onLinkAccount: () => void;
  onManageBilling: () => void;
};

export function AccountScreen({
  isGuest,
  displayName,
  username,
  email,
  linkedProviderLabel,
  isBusy,
  notice,
  onLinkAccount,
  onManageBilling
}: AccountScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const initials = (displayName ?? username ?? email ?? '?').slice(0, 2).toUpperCase();
  const accountStateLabel = isGuest ? t('account.accountStateGuest') : t('account.accountStateAuthenticated');

  return (
    <AppScreen title={t('account.title')} subtitle={t('account.subtitle')}>
      <SurfaceCard>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{initials}</Text>
          </View>
          <View style={styles.profileMeta}>
            <View style={styles.titleRow}>
              <Text style={styles.profileValue}>{displayName || t('account.missingDisplayName')}</Text>
              <Badge label={accountStateLabel} tone={isGuest ? 'neutral' : 'success'} />
            </View>
            <Text style={styles.profileSubvalue}>{username || t('account.missingUsername')}</Text>
            <Text style={styles.profileSubvalue}>{email || t('account.missingEmail')}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('account.accountDetails')}</Text>
        <DetailRow label={t('account.displayName')} value={displayName || t('account.missingDisplayName')} />
        <DetailRow label={t('account.username')} value={username || t('account.missingUsername')} />
        <DetailRow label={t('account.email')} value={email || t('account.missingEmail')} />
        <DetailRow label={t('account.accountState')} value={accountStateLabel} />
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>{t('account.linkedAccounts')}</Text>
          {linkedProviderLabel ? <Badge label={linkedProviderLabel} tone="success" /> : null}
        </View>
        <Text style={styles.profileValue}>{linkedProviderLabel || t('account.linkedAccountsEmpty')}</Text>
        <Text style={styles.helper}>{isGuest ? t('account.linkedAccountsGuestHint') : t('account.linkedAccountsHint')}</Text>
        <AppButton
          label={isGuest ? t('account.guestPrimaryLink') : t('account.linkAccount')}
          onPress={onLinkAccount}
          variant={isGuest ? 'primary' : 'secondary'}
          disabled={isBusy}
        />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('account.billingSection')}</Text>
        <DetailRow label={t('account.currentPlan')} value={t('account.currentPlanEmpty')} />
        <Text style={styles.helper}>{t('account.billingHint')}</Text>
        <AppButton label={t('account.billingCta')} onPress={onManageBilling} variant="secondary" />
      </SurfaceCard>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </AppScreen>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  avatarLabel: {
    color: theme.colors.highlight,
    fontSize: typography.section,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  profileValue: {
    color: theme.colors.textPrimary,
    fontSize: typography.body,
    lineHeight: 22,
    fontWeight: '700'
  },
  profileSubvalue: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  helper: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
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
