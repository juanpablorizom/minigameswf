import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  onRevealResults: () => void;
  onPlayAgain: () => void;
};

export function GameplayScreen({ players, activeGame, roomSettings, roundSetup, onRevealResults, onPlayAgain }: GameplayScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [stage, setStage] = useState<'reveal' | 'vote' | 'result'>('reveal');
  const [selectedVotePlayerId, setSelectedVotePlayerId] = useState<string | null>(null);

  useEffect(() => {
    setStage('reveal');
    setSelectedVotePlayerId(null);
  }, [roundSetup?.roundId]);

  if (activeGame.id === 'impostor' && roundSetup) {
    const currentPlayer = players.find((player) => player.isCurrentUser) ?? players[0] ?? null;
    const isCurrentPlayerImpostor = currentPlayer ? roundSetup.impostorIds.includes(currentPlayer.id) : false;
    const impostorCountLabel = t('roomSettings.impostorCountValue', { count: roomSettings.impostorCount });
    const themeLabel = t(`roomSettings.themeOptions.${roundSetup.categoryId}`);
    const expelledPlayer = players.find((player) => player.id === selectedVotePlayerId) ?? null;
    const expelledWasImpostor = expelledPlayer ? roundSetup.impostorIds.includes(expelledPlayer.id) : false;

    return (
      <AppScreen title={t('gameplay.impostorTitle')} subtitle={t('gameplay.impostorSubtitle')}>
        {stage === 'reveal' ? (
          <SurfaceCard>
            <View style={styles.header}>
              <Badge label={themeLabel} tone="accent" />
              <Badge label={impostorCountLabel} tone="success" />
            </View>
            <Text style={styles.gameTitle}>{t('gameplay.privateReveal')}</Text>
            <Text style={styles.gameCopy}>{t('gameplay.privateRevealCopy')}</Text>
            <View style={styles.revealCard}>
              <Text style={styles.revealValue}>{isCurrentPlayerImpostor ? t('gameplay.impostorWord') : roundSetup.secretWord}</Text>
            </View>
            <Text style={styles.helperCopy}>
              {isCurrentPlayerImpostor
                ? t('gameplay.impostorHelper')
                : t('gameplay.civilianHelper', { word: roundSetup.secretWord })}
            </Text>
          </SurfaceCard>
        ) : null}

        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t('gameplay.roundSetup')}</Text>
          <Text style={styles.itemSubtitle}>{t('gameplay.totalPlayers', { count: players.length })}</Text>
          <Text style={styles.itemSubtitle}>{t('gameplay.impostorCount', { count: roomSettings.impostorCount })}</Text>
          <Text style={styles.itemSubtitle}>{t('gameplay.themeSelected', { value: themeLabel })}</Text>
          <Text style={styles.itemSubtitle}>{t('gameplay.roundsConfigured', { count: roomSettings.rounds })}</Text>
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t('gameplay.playersTitle')}</Text>
          {stage === 'vote' ? (
            players.map((player) => (
              <Pressable
                key={player.id}
                onPress={() => setSelectedVotePlayerId(player.id)}
                style={({ pressed }) => [
                  styles.voteCard,
                  selectedVotePlayerId === player.id && styles.voteCardSelected,
                  pressed && styles.pressed
                ]}
              >
                <View style={styles.playerMeta}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerStatus}>{player.isCurrentUser ? t('gameplay.youLabel') : t('gameplay.voteHint')}</Text>
                </View>
                {selectedVotePlayerId === player.id ? <Badge label={t('gameplay.voted')} tone="success" /> : null}
              </Pressable>
            ))
          ) : stage === 'result' ? (
            <>
              {players.map((player) => (
                <View key={player.id} style={styles.playerRow}>
                  <View style={styles.playerMeta}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerStatus}>
                      {roundSetup.impostorIds.includes(player.id) ? t('gameplay.impostorReveal') : t('gameplay.notImpostor')}
                    </Text>
                  </View>
                  {selectedVotePlayerId === player.id ? <Badge label={t('gameplay.expelled')} tone="accent" /> : null}
                </View>
              ))}
              <View style={styles.resultPanel}>
                <Text style={styles.sectionTitle}>
                  {expelledWasImpostor ? t('gameplay.voteSuccessTitle') : t('gameplay.voteFailTitle')}
                </Text>
                <Text style={styles.itemSubtitle}>
                  {expelledPlayer
                    ? t('gameplay.voteResultLine', { player: expelledPlayer.name })
                    : t('gameplay.votePending')}
                </Text>
              </View>
            </>
          ) : (
            players.map((player) => (
              <View key={player.id} style={styles.playerRow}>
                <View style={styles.playerMeta}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerStatus}>{player.isCurrentUser ? t('gameplay.youLabel') : t('gameplay.playerWaiting')}</Text>
                </View>
                {player.isCurrentUser ? <Badge label={t('gameplay.youLabel')} tone="neutral" /> : null}
              </View>
            ))
          )}
        </SurfaceCard>

        <View style={styles.actions}>
          {stage === 'reveal' ? (
            <>
              <AppButton label={t('gameplay.newWord')} onPress={onPlayAgain} variant="secondary" />
              <AppButton label={t('gameplay.openVoting')} onPress={() => setStage('vote')} />
            </>
          ) : null}
          {stage === 'vote' ? (
            <>
              <AppButton label={t('common.back')} onPress={() => setStage('reveal')} variant="secondary" />
              <AppButton label={t('gameplay.expelVote')} onPress={() => setStage('result')} disabled={!selectedVotePlayerId} />
            </>
          ) : null}
          {stage === 'result' ? (
            <>
              <AppButton
                label={t('gameplay.newWord')}
                onPress={() => {
                  setSelectedVotePlayerId(null);
                  setStage('reveal');
                  onPlayAgain();
                }}
                variant="secondary"
              />
              <AppButton label={t('gameplay.finishRound')} onPress={onRevealResults} />
            </>
          ) : null}
        </View>
      </AppScreen>
    );
  }

  if (activeGame.id === 'impostor' && !roundSetup) {
    return (
      <AppScreen title={t('gameplay.impostorTitle')} subtitle={t('gameplay.impostorSubtitle')}>
        <SurfaceCard>
          <Text style={styles.gameTitle}>{t('gameplay.waitingForHostTitle')}</Text>
          <Text style={styles.gameCopy}>{t('gameplay.waitingForHostCopy')}</Text>
        </SurfaceCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen title={t('gameplay.genericTitle')} subtitle={t('gameplay.genericSubtitle')}>
      <SurfaceCard>
        <Text style={styles.gameTitle}>{activeGame.name}</Text>
        <Text style={styles.gameCopy}>{activeGame.description}</Text>
      </SurfaceCard>
      <AppButton label={t('gameplay.finishRound')} onPress={onRevealResults} />
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    gameTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.title,
      fontWeight: '700'
    },
    gameCopy: {
      color: theme.colors.textSecondary,
      fontSize: typography.body,
      lineHeight: 22
    },
    helperCopy: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      lineHeight: 18
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: typography.section,
      fontWeight: '700'
    },
    revealCard: {
      minHeight: 140,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    revealValue: {
      color: theme.colors.textPrimary,
      fontSize: typography.hero,
      fontWeight: '800',
      letterSpacing: -1
    },
    itemSubtitle: {
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
    voteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: spacing.md
    },
    voteCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    pressed: {
      opacity: 0.9
    },
    resultPanel: {
      gap: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      padding: spacing.md
    },
    actions: {
      gap: spacing.sm
    }
  });
}
