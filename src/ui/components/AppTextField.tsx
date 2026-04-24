import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { controls, radius, spacing } from '../system/layout';
import { getInputPalette, type InputState } from '../system/theme';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

type AppTextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string | null;
  state?: Exclude<InputState, 'disabled'>;
};

export function AppTextField({
  label,
  helperText,
  state = 'default',
  editable = true,
  style,
  onFocus,
  onBlur,
  ...props
}: AppTextFieldProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [isFocused, setIsFocused] = useState(false);
  const visualState: InputState = !editable ? 'disabled' : isFocused ? 'focus' : state;
  const palette = getInputPalette(theme, visualState);
  const helperTone =
    state === 'error' ? theme.colors.error : state === 'warning' ? theme.colors.warning : theme.colors.textSecondary;

  return (
    <View style={styles.root}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        editable={editable}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: palette.backgroundColor,
            borderColor: palette.borderColor,
            color: palette.textColor
          },
          style
        ]}
      />
      {helperText ? <Text style={[styles.helper, { color: helperTone }]}>{helperText}</Text> : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      gap: spacing.xs
    },
    label: {
      color: theme.colors.textPrimary,
      ...textStyles.bodyStrong
    },
    input: {
      minHeight: controls.minHeight,
      borderRadius: radius.lg,
      borderWidth: 2,
      paddingHorizontal: controls.inputPaddingX,
      paddingVertical: controls.inputPaddingY,
      fontSize: typography.body
    },
    helper: {
      fontSize: typography.caption,
      lineHeight: 18
    }
  });
}
