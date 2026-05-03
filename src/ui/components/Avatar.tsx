import { Image, StyleSheet, View } from 'react-native';

import { DEFAULT_AVATAR_ID, getAvatarById, getFrameById } from '../../data/avatarCatalog';

type AvatarProps = {
  avatarId?: string | null;
  frameId?: string | null;
  size?: number;
};

export function Avatar({ avatarId = DEFAULT_AVATAR_ID, frameId = 'plain', size = 44 }: AvatarProps) {
  const avatar = getAvatarById(avatarId);
  const frame = getFrameById(frameId);
  const styles = createStyles(size, frame.borderWidth);

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
      <Image source={avatar.source} resizeMode="cover" style={styles.image} />
    </View>
  );
}

function createStyles(size: number, frameWidth: number) {
  return StyleSheet.create({
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: frameWidth,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    image: {
      width: size - frameWidth * 2,
      height: size - frameWidth * 2,
      borderRadius: (size - frameWidth * 2) / 2
    }
  });
}
