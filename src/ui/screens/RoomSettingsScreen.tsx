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
  selectedGameIds = ['impostor'],
  onChangeSettings,
  onSave,
  embedded = false
}: RoomSettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const safeSelectedGameIds = normalizeGameIds(selectedGameIds);
  const [expandedGameId, setExpandedGameId] = useState<GameId | null>(safeSelectedGameIds[0] ?? 'impostor');

  useEffect(() => {
    if (expandedGameId && !safeSelectedGameIds.includes(expandedGameId)) {
      setExpandedGameId(safeSelectedGameIds[0] ?? 'impostor');
    }
  }, [expandedGameId, safeSelectedGameIds]);

  const content = (
    <>
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
    }
  });
}
