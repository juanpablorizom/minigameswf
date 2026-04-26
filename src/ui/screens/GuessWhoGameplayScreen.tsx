import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { GuessWhoRoundSetup, Player } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type GuessWhoGameplayScreenProps = {
  players: Player[];
  roundSetup: GuessWhoRoundSetup;
  canManageRoom: boolean;
  isBusy: boolean;
  notice: string | null;
  onSubmitGuess: (guess: string) => void;
  onFinishRound: () => void;
};

export function GuessWhoGameplayScreen({
  players,
  roundSetup,
  canManageRoom,
  isBusy,
  notice,
  onSubmitGuess,
  onFinishRound
}: GuessWhoGameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [guess, setGuess] = useState('');
  const currentAssignment = roundSetup.assignments.find((assignment) => assignment.isCurrentUser) ?? null;
  const isFinished = roundSetup.status === 'finished';
  const isSolved = Boolean(currentAssignment?.solvedAt);
  const isFailed = Boolean(currentAssignment?.failedAt);
  const remainingGuesses = currentAssignment?.remainingGuesses ?? 0;
  const canGuess = !isFinished && !isSolved && !isFailed && remainingGuesses > 0;

  function playerName(userId: string) {
    return players.find((player) => player.id === userId)?.name ?? t('common.player');
  }

  function submitGuess() {
    const trimmedGuess = guess.trim();

    if (!trimmedGuess || !canGuess) {
      return;
    }

    onSubmitGuess(trimmedGuess);
    setGuess('');
  }

  return (
    <AppScreen title={t('guessWho.title')} subtitle={t('guessWho.subtitle')}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>{t('guessWho.yourCharacter')}</Text>
          <Badge
            label={isFinished && currentAssignment?.characterLabel ? currentAssignment.characterLabel : t('guessWho.hidden')}
            tone={isSolved ? 'success' : 'accent'}
          />
        </View>
        <Text style={styles.meta}>{t('guessWho.attempts', { count: remainingGuesses })}</Text>
        <View style={styles.guessRow}>
          <AppTextField
            value={guess}
            onChangeText={setGuess}
            editable={canGuess && !isBusy}
            placeholder={t('guessWho.placeholder')}
            returnKeyType="done"
            onSubmitEditing={submitGuess}
          />
          <AppButton label={t('guessWho.guess')} onPress={submitGuess} disabled={!canGuess || isBusy || !guess.trim()} />
        </View>
        {isSolved ? <Text style={styles.success}>{t('guessWho.correct')}</Text> : null}
        {isFailed ? <Text style={styles.notice}>{t('guessWho.noAttempts')}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {canManageRoom && !isFinished ? (
          <AppButton label={t('gameplay.finishRound')} onPress={onFinishRound} variant="ghost" disabled={isBusy} />
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('guessWho.players')}</Text>
        {roundSetup.assignments.map((assignment) => {
          const isCurrentUser = assignment.isCurrentUser;
          const isAssignmentSolved = Boolean(assignment.solvedAt);
          const isAssignmentFailed = Boolean(assignment.failedAt);

          return (
            <View key={assignment.userId} style={styles.playerRow}>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName}>{playerName(assignment.userId)}</Text>
                <Text style={styles.character}>
                  {assignment.characterLabel ?? t('guessWho.hidden')}
                </Text>
              </View>
              <View style={styles.badges}>
                {isCurrentUser ? <Badge label={t('room.you')} tone="neutral" /> : null}
                {isAssignmentSolved ? <Badge label={t('guessWho.correct')} tone="success" /> : null}
                {isAssignmentFailed ? <Badge label={t('guessWho.noAttempts')} tone="accent" /> : null}
              </View>
            </View>
          );
        })}
      </SurfaceCard>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '800'
    },
    meta: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    guessRow: {
      gap: spacing.sm
    },
    playerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md
    },
    playerMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2
    },
    playerName: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    character: {
      color: theme.colors.textSecondary,
      fontSize: typography.body
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: spacing.xs
    },
    success: {
      color: theme.colors.successText,
      fontSize: typography.body,
      fontWeight: '800'
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18
    }
  });
}
