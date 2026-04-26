import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { FacesGesturesRoundSetup, Player } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type FacesGesturesGameplayScreenProps = {
  players: Player[];
  roundSetup: FacesGesturesRoundSetup;
  canManageRoom: boolean;
  isBusy: boolean;
  notice: string | null;
  onSubmitGuess: (guess: string) => void;
  onFinishRound: () => void;
};

export function FacesGesturesGameplayScreen({
  players,
  roundSetup,
  canManageRoom,
  isBusy,
  notice,
  onSubmitGuess,
  onFinishRound
}: FacesGesturesGameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(roundSetup.voteDeadlineAt));
  const didFinishByTimerRef = useRef(false);
  const currentUser = players.find((player) => player.isCurrentUser) ?? null;
  const isActor = currentUser?.id === roundSetup.actorUserId;
  const currentAnswer = roundSetup.answers.find((answer) => answer.isCurrentUser) ?? null;
  const isFinished = roundSetup.status === 'finished';
  const isSolved = Boolean(currentAnswer?.solvedAt);
  const canGuess = !isActor && !isFinished && !isSolved;
  const actorName = playerName(roundSetup.actorUserId);

  const helperText = useMemo(() => {
    const solvedLabel = roundSetup.characterLabel ?? currentAnswer?.lastGuess;

    if (isSolved && solvedLabel) {
      return t('facesGestures.correctWithAnswer', { value: solvedLabel });
    }

    return feedback;
  }, [currentAnswer?.lastGuess, feedback, isSolved, roundSetup.characterLabel, t]);

  useEffect(() => {
    setFeedback(null);
    setGuess('');
    didFinishByTimerRef.current = false;
  }, [roundSetup.roundId]);

  useEffect(() => {
    setSecondsLeft(getSecondsLeft(roundSetup.voteDeadlineAt));

    if (!roundSetup.voteDeadlineAt || isFinished) {
      return;
    }

    const interval = setInterval(() => {
      const nextSecondsLeft = getSecondsLeft(roundSetup.voteDeadlineAt);
      setSecondsLeft(nextSecondsLeft);

      if (nextSecondsLeft <= 0 && !didFinishByTimerRef.current) {
        didFinishByTimerRef.current = true;
        onFinishRound();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isFinished, onFinishRound, roundSetup.voteDeadlineAt]);

  function playerName(userId: string) {
    return players.find((player) => player.id === userId)?.name ?? t('common.player');
  }

  function submitGuess() {
    const trimmedGuess = guess.trim();

    if (!trimmedGuess || !canGuess || isBusy) {
      return;
    }

    const wasSolved = Boolean(currentAnswer?.solvedAt);
    onSubmitGuess(trimmedGuess);
    setGuess('');

    if (!wasSolved) {
      setFeedback(t('facesGestures.tryAgain'));
    }
  }

  return (
    <AppScreen title={t('facesGestures.title')} subtitle={isActor ? t('facesGestures.actorSubtitle') : t('facesGestures.guesserSubtitle')}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.sectionTitle}>{isActor ? t('facesGestures.actorTitle') : t('facesGestures.guessTitle')}</Text>
            <Text style={styles.meta}>
              {isFinished ? t('facesGestures.finished') : t('facesGestures.timer', { value: Math.max(secondsLeft, 0) })}
            </Text>
          </View>
          <Badge label={isActor ? t('facesGestures.actor') : actorName} tone={isActor ? 'accent' : 'neutral'} />
        </View>

        {isActor ? (
          <View style={styles.actorReveal}>
            <Text style={styles.revealLabel}>{t('facesGestures.yourPrompt')}</Text>
            <Text style={styles.revealWord}>{roundSetup.characterLabel ?? t('facesGestures.hidden')}</Text>
            <Text style={styles.notice}>{t('facesGestures.actorHelper')}</Text>
          </View>
        ) : (
          <View style={styles.guessBlock}>
            <AppTextField
              value={guess}
              onChangeText={(value) => {
                setGuess(value);
                if (feedback) {
                  setFeedback(null);
                }
              }}
              editable={canGuess && !isBusy}
              placeholder={t('facesGestures.placeholder')}
              returnKeyType="done"
              onSubmitEditing={submitGuess}
              helperText={helperText}
              state="default"
            />
            <AppButton label={t('facesGestures.guess')} onPress={submitGuess} disabled={!canGuess || isBusy || !guess.trim()} />
          </View>
        )}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {canManageRoom && !isFinished ? (
          <AppButton label={t('gameplay.finishRound')} onPress={onFinishRound} variant="ghost" disabled={isBusy} />
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('facesGestures.players')}</Text>
        {players.map((player) => {
          const answer = roundSetup.answers.find((entry) => entry.userId === player.id);
          const playerIsActor = player.id === roundSetup.actorUserId;
          const playerSolved = Boolean(answer?.solvedAt);

          return (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.character}>
                  {playerIsActor ? t('facesGestures.actor') : playerSolved ? t('facesGestures.completed') : t('facesGestures.waiting')}
                </Text>
              </View>
              <View style={styles.badges}>
                {player.isCurrentUser ? <Badge label={t('room.you')} tone="neutral" /> : null}
                {playerIsActor ? <Badge label={t('facesGestures.actor')} tone="accent" /> : null}
                {playerSolved ? <Badge label={t('facesGestures.completed')} tone="success" /> : null}
              </View>
            </View>
          );
        })}
      </SurfaceCard>
    </AppScreen>
  );
}

function getSecondsLeft(deadline: string | null) {
  if (!deadline) {
    return 0;
  }

  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000));
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md
    },
    headerCopy: {
      flex: 1,
      minWidth: 0,
      gap: spacing.xs
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
    actorReveal: {
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: spacing.lg,
      gap: spacing.sm,
      alignItems: 'center'
    },
    revealLabel: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '800',
      textTransform: 'uppercase'
    },
    revealWord: {
      color: theme.colors.highlight,
      fontSize: 34,
      fontWeight: '900',
      textAlign: 'center'
    },
    guessBlock: {
      gap: spacing.sm
    },
    notice: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      lineHeight: 18
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
    }
  });
}
