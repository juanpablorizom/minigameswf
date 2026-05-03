import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { gameRegistry, normalizeGameIds } from '../../data/gameRegistry';
import type { GameId, RoomSettings } from '../../navigation/types';
import { GameSettingsFields } from '../gameSettings/GameSettingsRegistry';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type RoomSettingsScreenProps = {
  settings: RoomSettings;
  selectedGameIds?: GameId[];
  onChangeSettings: (next: RoomSettings) => void;
  onSave: () => void;
  embedded?: boolean;
};

export function RoomSettingsScreen({
  settings,
  selectedGameIds = [],
  onChangeSettings,
  onSave,
  embedded = false
}: RoomSettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const safeSelectedGameIds = normalizeGameIds(selectedGameIds);
  const [expandedGameId, setExpandedGameId] = useState<GameId | null>(safeSelectedGameIds[0] ?? null);
  const roundOptions = [1, 2, 3, 5, 10];

  useEffect(() => {
    if (expandedGameId && !safeSelectedGameIds.includes(expandedGameId)) {
      setExpandedGameId(safeSelectedGameIds[0] ?? null);
    }
  }, [expandedGameId, safeSelectedGameIds]);

  const content = (
    <>
      <SurfaceCard>
        <View style={styles.modeCard}>
          <Text style={styles.sectionTitle}>{t('roomSettings.modeTitle')}</Text>
          <View style={styles.modeRow}>
            {(['tournament', 'single'] as const).map((mode) => {
              const isSelected = settings.mode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => onChangeSettings({ ...settings, mode })}
                  style={({ pressed }) => [styles.modeOption, isSelected && styles.modeOptionSelected, pressed && styles.blockHeaderPressed]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.modeLabel, isSelected && styles.modeLabelSelected]}>
                    {mode === 'tournament' ? t('roomSettings.modeTournament') : t('roomSettings.modeSingle')}
                  </Text>
                  <Text style={styles.summaryCopy}>
                    {mode === 'tournament' ? t('roomSettings.modeTournamentHint') : t('roomSettings.modeSingleHint')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {settings.mode === 'single' ? (
            <View style={styles.roundSelector}>
              <Text style={styles.summaryCopy}>{t('roomSettings.singleRoundCount')}</Text>
              <View style={styles.roundOptions}>
                {roundOptions.map((count) => (
                  <Pressable
                    key={count}
                    onPress={() => onChangeSettings({ ...settings, singleGameRoundCount: count })}
                    style={[
                      styles.roundOption,
                      settings.singleGameRoundCount === count && styles.roundOptionSelected
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.roundOptionLabel, settings.singleGameRoundCount === count && styles.roundOptionLabelSelected]}>
                      {count}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </SurfaceCard>

      {safeSelectedGameIds.map((gameId) => {
        const game = gameRegistry[gameId];
        const isExpanded = expandedGameId === gameId;

        return (
          <SurfaceCard key={gameId}>
            <Pressable
              onPress={() => setExpandedGameId(isExpanded ? null : gameId)}
              style={({ pressed }) => [styles.blockHeader, pressed && styles.blockHeaderPressed]}
              accessibilityRole="button"
              accessibilityLabel={t(`gameMeta.names.${gameId}`)}
            >
              <Image source={game.thumbnail} resizeMode="contain" style={styles.gameThumb} />
              <View style={styles.headerCopy}>
                <Text style={styles.sectionTitle}>{t(`gameMeta.names.${gameId}`)}</Text>
                <Text style={styles.summaryCopy}>{game.hasSettings ? t('roomSettings.settings') : t('roomSettings.noSettings')}</Text>
              </View>
              <Text style={styles.chevron}>{isExpanded ? '−' : '+'}</Text>
            </Pressable>

            {isExpanded ? (
              <View style={styles.settingsBody}>
                <Text style={styles.settingsTitle}>
                  {t('roomSettings.gameSettingsTitle', { game: t(`gameMeta.names.${gameId}`) })}
                </Text>
                <GameSettingsFields gameId={gameId} settings={settings} onChangeSettings={onChangeSettings} />
              </View>
            ) : null}
          </SurfaceCard>
        );
      })}

      {!embedded ? <AppButton label={t('roomSettings.save')} onPress={onSave} /> : null}
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedContent}>{content}</View>;
  }

  return (
    <AppScreen title={t('roomSettings.title')} subtitle={t('roomSettings.subtitle')}>
      {content}
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    embeddedContent: {
      gap: spacing.md
    },
    blockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md
    },
    blockHeaderPressed: {
      opacity: 0.86
    },
    gameThumb: {
      width: 48,
      height: 48,
      borderRadius: 14
    },
    headerCopy: {
      flex: 1,
      gap: 2
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '800'
    },
    summaryCopy: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      lineHeight: 18
    },
    chevron: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      fontWeight: '800'
    },
    settingsBody: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: spacing.md,
      gap: spacing.md
    },
    settingsTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '900'
    },
    modeCard: {
      gap: spacing.md
    },
    modeRow: {
      flexDirection: 'row',
      gap: spacing.sm
    },
    modeOption: {
      flex: 1,
      minHeight: 88,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: spacing.md,
      gap: spacing.xs,
      justifyContent: 'center'
    },
    modeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    modeLabel: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '900'
    },
    modeLabelSelected: {
      color: theme.colors.highlight
    },
    roundSelector: {
      gap: spacing.sm
    },
    roundOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm
    },
    roundOption: {
      minWidth: 48,
      minHeight: 42,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center'
    },
    roundOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary
    },
    roundOptionLabel: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    roundOptionLabelSelected: {
      color: theme.colors.primaryText
    }
  });
}
