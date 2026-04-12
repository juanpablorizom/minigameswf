import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import type { RoomActivityView, RoomMemberView } from '../../data/rooms';
import type { RoomRealtimeState } from '../../data/rooms';
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
  activity: RoomActivityView[];
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
};

export function PrivateRoomScreen({
  roomCode,
  roomUrl,
  roomStatus,
  members,
  activity,
  selectedGame,
  settings,
  canManageRoom,
  isBusy,
  notice,
  syncState,
  onShareCode,
  onChooseGames,
  onOpenSettings,
  onStart
}: PrivateRoomScreenProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const activeMembers = members.filter((member) => member.isActive);
  const host = members.find((member) => member.role === 'host') ?? null;
  const isImpostorMode = selectedGame?.id === 'impostor';

  return (
    <AppScreen title="Party room" subtitle={canManageRoom ? 'You are hosting this room. Keep members moving and lock the flow before the first round starts.' : 'The host controls setup. You can follow who is in and wait for the next step.'}>
      <SurfaceCard>
        <View style={styles.roomTop}>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>Room code</Text>
            <Text style={styles.codeValue}>{roomCode}</Text>
          </View>
          <View style={styles.statusStack}>
            <Badge label={roomStatus === 'active' ? 'In session' : roomStatus === 'finished' ? 'Finished' : 'Waiting'} tone={roomStatus === 'active' ? 'success' : 'accent'} />
            <Badge
              label={syncState === 'live' ? 'Live sync' : syncState === 'connecting' ? 'Syncing...' : syncState === 'error' ? 'Reconnect' : 'Idle'}
              tone={syncState === 'error' ? 'accent' : syncState === 'live' ? 'success' : 'neutral'}
            />
          </View>
        </View>
        <Text style={styles.sectionCopy}>
          {host ? `${host.displayName} is hosting` : 'Host unavailable'} · {activeMembers.length} active members
        </Text>
        <View style={styles.roomActions}>
          <AppButton label="Share code" onPress={onShareCode} variant="secondary" />
          {canManageRoom ? (
            <AppButton label={roomStatus === 'active' ? 'Return to game' : 'Continue to game'} onPress={onStart} disabled={isBusy} />
          ) : null}
        </View>
        <View style={styles.qrSection}>
          <View style={styles.qrCard}>
            <QRCode value={roomUrl} size={164} color={theme.colors.background} backgroundColor="#FFFFFF" />
          </View>
          <View style={styles.qrMeta}>
            <Text style={styles.qrTitle}>Scan to join instantly</Text>
            <Text style={styles.itemSubtitle}>{roomUrl}</Text>
            <Text style={styles.supportingCopy}>Fallback code: {roomCode}</Text>
          </View>
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members</Text>
          <Badge label={`${activeMembers.length} active`} />
        </View>
        {members.map((member) => (
          <View key={member.id} style={styles.playerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{member.displayName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.playerMeta}>
              <View style={styles.playerTitleRow}>
                <Text style={styles.playerName}>{member.displayName}</Text>
                {member.isCurrentUser ? <Badge label="You" tone="neutral" /> : null}
              </View>
              <Text style={styles.playerMood}>@{member.username}</Text>
            </View>
            <Badge label={member.role === 'host' ? 'Host' : member.isActive ? 'Joined' : 'Away'} tone={member.role === 'host' || member.isActive ? 'success' : 'neutral'} />
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current mode</Text>
          {canManageRoom ? <AppButton label="Change" onPress={onChooseGames} variant="ghost" /> : null}
        </View>
        {selectedGame ? (
          <View style={styles.listRow}>
            <View style={styles.listMeta}>
              <Text style={styles.itemTitle}>{selectedGame.name}</Text>
              <Text style={styles.itemSubtitle}>
                {selectedGame.duration} · {selectedGame.energy}
              </Text>
              {isImpostorMode ? (
                <Text style={styles.supportingCopy}>
                  Choose Friends Mode or Multiplayer when the round starts.
                </Text>
              ) : null}
            </View>
            <Badge label="Selected" tone="accent" />
          </View>
        ) : (
          <Text style={styles.itemSubtitle}>{canManageRoom ? 'Choose the first mode before starting the party.' : 'The host has not selected the next mode yet.'}</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Party setup</Text>
          {canManageRoom ? <AppButton label="Adjust" onPress={onOpenSettings} variant="ghost" /> : null}
        </View>
        <Text style={styles.itemSubtitle}>Privacy: {settings.privacy}</Text>
        <Text style={styles.itemSubtitle}>Max players: {settings.maxPlayers}</Text>
        <Text style={styles.itemSubtitle}>Turn timer: {settings.turnSeconds} seconds</Text>
        <Text style={styles.itemSubtitle}>Mode: {settings.format}</Text>
        <Text style={styles.itemSubtitle}>Flow: {settings.vibe}</Text>
        <Text style={styles.itemSubtitle}>Chat: {settings.chatEnabled ? 'On' : 'Off'}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Party activity</Text>
          <Badge label="Live" tone="success" />
        </View>
        {activity.length ? (
          activity.map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.activityMarker} />
              <View style={styles.listMeta}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.itemSubtitle}>Room activity will appear here as members join and the party moves forward.</Text>
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
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  activityMarker: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.success,
    marginTop: 6
  }
  });
}
