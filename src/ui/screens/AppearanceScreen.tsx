import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Path } from 'react-native-svg';

import type { AppThemePreference } from '../../lib/storage';
import { AppScreen } from '../components/AppScreen';
import { MinimalIcon } from '../components/MinimalIcon';
import { layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { themeOptions, useTheme } from '../theme';

type AppearanceScreenProps = {
  embedded?: boolean;
  themePreference: AppThemePreference;
  motionBackgroundEnabled?: boolean;
  onToggleMotionBackground?: (enabled: boolean) => void;
  onChangeTheme: (theme: AppThemePreference) => void;
};

export function AppearanceScreen({
  embedded = false,
  themePreference,
  motionBackgroundEnabled = true,
  onToggleMotionBackground,
  onChangeTheme
}: AppearanceScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <AppScreen title={embedded ? undefined : t('settings.appearanceSection')}>
      <View style={styles.paletteGrid}>
        {themeOptions.map((themeOption) => {
          const isActive = themePreference === themeOption.id;

          return (
            <Pressable
              key={themeOption.id}
              onPress={() => onChangeTheme(themeOption.id)}
              style={({ pressed, hovered }) => [
                styles.paletteItem,
                hovered && styles.paletteItemHover,
                isActive && styles.paletteItemActive,
                pressed && styles.paletteItemPressed
              ]}
              accessibilityRole="button"
              accessibilityLabel={t(`settings.themeChoices.${themeOption.id}.label`)}
            >
              <PaletteDisc colors={themeOption.paletteSwatch} active={isActive} />
              <Text style={styles.themeTitle}>{t(`settings.themeChoices.${themeOption.id}.label`)}</Text>
              {isActive ? <Text style={styles.activeLabel}>{t('settings.activeAppearance')}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      {onToggleMotionBackground ? (
        <Pressable
          onPress={() => onToggleMotionBackground(!motionBackgroundEnabled)}
          style={({ pressed, hovered }) => [styles.motionToggle, hovered && styles.motionToggleHover, pressed && styles.paletteItemPressed]}
          accessibilityRole="switch"
          accessibilityState={{ checked: motionBackgroundEnabled }}
        >
          <View style={[styles.motionKnobTrack, motionBackgroundEnabled && styles.motionKnobTrackActive]}>
            <View style={[styles.motionKnob, motionBackgroundEnabled && styles.motionKnobActive]} />
          </View>
          <View style={styles.motionCopy}>
            <Text style={styles.motionTitle}>{t('settings.motionBackground')}</Text>
            <Text style={styles.motionSubtitle}>{t('settings.motionBackgroundHint')}</Text>
          </View>
        </Pressable>
      ) : null}
    </AppScreen>
  );
}

function PaletteDisc({ colors, active }: { colors: readonly [string, string, string, string]; active: boolean }) {
  const theme = useTheme();

  return (
    <View>
      <Svg width={96} height={96} viewBox="0 0 96 96">
        <Path d="M48 48 L48 2 A46 46 0 0 1 94 48 Z" fill={colors[0]} />
        <Path d="M48 48 L94 48 A46 46 0 0 1 48 94 Z" fill={colors[1]} />
        <Path d="M48 48 L48 94 A46 46 0 0 1 2 48 Z" fill={colors[2]} />
        <Path d="M48 48 L2 48 A46 46 0 0 1 48 2 Z" fill={colors[3]} />
        <Circle cx="48" cy="48" r="45" fill="none" stroke={active ? theme.colors.primary : theme.colors.borderStrong} strokeWidth={active ? 4 : 1.5} />
      </Svg>
      {active ? (
        <View style={stylesStatic.checkBadge}>
          <MinimalIcon name="check" size={14} color={theme.colors.primary} strokeWidth={3} />
        </View>
      ) : null}
    </View>
  );
}

const stylesStatic = StyleSheet.create({
  checkBadge: {
    position: 'absolute',
    left: 32,
    top: 32,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  }
});

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    paletteGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.md
    },
    paletteItem: {
      width: 148,
      minHeight: 148,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: theme.colors.surface,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs
    },
    paletteItemActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    paletteItemHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceMuted,
      transform: [{ translateY: -2 }]
    },
    paletteItemPressed: {
      transform: [{ scale: 0.994 }]
    },
    themeTitle: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
      ...textStyles.bodyStrong
    },
    activeLabel: {
      color: theme.colors.success,
      fontSize: typography.caption,
      fontWeight: '900'
    },
    motionToggle: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: layout.cardPadding,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md
    },
    motionToggleHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceMuted
    },
    motionKnobTrack: {
      width: 54,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      paddingHorizontal: 3
    },
    motionKnobTrackActive: {
      backgroundColor: theme.colors.badgeAccentBackground,
      borderColor: theme.colors.primary
    },
    motionKnob: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.textMuted
    },
    motionKnobActive: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.primary
    },
    motionCopy: {
      flex: 1,
      gap: 2
    },
    motionTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.bodyStrong
    },
    motionSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      lineHeight: 18
    }
  });
}
