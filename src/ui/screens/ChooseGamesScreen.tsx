import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import { gameRegistry } from '../../data/gameRegistry';
import type { GameId } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { GameCard } from '../components/GameCard';
import { layout, spacing } from '../system/layout';
import { useTheme } from '../theme';

type ChooseGamesScreenProps = {
  selectedGameIds: GameId[];
  onToggleGame: (gameId: GameId) => void;
  onSave: () => void;
};

export function ChooseGamesScreen({ selectedGameIds, onToggleGame, onSave }: ChooseGamesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);
  const isWide = width >= 860;

  return (
    <AppScreen title={t('chooseGames.title')} subtitle={t('chooseGames.subtitle')}>
      <View style={styles.gridShell}>
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {featuredGames.map((game) => (
            <View key={game.id} style={[styles.cell, isWide && styles.cellWide]}>
              <GameCard
                title={t(`gameMeta.names.${game.id}`)}
                imageSource={gameRegistry[game.id].thumbnail}
                selected={selectedGameIds.includes(game.id)}
                onPress={() => onToggleGame(game.id)}
              />
            </View>
          ))}
        </View>
      </View>

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
    }
  });
}
