import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import { GameCard } from '../components/GameCard';
import { AppScreen } from '../components/AppScreen';
import { layout, spacing } from '../system/layout';
import { useTheme } from '../theme';

const impostorArtwork = require('../assets/impostor-catalog-cover.png');

type GamesCatalogScreenProps = {
  embedded?: boolean;
  onSelectImpostor: () => void;
};

export function GamesCatalogScreen({ embedded = false, onSelectImpostor }: GamesCatalogScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWide = width >= 860;

  const content = (
    <View style={styles.catalogShell}>
      <View style={[styles.grid, isWide && styles.gridWide]}>
        {featuredGames.map((game) => (
          <View key={game.id} style={[styles.cell, isWide && styles.cellWide]}>
            <GameCard title={t(`gameMeta.names.${game.id}`)} imageSource={impostorArtwork} onPress={onSelectImpostor} />
          </View>
        ))}

        {Array.from({ length: 3 }).map((_, index) => (
          <View key={`future-slot-${index}`} style={[styles.cell, isWide && styles.cellWide]}>
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
    return <View style={styles.embedded}>{content}</View>;
  }

  return (
    <AppScreen title="Juegos" subtitle="Explora los minijuegos disponibles y elige el modo para tu grupo.">
      {content}
    </AppScreen>
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
    cellWide: {
      width: '48%'
    }
  });
}
