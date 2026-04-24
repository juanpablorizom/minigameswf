import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames } from '../../data/mockData';
import type { LobbyActionId, LobbyScenario } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AvatarSilhouette } from '../components/AvatarSilhouette';
import { MinimalIcon } from '../components/MinimalIcon';
import { SurfaceCard } from '../components/SurfaceCard';
import { layout, radius, spacing } from '../system/layout';
import { textStyles, typography } from '../system/typography';
import { useTheme } from '../theme';

type LobbyScreenProps = {
  displayName: string;
  scenario: LobbyScenario;
  onAction: (actionId: LobbyActionId) => void;
  notice?: string | null;
};

const friends = [
  { id: 'carlos', name: 'Carlos', status: 'En lobby', active: true },
  { id: 'sofia', name: 'Sofia', status: 'Jugando', active: true },
  { id: 'diego', name: 'Diego', status: 'Inactivo', active: true }
];

export function LobbyScreen({ displayName, scenario, onAction, notice = null }: LobbyScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const actionLabels: Record<LobbyActionId, string> = {
    createRoom: t('lobby.createRoom'),
    joinByCode: t('lobby.joinByCode'),
    scanQr: t('lobby.scanQr'),
    continueRoom: t('lobby.continueRoom'),
    openGamesCatalog: t('gamesCatalog.title'),
    inviteFriends: t('lobby.shareCode'),
    resumeActivity: t('lobby.resume'),
    quickPlay: t('lobby.quickPlay')
  };

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>BIENVENIDO</Text>
        <Text style={styles.name}>{displayName}</Text>
      </View>

      <SurfaceCard>
        <View style={styles.createHeader}>
          <View style={styles.createCopy}>
            <Text style={styles.heroTitle}>{scenario.key === 'activeRoom' ? scenario.title : 'Crear sala'}</Text>
            {scenario.key === 'activeRoom' ? <Text style={styles.copy}>{scenario.subtitle}</Text> : null}
          </View>
          <Pressable
            onPress={() => onAction(scenario.primaryAction.id)}
            style={({ pressed, hovered }) => [styles.arrowButton, hovered && styles.arrowButtonHover, pressed && styles.arrowButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel={actionLabels[scenario.primaryAction.id] ?? scenario.primaryAction.label}
          >
            <MinimalIcon name="arrowRight" size={32} color={theme.colors.primaryText} strokeWidth={2.6} />
          </Pressable>
        </View>

        {scenario.key === 'guest' || scenario.key === 'noRoom' ? null : (
          <View style={styles.actionRow}>
            <AppButton
              label={actionLabels[scenario.primaryAction.id] ?? scenario.primaryAction.label}
              onPress={() => onAction(scenario.primaryAction.id)}
              variant={scenario.primaryAction.variant}
            />
            {scenario.secondaryAction ? (
              <AppButton
                label={actionLabels[scenario.secondaryAction.id] ?? scenario.secondaryAction.label}
                onPress={() => onAction(scenario.secondaryAction!.id)}
                variant={scenario.secondaryAction.variant}
              />
            ) : null}
          </View>
        )}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SurfaceCard>

      <View style={styles.friendsHeader}>
        <Text style={styles.sectionTitle}>Amigos online</Text>
        <Text style={styles.activeCount}>3 activos</Text>
      </View>
      <View style={styles.friendRail}>
        {friends.map((friend) => (
          <View key={friend.id} style={styles.friend}>
            <View>
              <AvatarSilhouette size={64} />
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendStatus}>{friend.status}</Text>
          </View>
        ))}
        <Pressable style={styles.inviteFriend} onPress={() => onAction('inviteFriends')}>
          <View style={styles.invitePlus}>
            <MinimalIcon name="plus" size={30} color={theme.colors.textMuted} strokeWidth={2.2} />
          </View>
          <Text style={styles.friendStatus}>Invitar</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => onAction('openGamesCatalog')}
        style={({ pressed, hovered }) => [styles.gamesShortcut, hovered && styles.gamesShortcutHover, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={t('gamesCatalog.title')}
      >
        <View style={styles.gamesShortcutIcon}>
          <MinimalIcon name="games" size={34} color={theme.colors.textPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.gamesShortcutCopy}>
          <Text style={styles.gamesShortcutTitle}>Todos los juegos</Text>
          <Text style={styles.gamesShortcutMeta}>{featuredGames.length} disponibles</Text>
        </View>
        <View style={styles.gamesShortcutButton}>
          <MinimalIcon name="chevronRight" size={24} color={theme.colors.textMuted} strokeWidth={2.4} />
        </View>
      </Pressable>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    hero: {
      gap: spacing.xs,
      paddingTop: spacing.xs
    },
    kicker: {
      color: theme.colors.textMuted,
      fontSize: typography.body,
      fontWeight: '800',
      letterSpacing: 2
    },
    name: {
      color: theme.colors.highlight,
      ...textStyles.hero
    },
    createHeader: {
      minHeight: 92,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    createCopy: {
      flex: 1,
      gap: spacing.xs
    },
    heroTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    copy: {
      color: theme.colors.textSecondary,
      ...textStyles.body
    },
    arrowButton: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    arrowButtonHover: {
      backgroundColor: theme.colors.primaryHover
    },
    arrowButtonPressed: {
      transform: [{ scale: 0.96 }]
    },
    pressed: {
      transform: [{ scale: 0.98 }]
    },
    actionRow: {
      gap: layout.controlGap
    },
    notice: {
      color: theme.colors.highlight,
      fontSize: typography.caption,
      lineHeight: 18
    },
    friendsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    activeCount: {
      color: theme.colors.textMuted,
      fontSize: typography.body,
      fontWeight: '800'
    },
    friendRail: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      gap: spacing.lg,
      rowGap: spacing.lg
    },
    friend: {
      width: 82,
      alignItems: 'center',
      gap: spacing.xs
    },
    onlineDot: {
      position: 'absolute',
      top: 3,
      right: 4,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.success,
      borderWidth: 2,
      borderColor: theme.colors.background
    },
    friendName: {
      color: theme.colors.textPrimary,
      fontSize: typography.body,
      fontWeight: '800',
      textAlign: 'center'
    },
    friendStatus: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      textAlign: 'center'
    },
    inviteFriend: {
      width: 82,
      alignItems: 'center',
      gap: spacing.sm
    },
    invitePlus: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center'
    },
    gamesShortcut: {
      minHeight: 148,
      borderRadius: radius.xl,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      overflow: 'hidden'
    },
    gamesShortcutHover: {
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceMuted
    },
    gamesShortcutIcon: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.badgeAccentBackground,
      backgroundColor: theme.colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center'
    },
    gamesShortcutCopy: {
      flex: 1,
      minWidth: 0,
      gap: spacing.xs
    },
    gamesShortcutTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.section
    },
    gamesShortcutMeta: {
      color: theme.colors.textMuted,
      fontSize: typography.body,
      fontWeight: '700'
    },
    gamesShortcutButton: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: theme.colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
