import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors, radius, spacing, typography } from '../theme';

type JoinRoomScreenProps = {
  isBusy: boolean;
  notice: string | null;
  onJoin: (code: string) => void;
};

export function JoinRoomScreen({ isBusy, notice, onJoin }: JoinRoomScreenProps) {
  const [code, setCode] = useState('');

  return (
    <AppScreen title="Join room" subtitle="Enter the code your host shared. If the room is still open, you will drop straight into the party.">
      <SurfaceCard>
        <Text style={styles.sectionTitle}>Room code</Text>
        <TextInput
          value={code}
          onChangeText={(next) => setCode(next.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
          placeholder="AX4N2"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={5}
        />
        <Text style={styles.helper}>Codes are short and private. Ask the host to share the latest code if this one does not work.</Text>
        <AppButton label="Join party" onPress={() => onJoin(code)} disabled={isBusy || code.trim().length < 4} />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  input: {
    minHeight: 64,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center'
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  notice: {
    color: colors.accentSoft,
    fontSize: typography.caption,
    lineHeight: 18
  }
});
