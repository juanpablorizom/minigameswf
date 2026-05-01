import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { FriendView } from '../../data/friends';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppTextField } from '../components/AppTextField';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { SurfaceCard } from '../components/SurfaceCard';
import { layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

type FriendsScreenProps = {
  embedded?: boolean;
  friends: FriendView[];
  pendingRequests: FriendView[];
  isBusy: boolean;
  notice?: string | null;
  onSendRequest: (username: string) => void;
  onRespondRequest: (friendshipId: string, accept: boolean) => void;
  onRemoveFriend: (friendshipId: string) => void;
};

export function FriendsScreen({
  embedded = false,
  friends,
  pendingRequests,
  isBusy,
  notice = null,
  onSendRequest,
  onRespondRequest,
  onRemoveFriend
}: FriendsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');
  const [username, setUsername] = useState('');
  const visibleRows = tab === 'friends' ? friends : pendingRequests;

  const content = (
    <>
      <View style={styles.tabRow}>
        <TabButton label={t('friends.friendsTab')} active={tab === 'friends'} onPress={() => setTab('friends')} />
        <TabButton label={t('friends.requestsTab')} active={tab === 'requests'} onPress={() => setTab('requests')} />
      </View>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>{t('friends.addFriend')}</Text>
        <View style={styles.addRow}>
          <AppTextField value={username} onChangeText={setUsername} placeholder={t('friends.searchPlaceholder')} autoCapitalize="none" />
          <AppButton label={t('friends.sendRequest')} onPress={() => onSendRequest(username)} disabled={isBusy || !username.trim()} />
        </View>
      </SurfaceCard>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {visibleRows.length ? (
        visibleRows.map((friend) => (
          <SurfaceCard key={friend.friendship_id}>
            <View style={styles.friendRow}>
              <Avatar avatarId={friend.avatar_id} frameId={friend.frame_id} size={54} />
              <View style={styles.friendMeta}>
                <Text style={styles.friendName}>{friend.display_name ?? friend.username}</Text>
                <Text style={styles.friendUsername}>@{friend.username}</Text>
              </View>
              <Badge label={t(`friends.status.${friend.presence_status}`)} tone={friend.presence_status === 'online' ? 'success' : 'neutral'} />
            </View>
            {tab === 'requests' ? (
              <View style={styles.actions}>
                <AppButton label={t('friends.acceptRequest')} onPress={() => onRespondRequest(friend.friendship_id, true)} disabled={isBusy} />
                <AppButton label={t('friends.rejectRequest')} variant="secondary" onPress={() => onRespondRequest(friend.friendship_id, false)} disabled={isBusy} />
              </View>
            ) : (
              <AppButton label={t('friends.removeFriend')} variant="ghost" onPress={() => onRemoveFriend(friend.friendship_id)} disabled={isBusy} />
            )}
          </SurfaceCard>
        ))
      ) : (
        <SurfaceCard>
          <Text style={styles.emptyTitle}>{tab === 'friends' ? t('friends.empty') : t('friends.noRequests')}</Text>
          <Text style={styles.emptyCopy}>{t('friends.emptyHint')}</Text>
        </SurfaceCard>
      )}
    </>
  );

  if (embedded) {
    return <View style={styles.embedded}>{content}</View>;
  }

  return (
    <AppScreen title={t('friends.title')} subtitle={t('friends.subtitle')}>
      {content}
    </AppScreen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    embedded: {
      gap: layout.sectionGap
    },
    tabRow: {
      flexDirection: 'row',
      gap: spacing.sm
    },
    tabButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center'
    },
    tabButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    tabLabel: {
      color: theme.colors.textSecondary,
      ...textStyles.bodyStrong
    },
    tabLabelActive: {
      color: theme.colors.textPrimary
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    addRow: {
      gap: spacing.md
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18
    },
    friendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md
    },
    friendMeta: {
      flex: 1,
      minWidth: 0
    },
    friendName: {
      color: theme.colors.textPrimary,
      ...textStyles.bodyStrong
    },
    friendUsername: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption
    },
    actions: {
      gap: spacing.sm
    },
    emptyTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    emptyCopy: {
      color: theme.colors.textSecondary,
      ...textStyles.body
    }
  });
}
