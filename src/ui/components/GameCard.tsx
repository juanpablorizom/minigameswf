import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { controls, layout, radius, spacing } from '../system/layout';
import { textStyles } from '../system/typography';
import { useTheme } from '../theme';

type GameCardProps = {
  title: string;
  imageSource: number;
  selected?: boolean;
  onPress: () => void;
  onHelpPress?: () => void;
};

export function GameCard({ title, imageSource, selected = false, onPress, onHelpPress }: GameCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.card,
        selected && styles.cardSelected,
        hovered && styles.cardHover,
        pressed && styles.cardPressed
      ]}
    >
      <Pressable onPress={onHelpPress ?? (() => {})} style={({ pressed }) => [styles.helpButton, pressed && styles.helpButtonPressed]}>
        <Text style={styles.helpLabel}>?</Text>
      </Pressable>

      <View style={styles.mediaWrap}>
        <Image source={imageSource} resizeMode="contain" style={styles.image} />
      </View>

      <Text style={styles.title}>{title}</Text>
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
      justifyContent: 'space-between'
    },
    cardSelected: {
      borderColor: theme.colors.primary
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
    helpLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
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
    }
  });
}
