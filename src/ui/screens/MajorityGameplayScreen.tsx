import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { MajorityRoundSetup, Player } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type MajorityGameplayScreenProps = {
  players: Player[];
  roundSetup: MajorityRoundSetup;
  canManageRoom: boolean;
  isBusy: boolean;
  notice: string | null;
  onSubmitAnswer: (option: string) => void;
  onSubmitPrediction: (option: string) => void;
  onAdvance: () => void;
};

export function MajorityGameplayScreen({
  players,
  roundSetup,
  canManageRoom,
  isBusy,
  notice,
  onSubmitAnswer,
  onSubmitPrediction,
  onAdvance
}: MajorityGameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(roundSetup.voteDeadlineAt));
  const autoAdvanceKeyRef = useRef<string | null>(null);
  const currentPlayerState = roundSetup.players.find((player) => player.isCurrentUser) ?? null;
  const isAnswerPhase = roundSetup.phase === 'reveal' && roundSetup.status === 'active';
  const isPredictionPhase = roundSetup.phase === 'voting' && roundSetup.status === 'active';
  const isResultPhase = roundSetup.phase === 'result' || roundSetup.status === 'finished';
  const hasAnswered = Boolean(currentPlayerState?.answeredAt);
  const hasPredicted = Boolean(currentPlayerState?.predictedAt);
  const allAnswered = roundSetup.players.length > 0 && roundSetup.players.every((player) => Boolean(player.answeredAt));
  const allPredicted = roundSetup.players.length > 0 && roundSetup.players.every((player) => Boolean(player.predictedAt));

  useEffect(() => {
    setSelectedOption(null);
    autoAdvanceKeyRef.current = null;
  }, [roundSetup.questionId, roundSetup.phase]);

  useEffect(() => {
    setSecondsLeft(getSecondsLeft(roundSetup.voteDeadlineAt));

    if (!roundSetup.voteDeadlineAt || roundSetup.status === 'finished') {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(getSecondsLeft(roundSetup.voteDeadlineAt));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [roundSetup.status, roundSetup.voteDeadlineAt]);

  useEffect(() => {
    if (!canManageRoom || roundSetup.status === 'finished') {
      return;
    }

    const shouldAdvance =
      (isAnswerPhase && (allAnswered || secondsLeft <= 0)) ||
      (isPredictionPhase && (allPredicted || secondsLeft <= 0));

    if (!shouldAdvance) {
      return;
    }

    const advanceKey = `${roundSetup.roundId}:${roundSetup.questionId}:${roundSetup.phase}:${secondsLeft}`;

    if (autoAdvanceKeyRef.current === advanceKey) {
      return;
    }

    autoAdvanceKeyRef.current = advanceKey;
    onAdvance();
  }, [
    allAnswered,
    allPredicted,
    canManageRoom,
    isAnswerPhase,
    isPredictionPhase,
    onAdvance,
    roundSetup.phase,
    roundSetup.questionId,
    roundSetup.roundId,
    roundSetup.status,
    secondsLeft
  ]);

  function submitSelection() {
    if (!selectedOption || isBusy) {
      return;
    }

    if (isAnswerPhase && !hasAnswered) {
      onSubmitAnswer(selectedOption);
      return;
    }

    if (isPredictionPhase && !hasPredicted) {
      onSubmitPrediction(selectedOption);
    }
  }

  return (
    <AppScreen title={t('majority.title')} subtitle={t(`roomSettings.majorityCategoryOptions.${roundSetup.category}`)}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <Badge label={t('majority.roundCount', { current: roundSetup.roundNumber, total: roundSetup.roundCount })} tone="accent" />
          <Badge label={roundSetup.status === 'finished' ? t('majority.done') : t('majority.timer', { value: Math.max(secondsLeft, 0) })} tone="success" />
        </View>
        <Text style={styles.phase}>{isAnswerPhase ? t('majority.choose') : isPredictionPhase ? t('majority.predict') : t('majority.result')}</Text>
        <Text style={styles.question}>{roundSetup.question}</Text>

        <View style={styles.optionGrid}>
          {roundSetup.options.map((option) => {
            const active = selectedOption === option;
            const isMajority = isResultPhase && roundSetup.majorityOptions.includes(option);

            return (
              <Pressable
                key={option}
                onPress={() => setSelectedOption(option)}
                disabled={isResultPhase || isBusy || (isAnswerPhase && hasAnswered) || (isPredictionPhase && hasPredicted)}
                style={({ pressed }) => [
                  styles.option,
                  active ? styles.optionActive : null,
                  isMajority ? styles.optionMajority : null,
                  pressed ? styles.optionPressed : null
                ]}
              >
                <Text style={[styles.optionText, active || isMajority ? styles.optionTextActive : null]}>{option}</Text>
                {isResultPhase ? <Text style={styles.count}>{roundSetup.optionCounts[option] ?? 0}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        {!isResultPhase ? (
          <AppButton
            label={isAnswerPhase ? t('majority.choose') : t('majority.guess')}
            onPress={submitSelection}
            disabled={!selectedOption || isBusy || (isAnswerPhase && hasAnswered) || (isPredictionPhase && hasPredicted)}
          />
        ) : null}

        {isResultPhase ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{t('majority.majority')}</Text>
            <Text style={styles.resultValue}>{roundSetup.majorityOptions.join(' / ') || t('majority.noResult')}</Text>
            {currentPlayerState?.predictedAt ? (
              <Text style={styles.notice}>{currentPlayerState.isPredictionCorrect ? t('majority.correct') : t('majority.wrong')}</Text>
            ) : null}
          </View>
        ) : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {canManageRoom ? <AppButton label={t('majority.next')} onPress={onAdvance} variant="ghost" disabled={isBusy} /> : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('majority.players')}</Text>
        {players.map((player) => {
          const state = roundSetup.players.find((entry) => entry.userId === player.id);
          const ready = isAnswerPhase ? Boolean(state?.answeredAt) : isPredictionPhase ? Boolean(state?.predictedAt) : Boolean(state?.isPredictionCorrect);

          return (
            <View key={player.id} style={styles.playerRow}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Badge
                label={isResultPhase ? (state?.isPredictionCorrect ? t('majority.correct') : t('majority.ready')) : ready ? t('majority.ready') : t('majority.pending')}
                tone={state?.isPredictionCorrect ? 'success' : 'neutral'}
              />
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
      gap: spacing.sm
    },
    phase: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '900',
      textTransform: 'uppercase'
    },
    question: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      lineHeight: 34,
      fontWeight: '900'
    },
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm
    },
    option: {
      minHeight: 56,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      justifyContent: 'center',
      minWidth: 120
    },
    optionActive: {
      borderColor: theme.colors.highlight,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    optionMajority: {
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.successMuted
    },
    optionPressed: {
      opacity: 0.82
    },
    optionText: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '900'
    },
    optionTextActive: {
      color: theme.colors.textPrimary
    },
    count: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '800'
    },
    resultBox: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: spacing.md,
      gap: spacing.xs
    },
    resultLabel: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '900',
      textTransform: 'uppercase'
    },
    resultValue: {
      color: theme.colors.highlight,
      fontSize: typography.section,
      fontWeight: '900'
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '900'
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
    playerName: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
    }
  });
}
