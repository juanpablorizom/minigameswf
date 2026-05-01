import type { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { layout, useResponsive } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

type AppScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
}>;

export function AppScreen({ children, title, subtitle, footer }: AppScreenProps) {
  const theme = useTheme();
  const responsive = useResponsive();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            maxWidth: responsive.isDesktop ? layout.compactWidth : '100%',
            paddingHorizontal: responsive.screenPaddingX
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
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
      backgroundColor: 'transparent'
    },
    content: {
      width: '100%',
      maxWidth: layout.compactWidth,
      alignSelf: 'center',
      paddingHorizontal: layout.screenPaddingX,
      paddingTop: layout.screenPaddingTop,
      paddingBottom: layout.screenPaddingBottom,
      gap: layout.sectionGap
    },
    header: {
      gap: layout.groupGap,
      paddingBottom: layout.controlGap
    },
    title: {
      color: theme.colors.textPrimary,
      ...textStyles.title
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 26,
      maxWidth: 760
    },
    footer: {
      marginTop: layout.controlGap
    }
  });
}
