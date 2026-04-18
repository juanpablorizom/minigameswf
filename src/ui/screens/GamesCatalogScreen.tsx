import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GameCard } from '../components/GameCard';
import { layout, spacing } from '../system/layout';
import { useTheme } from '../theme';

const impostorArtwork = require('../assets/impostor-catalog-cover.png');

type GamesCatalogScreenProps = {
  onSelectImpostor: () => void;
};

export function GamesCatalogScreen({ onSelectImpostor }: GamesCatalogScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWide = width >= 860;

  return (
    <View style={styles.catalogShell}>
      <View style={[styles.grid, isWide && styles.gridWide]}>
        <View style={[styles.cell, isWide && styles.cellWide]}>
          <GameCard title={t('gameMeta.names.impostor')} imageSource={impostorArtwork} onPress={onSelectImpostor} />
        </View>

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
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
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
