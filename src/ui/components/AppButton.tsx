import { useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptic, playSound, type HapticType } from '../../lib/feedback';
import { controls, radius, spacing } from '../system/layout';
import { getButtonPalette, type ButtonState, type ButtonVariant } from '../system/theme';
import { textStyles } from '../system/typography';
import { useTheme } from '../theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  leftSlot?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  hapticType?: HapticType;
};

export function AppButton({ label, onPress, variant = 'primary', leftSlot, disabled = false, loading = false, hapticType = 'light' }: AppButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    haptic(hapticType);
    void playSound('tap');
    scale.setValue(0.96);
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true
    }).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed, hovered }) => {
          const state: ButtonState = isDisabled ? 'disabled' : pressed ? 'pressed' : hovered ? 'hover' : 'default';
          const palette = getButtonPalette(theme, variant, state);

          return [
            styles.base,
            {
              backgroundColor: palette.backgroundColor,
              borderColor: palette.borderColor
            },
            isDisabled && styles.disabled,
            pressed && !isDisabled && styles.pressed
          ];
        }}
      >
        {({ pressed, hovered }) => {
          const state: ButtonState = isDisabled ? 'disabled' : pressed ? 'pressed' : hovered ? 'hover' : 'default';
          const palette = getButtonPalette(theme, variant, state);

          return (
            <>
              {loading ? <ActivityIndicator color={palette.textColor} /> : null}
              {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}
              <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
            </>
          );
        }}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    base: {
      minHeight: controls.minHeight,
      borderRadius: radius.md,
      paddingHorizontal: controls.buttonPaddingX,
      paddingVertical: controls.buttonPaddingY,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: 'transparent'
    },
    pressed: {
      opacity: 0.94,
      transform: [{ scale: 0.992 }]
    },
    disabled: {
      opacity: 0.42
    },
    label: {
      ...textStyles.bodyStrong
    },
    leftSlot: {
      width: controls.iconSize,
      height: controls.iconSize,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
