import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import type { MiniGame } from '../../navigation/types';
import { GameCard } from '../components/GameCard';
import { AppScreen } from '../components/AppScreen';
import { controls, layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

const impostorArtwork = require('../assets/impostor-catalog-cover.png');

type GamesCatalogScreenProps = {
  embedded?: boolean;
  onSelectImpostor: () => void;
};

type CategoryFilter = 'Todos' | MiniGame['category'];

const filters: CategoryFilter[] = ['Todos', 'Social Deduction', 'Bluffing', 'Social Reads', 'Warm Up'];

export function GamesCatalogScreen({ embedded = false, onSelectImpostor }: GamesCatalogScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWide = width >= 860;
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('Todos');
  const visibleGames = useMemo(
    () => (activeFilter === 'Todos' ? featuredGames : featuredGames.filter((game) => game.category === activeFilter)),
    [activeFilter]
  );

  const content = (
    <>
      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const active = filter === activeFilter;

          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={({ pressed, hovered }) => [
                styles.filterChip,
                active && styles.filterChipActive,
                hovered && styles.filterChipHover,
                pressed && styles.filterChipPressed
              ]}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.catalogShell}>
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {visibleGames.map((game) => (
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
    </>
  );

  if (embedded) {
    return <View style={styles.embedded}>{content}</View>;
  }

  return (
    <AppScreen title="Juegos" subtitle="Explora los minijuegos por categoria y elige el modo para tu grupo.">
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
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm
    },
    filterChip: {
      minHeight: controls.compactMinHeight,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center'
    },
    filterChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    filterChipHover: {
      borderColor: theme.colors.borderStrong
    },
    filterChipPressed: {
      transform: [{ scale: 0.98 }]
    },
    filterLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong,
      fontSize: typography.caption
    },
    filterLabelActive: {
      color: theme.colors.highlight
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
