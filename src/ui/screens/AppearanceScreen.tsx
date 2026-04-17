import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppThemePreference } from '../../lib/storage';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { themeOptions, useTheme } from '../theme';

type AppearanceScreenProps = {
  embedded?: boolean;
  themePreference: AppThemePreference;
  onChangeTheme: (theme: AppThemePreference) => void;
};

export function AppearanceScreen({
  embedded = false,
  themePreference,
  onChangeTheme
}: AppearanceScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <AppScreen title={embedded ? undefined : t('settings.appearanceSection')} subtitle={embedded ? undefined : t('settings.appearanceHint')}>
      <SurfaceCard>
        <Text style={styles.introTitle}>{t('settings.appearanceSection')}</Text>
        <Text style={styles.introCopy}>{t('settings.appearanceHint')}</Text>
      </SurfaceCard>

      {themeOptions.map((themeOption) => {
        const isActive = themePreference === themeOption.id;

        return (
          <Pressable
            key={themeOption.id}
            onPress={() => onChangeTheme(themeOption.id)}
            style={({ pressed, hovered }) => [
              styles.themeCard,
              isActive && styles.themeCardActive,
              hovered && styles.themeCardHover,
              pressed && styles.themeCardPressed
            ]}
          >
            <View style={styles.themeHeader}>
              <View style={styles.themeMeta}>
                <View style={styles.themeTitleRow}>
                  <Text style={styles.themeTitle}>{t(`settings.themeChoices.${themeOption.id}.label`)}</Text>
                  {isActive ? <Badge label={t('settings.activeAppearance')} tone="success" /> : null}
                </View>
                <Text style={styles.themeDescription}>{t(`settings.themeChoices.${themeOption.id}.description`)}</Text>
              </View>
              <View style={styles.swatchRow}>
                {themeOption.preview.map((colorValue) => (
                  <View key={colorValue} style={[styles.swatch, { backgroundColor: colorValue }]} />
                ))}
              </View>
            </View>
          </Pressable>
        );
      })}
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    introTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    introCopy: {
      color: theme.colors.textSecondary,
      ...textStyles.body
    },
    themeCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: layout.cardPadding,
      gap: layout.groupGap
    },
    themeCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    themeCardHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface
    },
    themeCardPressed: {
      transform: [{ scale: 0.994 }]
    },
    themeHeader: {
      gap: layout.groupGap
    },
    themeMeta: {
      gap: spacing.xs
    },
    themeTitleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      alignItems: 'center'
    },
    themeTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.bodyStrong
    },
    themeDescription: {
      color: theme.colors.textSecondary,
      ...textStyles.body,
      maxWidth: 720
    },
    swatchRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'center'
    },
    swatch: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    }
  });
}
