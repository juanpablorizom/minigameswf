import type { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '../theme';

type AppScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
}>;

export function AppScreen({ children, title, subtitle, footer }: AppScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: spacing.lg
    },
    header: {
      gap: spacing.sm
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      fontWeight: '700',
      letterSpacing: -0.8
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    footer: {
      marginTop: spacing.sm
    },
    backgroundGlowTop: {
      position: 'absolute',
      top: -80,
      left: -30,
      width: 220,
      height: 220,
      borderRadius: 220,
      backgroundColor: theme.colors.glowTop
    },
    backgroundGlowBottom: {
      position: 'absolute',
      right: -50,
      bottom: 110,
      width: 180,
      height: 180,
      borderRadius: 180,
      backgroundColor: theme.colors.glowBottom
    }
  });
}
