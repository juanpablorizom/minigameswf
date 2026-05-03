import { Animated, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

type LottieAssetProps = {
  size?: number;
};

export function LottieAsset({ size = 64 }: LottieAssetProps) {
  const theme = useTheme();

  return (
    <View style={[styles.shell, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.72
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7
  }
});
