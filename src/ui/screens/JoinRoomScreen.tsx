import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { SurfaceCard } from '../components/SurfaceCard';
import { layout, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

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
        <AppTextField
          value={code}
          onChangeText={(next) => setCode(next.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
          label={undefined}
          placeholder="AX4N2"
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={5}
          helperText={t('joinRoom.helper')}
        />
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
    ...textStyles.section
  },
  input: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center'
  },
  actionRow: {
    gap: layout.controlGap
  },
  notice: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    lineHeight: 18
  }
  });
}
