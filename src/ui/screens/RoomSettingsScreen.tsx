import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RoomSettings } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type RoomSettingsScreenProps = {
  settings: RoomSettings;
  onChangeSettings: (next: RoomSettings) => void;
  onSave: () => void;
};

const maxPlayerOptions = [6, 8, 10];
const roundOptions = [2, 3, 4];
const turnOptions = [30, 45, 60];
const privacyOptions: RoomSettings['privacy'][] = ['Invite only', 'Friends of friends'];
const vibeOptions: RoomSettings['vibe'][] = ['Balanced', 'Fast', 'Talkative'];
const formatOptions: RoomSettings['format'][] = ['Casual', 'Competitive'];

export function RoomSettingsScreen({ settings, onChangeSettings, onSave }: RoomSettingsScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <AppScreen title="Room Settings" subtitle="Keep the session easy to join, quick to understand, and tightly paced for mobile play.">
      <SurfaceCard>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>Tonight's room profile</Text>
          <Badge label={settings.chatEnabled ? 'Chat on' : 'Chat off'} tone={settings.chatEnabled ? 'success' : 'neutral'} />
        </View>
        <Text style={styles.summaryCopy}>A {settings.format.toLowerCase()} room for up to {settings.maxPlayers} players with {settings.rounds} rounds and a {settings.turnSeconds}-second timer.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Max players</Text>
        <View style={styles.optionRow}>
          {maxPlayerOptions.map((maxPlayers) => (
            <OptionChip
              key={maxPlayers}
              label={`${maxPlayers}`}
              active={settings.maxPlayers === maxPlayers}
              onPress={() => onChangeSettings({ ...settings, maxPlayers })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Rounds</Text>
        <View style={styles.optionRow}>
          {roundOptions.map((rounds) => (
            <OptionChip
              key={rounds}
              label={`${rounds}`}
              active={settings.rounds === rounds}
              onPress={() => onChangeSettings({ ...settings, rounds })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Turn timer</Text>
        <View style={styles.optionRow}>
          {turnOptions.map((turnSeconds) => (
            <OptionChip
              key={turnSeconds}
              label={`${turnSeconds}s`}
              active={settings.turnSeconds === turnSeconds}
              onPress={() => onChangeSettings({ ...settings, turnSeconds })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.optionColumn}>
          {privacyOptions.map((privacy) => (
            <OptionChip
              key={privacy}
              label={privacy}
              active={settings.privacy === privacy}
              onPress={() => onChangeSettings({ ...settings, privacy })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Room vibe</Text>
        <View style={styles.optionColumn}>
          {vibeOptions.map((vibe) => (
            <OptionChip
              key={vibe}
              label={vibe}
              active={settings.vibe === vibe}
              onPress={() => onChangeSettings({ ...settings, vibe })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Format</Text>
        <View style={styles.optionRow}>
          {formatOptions.map((format) => (
            <OptionChip
              key={format}
              label={format}
              active={settings.format === format}
              onPress={() => onChangeSettings({ ...settings, format })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Room chat</Text>
        <View style={styles.optionRow}>
          <OptionChip
            label="Chat on"
            active={settings.chatEnabled}
            onPress={() => onChangeSettings({ ...settings, chatEnabled: true })}
          />
          <OptionChip
            label="Chat off"
            active={!settings.chatEnabled}
            onPress={() => onChangeSettings({ ...settings, chatEnabled: false })}
          />
        </View>
      </SurfaceCard>

      <AppButton label="Save Room Settings" onPress={onSave} />
    </AppScreen>
  );
}

type OptionChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function OptionChip({ label, active, onPress }: OptionChipProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={[styles.optionChip, active && styles.optionChipActive]}>
      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  summaryCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  optionColumn: {
    gap: spacing.sm
  },
  optionChip: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundElevated,
    justifyContent: 'center'
  },
  optionChipActive: {
    backgroundColor: theme.colors.successMuted,
    borderColor: theme.colors.success
  },
  optionLabel: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600'
  },
  optionLabelActive: {
    color: theme.colors.successText
  }
  });
}
