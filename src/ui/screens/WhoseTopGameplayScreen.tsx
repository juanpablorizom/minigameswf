import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Player, WhoseTopRoundSetup } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type WhoseTopGameplayScreenProps = {
  players: Player[];
  roundSetup: WhoseTopRoundSetup;
  canManageRoom: boolean;
  isBusy: boolean;
  notice: string | null;
  onSubmitTop: (items: string[]) => void;
  onSubmitGuess: (targetUserId: string) => void;
  onAdvance: () => void;
};

export function WhoseTopGameplayScreen({
  players,
  roundSetup,
  canManageRoom,
  isBusy,
  notice,
  onSubmitTop,
  onSubmitGuess,
  onAdvance
}: WhoseTopGameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(roundSetup.voteDeadlineAt));
  const autoAdvanceKeyRef = useRef<string | null>(null);
  const currentState = roundSetup.guesses.find((entry) => entry.isCurrentUser) ?? null;
  const currentUser = players.find((player) => player.isCurrentUser) ?? null;
  const hasSubmittedTop = Boolean(currentState?.hasSubmittedTop);
  const hasGuessed = Boolean(currentState?.guessedAt);
  const isAuthor = roundSetup.isCurrentTopAuthor;
  const isCreating = roundSetup.phase === 'reveal' && roundSetup.status === 'active';
  const isGuessing = roundSetup.phase === 'voting' && roundSetup.status === 'active';
  const isReveal = roundSetup.phase === 'result' || roundSetup.status === 'finished';
  const activePlayersSubmitted = roundSetup.guesses.length > 0 && roundSetup.submittedCount >= roundSetup.guesses.length;
  const eligibleGuessers = roundSetup.guesses.filter((entry) => entry.userId !== roundSetup.currentTopAuthorUserId);
  const allEligibleGuessed = eligibleGuessers.length > 0 && eligibleGuessers.every((entry) => Boolean(entry.guessedAt));
  const guessOptions = useMemo(() => players.filter((player) => player.id !== currentUser?.id), [currentUser?.id, players]);

  useEffect(() => {
    setSelectedItems([]);
    setSelectedUserId(null);
    autoAdvanceKeyRef.current = null;
  }, [roundSetup.currentTopId, roundSetup.phase, roundSetup.roundId]);

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
      (isCreating && (activePlayersSubmitted || secondsLeft <= 0)) ||
      (isGuessing && (allEligibleGuessed || secondsLeft <= 0));

    if (!shouldAdvance) {
      return;
    }

    const advanceKey = `${roundSetup.roundId}:${roundSetup.phase}:${roundSetup.currentTopId ?? 'create'}:${secondsLeft}:${roundSetup.submittedCount}`;

    if (autoAdvanceKeyRef.current === advanceKey) {
      return;
    }

    autoAdvanceKeyRef.current = advanceKey;
    onAdvance();
  }, [
    activePlayersSubmitted,
    allEligibleGuessed,
    canManageRoom,
    isCreating,
    isGuessing,
    onAdvance,
    roundSetup.currentTopId,
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

  function toggleItem(item: string) {
    if (hasSubmittedTop || isBusy) {
      return;
    }

    setSelectedItems((current) => {
      if (current.includes(item)) {
        return current.filter((entry) => entry !== item);
      }

      if (current.length >= roundSetup.topSize) {
        return current;
      }

      return [...current, item];
    });
  }

  function submitTop() {
    if (selectedItems.length !== roundSetup.topSize || hasSubmittedTop || isBusy) {
      return;
    }

    onSubmitTop(selectedItems);
  }

  function submitGuess() {
    if (!selectedUserId || hasGuessed || isAuthor || isBusy) {
      return;
    }

    onSubmitGuess(selectedUserId);
  }

  return (
    <AppScreen title={t('whoseTop.title')} subtitle={t(`roomSettings.whoseTopCategoryOptions.${roundSetup.category}`)}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <Badge
            label={
              isCreating
                ? t('whoseTop.create')
                : roundSetup.currentTopOrder
                  ? t('whoseTop.topCount', { current: roundSetup.currentTopOrder, total: roundSetup.topCount })
                  : t('whoseTop.title')
            }
            tone="accent"
          />
          <Badge label={roundSetup.status === 'finished' ? t('whoseTop.done') : t('whoseTop.timer', { value: Math.max(secondsLeft, 0) })} tone="success" />
        </View>

        {isCreating ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('whoseTop.yourTop')}</Text>
            <View style={styles.selectedList}>
              {Array.from({ length: roundSetup.topSize }).map((_, index) => (
                <View key={index} style={styles.rankRow}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                  <Text style={styles.rankLabel}>{selectedItems[index] ?? '-'}</Text>
                </View>
              ))}
            </View>
            <View style={styles.optionGrid}>
              {roundSetup.optionLabels.map((item) => {
                const order = selectedItems.indexOf(item);
                const active = order >= 0;

                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleItem(item)}
                    disabled={hasSubmittedTop || isBusy}
                    style={({ pressed }) => [
                      styles.option,
                      active ? styles.optionActive : null,
                      pressed ? styles.optionPressed : null
                    ]}
                  >
                    <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                      {active ? `${order + 1}. ` : ''}
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <AppButton
              label={t('whoseTop.send')}
              onPress={submitTop}
              disabled={selectedItems.length !== roundSetup.topSize || hasSubmittedTop || isBusy}
            />
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('whoseTop.guessTitle')}</Text>
            <View style={styles.selectedList}>
              {roundSetup.currentTopItems.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.rankRow}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                  <Text style={styles.rankLabel}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {isReveal && roundSetup.currentTopId ? (
          <View style={styles.revealBox}>
            <Text style={styles.revealLabel}>{t('whoseTop.reveal')}</Text>
            <Text style={styles.revealName}>{playerName(roundSetup.currentTopAuthorUserId)}</Text>
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
            <AppButton label={t('whoseTop.guess')} onPress={submitGuess} disabled={!selectedUserId || hasGuessed || isBusy} />
          </View>
        ) : null}

        {isGuessing && isAuthor ? <Text style={styles.notice}>{t('whoseTop.authorWait')}</Text> : null}
        {currentState?.guessedAt ? (
          <Text style={styles.notice}>{currentState.isCorrect ? t('whoseTop.correct') : t('whoseTop.guessed')}</Text>
        ) : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {canManageRoom ? <AppButton label={t('whoseTop.next')} onPress={onAdvance} variant="ghost" disabled={isBusy} /> : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('whoseTop.players')}</Text>
        {players.map((player) => {
          const state = roundSetup.guesses.find((entry) => entry.userId === player.id);
          const badgeLabel = isCreating
            ? state?.hasSubmittedTop
              ? t('whoseTop.ready')
              : t('whoseTop.pending')
            : player.id === roundSetup.currentTopAuthorUserId
              ? t('whoseTop.author')
              : state?.guessedAt
                ? t('whoseTop.ready')
                : t('whoseTop.pending');

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
    selectedList: {
      gap: spacing.xs
    },
    rankRow: {
      minHeight: 42,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm
    },
    rankNumber: {
      width: 28,
      color: theme.colors.highlight,
      fontSize: typography.body,
      fontWeight: '900'
    },
    rankLabel: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
    },
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm
    },
    option: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: theme.colors.surface
    },
    optionActive: {
      borderColor: theme.colors.highlight,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    optionPressed: {
      transform: [{ scale: 0.98 }]
    },
    optionText: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
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
      fontWeight: '900',
      textTransform: 'uppercase'
    },
    revealName: {
      color: theme.colors.highlight,
      fontSize: typography.title,
      fontWeight: '900'
    },
    notice: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption,
      fontWeight: '800'
    },
    playerRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    playerName: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800'
    }
  });
}
