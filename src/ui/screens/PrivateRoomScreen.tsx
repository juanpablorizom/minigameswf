import { StyleSheet, Text, View } from 'react-native';

import { featuredGames, roomActivity } from '../../data/mockData';
import type { MiniGame, Player, RoomSettings } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors, spacing, typography } from '../theme';

type PrivateRoomScreenProps = {
  players: Player[];
  selectedGames: MiniGame[];
  settings: RoomSettings;
  onInviteFriends: () => void;
  onChooseGames: () => void;
  onOpenSettings: () => void;
  onStart: () => void;
};

export function PrivateRoomScreen({
  players,
  selectedGames,
  settings,
  onInviteFriends,
  onChooseGames,
  onOpenSettings,
  onStart
}: PrivateRoomScreenProps) {
  return (
    <AppScreen title="Private Room" subtitle="Host tools, guest readiness, and tonight’s lineup live here.">
      <SurfaceCard>
        <View style={styles.roomTop}>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>Invite code</Text>
            <Text style={styles.codeValue}>Q7K9</Text>
          </View>
          <Badge label="Host ready" tone="success" />
        </View>
        <Text style={styles.sectionCopy}>
          The room is staged for {players.length} players, {selectedGames.length} selected games, and {settings.rounds} rounds.
        </Text>
        <View style={styles.roomActions}>
          <AppButton label="Invite Friends" onPress={onInviteFriends} variant="secondary" />
          <AppButton label="Continue to Game" onPress={onStart} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Players</Text>
          <Badge label={`${players.filter((player) => player.status !== 'invited').length} active`} />
        </View>
        {players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{player.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.playerMeta}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerMood}>{player.mood}</Text>
            </View>
            <Badge label={player.status === 'host' ? 'Host' : player.status === 'invited' ? 'Invited' : 'Ready'} tone={player.status === 'invited' ? 'neutral' : 'success'} />
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mini game lineup</Text>
          <AppButton label="Edit" onPress={onChooseGames} variant="ghost" />
        </View>
        {(selectedGames.length ? selectedGames : featuredGames.slice(0, 2)).map((game) => (
          <View key={game.id} style={styles.listRow}>
            <View style={styles.listMeta}>
              <Text style={styles.itemTitle}>{game.name}</Text>
              <Text style={styles.itemSubtitle}>
                {game.duration} · {game.energy}
              </Text>
            </View>
            <Badge label="Queued" tone="accent" />
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room setup</Text>
          <AppButton label="Adjust" onPress={onOpenSettings} variant="ghost" />
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
          <Text style={styles.sectionTitle}>Room activity</Text>
          <Badge label="Live" tone="success" />
        </View>
        {roomActivity.map((item) => (
          <View key={item.id} style={styles.activityRow}>
            <View style={styles.activityMarker} />
            <View style={styles.listMeta}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </SurfaceCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  roomTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  codeBlock: {
    gap: spacing.xs
  },
  codeLabel: {
    color: colors.textMuted,
    fontSize: typography.caption
  },
  codeValue: {
    color: colors.accentSoft,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 3
  },
  sectionCopy: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  roomActions: {
    gap: spacing.sm
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.textPrimary,
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
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLabel: {
    color: colors.accentSoft,
    fontWeight: '800'
  },
  playerMeta: {
    flex: 1,
    gap: 2
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  playerMood: {
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  itemSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
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
    backgroundColor: colors.success,
    marginTop: 6
  }
});
