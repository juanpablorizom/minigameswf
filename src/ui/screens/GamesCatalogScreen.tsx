import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import { gameRegistry } from '../../data/gameRegistry';
import type { GameId } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { GameCard } from '../components/GameCard';
import { AppScreen } from '../components/AppScreen';
import { layout, spacing, useResponsive } from '../system/layout';
import { textStyles } from '../system/typography';
import { useTheme } from '../theme';

type GamesCatalogScreenProps = {
  embedded?: boolean;
  selectedGameIds: GameId[];
  onToggleGame: (gameId: GameId) => void;
};

export function GamesCatalogScreen({ embedded = false, selectedGameIds, onToggleGame }: GamesCatalogScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const responsive = useResponsive();
  const [helpGameId, setHelpGameId] = useState<GameId | null>(null);
  const columnStyle = responsive.isDesktop ? styles.cellDesktop : responsive.isTablet ? styles.cellTablet : styles.cell;

  const content = (
    <View style={styles.catalogShell}>
      <Text style={styles.selectionCount}>{t('gamesCatalog.selectedCount', { count: selectedGameIds.length })}</Text>
      <View style={[styles.grid, !responsive.isPhone && styles.gridWide]}>
        {featuredGames.map((game) => (
          <View key={game.id} style={columnStyle}>
            <GameCard
              title={t(`gameMeta.names.${game.id}`)}
              imageSource={gameRegistry[game.id].thumbnail}
              selected={selectedGameIds.includes(game.id)}
              onPress={() => onToggleGame(game.id)}
              onHelpPress={() => setHelpGameId(game.id)}
            />
          </View>
        ))}

        {Array.from({ length: 2 }).map((_, index) => (
          <View key={`future-slot-${index}`} style={columnStyle}>
            <GameCard
              inactive
              showHelpButton={false}
              title={t('gamesCatalog.futureSlot')}
              placeholderLabel={t('gamesCatalog.futureSlot')}
              onPress={() => {}}
            />
          </View>
        ))}
      </View>
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embedded}>
        {content}
        <HowToPlayModal gameId={helpGameId} onClose={() => setHelpGameId(null)} />
      </View>
    );
  }

  return (
    <AppScreen title={t('gamesCatalog.title')} subtitle={t('gamesCatalog.subtitle')}>
      {content}
      <HowToPlayModal gameId={helpGameId} onClose={() => setHelpGameId(null)} />
    </AppScreen>
  );
}

function HowToPlayModal({ gameId, onClose }: { gameId: GameId | null; onClose: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const prefix =
    gameId === 'guess-who'
      ? 'gamesCatalog.guessWhoHowToPlay'
      : gameId === 'faces-gestures'
        ? 'gamesCatalog.facesGesturesHowToPlay'
        : gameId === 'trivia'
          ? 'gamesCatalog.triviaHowToPlay'
          : gameId === 'who-said'
            ? 'gamesCatalog.whoSaidHowToPlay'
            : gameId === 'majority'
              ? 'gamesCatalog.majorityHowToPlay'
              : 'gamesCatalog.howToPlay';

  return (
    <Modal visible={Boolean(gameId)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlayBackdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.helpPanel}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpTitle}>{t(`${prefix}Title`)}</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel={t('auth.modalClose')}>
              <Text style={styles.closeLabel}>{t('auth.modalClose')}</Text>
            </Pressable>
          </View>
          <View style={styles.helpBody}>
            <Text style={styles.helpCopy}>{t(`${prefix}Intro`)}</Text>
            <Text style={styles.helpStep}>{t(`${prefix}StepOne`)}</Text>
            <Text style={styles.helpStep}>{t(`${prefix}StepTwo`)}</Text>
            <Text style={styles.helpStep}>{t(`${prefix}StepThree`)}</Text>
          </View>
          <AppButton label={t('auth.modalClose')} onPress={onClose} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    embedded: {
      width: '100%',
      maxWidth: layout.maxWidth,
      alignSelf: 'center',
      paddingHorizontal: layout.screenPaddingX,
      paddingTop: layout.screenPaddingTop,
      paddingBottom: layout.screenPaddingBottom,
      gap: layout.sectionGap
    },
    catalogShell: {
      width: '100%',
      maxWidth: layout.maxWidth,
      alignSelf: 'center',
      gap: spacing.lg
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
    cellTablet: {
      width: '48%'
    },
    cellDesktop: {
      width: '31.8%'
    },
    selectionCount: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    overlayBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(10, 10, 12, 0.42)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg
    },
    helpPanel: {
      width: '100%',
      maxWidth: 520,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      padding: spacing.lg,
      gap: spacing.lg
    },
    helpHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    helpTitle: {
      color: theme.colors.textPrimary,
      flex: 1,
      ...textStyles.section
    },
    closeButton: {
      minHeight: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface
    },
    closeLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    helpBody: {
      gap: spacing.sm
    },
    helpCopy: {
      color: theme.colors.textSecondary,
      ...textStyles.body
    },
    helpStep: {
      color: theme.colors.textPrimary,
      ...textStyles.body
    }
  });
}
