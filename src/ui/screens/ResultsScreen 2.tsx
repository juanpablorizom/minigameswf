import { StyleSheet, Text, View } from 'react-native';

import { podium, sessionRecognitions } from '../../data/mockData';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type ResultsScreenProps = {
  onPlayAgain: () => void;
  onBackToLobby: () => void;
};

export function ResultsScreen({ onPlayAgain, onBackToLobby }: ResultsScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const topThree = podium.slice(0, 3);

  return (
    <AppScreen title="Results" subtitle="A clean finish: clear winners, score movement, and one-tap routes into the next round.">
      <SurfaceCard>
        <Badge label="Tonight's podium" tone="accent" />
        <View style={styles.podiumRow}>
          {topThree.map((entry, index) => (
            <View key={entry.id} style={[styles.podiumCard, index === 0 && styles.winnerCard]}>
              <Text style={styles.place}>{index + 1}</Text>
              <Text style={styles.name}>{entry.name}</Text>
              <Text style={styles.points}>{entry.points}</Text>
              <Text style={styles.change}>{entry.change}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Scoreboard</Text>
        {podium.map((entry, index) => (
          <View key={entry.id} style={styles.scoreRow}>
            <Text style={styles.scoreRank}>#{index + 1}</Text>
            <View style={styles.scoreMeta}>
              <Text style={styles.scoreName}>{entry.name}</Text>
              <Text style={styles.scoreBadge}>{entry.badge}</Text>
            </View>
            <Text style={styles.scoreValue}>{entry.points}</Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Session recognitions</Text>
        {sessionRecognitions.map((item) => (
          <View key={item.id} style={styles.recognitionRow}>
            <Badge label="Highlight" tone="success" />
            <View style={styles.recognitionMeta}>
              <Text style={styles.scoreName}>{item.title}</Text>
              <Text style={styles.scoreBadge}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </SurfaceCard>

      <View style={styles.actions}>
        <AppButton label="Play Again" onPress={onPlayAgain} />
        <AppButton label="Back to Lobby" onPress={onBackToLobby} variant="secondary" />
      </View>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm
  },
  podiumCard: {
    flex: 1,
    minHeight: 150,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundElevated,
    padding: spacing.md,
    justifyContent: 'flex-end',
    gap: spacing.xs
  },
  winnerCard: {
    minHeight: 190,
    backgroundColor: theme.colors.badgeAccentBackground
  },
  place: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    fontWeight: '800'
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  points: {
    color: theme.colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800'
  },
  change: {
    color: theme.colors.successText,
    fontSize: typography.caption,
    fontWeight: '700'
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  scoreRank: {
    color: theme.colors.textMuted,
    width: 26
  },
  scoreMeta: {
    flex: 1,
    gap: 2
  },
  scoreName: {
    color: theme.colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  scoreBadge: {
    color: theme.colors.textSecondary,
    fontSize: typography.caption
  },
  scoreValue: {
    color: theme.colors.highlight,
    fontSize: typography.body,
    fontWeight: '800'
  },
  recognitionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  recognitionMeta: {
    flex: 1,
    gap: 2
  },
  actions: {
    gap: spacing.sm
  }
  });
}
