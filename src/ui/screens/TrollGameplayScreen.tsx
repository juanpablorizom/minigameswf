import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Player, TrollRoundSetup } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type TrollGameplayScreenProps = {
  players: Player[];
  roundSetup: TrollRoundSetup;
  canManageRoom: boolean;
  isBusy: boolean;
  notice: string | null;
  onCastVote: (targetUserId: string) => void;
  onAdvance: () => void;
};

export function TrollGameplayScreen({
  players,
  roundSetup,
  canManageRoom,
  isBusy,
  notice,
  onCastVote,
  onAdvance
}: TrollGameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(roundSetup.voteDeadlineAt));
  const autoAdvanceKeyRef = useRef<string | null>(null);
  const currentAssignment = roundSetup.assignments.find((assignment) => assignment.isCurrentUser) ?? null;
  const currentVote = roundSetup.votes.find((vote) => players.find((player) => player.isCurrentUser)?.id === vote.voterUserId) ?? null;
  const isVoting = roundSetup.phase === 'voting' && roundSetup.status === 'active';
  const isResult = roundSetup.phase === 'result' || roundSetup.status === 'finished';
  const activeVoters = roundSetup.assignments.filter((assignment) => !assignment.isEliminated);
  const allVoted = isVoting && activeVoters.length > 0 && activeVoters.every((assignment) => roundSetup.votes.some((vote) => vote.voterUserId === assignment.userId));

  useEffect(() => {
    setSelectedUserId(null);
    autoAdvanceKeyRef.current = null;
  }, [roundSetup.phase, roundSetup.roundNumber]);

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

    const shouldAdvance = secondsLeft <= 0 || allVoted;

    if (!shouldAdvance) {
      return;
    }

    const advanceKey = `${roundSetup.roundId}:${roundSetup.phase}:${roundSetup.roundNumber}:${secondsLeft}:${allVoted}`;

    if (autoAdvanceKeyRef.current === advanceKey) {
      return;
    }

    autoAdvanceKeyRef.current = advanceKey;
    onAdvance();
  }, [allVoted, canManageRoom, onAdvance, roundSetup.phase, roundSetup.roundId, roundSetup.roundNumber, roundSetup.status, secondsLeft]);

  function playerName(userId: string | null) {
    if (!userId) {
      return t('common.player');
    }

    return players.find((player) => player.id === userId)?.name ?? t('common.player');
  }

  function roleLabel(role: string | null) {
    if (!role) {
      return t('troll.hidden');
    }

    return t(`troll.roles.${role}`);
  }

  function submitVote() {
    if (!selectedUserId || currentVote || isBusy) {
      return;
    }

    onCastVote(selectedUserId);
  }

  return (
    <AppScreen title={t('troll.title')} subtitle={isVoting ? t('troll.vote') : isResult ? t('troll.result') : t('troll.discuss')}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <Badge label={t('troll.roundCount', { current: roundSetup.roundNumber, total: roundSetup.roundCount })} tone="accent" />
          <Badge label={roundSetup.status === 'finished' ? t('troll.done') : t('troll.timer', { value: Math.max(secondsLeft, 0) })} tone="success" />
        </View>

        <View style={styles.revealBox}>
          <Text style={styles.revealLabel}>{t('troll.yourRole')}</Text>
          <Text style={styles.role}>{roleLabel(currentAssignment?.role ?? null)}</Text>
          <Text style={styles.revealLabel}>{t('troll.yourWord')}</Text>
          <Text style={styles.word}>{currentAssignment?.word ?? t('troll.noWord')}</Text>
        </View>

        {isVoting ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>{t('troll.vote')}</Text>
            <View style={styles.optionGrid}>
              {players.map((player) => {
                const assignment = roundSetup.assignments.find((entry) => entry.userId === player.id);
                const disabled = Boolean(currentVote) || Boolean(assignment?.isEliminated) || player.isCurrentUser || isBusy;
                const active = selectedUserId === player.id;

                return (
                  <Pressable
                    key={player.id}
                    disabled={disabled}
                    onPress={() => setSelectedUserId(player.id)}
                    style={({ pressed }) => [
                      styles.option,
                      active ? styles.optionActive : null,
                      disabled ? styles.optionDisabled : null,
                      pressed ? styles.optionPressed : null
                    ]}
                  >
                    <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>{player.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <AppButton label={t('troll.vote')} onPress={submitVote} disabled={!selectedUserId || Boolean(currentVote) || isBusy} />
          </View>
        ) : null}

        {isResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.revealLabel}>{t('troll.eliminated')}</Text>
            <Text style={styles.resultName}>{playerName(roundSetup.expelledUserId)}</Text>
            <Text style={styles.notice}>{t(`troll.outcomes.${roundSetup.outcome}`)}</Text>
          </View>
        ) : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {canManageRoom ? <AppButton label={isResult ? t('troll.next') : t('troll.vote')} onPress={onAdvance} variant="ghost" disabled={isBusy} /> : null}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('troll.players')}</Text>
        {players.map((player) => {
          const assignment = roundSetup.assignments.find((entry) => entry.userId === player.id);
          const voted = roundSetup.votes.some((vote) => vote.voterUserId === player.id);

          return (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName}>{player.name}</Text>
                {isResult ? <Text style={styles.playerStatus}>{roleLabel(assignment?.role ?? null)}</Text> : null}
              </View>
              <View style={styles.badges}>
                {assignment?.isEliminated ? <Badge label={t('troll.eliminated')} tone="neutral" /> : null}
                {voted && isVoting ? <Badge label={t('troll.ready')} tone="success" /> : null}
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
      gap: spacing.sm
    },
    block: {
      gap: spacing.sm
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
    role: {
      color: theme.colors.highlight,
      fontSize: typography.title,
      fontWeight: '900'
    },
    word: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: '900'
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
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
    optionDisabled: {
      opacity: 0.45
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
    resultBox: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: spacing.md,
      gap: spacing.xs
    },
    resultName: {
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
    playerMeta: {
      flex: 1,
      minWidth: 0
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
    badges: {
      flexDirection: 'row',
      gap: spacing.xs
    }
  });
}
