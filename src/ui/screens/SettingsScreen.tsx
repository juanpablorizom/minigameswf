import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage, AppThemePreference } from '../../lib/storage';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, themeOptions, typography, useTheme } from '../theme';

type SettingsScreenProps = {
  language: AppLanguage;
  themePreference: AppThemePreference;
  isBusy: boolean;
  notice: string | null;
  onChangeLanguage: (language: AppLanguage) => void;
  onChangeTheme: (theme: AppThemePreference) => void;
  onLogout: () => void;
};

export function SettingsScreen({
  language,
  themePreference,
  isBusy,
  notice,
  onChangeLanguage,
  onChangeTheme,
  onLogout
}: SettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <AppScreen title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.optionRow}>
          <OptionChip label={t('settings.spanish')} active={language === 'es'} onPress={() => onChangeLanguage('es')} />
          <OptionChip label={t('settings.english')} active={language === 'en'} onPress={() => onChangeLanguage('en')} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('settings.appearanceSection')}</Text>
        <Text style={styles.helper}>{t('settings.themeHint')}</Text>
        <View style={styles.themeColumn}>
          {themeOptions.map((theme) => (
            <Pressable
              key={theme.id}
              onPress={() => onChangeTheme(theme.id)}
              style={[styles.themeCard, themePreference === theme.id && styles.themeCardActive]}
            >
              <View style={styles.themeMeta}>
                <Text style={styles.themeTitle}>{theme.label}</Text>
                <Text style={styles.themeDescription}>{theme.description}</Text>
              </View>
              <View style={styles.swatchRow}>
                {theme.preview.map((colorValue) => (
                  <View key={colorValue} style={[styles.swatch, { backgroundColor: colorValue }]} />
                ))}
              </View>
            </Pressable>
          ))}
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
    <Pressable onPress={onPress} style={[styles.optionChip, active && styles.optionChipActive]}>
      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    helper: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    optionRow: {
      flexDirection: 'row',
      gap: spacing.sm
    },
    optionChip: {
      flex: 1,
      minHeight: 48,
      borderRadius: radius.pill,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md
    },
    optionChipActive: {
      backgroundColor: theme.colors.successMuted,
      borderColor: theme.colors.success
    },
    optionLabel: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    optionLabelActive: {
      color: theme.colors.successText
    },
    themeColumn: {
      gap: spacing.sm
    },
    themeCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: spacing.md,
      gap: spacing.sm
    },
    themeCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    themeMeta: {
      gap: spacing.xs
    },
    themeTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    themeDescription: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    swatchRow: {
      flexDirection: 'row',
      gap: spacing.sm
    },
    swatch: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18,
      paddingHorizontal: spacing.lg
    }
  });
}
