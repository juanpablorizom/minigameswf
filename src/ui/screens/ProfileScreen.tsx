import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage, AppThemePreference } from '../../lib/storage';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AvatarSilhouette } from '../components/AvatarSilhouette';
import { Badge } from '../components/Badge';
import { MinimalIcon } from '../components/MinimalIcon';
import { SurfaceCard } from '../components/SurfaceCard';
import { controls, layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

type ProfileScreenProps = {
  displayName: string | null;
  username: string | null;
  email: string | null;
  isGuest: boolean;
  language: AppLanguage;
  themePreference: AppThemePreference;
  avatarId?: string | null;
  frameId?: string | null;
  isBusy: boolean;
  notice: string | null;
  onOpenAccount: () => void;
  onOpenAppearance: () => void;
  onOpenAvatar: () => void;
  onChangeLanguage: (language: AppLanguage) => void;
  onLogout: () => void;
};

export function ProfileScreen({
  displayName,
  username,
  email,
  isGuest,
  language,
  themePreference,
  avatarId = 'default',
  frameId = 'plain',
  isBusy,
  notice,
  onOpenAccount,
  onOpenAppearance,
  onOpenAvatar,
  onChangeLanguage,
  onLogout
}: ProfileScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const accountLabel = displayName ?? username ?? email?.split('@')[0] ?? t('common.guest');

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>CUENTA</Text>
        <Text style={styles.heroName}>{accountLabel}</Text>
      </View>

      <SurfaceCard>
        <View style={styles.profileHeader}>
          <AvatarSilhouette size={76} avatarId={avatarId} frameId={frameId} />
          <View style={styles.profileMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{accountLabel}</Text>
              {isGuest ? <Badge label={t('account.guestBadge')} tone="neutral" /> : <Badge label="Cuenta" tone="success" />}
            </View>
            {username ? <Text style={styles.profileSubvalue}>@{username}</Text> : null}
            {email ? <Text style={styles.profileSubvalue}>{email}</Text> : null}
          </View>
        </View>

        <View style={styles.cardDivider} />
        <Text style={styles.sectionTitle}>Menu</Text>
        <MenuRow label="Datos de cuenta" value={isGuest ? 'Invitado' : 'Activa'} onPress={onOpenAccount} />
        <MenuRow label={t('profile.avatarPicker')} value={t('profile.avatar')} onPress={onOpenAvatar} />
        <MenuRow label="Apariencia" value={t(`settings.themeChoices.${themePreference}.label`)} onPress={onOpenAppearance} />
        <View style={styles.languageRow}>
          <Text style={styles.menuLabel}>Idioma</Text>
          <View style={styles.optionRow}>
            <OptionChip label="ES" active={language === 'es'} onPress={() => onChangeLanguage('es')} />
            <OptionChip label="EN" active={language === 'en'} onPress={() => onChangeLanguage('en')} />
          </View>
        </View>
        <AppButton label="Cerrar sesion" onPress={onLogout} variant="ghost" disabled={isBusy} />
      </SurfaceCard>

      {isBusy ? <Text style={styles.notice}>{t('account.savingLanguage')}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </AppScreen>
  );
}

type MenuRowProps = {
  label: string;
  value: string;
  onPress: () => void;
};

function MenuRow({ label, value, onPress }: MenuRowProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={({ pressed, hovered }) => [styles.menuRow, hovered && styles.menuRowHover, pressed && styles.menuRowPressed]}>
      <View style={styles.menuMeta}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuValue}>{value}</Text>
      </View>
      <View style={styles.menuArrow}>
        <MinimalIcon name="chevronRight" size={22} color={theme.colors.highlight} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

type OptionChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function OptionChip({ label, active, onPress }: OptionChipProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={[styles.optionChip, active && styles.optionChipActive]}>
      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    hero: {
      gap: spacing.xs,
      paddingTop: spacing.xs
    },
    kicker: {
      color: theme.colors.textMuted,
      fontSize: typography.body,
      fontWeight: '800',
      letterSpacing: 2
    },
    heroName: {
      color: theme.colors.highlight,
      ...textStyles.hero
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 96
    },
    profileMeta: {
      flex: 1,
      gap: spacing.xs
    },
    nameRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      alignItems: 'center'
    },
    profileName: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    profileSubvalue: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      lineHeight: 18
    },
    cardDivider: {
      height: 2,
      backgroundColor: theme.colors.border,
      opacity: 0.7
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    menuRow: {
      minHeight: controls.minHeight,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    menuRowHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface
    },
    menuRowPressed: {
      transform: [{ scale: 0.99 }]
    },
    menuMeta: {
      flex: 1,
      gap: 2
    },
    menuLabel: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    menuValue: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption
    },
    menuArrow: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center'
    },
    languageRow: {
      gap: spacing.sm
    },
    optionRow: {
      flexDirection: 'row',
      gap: layout.controlGap
    },
    optionChip: {
      flex: 1,
      minHeight: controls.compactMinHeight,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center'
    },
    optionChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    optionLabel: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    optionLabelActive: {
      color: theme.colors.highlight
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18,
      paddingHorizontal: layout.cardPadding
    }
  });
}
