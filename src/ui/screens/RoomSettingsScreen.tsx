import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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

const impostorCountOptions = [1, 2, 3];
const roundOptions = [2, 3, 4];
const turnOptions = [30, 45, 60];
const themeOptions: RoomSettings['themeCategory'][] = ['animals', 'countries', 'objects'];

export function RoomSettingsScreen({ settings, onChangeSettings, onSave }: RoomSettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <AppScreen title={t('roomSettings.title')} subtitle={t('roomSettings.subtitle')}>
      <SurfaceCard>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>{t('roomSettings.profileTitle')}</Text>
          <Badge label={t('gameMeta.names.impostor')} tone="accent" />
        </View>
        <Text style={styles.summaryCopy}>
          {t('roomSettings.summary', {
            rounds: settings.rounds,
            turnSeconds: settings.turnSeconds,
            impostorCount: settings.impostorCount,
            theme: t(`roomSettings.themeOptions.${settings.themeCategory}`).toLowerCase()
          })}
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('roomSettings.impostorCount')}</Text>
        <View style={styles.optionRow}>
          {impostorCountOptions.map((impostorCount) => (
            <OptionChip
              key={impostorCount}
              label={t('roomSettings.impostorCountValue', { count: impostorCount })}
              active={settings.impostorCount === impostorCount}
              onPress={() => onChangeSettings({ ...settings, impostorCount })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('roomSettings.theme')}</Text>
        <Text style={styles.summaryCopy}>{t('roomSettings.themeHint')}</Text>
        <View style={styles.optionColumn}>
          {themeOptions.map((themeCategory) => (
            <OptionChip
              key={themeCategory}
              label={t(`roomSettings.themeOptions.${themeCategory}`)}
              active={settings.themeCategory === themeCategory}
              onPress={() => onChangeSettings({ ...settings, themeCategory })}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('roomSettings.rounds')}</Text>
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
        <Text style={styles.sectionTitle}>{t('roomSettings.turnTimer')}</Text>
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

      <AppButton label={t('roomSettings.save')} onPress={onSave} />
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
