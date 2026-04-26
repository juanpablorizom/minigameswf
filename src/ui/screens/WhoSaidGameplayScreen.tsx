import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Player, WhoSaidRoundSetup } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type WhoSaidGameplayScreenProps = {
  players: Player[];
  roundSetup: WhoSaidRoundSetup;
  canManageRoom: boolean;
  isBusy: boolean;
  notice: string | null;
  onSubmitPhrase: (phrase: string) => void;
  onSubmitGuess: (targetUserId: string) => void;
  onAdvance: () => void;
};

export function WhoSaidGameplayScreen({
  players,
  roundSetup,
  canManageRoom,
  isBusy,
  notice,
  onSubmitPhrase,
  onSubmitGuess,
  onAdvance
}: WhoSaidGameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [phrase, setPhrase] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(roundSetup.voteDeadlineAt));
  const autoAdvanceKeyRef = useRef<string | null>(null);
  const currentState = roundSetup.guesses.find((entry) => entry.isCurrentUser) ?? null;
  const currentUser = players.find((player) => player.isCurrentUser) ?? null;
  const hasSubmittedPhrase = Boolean(currentState?.hasSubmittedPhrase);
  const hasGuessed = Boolean(currentState?.guessedAt);
  const isAuthor = roundSetup.isCurrentPhraseAuthor;
  const isWriting = roundSetup.phase === 'reveal' && roundSetup.status === 'active';
  const isGuessing = roundSetup.phase === 'voting' && roundSetup.status === 'active';
  const isReveal = roundSetup.phase === 'result' || roundSetup.status === 'finished';
  const activePlayersSubmitted =
    roundSetup.guesses.length > 0 && roundSetup.submittedCount >= roundSetup.guesses.length;
  const eligibleGuessers = roundSetup.guesses.filter((entry) => entry.userId !== roundSetup.currentPhraseAuthorUserId);
  const allEligibleGuessed = eligibleGuessers.length > 0 && eligibleGuessers.every((entry) => Boolean(entry.guessedAt));
  const guessOptions = useMemo(
    () => players.filter((player) => player.id !== currentUser?.id),
    [currentUser?.id, players]
  );

  useEffect(() => {
    setPhrase('');
    setSelectedUserId(null);
    autoAdvanceKeyRef.current = null;
  }, [roundSetup.currentPhraseId, roundSetup.phase, roundSetup.roundId]);

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
      (isWriting && (activePlayersSubmitted || secondsLeft <= 0)) ||
      (isGuessing && (allEligibleGuessed || secondsLeft <= 0));

    if (!shouldAdvance) {
      return;
    }

    const advanceKey = `${roundSetup.roundId}:${roundSetup.phase}:${roundSetup.currentPhraseId ?? 'write'}:${secondsLeft}:${roundSetup.submittedCount}`;

    if (autoAdvanceKeyRef.current === advanceKey) {
      return;
    }

    autoAdvanceKeyRef.current = advanceKey;
    onAdvance();
  }, [
    activePlayersSubmitted,
    allEligibleGuessed,
    canManageRoom,
    isGuessing,
    isWriting,
    onAdvance,
    roundSetup.currentPhraseId,
    roundSetup.phase,
    roundSetup.roundId,
    roundSetup.status,
    roundSetup.submittedCount,
    secondsLeft
  ]);

  function playerName(userId: string | null) {
    if (!userId) {
      return t('common.player');
    }

    return players.find((player) => player.id === userId)?.name ?? t('common.player');
  }

  function submitPhrase() {
    const trimmedPhrase = phrase.trim();

    if (!trimmedPhrase || hasSubmittedPhrase || isBusy) {
      return;
    }

    onSubmitPhrase(trimmedPhrase);
    setPhrase('');
  }

  function submitGuess() {
    if (!selectedUserId || hasGuessed || isAuthor || isBusy) {
      return;
    }

    onSubmitGuess(selectedUserId);
  }

  return (
    <AppScreen title={t('whoSaid.title')} subtitle={t(`roomSettings.whoSaidTopicOptions.${roundSetup.topic}`)}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <Badge
            label={
              isWriting
                ? t('whoSaid.write')
                : roundSetup.currentPhraseOrder
                  ? t('whoSaid.phraseCount', { current: roundSetup.currentPhraseOrder, total: roundSetup.phraseCount })
                  : t('whoSaid.title')
            }
            tone="accent"
          />
          <Badge label={roundSetup.status === 'finished' ? t('whoSaid.done') : t('whoSaid.timer', { value: Math.max(secondsLeft, 0) })} tone="success" />
        </View>

        {isWriting ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('whoSaid.write')}</Text>
            <AppTextField
              value={phrase}
              onChangeText={setPhrase}
              editable={!hasSubmittedPhrase && !isBusy}
              placeholder={t('whoSaid.placeholder')}
              returnKeyType="done"
              onSubmitEditing={submitPhrase}
              helperText={hasSubmittedPhrase ? t('whoSaid.ready') : null}
            />
            <AppButton label={t('whoSaid.send')} onPress={submitPhrase} disabled={hasSubmittedPhrase || isBusy || !phrase.trim()} />
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('whoSaid.guessTitle')}</Text>
            <Text style={styles.phrase}>{roundSetup.currentPhraseText ?? t('whoSaid.waiting')}</Text>
          </View>
        )}

        {isReveal && roundSetup.currentPhraseText ? (
          <View style={styles.revealBox}>
            <Text style={styles.revealLabel}>{t('whoSaid.reveal')}</Text>
            <Text style={styles.revealName}>{playerName(roundSetup.currentPhraseAuthorUserId)}</Text>
          </View>
        ) : null}

        {isGuessing && !isAuthor ? (
          <View style={styles.block}>
            <View style={styles.optionGrid}>
              {guessOptions.map((player) => {
                const active = selectedUserId === player.id;

                return (
                  <Pressable
                    key={player.id}
                    onPress={() => setSelectedUserId(player.id)}
                    disabled={hasGuessed || isBusy}
                    style={({ pressed }) => [
                      styles.option,
                      active ? styles.optionActive : null,
                      pressed ? styles.optionPressed : null
                    ]}
                  >
                    <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>{player.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <AppButton label={t('whoSaid.guess')} onPress={submitGuess} disabled={!selectedUserId || hasGuessed || isBusy} />
          </View>
        ) : null}

        {isGuessing && isAuthor ? <Text style={styles.notice}>{t('whoSaid.authorWait')}</Text> : null}

        {currentState?.guessedAt ? (
          <Text style={styles.notice}>{currentState.isCorrect ? t('whoSaid.correct') : t('whoSaid.guessed')}</Text>
        ) : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {canManageRoom ? <AppButton label={isReveal ? t('whoSaid.next') : t('whoSaid.next')} onPress={onAdvance} variant="ghost" disabled={isBusy} /> : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('whoSaid.players')}</Text>
        {players.map((player) => {
          const state = roundSetup.guesses.find((entry) => entry.userId === player.id);
          const badgeLabel = isWriting
            ? state?.hasSubmittedPhrase
              ? t('whoSaid.ready')
              : t('whoSaid.pending')
            : player.id === roundSetup.currentPhraseAuthorUserId
              ? t('whoSaid.author')
              : state?.guessedAt
                ? t('whoSaid.ready')
                : t('whoSaid.pending');

          return (
            <View key={player.id} style={styles.playerRow}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Badge label={badgeLabel} tone={state?.isCorrect ? 'success' : 'neutral'} />
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
    block: {
      gap: spacing.sm
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '900'
    },
    phrase: {
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
      minHeight: 48,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      justifyContent: 'center'
    },
    optionActive: {
      borderColor: theme.colors.highlight,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    optionPressed: {
      opacity: 0.82
    },
    optionText: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    optionTextActive: {
      color: theme.colors.highlight
    },
    revealBox: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: spacing.md,
      gap: spacing.xs
    },
    revealLabel: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '800',
      textTransform: 'uppercase'
    },
    revealName: {
      color: theme.colors.highlight,
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
