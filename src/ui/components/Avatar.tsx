import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { getAvatarById, getFrameById } from '../../data/avatarCatalog';
import { useTheme } from '../theme';

type AvatarProps = {
  avatarId?: string | null;
  frameId?: string | null;
  size?: number;
};

export function Avatar({ avatarId = 'default', frameId = 'plain', size = 44 }: AvatarProps) {
  const theme = useTheme();
  const avatar = getAvatarById(avatarId);
  const frame = getFrameById(frameId);
  const styles = createStyles(theme, size, frame.borderWidth);

  return (
    <View
      style={[
        styles.avatar,
        frame.borderColor
          ? {
              borderColor: frame.borderColor,
              borderWidth: frame.borderWidth,
              borderStyle: frame.borderStyle ?? 'solid'
            }
          : null
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {avatar.kind === 'default' ? (
        <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 48 48">
          <Circle cx="24" cy="17" r="8" fill={theme.colors.textMuted} />
          <Path
            d="M12 38c1.6-8 6-12 12-12s10.4 4 12 12c-3.1 2.2-7.1 3.4-12 3.4S15.1 40.2 12 38z"
            fill={theme.colors.textMuted}
          />
          <Circle cx="20.8" cy="16.2" r="1.6" fill={theme.colors.surface} />
          <Circle cx="27.2" cy="16.2" r="1.6" fill={theme.colors.surface} />
          <Path d="M20.5 21.5c2.1 1.7 4.9 1.7 7 0" stroke={theme.colors.surface} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ) : (
        <Text style={styles.emoji}>{avatar.emoji}</Text>
      )}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>, size: number, frameWidth: number) {
  return StyleSheet.create({
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: frameWidth || 1,
      borderColor: frameWidth ? theme.colors.primary : theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    emoji: {
      fontSize: Math.round(size * 0.5),
      lineHeight: Math.round(size * 0.62)
    }
  });
}
