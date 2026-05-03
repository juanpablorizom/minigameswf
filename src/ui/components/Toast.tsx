import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { radius, spacing, useTheme } from '../theme';
import { textStyles } from '../system/typography';

type ToastProps = {
  message: string | null;
  tone?: 'success' | 'warning' | 'neutral';
};

export function Toast({ message, tone = 'neutral' }: ToastProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) {
      progress.setValue(0);
      return;
    }

    progress.setValue(0);
    const animation = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: true })
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [message, progress]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        tone === 'success' && styles.toastSuccess,
        tone === 'warning' && styles.toastWarning,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }]
        }
      ]}
    >
      <Text style={styles.label}>{message}</Text>
    </Animated.View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    toast: {
      position: 'absolute',
      top: spacing.md,
      alignSelf: 'center',
      zIndex: 20,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm
    },
    toastSuccess: {
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.successMuted
    },
    toastWarning: {
      borderColor: theme.colors.warning,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    label: {
      color: theme.colors.textPrimary,
      ...textStyles.bodyStrong
    }
  });
}
