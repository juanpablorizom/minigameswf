import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { calculateTriviaRanking } from '../../data/trivia';
import type { Player, TriviaRoundSetup } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type TriviaGameplayScreenProps = {
  players: Player[];
  roundSetup: TriviaRoundSetup;
  canManageRoom: boolean;
  isBusy: boolean;
  notice: string | null;
  onSubmitAnswer: (answer: string) => void;
  onAdvance: () => void;
};

export function TriviaGameplayScreen({
  players,
  roundSetup,
  canManageRoom,
  isBusy,
  notice,
  onSubmitAnswer,
  onAdvance
}: TriviaGameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [answer, setAnswer] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(roundSetup.voteDeadlineAt));
  const autoAdvanceKeyRef = useRef<string | null>(null);
  const currentAnswer = roundSetup.answers.find((entry) => entry.isCurrentUser) ?? null;
  const hasAnswered = Boolean(currentAnswer?.answeredAt);
  const isFinished = roundSetup.status === 'finished';
  const activePlayersAnswered = roundSetup.answers.length > 0 && roundSetup.answers.every((entry) => Boolean(entry.answeredAt));
  const canAnswer = !isFinished && !hasAnswered;
  const ranking = useMemo(
    () => calculateTriviaRanking(roundSetup.answers.map((entry) => ({ userId: entry.userId, correctCount: entry.correctCount }))),
    [roundSetup.answers]
  );

  useEffect(() => {
    setAnswer('');
    autoAdvanceKeyRef.current = null;
  }, [roundSetup.questionId]);

  useEffect(() => {
    setSecondsLeft(getSecondsLeft(roundSetup.voteDeadlineAt));

    if (!roundSetup.voteDeadlineAt || isFinished) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(getSecondsLeft(roundSetup.voteDeadlineAt));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isFinished, roundSetup.voteDeadlineAt]);

  useEffect(() => {
    if (!canManageRoom || isFinished) {
      return;
    }

    if (secondsLeft > 0 && !activePlayersAnswered) {
      return;
    }

    const advanceKey = `${roundSetup.roundId}:${roundSetup.questionId}:${roundSetup.questionOrder}:${secondsLeft}:${activePlayersAnswered}`;

    if (autoAdvanceKeyRef.current === advanceKey) {
      return;
    }

    autoAdvanceKeyRef.current = advanceKey;
    onAdvance();
  }, [activePlayersAnswered, canManageRoom, isFinished, onAdvance, roundSetup.questionId, roundSetup.questionOrder, roundSetup.roundId, secondsLeft]);

  function playerName(userId: string) {
    return players.find((player) => player.id === userId)?.name ?? t('common.player');
  }

  function submitAnswer() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer || !canAnswer || isBusy) {
      return;
    }

    onSubmitAnswer(trimmedAnswer);
    setAnswer('');
  }

  if (isFinished) {
    return (
      <AppScreen title={t('trivia.title')} subtitle={t('trivia.finished')}>
        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t('trivia.ranking')}</Text>
          {ranking.map((entry) => (
            <View key={entry.userId} style={styles.playerRow}>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName}>{playerName(entry.userId)}</Text>
                <Text style={styles.playerStatus}>{t('trivia.correctCount', { count: entry.correctCount })}</Text>
              </View>
              <Badge label={t('trivia.pointsEarned', { count: entry.tournamentPoints })} tone={entry.tournamentPoints > 0 ? 'success' : 'neutral'} />
            </View>
          ))}
        </SurfaceCard>
        {canManageRoom ? <AppButton label={t('tournament.results')} onPress={onAdvance} disabled={isBusy} /> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </AppScreen>
    );
  }

  return (
    <AppScreen title={t('trivia.title')} subtitle={t('trivia.subtitle')}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <Badge label={t('trivia.questionCount', { current: roundSetup.questionOrder, total: roundSetup.questionCount })} tone="accent" />
          <Badge label={t('trivia.timer', { value: Math.max(secondsLeft, 0) })} tone="success" />
        </View>
        <Text style={styles.topic}>{t(`roomSettings.triviaTopicOptions.${roundSetup.topic}`)}</Text>
        <Text style={styles.question}>{roundSetup.question}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <AppTextField
          value={answer}
          onChangeText={setAnswer}
          editable={canAnswer && !isBusy}
          placeholder={t('trivia.placeholder')}
          returnKeyType="done"
          onSubmitEditing={submitAnswer}
          helperText={
            hasAnswered
              ? currentAnswer?.isCorrect
                ? t('trivia.correct')
                : t('trivia.wrong')
              : null
          }
        />
        <AppButton label={t('trivia.submit')} onPress={submitAnswer} disabled={!canAnswer || isBusy || !answer.trim()} />
        {canManageRoom ? <AppButton label={t('trivia.next')} onPress={onAdvance} variant="ghost" disabled={isBusy} /> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('trivia.players')}</Text>
        {roundSetup.answers.map((entry) => (
          <View key={entry.userId} style={styles.playerRow}>
            <View style={styles.playerMeta}>
              <Text style={styles.playerName}>{playerName(entry.userId)}</Text>
              <Text style={styles.playerStatus}>{t('trivia.correctCount', { count: entry.correctCount })}</Text>
            </View>
            <Badge label={entry.answeredAt ? t('trivia.answered') : t('trivia.pending')} tone={entry.answeredAt ? 'success' : 'neutral'} />
          </View>
        ))}
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
      gap: spacing.sm
    },
    topic: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '800',
      textTransform: 'uppercase'
    },
    question: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      lineHeight: 36,
      fontWeight: '900'
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '800'
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    playerStatus: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption
    },
    notice: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      lineHeight: 18
    }
  });
}
