import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const groupedGames = featuredGames.reduce<Record<string, typeof featuredGames>>((groups, game) => {
    groups[game.category] = [...(groups[game.category] ?? []), game];
    return groups;
  }, {});

  return (
    <AppScreen title={t('chooseGames.title')} subtitle={t('chooseGames.subtitle')}>
      <SurfaceCard>
        <Text style={styles.selectionTitle}>{t('chooseGames.curatedTonight')}</Text>
        <Text style={styles.selectionCopy}>{t('chooseGames.curatedCopy')}</Text>
        <Badge label={t('chooseGames.selectedCount', { count: selectedGameIds.length })} tone="success" />
      </SurfaceCard>

      {Object.entries(groupedGames).map(([category, games]) => (
        <View key={category} style={styles.group}>
          <Text style={styles.groupTitle}>{t(`gameMeta.categories.${category}`)}</Text>
          {games.map((game) => {
            const selected = selectedGameIds.includes(game.id);

            return (
              <Pressable key={game.id} onPress={() => onToggleGame(game.id)} style={({ pressed }) => [pressed && styles.pressed]}>
                <SurfaceCard>
                  <View style={styles.header}>
                    <View style={styles.meta}>
                      <Text style={styles.title}>{t(`gameMeta.names.${game.id}`)}</Text>
                      <Text style={styles.subtitle}>{t(`gameMeta.descriptions.${game.id}`)}</Text>
                    </View>
                    <Badge label={selected ? t('chooseGames.selected') : t('chooseGames.tapToAdd')} tone={selected ? 'success' : 'neutral'} />
                  </View>
                  <View style={styles.badgesRow}>
                    <Badge label={game.duration} tone="accent" />
                    <Badge label={t(`gameMeta.energies.${game.energy}`)} tone="neutral" />
                  </View>
                </SurfaceCard>
              </Pressable>
            );
          })}
        </View>
      ))}

      <AppButton label={t('chooseGames.save', { count: selectedGameIds.length })} onPress={onSave} />
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
