import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  const theme = useTheme();
  const styles = createStyles(theme);
  const [code, setCode] = useState('');
  const canEnter = code.trim().length === 5;

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Unirse a sala</Text>
        <Text style={styles.subtitle}>Ingresa el codigo de 5 caracteres que te compartieron.</Text>
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Codigo de sala</Text>
        <AppTextField
          value={code}
          onChangeText={(next) => setCode(next.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
          label={undefined}
          placeholder="AX4N2"
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={5}
          helperText={code.length ? `${code.length}/5` : 'Pega o escribe el codigo en mayusculas.'}
        />
        <View style={styles.actionRow}>
          <AppButton label="Entrar" onPress={() => onJoin(code)} disabled={isBusy || !canEnter} />
          <AppButton label="Escanear QR" onPress={onOpenScanner} variant="secondary" disabled={isBusy} />
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  header: {
    gap: layout.groupGap,
    alignItems: 'center'
  },
  title: {
    color: theme.colors.textPrimary,
    ...textStyles.title,
    textAlign: 'center'
  },
  subtitle: {
    color: theme.colors.textSecondary,
    ...textStyles.body,
    textAlign: 'center',
    maxWidth: 420
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    ...textStyles.section,
    textAlign: 'center'
  },
  input: {
    minHeight: 86,
    fontSize: 34,
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
