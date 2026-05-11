import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import { gameRegistry } from '../../data/gameRegistry';
import type { GameId } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { GameCard } from '../components/GameCard';
import { layout, spacing, useResponsive } from '../system/layout';
import { textStyles } from '../system/typography';
import { useTheme } from '../theme';
import type { RoomSettings } from '../../navigation/types';

type ChooseGamesScreenProps = {
  selectedGameIds: GameId[];
  settings: RoomSettings;
  onToggleGame: (gameId: GameId) => void;
  onChangeSettings: (next: RoomSettings) => void;
  onSave: () => void;
};

export function ChooseGamesScreen({ selectedGameIds, settings, onToggleGame, onChangeSettings, onSave }: ChooseGamesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const responsive = useResponsive();
  const isWide = !responsive.isPhone;
  const columnStyle = responsive.isDesktop ? styles.cellDesktop : isWide ? styles.cellWide : styles.cell;
  const roundOptions = [1, 2, 3, 5, 10];

  function setMode(mode: RoomSettings['mode']) {
    const nextSelectedGameIds = mode === 'single' && selectedGameIds.length > 1 ? [selectedGameIds[0]] : selectedGameIds;
    onChangeSettings({ ...settings, mode });

    if (mode === 'single' && nextSelectedGameIds.length !== selectedGameIds.length) {
      selectedGameIds.slice(1).forEach((gameId) => onToggleGame(gameId));
    }
  }

  function handleToggleGame(gameId: GameId) {
    if (settings.mode === 'single' && !selectedGameIds.includes(gameId)) {
      selectedGameIds.forEach((selectedGameId) => onToggleGame(selectedGameId));
    }

    onToggleGame(gameId);
  }

  return (
    <AppScreen title={t('chooseGames.title')} subtitle={t('chooseGames.subtitle')}>
      <View style={styles.modePanel}>
        <View style={styles.modeRow}>
          {(['tournament', 'single'] as const).map((mode) => {
            const isSelected = settings.mode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => setMode(mode)}
                style={[styles.modeOption, isSelected && styles.modeOptionSelected]}
                accessibilityRole="button"
              >
                <Text style={[styles.modeLabel, isSelected && styles.modeLabelSelected]}>
                  {mode === 'tournament' ? t('tournament.modeTournament') : t('tournament.modeSingle')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {settings.mode === 'single' ? (
          <View style={styles.roundSelector}>
            <Text style={styles.roundLabel}>{t('tournament.roundCount')}</Text>
            <View style={styles.roundOptions}>
              {roundOptions.map((count) => {
                const isSelected = settings.singleGameRoundCount === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => onChangeSettings({ ...settings, singleGameRoundCount: count })}
                    style={[styles.roundOption, isSelected && styles.roundOptionSelected]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.roundOptionLabel, isSelected && styles.roundOptionLabelSelected]}>{count}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.gridShell}>
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {featuredGames.map((game) => (
            <View key={game.id} style={columnStyle}>
              <GameCard
                title={t(`gameMeta.names.${game.id}`)}
                imageSource={gameRegistry[game.id].thumbnail}
                selected={selectedGameIds.includes(game.id)}
                onPress={() => handleToggleGame(game.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {!selectedGameIds.length ? <Text style={styles.validationCopy}>{t('chooseGames.selectAtLeastOne')}</Text> : null}
      <AppButton label={t('chooseGames.save')} onPress={onSave} disabled={!selectedGameIds.length} />
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    gridShell: {
      width: '100%',
      maxWidth: layout.compactWidth,
      alignSelf: 'center'
    },
    modePanel: {
      width: '100%',
      maxWidth: layout.compactWidth,
      alignSelf: 'center',
      gap: spacing.md
    },
    modeRow: {
      flexDirection: 'row',
      gap: spacing.sm
    },
    modeOption: {
      flex: 1,
      minHeight: 52,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm
    },
    modeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    modeLabel: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      ...textStyles.bodyStrong
    },
    modeLabelSelected: {
      color: theme.colors.textPrimary
    },
    roundSelector: {
      gap: spacing.sm
    },
    roundLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    roundOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm
    },
    roundOption: {
      minWidth: 48,
      minHeight: 44,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface
    },
    roundOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary
    },
    roundOptionLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    roundOptionLabelSelected: {
      color: theme.colors.background
    },
    grid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.md
    },
    gridWide: {
      justifyContent: 'flex-start'
    },
    cell: {
      width: '100%'
    },
    cellWide: {
      width: '48%'
    },
    cellDesktop: {
      width: '31.8%'
    },
    validationCopy: {
      color: theme.colors.error,
      textAlign: 'center',
      ...textStyles.bodyStrong
    }
  });
}
