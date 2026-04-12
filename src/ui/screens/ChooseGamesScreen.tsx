import { Pressable, StyleSheet, Text, View } from 'react-native';

import { featuredGames } from '../../data/mockData';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type ChooseGamesScreenProps = {
  selectedGameIds: string[];
  onToggleGame: (gameId: string) => void;
  onSave: () => void;
};

export function ChooseGamesScreen({ selectedGameIds, onToggleGame, onSave }: ChooseGamesScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const groupedGames = featuredGames.reduce<Record<string, typeof featuredGames>>((groups, game) => {
    groups[game.category] = [...(groups[game.category] ?? []), game];
    return groups;
  }, {});

  return (
    <AppScreen title="Choose Mini Games" subtitle="Build a lineup with enough contrast to keep the room fresh without dragging the session.">
      <SurfaceCard>
        <Text style={styles.selectionTitle}>Curated tonight</Text>
        <Text style={styles.selectionCopy}>Select a tight mix of warm-up, social reads, and one strong bluffing closer.</Text>
        <Badge label={`${selectedGameIds.length} games selected`} tone="success" />
      </SurfaceCard>

      {Object.entries(groupedGames).map(([category, games]) => (
        <View key={category} style={styles.group}>
          <Text style={styles.groupTitle}>{category}</Text>
          {games.map((game) => {
            const selected = selectedGameIds.includes(game.id);

            return (
              <Pressable key={game.id} onPress={() => onToggleGame(game.id)} style={({ pressed }) => [pressed && styles.pressed]}>
                <SurfaceCard>
                  <View style={styles.header}>
                    <View style={styles.meta}>
                      <Text style={styles.title}>{game.name}</Text>
                      <Text style={styles.subtitle}>{game.description}</Text>
                    </View>
                    <Badge label={selected ? 'Selected' : 'Tap to add'} tone={selected ? 'success' : 'neutral'} />
                  </View>
                  <View style={styles.badgesRow}>
                    <Badge label={game.duration} tone="accent" />
                    <Badge label={game.energy} tone="neutral" />
                  </View>
                </SurfaceCard>
              </Pressable>
            );
          })}
        </View>
      ))}

      <AppButton label={`Save ${selectedGameIds.length} Games`} onPress={onSave} />
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }]
  },
  selectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  selectionCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  group: {
    gap: spacing.md
  },
  groupTitle: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md
  },
  meta: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  }
  });
}
