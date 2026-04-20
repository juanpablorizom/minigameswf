import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

import type { RoomMemberView, RoomRealtimeState } from '../../data/rooms';
import type { MiniGame, RoomSettings } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { spacing, typography, useTheme } from '../theme';

type PrivateRoomScreenProps = {
  roomCode: string;
  roomUrl: string;
  roomStatus: 'waiting' | 'active' | 'finished';
  members: RoomMemberView[];
  selectedGame: MiniGame | null;
  settings: RoomSettings;
  canManageRoom: boolean;
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
  selectedGame,
  settings,
  canManageRoom,
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
  const activeMembers = members.filter((member) => member.isActive);
  const host = members.find((member) => member.role === 'host') ?? null;
  const isImpostorMode = selectedGame?.id === 'impostor';
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

  function themeLabel(value: RoomSettings['themeCategory']) {
    return t(`roomSettings.themeOptions.${value}`);
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

  return (
    <AppScreen title={t('room.title')} subtitle={canManageRoom ? t('room.subtitleHost') : t('room.subtitleMember')}>
      <SurfaceCard>
        <View style={styles.roomTop}>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>{t('room.roomCode')}</Text>
            <Text style={styles.codeValue}>{roomCode}</Text>
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
            <AppButton label={t('room.startGame')} onPress={onStart} disabled={isBusy} />
          ) : null}
          <AppButton label={canManageRoom ? t('room.closeRoom') : t('room.leaveRoom')} onPress={onLeaveRoom} variant="ghost" disabled={isBusy} />
        </View>
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
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{member.displayName.slice(0, 2).toUpperCase()}</Text>
            </View>
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
        {selectedGame ? (
          <View style={styles.listRow}>
            <View style={styles.listMeta}>
              <Text style={styles.itemTitle}>{gameName(selectedGame.id)}</Text>
              <Text style={styles.itemSubtitle}>{t(`gameMeta.descriptions.${selectedGame.id}`)}</Text>
              {isImpostorMode ? (
                <Text style={styles.supportingCopy}>{t('room.impostorHint')}</Text>
              ) : null}
            </View>
            <Badge label={t('room.selected')} tone="accent" />
          </View>
        ) : (
          <Text style={styles.itemSubtitle}>{canManageRoom ? t('room.noModeHost') : t('room.noModeMember')}</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('room.gameSetup')}</Text>
          {canManageRoom ? <AppButton label={t('room.configureGame')} onPress={onOpenSettings} variant="ghost" /> : null}
        </View>
        <Text style={styles.itemSubtitle}>{t('room.impostorCountLine', { value: settings.impostorCount })}</Text>
        <Text style={styles.itemSubtitle}>{t('room.themeLine', { value: themeLabel(settings.themeCategory) })}</Text>
        <Text style={styles.itemSubtitle}>{t('room.turnTimerLine', { value: turnTimerValue(settings.turnSeconds) })}</Text>
        <Text style={styles.itemSubtitle}>{t(`room.missBehaviorLine.${settings.missBehavior}`)}</Text>
        <Text style={styles.itemSubtitle}>{t(settings.balanceEndsGame ? 'room.balanceRuleOn' : 'room.balanceRuleOff')}</Text>
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLabel: {
    color: theme.colors.highlight,
    fontWeight: '800'
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
  listMeta: {
    flex: 1,
    gap: 2
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
