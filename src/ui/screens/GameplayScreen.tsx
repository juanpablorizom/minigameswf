import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MiniGame, Player } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors, spacing, typography } from '../theme';

type GameplayScreenProps = {
  players: Player[];
  activeGame: MiniGame;
  onRevealResults: () => void;
};

export function GameplayScreen({ players, activeGame, onRevealResults }: GameplayScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(1);
  const answers = [
    'I “accidentally” started the rumor so I could control the outcome.',
    'I only lied to protect the vibe, not because I was caught.',
    'I rehearsed that excuse in advance because I knew this question was coming.',
    'I told the truth once, nobody believed me, so I committed to the bit.'
  ];

  return (
    <AppScreen title="Gameplay" subtitle="The live play surface stays focused: one game, one prompt, one clear next step.">
      <SurfaceCard>
        <View style={styles.header}>
          <Badge label="Round 2 of 3" tone="accent" />
          <Badge label="00:32 left" tone="success" />
        </View>
        <Text style={styles.gameTitle}>Mentiroso Profesional</Text>
        <Text style={styles.gameCopy}>{activeGame.description}</Text>
        <View style={styles.promptPanel}>
          <Text style={styles.promptLabel}>Current prompt</Text>
          <Text style={styles.promptText}>Which answer sounds the most believable if someone is clearly hiding the truth?</Text>
        </View>
        <View style={styles.answerList}>
          {answers.map((answer, index) => {
            const selected = selectedAnswer === index;

            return (
              <Pressable
                key={answer}
                onPress={() => setSelectedAnswer(index)}
                style={[styles.answerCard, selected && styles.answerCardSelected]}
              >
                <Text style={[styles.answerKey, selected && styles.answerKeySelected]}>{String.fromCharCode(65 + index)}</Text>
                <Text style={[styles.answerText, selected && styles.answerTextSelected]}>{answer}</Text>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.queueTitle}>Turn order</Text>
        {players.map((player, index) => (
          <View key={player.id} style={styles.queueRow}>
            <Text style={styles.queueIndex}>0{index + 1}</Text>
            <View style={styles.queueMeta}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerStatus}>{index === 0 ? 'Speaking now' : index === 1 ? 'On deck' : 'Waiting'}</Text>
            </View>
            <Badge label={`${player.score} pts`} />
          </View>
        ))}
      </SurfaceCard>

      <AppButton label="Reveal Results" onPress={onRevealResults} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  gameTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700'
  },
  gameCopy: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  promptPanel: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm
  },
  promptLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.4
  },
  promptText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30
  },
  answerList: {
    gap: spacing.sm
  },
  answerCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md
  },
  answerCardSelected: {
    backgroundColor: '#2a3329',
    borderColor: '#6a7c66'
  },
  answerKey: {
    color: colors.accentSoft,
    fontSize: typography.body,
    fontWeight: '800',
    marginTop: 1
  },
  answerKeySelected: {
    color: '#d8ebcf'
  },
  answerText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  answerTextSelected: {
    color: colors.textPrimary
  },
  queueTitle: {
    color: colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700'
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  queueIndex: {
    color: colors.accentSoft,
    fontSize: typography.body,
    fontWeight: '800'
  },
  queueMeta: {
    flex: 1,
    gap: 2
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  playerStatus: {
    color: colors.textSecondary,
    fontSize: typography.caption
  }
});
