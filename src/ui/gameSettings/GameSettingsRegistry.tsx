import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { guessWhoCategoryOptions } from '../../data/guessWho/categories';
import { impostorThemeOptions } from '../../data/themes';
import type { GameId, RoomSettings } from '../../navigation/types';
import { radius, spacing, typography, useTheme } from '../theme';

type GameSettingsFieldsProps = {
  gameId: GameId;
  settings: RoomSettings;
  onChangeSettings: (next: RoomSettings) => void;
};

const impostorCountOptions = [1, 2, 3, 4];
const turnOptions = [0, 30, 45, 60, 300];
const missBehaviorOptions: RoomSettings['games']['impostor']['missBehavior'][] = ['repeat', 'end'];

export function GameSettingsFields({ gameId, settings, onChangeSettings }: GameSettingsFieldsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  if (gameId === 'guess-who') {
    const guessWhoSettings = settings.games['guess-who'];

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.guessWhoCategory')}</Text>
        <View style={styles.optionColumn}>
          {guessWhoCategoryOptions.map((category) => (
            <OptionChip
              key={category}
              label={t(`roomSettings.guessWhoCategoryOptions.${category}`)}
              active={guessWhoSettings.category === category}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    'guess-who': { ...guessWhoSettings, category }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  if (gameId === 'impostor') {
    const impostorSettings = settings.games.impostor;

    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{t('roomSettings.impostorCount')}</Text>
        <View style={styles.optionRow}>
          {impostorCountOptions.map((impostorCount) => (
            <OptionChip
              key={impostorCount}
              label={t('roomSettings.impostorCountValue', { count: impostorCount })}
              active={impostorSettings.impostorCount === impostorCount}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, impostorCount }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.theme')}</Text>
        <Text style={styles.summaryCopy}>{t('roomSettings.themeHint')}</Text>
        <View style={styles.optionColumn}>
          {impostorThemeOptions.map((themeCategory) => (
            <OptionChip
              key={themeCategory}
              label={t(`roomSettings.themeOptions.${themeCategory}`)}
              active={impostorSettings.themeCategory === themeCategory}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, themeCategory }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.turnTimer')}</Text>
        <View style={styles.optionRow}>
          {turnOptions.map((turnSeconds) => (
            <OptionChip
              key={turnSeconds}
              label={
                turnSeconds === 0
                  ? t('roomSettings.turnTimerOptions.none')
                  : turnSeconds === 300
                    ? t('roomSettings.turnTimerOptions.fiveMinutes')
                    : `${turnSeconds}s`
              }
              active={impostorSettings.turnSeconds === turnSeconds}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, turnSeconds }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.missBehavior')}</Text>
        <Text style={styles.summaryCopy}>{t('roomSettings.missBehaviorHint')}</Text>
        <View style={styles.optionColumn}>
          {missBehaviorOptions.map((missBehavior) => (
            <OptionChip
              key={missBehavior}
              label={t(`roomSettings.missBehaviorOptions.${missBehavior}`)}
              active={impostorSettings.missBehavior === missBehavior}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, missBehavior }
                  }
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('roomSettings.balanceRule')}</Text>
        <Text style={styles.summaryCopy}>{t('roomSettings.balanceRuleHint')}</Text>
        <View style={styles.optionRow}>
          {[true, false].map((balanceEndsGame) => (
            <OptionChip
              key={String(balanceEndsGame)}
              label={balanceEndsGame ? t('common.on') : t('common.off')}
              active={impostorSettings.balanceEndsGame === balanceEndsGame}
              onPress={() =>
                onChangeSettings({
                  ...settings,
                  games: {
                    ...settings.games,
                    impostor: { ...impostorSettings, balanceEndsGame }
                  }
                })
              }
            />
          ))}
        </View>
      </View>
    );
  }

  return <Text style={styles.summaryCopy}>{t('roomSettings.noSettings')}</Text>;
}

type OptionChipProps = {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function OptionChip({ label, active, disabled = false, onPress }: OptionChipProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.optionChip, active && styles.optionChipActive, disabled && styles.optionChipDisabled]}>
      <Text style={[styles.optionLabel, active && styles.optionLabelActive, disabled && styles.optionLabelDisabled]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    block: {
      gap: spacing.md
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
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
      minHeight: 48,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted
    },
    optionChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.successMuted
    },
    optionChipDisabled: {
      opacity: 0.5
    },
    optionLabel: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    optionLabelActive: {
      color: theme.colors.primary,
      fontWeight: '800'
    },
    optionLabelDisabled: {
      color: theme.colors.textMuted
    }
  });
}
