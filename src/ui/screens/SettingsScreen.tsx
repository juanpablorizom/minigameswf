import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage, AppThemePreference } from '../../lib/storage';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { controls, layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

type SettingsScreenProps = {
  embedded?: boolean;
  accountLabel: string;
  accountStateLabel: string;
  language: AppLanguage;
  themePreference: AppThemePreference;
  isBusy: boolean;
  notice: string | null;
  onOpenAccount: () => void;
  onOpenAppearance: () => void;
  onChangeLanguage: (language: AppLanguage) => void;
  onLogout: () => void;
};

export function SettingsScreen({
  embedded = false,
  accountLabel,
  accountStateLabel,
  language,
  themePreference,
  isBusy,
  notice,
  onOpenAccount,
  onOpenAppearance,
  onChangeLanguage,
  onLogout
}: SettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <AppScreen title={embedded ? undefined : t('settings.title')} subtitle={embedded ? undefined : t('settings.subtitle')}>
      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('common.account')}</Text>
        <Text style={styles.helper}>{t('settings.accountHint', { account: accountLabel, state: accountStateLabel })}</Text>
        <AppButton label={t('settings.openAccount')} onPress={onOpenAccount} variant="secondary" />
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.rowHeader}>
          <View style={styles.rowMeta}>
            <Text style={styles.sectionTitle}>{t('settings.appearanceSection')}</Text>
            <Text style={styles.helper}>{t('settings.appearanceCardHint')}</Text>
          </View>
          <Badge label={t(`settings.themeChoices.${themePreference}.label`)} tone="accent" />
        </View>
        <AppButton label={t('settings.openAppearance')} onPress={onOpenAppearance} variant="secondary" />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <Text style={styles.helper}>{t('settings.languageHint')}</Text>
        <View style={styles.optionRow}>
          <OptionChip label={t('settings.spanish')} active={language === 'es'} onPress={() => onChangeLanguage('es')} />
          <OptionChip label={t('settings.english')} active={language === 'en'} onPress={() => onChangeLanguage('en')} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('settings.sessionSection')}</Text>
        <AppButton label={t('settings.logout')} onPress={onLogout} variant="ghost" disabled={isBusy} />
      </SurfaceCard>

      {isBusy ? <Text style={styles.notice}>{t('account.savingLanguage')}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </AppScreen>
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
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.optionChip,
        active && styles.optionChipActive,
        hovered && styles.optionChipHover,
        pressed && styles.optionChipPressed
      ]}
    >
      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    sectionTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    helper: {
      color: theme.colors.textSecondary,
      ...textStyles.body
    },
    optionRow: {
      flexDirection: 'row',
      gap: layout.controlGap
    },
    optionChip: {
      flex: 1,
      minHeight: controls.compactMinHeight,
      borderRadius: radius.pill,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md
    },
    optionChipActive: {
      backgroundColor: theme.colors.badgeAccentBackground,
      borderColor: theme.colors.primary
    },
    optionChipHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface
    },
    optionChipPressed: {
      transform: [{ scale: 0.992 }]
    },
    optionLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    optionLabelActive: {
      color: theme.colors.textPrimary
    },
    rowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: layout.groupGap
    },
    rowMeta: {
      flex: 1,
      gap: spacing.xs
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18,
      paddingHorizontal: layout.cardPadding
    }
  });
}
