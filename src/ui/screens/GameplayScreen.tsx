import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ImpostorRoundSetup, MiniGame, Player, RoomSettings } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { radius, spacing, typography, useTheme } from '../theme';

type GameplayScreenProps = {
  players: Player[];
  activeGame: MiniGame;
  roomSettings: RoomSettings;
  roundSetup: ImpostorRoundSetup | null;
  isHost: boolean;
  isBusy: boolean;
  notice: string | null;
  onStartVoting: () => void;
  onCastVote: (targetUserId: string) => void;
  onResolveVote: () => void;
  onStartNextRound: () => void;
  onRevealResults: () => void;
  onPlayAgain: () => void;
};

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function GameplayScreen({
  players,
  activeGame,
  roomSettings,
  roundSetup,
  isHost,
  isBusy,
  notice,
  onStartVoting,
  onCastVote,
  onResolveVote,
  onStartNextRound
}: GameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [isVoteModalVisible, setIsVoteModalVisible] = useState(false);
  const [pendingVoteTargetId, setPendingVoteTargetId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const autoResolvedVoteRef = useRef<string | null>(null);

  useEffect(() => {
    setIsVoteModalVisible(false);
    setPendingVoteTargetId(null);
  }, [roundSetup?.roundId, roundSetup?.phase, roundSetup?.expelledUserId]);

  useEffect(() => {
    if (!roundSetup?.voteDeadlineAt || roundSetup.phase !== 'voting') {
      setSecondsLeft(null);
      autoResolvedVoteRef.current = null;
      return;
    }

    const voteDeadlineAt = roundSetup.voteDeadlineAt;

    function syncRemainingTime() {
      const diffMs = new Date(voteDeadlineAt).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(diffMs / 1000)));
    }

    syncRemainingTime();
    const interval = setInterval(syncRemainingTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [roundSetup?.phase, roundSetup?.voteDeadlineAt]);

  useEffect(() => {
    if (!roundSetup || !isHost || roundSetup.phase !== 'voting' || secondsLeft === null || secondsLeft > 0) {
      return;
    }

    const resolutionKey = `${roundSetup.roundId}:${roundSetup.voteDeadlineAt ?? 'no-deadline'}`;

    if (autoResolvedVoteRef.current === resolutionKey) {
      return;
    }

    autoResolvedVoteRef.current = resolutionKey;
    onResolveVote();
  }, [isHost, onResolveVote, roundSetup, secondsLeft]);

  if (activeGame.id !== 'impostor' || !roundSetup) {
    return (
      <AppScreen title={t('gameplay.impostorTitle')} subtitle={t('gameplay.waitingForHostCopy')}>
        <SurfaceCard>
          <Text style={styles.infoTitle}>{t('gameplay.waitingForHostTitle')}</Text>
          <Text style={styles.infoCopy}>{t('gameplay.waitingForHostCopy')}</Text>
        </SurfaceCard>
      </AppScreen>
    );
  }

  const currentPlayer = players.find((player) => player.isCurrentUser) ?? players[0] ?? null;
  const isCurrentPlayerImpostor = currentPlayer ? roundSetup.impostorIds.includes(currentPlayer.id) : false;
  const currentVote = currentPlayer
    ? roundSetup.votes.find((vote) => vote.voterUserId === currentPlayer.id) ?? null
    : null;
  const expelledPlayer = players.find((player) => player.id === roundSetup.expelledUserId) ?? null;
  const expelledWasImpostor = expelledPlayer ? roundSetup.impostorIds.includes(expelledPlayer.id) : false;
  const availableVoteTargets = players.filter((player) => !roundSetup.eliminatedUserIds.includes(player.id));
  const remainingImpostorIds = roundSetup.impostorIds.filter((playerId) => !roundSetup.eliminatedUserIds.includes(playerId));
  const allImpostorsOut = remainingImpostorIds.length === 0;
  const voteSummary = useMemo(() => {
    const counts = new Map<string, number>();

    for (const vote of roundSetup.votes) {
      counts.set(vote.targetUserId, (counts.get(vote.targetUserId) ?? 0) + 1);
    }

    return counts;
  }, [roundSetup.votes]);

  const pendingVoteTarget = availableVoteTargets.find((player) => player.id === pendingVoteTargetId) ?? null;
  const canOpenVoting = roundSetup.phase === 'reveal' || roundSetup.phase === 'result';
  const canVoteNow = roundSetup.phase === 'voting';
  const shouldShowNextRoundButton = allImpostorsOut && roundSetup.roundNumber < roomSettings.rounds;
  const shouldShowFinalState = allImpostorsOut && roundSetup.roundNumber >= roomSettings.rounds;

  function openVoteFlow() {
    if (canOpenVoting && isHost) {
      onStartVoting();
      setIsVoteModalVisible(true);
      return;
    }

    if (canVoteNow) {
      setIsVoteModalVisible(true);
    }
  }

  return (
    <AppScreen title={t('gameplay.impostorTitle')} subtitle={t('gameplay.impostorSubtitle')}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <Badge label={t(`roomSettings.themeOptions.${roundSetup.categoryId}`)} tone="accent" />
          <Badge label={t('gameplay.roundNumber', { current: roundSetup.roundNumber, total: roomSettings.rounds })} tone="neutral" />
        </View>
        <View style={styles.revealCard}>
          <Text style={styles.revealEyebrow}>
            {isCurrentPlayerImpostor ? t('gameplay.impostorTag') : t('gameplay.secretWordTag')}
          </Text>
          <Text style={styles.revealValue}>
            {isCurrentPlayerImpostor ? t('gameplay.impostorWord') : roundSetup.secretWord}
          </Text>
          <Text style={styles.revealCopy}>
            {isCurrentPlayerImpostor
              ? t('gameplay.impostorHelper')
              : t('gameplay.civilianHelper', { word: roundSetup.secretWord })}
          </Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('gameplay.voteSection')}</Text>
          {canVoteNow && secondsLeft !== null ? <Badge label={t('gameplay.voteTimer', { time: formatSeconds(secondsLeft) })} tone="success" /> : null}
          {roundSetup.phase === 'result' ? <Badge label={t('gameplay.voteClosed')} tone="neutral" /> : null}
        </View>
        <Text style={styles.infoCopy}>
          {roundSetup.phase === 'reveal'
            ? t('gameplay.votePrompt')
            : roundSetup.phase === 'voting'
              ? currentVote
                ? t('gameplay.voteRegisteredFor', {
                    player:
                      players.find((player) => player.id === currentVote.targetUserId)?.name ?? t('common.player')
                  })
                : t('gameplay.voteOpen')
              : expelledPlayer
                ? t('gameplay.voteResultLine', { player: expelledPlayer.name })
                : t('gameplay.votePending')}
        </Text>

        <AppButton
          label={
            roundSetup.phase === 'result'
              ? allImpostorsOut
                ? shouldShowNextRoundButton
                  ? t('gameplay.nextRound')
                  : t('gameplay.finishMatch')
                : t('gameplay.openVoting')
              : t('gameplay.votePrimary')
          }
          onPress={() => {
            if (roundSetup.phase === 'result') {
              if (allImpostorsOut) {
                if (shouldShowNextRoundButton) {
                  onStartNextRound();
                }
                return;
              }

              openVoteFlow();
              return;
            }

            openVoteFlow();
          }}
          disabled={
            isBusy ||
            (!isHost && canOpenVoting) ||
            shouldShowFinalState
          }
        />
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('gameplay.playersTitle')}</Text>
        {players.map((player) => {
          const isEliminated = roundSetup.eliminatedUserIds.includes(player.id);
          const receivedVotes = voteSummary.get(player.id) ?? 0;

          return (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerStatus}>
                  {isEliminated
                    ? t('gameplay.playerEliminated')
                    : roundSetup.impostorIds.includes(player.id) && roundSetup.phase === 'result'
                      ? t('gameplay.impostorReveal')
                      : player.isCurrentUser
                        ? t('gameplay.youLabel')
                        : t('gameplay.playerActive')}
                </Text>
              </View>
              <View style={styles.playerBadges}>
                {receivedVotes > 0 && roundSetup.phase === 'voting' ? (
                  <Badge label={t('gameplay.voteCount', { count: receivedVotes })} tone="neutral" />
                ) : null}
                {roundSetup.expelledUserId === player.id ? <Badge label={t('gameplay.expelled')} tone="accent" /> : null}
              </View>
            </View>
          );
        })}
      </SurfaceCard>

      {roundSetup.phase === 'result' ? (
        <SurfaceCard>
          <Text style={styles.infoTitle}>
            {expelledWasImpostor ? t('gameplay.voteSuccessTitle') : t('gameplay.voteFailTitle')}
          </Text>
          <Text style={styles.infoCopy}>
            {expelledPlayer
              ? expelledWasImpostor
                ? t('gameplay.revealedImpostor', { player: expelledPlayer.name })
                : t('gameplay.revealedCivilian', { player: expelledPlayer.name })
              : t('gameplay.votePending')}
          </Text>
          <Text style={styles.infoCopy}>
            {allImpostorsOut
              ? shouldShowNextRoundButton
                ? t('gameplay.nextRoundAutoHost')
                : t('gameplay.matchFinished')
              : t('gameplay.remainingImpostors', { count: remainingImpostorIds.length })}
          </Text>
        </SurfaceCard>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Modal visible={isVoteModalVisible} transparent animationType="fade" onRequestClose={() => setIsVoteModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setIsVoteModalVisible(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('gameplay.voteModalTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('gameplay.voteModalSubtitle')}</Text>

            <View style={styles.modalList}>
              {availableVoteTargets.map((player) => (
                <Pressable
                  key={player.id}
                  onPress={() => setPendingVoteTargetId(player.id)}
                  style={[
                    styles.voteOption,
                    pendingVoteTargetId === player.id && styles.voteOptionSelected
                  ]}
                >
                  <Text style={styles.voteOptionLabel}>{player.name}</Text>
                  {pendingVoteTargetId === player.id ? <Badge label={t('gameplay.selectedVote')} tone="success" /> : null}
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <AppButton label={t('common.stay')} onPress={() => setIsVoteModalVisible(false)} variant="secondary" />
              <AppButton
                label={t('gameplay.confirmVote')}
                onPress={() => {
                  if (!pendingVoteTarget) {
                    return;
                  }

                  onCastVote(pendingVoteTarget.id);
                  setIsVoteModalVisible(false);
                }}
                disabled={!pendingVoteTarget || isBusy}
              />
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    revealCard: {
      minHeight: 360,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.md
    },
    revealEyebrow: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1.4
    },
    revealValue: {
      color: theme.colors.textPrimary,
      fontSize: 52,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -1.2
    },
    revealCopy: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22,
      textAlign: 'center'
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    infoTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    infoCopy: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    playerMeta: {
      flex: 1,
      gap: spacing.xs
    },
    playerName: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    playerStatus: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption
    },
    playerBadges: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'center'
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      backgroundColor: 'rgba(0, 0, 0, 0.55)'
    },
    modalCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: spacing.lg,
      gap: spacing.md
    },
    modalTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    modalSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    modalList: {
      gap: spacing.sm
    },
    voteOption: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    voteOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    voteOptionLabel: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '700'
    },
    modalActions: {
      gap: spacing.sm
    }
  });
}
