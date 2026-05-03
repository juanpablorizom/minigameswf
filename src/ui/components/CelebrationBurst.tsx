import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

const PARTICLES = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  x: (index - 3.5) * 18,
  y: -42 - (index % 3) * 16,
  rotate: index % 2 === 0 ? '18deg' : '-18deg'
}));

export function CelebrationBurst() {
  const theme = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [progress]);

  const opacity = progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.08] });

  return (
    <View pointerEvents="none" style={styles.shell}>
      {PARTICLES.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: index % 3 === 0 ? theme.colors.primary : index % 3 === 1 ? theme.colors.success : theme.colors.warning,
              opacity,
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.x] }) },
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.y] }) },
                { rotate: particle.rotate },
                { scale }
              ]
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    width: 1,
    height: 1
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 18,
    borderRadius: 4
  }
});
