import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

import type { RoomMemberView, RoomRealtimeState } from '../../data/rooms';
import { gameRegistry } from '../../data/gameRegistry';
import type { MiniGame, RoomSettings } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AvatarSilhouette } from '../components/AvatarSilhouette';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type PrivateRoomScreenProps = {
  roomCode: string;
  roomUrl: string;
  roomStatus: 'waiting' | 'active' | 'finished';
  members: RoomMemberView[];
  selectedGames: MiniGame[];
  settings: RoomSettings;
  canManageRoom: boolean;
  canStartGame: boolean;
  startDisabledReason: string | null;
  isBusy: boolean;
  notice: string | null;
  syncState: RoomRealtimeState;
  onShareCode: () => void;
  onChooseGames: () => void;
  onOpenSettings: () => void;
  onStart: () => void;
  onRemoveMember: (memberUserId: string) => void;
  onLeaveRoom: () => void;
};

export function PrivateRoomScreen({
  roomCode,
  roomUrl,
  roomStatus,
  members,
  selectedGames,
  settings,
  canManageRoom,
  canStartGame,
  startDisabledReason,
  isBusy,
  notice,
  syncState,
  onShareCode,
  onChooseGames,
  onOpenSettings,
  onStart,
  onRemoveMember,
  onLeaveRoom
}: PrivateRoomScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [copied, setCopied] = useState(false);
  const activeMembers = members.filter((member) => member.isActive);
  const host = members.find((member) => member.role === 'host') ?? null;
  const roomStatusLabel =
    roomStatus === 'active' ? t('room.statusActive') : roomStatus === 'finished' ? t('room.statusFinished') : t('room.statusWaiting');
  const syncStatusLabel =
    syncState === 'live'
      ? t('room.syncLive')
      : syncState === 'connecting'
        ? t('room.syncConnecting')
        : syncState === 'error'
          ? t('room.syncReconnect')
          : t('room.syncIdle');

  function gameName(id: string) {
    return t(`gameMeta.names.${id}`);
  }

  function themeLabel(value: RoomSettings['games']['impostor']['themeCategory']) {
    return t(`roomSettings.themeOptions.${value}`);
  }

  function guessWhoCategoryLabel(value: RoomSettings['games']['guess-who']['category']) {
    return t(`roomSettings.guessWhoCategoryOptions.${value}`);
  }

  function whoSaidTopicLabel(value: RoomSettings['games']['who-said']['topic']) {
    return t(`roomSettings.whoSaidTopicOptions.${value}`);
  }

  function majorityCategoryLabel(value: RoomSettings['games']['majority']['category']) {
    return t(`roomSettings.majorityCategoryOptions.${value}`);
  }

  function whoseTopCategoryLabel(value: RoomSettings['games']['whose-top']['category']) {
    return t(`roomSettings.whoseTopCategoryOptions.${value}`);
  }

  function turnTimerValue(value: number) {
    if (value === 0) {
      return t('roomSettings.turnTimerOptions.none');
    }

    if (value === 300) {
      return t('roomSettings.turnTimerOptions.fiveMinutes');
    }

    return `${value} ${t('common.secondsShort')}`;
  }

  function renderGameSettingsSummary(game: MiniGame) {
    if (game.id === 'guess-who') {
      return (
        <>
          <Text style={styles.itemSubtitle}>
            {t('room.guessWhoCategoryLine', { value: guessWhoCategoryLabel(settings.games['guess-who'].category) })}
          </Text>
          <Text style={styles.itemSubtitle}>{t('room.guessWhoAttemptsLine')}</Text>
        </>
      );
    }

    if (game.id === 'faces-gestures') {
      return <Text style={styles.itemSubtitle}>{t('room.turnTimerLine', { value: turnTimerValue(settings.games['faces-gestures'].turnSeconds) })}</Text>;
    }

    if (game.id === 'trivia') {
      return (
        <>
          <Text style={styles.itemSubtitle}>{t('room.triviaQuestionsLine', { value: settings.games.trivia.questionCount })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.turnTimerLine', { value: turnTimerValue(settings.games.trivia.turnSeconds) })}</Text>
        </>
      );
    }

    if (game.id === 'who-said') {
      return (
        <>
          <Text style={styles.itemSubtitle}>{t('room.whoSaidTopicLine', { value: whoSaidTopicLabel(settings.games['who-said'].topic) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.whoSaidWriteLine', { value: turnTimerValue(settings.games['who-said'].writeSeconds) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.whoSaidGuessLine', { value: turnTimerValue(settings.games['who-said'].guessSeconds) })}</Text>
        </>
      );
    }

    if (game.id === 'majority') {
      return (
        <>
          <Text style={styles.itemSubtitle}>{t('room.majorityCategoryLine', { value: majorityCategoryLabel(settings.games.majority.category) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.roundsLine', { value: settings.games.majority.roundCount })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.majorityAnswerLine', { value: turnTimerValue(settings.games.majority.answerSeconds) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.majorityPredictionLine', { value: turnTimerValue(settings.games.majority.predictionSeconds) })}</Text>
        </>
      );
    }

    if (game.id === 'troll') {
      return (
        <>
          <Text style={styles.itemSubtitle}>{t('room.themeLine', { value: themeLabel(settings.games.troll.category) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.roundsLine', { value: settings.games.troll.roundCount })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.trollDiscussionLine', { value: turnTimerValue(settings.games.troll.discussionSeconds) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.trollVotingLine', { value: turnTimerValue(settings.games.troll.votingSeconds) })}</Text>
        </>
      );
    }

    if (game.id === 'whose-top') {
      return (
        <>
          <Text style={styles.itemSubtitle}>{t('room.whoseTopCategoryLine', { value: whoseTopCategoryLabel(settings.games['whose-top'].category) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.whoseTopSizeLine', { value: settings.games['whose-top'].topSize })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.whoseTopCreateLine', { value: turnTimerValue(settings.games['whose-top'].createSeconds) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.whoseTopGuessLine', { value: turnTimerValue(settings.games['whose-top'].guessSeconds) })}</Text>
        </>
      );
    }

    if (game.id === 'impostor') {
      const impostorSettings = settings.games.impostor;

      return (
        <>
          <Text style={styles.itemSubtitle}>{t('room.impostorCountLine', { value: impostorSettings.impostorCount })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.themeLine', { value: themeLabel(impostorSettings.themeCategory) })}</Text>
          <Text style={styles.itemSubtitle}>{t('room.turnTimerLine', { value: turnTimerValue(impostorSettings.turnSeconds) })}</Text>
          <Text style={styles.itemSubtitle}>{t(`room.missBehaviorLine.${impostorSettings.missBehavior}`)}</Text>
          <Text style={styles.itemSubtitle}>{t(impostorSettings.balanceEndsGame ? 'room.balanceRuleOn' : 'room.balanceRuleOff')}</Text>
        </>
      );
    }

    return <Text style={styles.itemSubtitle}>{t('roomSettings.noSettings')}</Text>;
  }

  async function copyRoomCode() {
    const webNavigator = (globalThis as unknown as {
      navigator?: { clipboard?: { writeText: (value: string) => Promise<void> } };
    }).navigator;

    if (Platform.OS === 'web' && webNavigator?.clipboard?.writeText) {
      await webNavigator.clipboard.writeText(roomCode);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <AppScreen title={t('room.title')} subtitle={canManageRoom ? t('room.subtitleHost') : t('room.subtitleMember')}>
      <SurfaceCard>
        <View style={styles.roomTop}>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>{t('room.roomCode')}</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeValue}>{roomCode}</Text>
              <Pressable
                onPress={() => {
                  void copyRoomCode();
                }}
                style={({ pressed }) => [styles.copyButton, copied && styles.copyButtonDone, pressed && styles.copyButtonPressed]}
                accessibilityRole="button"
                accessibilityLabel="Copiar codigo"
              >
                <Text style={[styles.copyButtonLabel, copied && styles.copyButtonLabelDone]}>{copied ? '✓' : '⧉'}</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.statusStack}>
            <Badge label={roomStatusLabel} tone={roomStatus === 'active' ? 'success' : 'accent'} />
            <Badge
              label={syncStatusLabel}
              tone={syncState === 'error' ? 'accent' : syncState === 'live' ? 'success' : 'neutral'}
            />
          </View>
        </View>
        <Text style={styles.sectionCopy}>
          {host
            ? t('room.hostLine', { host: host.displayName, count: activeMembers.length })
            : t('room.hostUnavailable')}
        </Text>
        <View style={styles.roomActions}>
          <AppButton label={t('room.shareCode')} onPress={onShareCode} variant="secondary" />
          {canManageRoom ? <AppButton label={t('room.configureRoom')} onPress={onOpenSettings} variant="ghost" /> : null}
          {canManageRoom ? (
            <AppButton label={t('room.startGame')} onPress={onStart} disabled={isBusy || !canStartGame} />
          ) : null}
          <AppButton label={canManageRoom ? t('room.closeRoom') : t('room.leaveRoom')} onPress={onLeaveRoom} variant="ghost" disabled={isBusy} />
        </View>
        {canManageRoom && startDisabledReason ? <Text style={styles.notice}>{startDisabledReason}</Text> : null}
        <View style={styles.qrSection}>
          <View style={styles.qrCard}>
            <QRCode value={roomUrl} size={164} color={theme.colors.background} backgroundColor="#FFFFFF" />
          </View>
          <View style={styles.qrMeta}>
            <Text style={styles.qrTitle}>{t('room.qrTitle')}</Text>
            <Text style={styles.itemSubtitle}>{roomUrl}</Text>
            <Text style={styles.supportingCopy}>{t('room.fallbackCode', { code: roomCode })}</Text>
          </View>
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('room.members')}</Text>
          <Badge label={t('room.activeCount', { count: activeMembers.length })} />
        </View>
        {members.map((member) => (
          <View key={member.id} style={styles.playerRow}>
            <AvatarSilhouette size={44} />
            <View style={styles.playerMeta}>
              <View style={styles.playerTitleRow}>
                <Text style={styles.playerName}>{member.displayName}</Text>
                {member.isCurrentUser ? <Badge label={t('room.you')} tone="neutral" /> : null}
              </View>
                <Text style={styles.playerMood}>@{member.username}</Text>
              </View>
            <View style={styles.playerActions}>
              <Badge
                label={member.role === 'host' ? t('room.memberHost') : member.isActive ? t('room.memberJoined') : t('room.memberAway')}
                tone={member.role === 'host' || member.isActive ? 'success' : 'neutral'}
              />
              {canManageRoom && !member.isCurrentUser && member.role !== 'host' ? (
                <AppButton label={t('room.removeMember')} onPress={() => onRemoveMember(member.userId)} variant="ghost" disabled={isBusy} />
              ) : null}
            </View>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('room.gameModes')}</Text>
          {canManageRoom ? <AppButton label={t('room.chooseGame')} onPress={onChooseGames} variant="ghost" /> : null}
        </View>
        {selectedGames.length ? (
          selectedGames.map((game, index) => (
            <View key={game.id} style={styles.listRow}>
              <Image source={gameRegistry[game.id].thumbnail} resizeMode="contain" style={styles.gameThumb} />
              <View style={styles.listMeta}>
                <Text style={styles.itemTitle}>{gameName(game.id)}</Text>
              </View>
              <Badge label={index === 0 ? t('room.startsFirst') : t('room.selected')} tone="accent" />
            </View>
          ))
        ) : (
          <Text style={styles.itemSubtitle}>{canManageRoom ? t('room.noModeHost') : t('room.noModeMember')}</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('room.gameSetup')}</Text>
          {canManageRoom ? <AppButton label={t('room.configureGame')} onPress={onOpenSettings} variant="ghost" /> : null}
        </View>
        {selectedGames.length ? (
          selectedGames.map((game) => (
            <View key={game.id} style={styles.settingsPreview}>
              <View style={styles.settingsPreviewHeader}>
                <Image source={gameRegistry[game.id].thumbnail} resizeMode="contain" style={styles.gameThumb} />
                <Text style={styles.itemTitle}>{gameName(game.id)}</Text>
              </View>
              {renderGameSettingsSummary(game)}
            </View>
          ))
        ) : (
          <Text style={styles.itemSubtitle}>{t('room.noModeHost')}</Text>
        )}
      </SurfaceCard>

    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  roomTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  statusStack: {
    gap: spacing.xs,
    alignItems: 'flex-end'
  },
  codeBlock: {
    gap: spacing.xs
  },
  codeLabel: {
    color: theme.colors.textMuted,
    fontSize: typography.caption
  },
  codeValue: {
    color: theme.colors.highlight,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 3
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap'
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  copyButtonDone: {
    backgroundColor: theme.colors.successMuted,
    borderColor: theme.colors.success
  },
  copyButtonPressed: {
    transform: [{ scale: 0.94 }]
  },
  copyButtonLabel: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800'
  },
  copyButtonLabelDone: {
    color: theme.colors.successText
  },
  sectionCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  roomActions: {
    gap: spacing.sm
  },
  qrSection: {
    gap: spacing.md,
    alignItems: 'center'
  },
  qrCard: {
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  qrMeta: {
    gap: spacing.xs,
    alignItems: 'center'
  },
  qrTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  notice: {
    color: theme.colors.highlight,
    fontSize: typography.caption,
    lineHeight: 18
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
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  playerMeta: {
    flex: 1,
    gap: 2
  },
  playerTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center'
  },
  playerName: {
    color: theme.colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  playerMood: {
    color: theme.colors.textSecondary,
    fontSize: typography.caption
  },
  playerActions: {
    gap: spacing.sm,
    alignItems: 'flex-end'
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  gameThumb: {
    width: 44,
    height: 44,
    borderRadius: 12
  },
  listMeta: {
    flex: 1,
    gap: 2
  },
  settingsPreview: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: theme.colors.surfaceMuted
  },
  settingsPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  itemTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  itemSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  supportingCopy: {
    color: theme.colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18
  }
  });
}
