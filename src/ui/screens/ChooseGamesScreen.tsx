import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { GameCard } from '../components/GameCard';
import { layout, spacing } from '../system/layout';
import { useTheme } from '../theme';

const impostorArtwork = require('../assets/impostor-card.png');

type ChooseGamesScreenProps = {
  selectedGameIds: string[];
  onToggleGame: (gameId: string) => void;
  onSave: () => void;
};

export function ChooseGamesScreen({ selectedGameIds, onToggleGame, onSave }: ChooseGamesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);
  const impostor = featuredGames[0];
  const selected = selectedGameIds.includes(impostor.id);
  const isWide = width >= 860;

  return (
    <AppScreen title={t('chooseGames.title')} subtitle={t('chooseGames.subtitle')}>
      <View style={styles.gridShell}>
        <View style={[styles.grid, isWide && styles.gridWide]}>
          <View style={[styles.cell, isWide && styles.cellWide]}>
            <GameCard
              title={t(`gameMeta.names.${impostor.id}`)}
              imageSource={impostorArtwork}
              selected={selected}
              onPress={() => onToggleGame(impostor.id)}
            />
          </View>
        </View>
      </View>

      <AppButton label={t('chooseGames.save')} onPress={onSave} disabled={!selected} />
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
