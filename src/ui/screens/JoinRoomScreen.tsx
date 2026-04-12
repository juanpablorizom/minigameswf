import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type JoinRoomScreenProps = {
  isBusy: boolean;
  notice: string | null;
  onJoin: (code: string) => void;
  onOpenScanner: () => void;
};

export function JoinRoomScreen({ isBusy, notice, onJoin, onOpenScanner }: JoinRoomScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [code, setCode] = useState('');

  return (
    <AppScreen title={t('joinRoom.title')} subtitle={t('joinRoom.subtitle')}>
      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('joinRoom.roomCode')}</Text>
        <TextInput
          value={code}
          onChangeText={(next) => setCode(next.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
          placeholder="AX4N2"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={5}
        />
        <Text style={styles.helper}>{t('joinRoom.helper')}</Text>
        <View style={styles.actionRow}>
          <AppButton label={t('joinRoom.joinParty')} onPress={() => onJoin(code)} disabled={isBusy || code.trim().length < 5} />
          <AppButton label={t('joinRoom.scanInstead')} onPress={onOpenScanner} variant="secondary" disabled={isBusy} />
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  input: {
    minHeight: 64,
    borderRadius: radius.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    paddingHorizontal: spacing.md,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center'
  },
  helper: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  actionRow: {
    gap: spacing.sm
  },
  notice: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    lineHeight: 18
  }
  });
}
