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
      width: '100%',
      maxWidth: 1040,
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: spacing.lg
    },
    header: {
      gap: spacing.md,
      paddingBottom: spacing.sm
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      fontWeight: '800',
      letterSpacing: -1.2,
      lineHeight: 40
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 26,
      maxWidth: 760
    },
    footer: {
      marginTop: spacing.sm
    }
  });
}
