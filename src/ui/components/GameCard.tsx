import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { controls, layout, radius, spacing } from '../system/layout';
import { textStyles } from '../system/typography';
import { useTheme } from '../theme';
import { MinimalIcon } from './MinimalIcon';

type GameCardProps = {
  title?: string;
  imageSource?: ImageSourcePropType;
  selected?: boolean;
  inactive?: boolean;
  showHelpButton?: boolean;
  placeholderLabel?: string;
  onPress: () => void;
  onHelpPress?: () => void;
};

export function GameCard({
  title,
  imageSource,
  selected = false,
  inactive = false,
  showHelpButton = true,
  placeholderLabel = 'Coming soon',
  onPress,
  onHelpPress
}: GameCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed, hovered }) => [
        styles.card,
        selected && styles.cardSelected,
        inactive && styles.cardInactive,
        hovered && styles.cardHover,
        pressed && styles.cardPressed
      ]}
    >
      {showHelpButton && !inactive ? (
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onHelpPress?.();
          }}
          style={({ pressed }) => [styles.helpButton, pressed && styles.helpButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Como funciona el juego"
        >
          <Text style={styles.helpLabel}>?</Text>
        </Pressable>
      ) : (
        <View style={styles.placeholderTopGap} />
      )}

      {selected && !inactive ? (
        <View style={styles.selectedMark}>
          <MinimalIcon name="check" size={18} color={theme.colors.background} strokeWidth={3} />
        </View>
      ) : null}

      <View style={styles.mediaWrap}>
        {imageSource ? (
          <Image source={imageSource} resizeMode="contain" style={styles.image} />
        ) : (
          <View style={styles.placeholderWrap}>
            <Text style={styles.placeholderPlus}>+</Text>
            <Text style={styles.placeholderLabel}>{placeholderLabel}</Text>
          </View>
        )}
      </View>

      {title ? <Text style={[styles.title, inactive && styles.titleInactive]}>{title}</Text> : null}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      width: '100%',
      minHeight: 320,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : theme.colors.surface,
      padding: layout.cardPadding,
      gap: layout.groupGap,
      justifyContent: 'space-between',
      position: 'relative'
    },
    cardSelected: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    cardInactive: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      opacity: 0.92
    },
    cardHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface
    },
    cardPressed: {
      transform: [{ scale: 0.992 }]
    },
    helpButton: {
      width: controls.iconSize + 12,
      height: controls.iconSize + 12,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end'
    },
    helpButtonPressed: {
      opacity: 0.9
    },
    selectedMark: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    helpLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    placeholderTopGap: {
      alignSelf: 'flex-end',
      width: controls.iconSize + 12,
      height: controls.iconSize + 12
    },
    mediaWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm
    },
    image: {
      width: '100%',
      height: 220
    },
    title: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
      ...textStyles.section
    },
    titleInactive: {
      color: theme.colors.textMuted
    },
    placeholderWrap: {
      width: '100%',
      height: 220,
      borderRadius: radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.colors.surfaceMuted
    },
    placeholderPlus: {
      color: theme.colors.textMuted,
      ...textStyles.title
    },
    placeholderLabel: {
      color: theme.colors.textMuted,
      ...textStyles.body
    }
  });
}
