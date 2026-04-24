import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { featuredGames } from '../../data/mockData';
import type { LobbyActionId, LobbyScenario } from '../../navigation/types';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AvatarSilhouette } from '../components/AvatarSilhouette';
import { SurfaceCard } from '../components/SurfaceCard';
import { controls, layout, radius, spacing } from '../system/layout';
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
  const [selectedGameId, setSelectedGameId] = useState(featuredGames[0]?.id ?? 'impostor');
  const [playerCount, setPlayerCount] = useState(4);
  const selectedGame = featuredGames.find((game) => game.id === selectedGameId) ?? featuredGames[0];
  const actionLabels: Record<LobbyActionId, string> = {
    createRoom: t('lobby.createRoom'),
    joinByCode: t('lobby.joinByCode'),
    scanQr: t('lobby.scanQr'),
    continueRoom: t('lobby.continueRoom'),
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
            <Text style={styles.copy}>
              {scenario.key === 'activeRoom'
                ? scenario.subtitle
                : 'Elige juego, ajusta el grupo y comparte el codigo con tus amigos.'}
            </Text>
          </View>
          <Pressable
            onPress={() => onAction(scenario.primaryAction.id)}
            style={({ pressed, hovered }) => [styles.arrowButton, hovered && styles.arrowButtonHover, pressed && styles.arrowButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel={actionLabels[scenario.primaryAction.id] ?? scenario.primaryAction.label}
          >
            <Text style={styles.arrowButtonLabel}>→</Text>
          </Pressable>
        </View>

        {scenario.key === 'guest' || scenario.key === 'noRoom' ? (
          <>
            <View style={styles.selectorBlock}>
              <Text style={styles.sectionLabel}>Juego</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gameRail}>
                {featuredGames.map((game) => {
                  const isSelected = game.id === selectedGameId;

                  return (
                    <Pressable
                      key={game.id}
                      onPress={() => setSelectedGameId(game.id)}
                      style={({ pressed }) => [styles.gameCard, isSelected && styles.gameCardSelected, pressed && styles.pressed]}
                    >
                      <Text style={styles.gameIcon}>▣</Text>
                      <Text style={styles.gameTitle}>{t(`gameMeta.names.${game.id}`)}</Text>
                      <Text style={styles.gameMeta}>{game.category}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.stepperRow}>
              <View>
                <Text style={styles.sectionLabel}>Jugadores</Text>
                <Text style={styles.copy}>De 2 a 10 jugadores</Text>
              </View>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => setPlayerCount((current) => Math.max(2, current - 1))}
                  style={[styles.stepperButton, playerCount <= 2 && styles.stepperButtonDisabled]}
                  disabled={playerCount <= 2}
                  accessibilityRole="button"
                  accessibilityLabel="Quitar jugador"
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </Pressable>
                <Text style={styles.stepperValue}>{playerCount}</Text>
                <Pressable
                  onPress={() => setPlayerCount((current) => Math.min(10, current + 1))}
                  style={[styles.stepperButton, playerCount >= 10 && styles.stepperButtonDisabled]}
                  disabled={playerCount >= 10}
                  accessibilityRole="button"
                  accessibilityLabel="Agregar jugador"
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <AppButton label="Crear sala" onPress={() => onAction('createRoom')} />
            <View style={styles.secondaryActions}>
              <AppButton label="Unirse con codigo" onPress={() => onAction('joinByCode')} variant="secondary" />
              <AppButton label="Escanear QR" onPress={() => onAction('scanQr')} variant="ghost" />
            </View>
            {selectedGame ? <Text style={styles.selectedHint}>{selectedGame.description}</Text> : null}
          </>
        ) : (
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
          <Text style={styles.invitePlus}>+</Text>
          <Text style={styles.friendStatus}>Invitar</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    hero: {
      gap: spacing.xs
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
    arrowButtonLabel: {
      color: theme.colors.primaryText,
      fontSize: 30,
      fontWeight: '800',
      lineHeight: 34
    },
    selectorBlock: {
      gap: spacing.sm
    },
    sectionLabel: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1.2
    },
    gameRail: {
      gap: spacing.sm,
      paddingRight: spacing.md
    },
    gameCard: {
      width: 148,
      minHeight: 124,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: spacing.md,
      justifyContent: 'space-between'
    },
    gameCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeAccentBackground
    },
    gameIcon: {
      color: theme.colors.textPrimary,
      fontSize: 26,
      lineHeight: 28
    },
    gameTitle: {
      color: theme.colors.textPrimary,
      ...textStyles.bodyStrong
    },
    gameMeta: {
      color: theme.colors.textSecondary,
      fontSize: typography.caption
    },
    pressed: {
      transform: [{ scale: 0.98 }]
    },
    stepperRow: {
      minHeight: controls.minHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundElevated,
      overflow: 'hidden'
    },
    stepperButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center'
    },
    stepperButtonDisabled: {
      opacity: 0.35
    },
    stepperButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: '800'
    },
    stepperValue: {
      minWidth: 44,
      color: theme.colors.highlight,
      fontSize: typography.section,
      fontWeight: '800',
      textAlign: 'center'
    },
    secondaryActions: {
      gap: layout.controlGap
    },
    selectedHint: {
      color: theme.colors.textMuted,
      fontSize: typography.caption,
      lineHeight: 18
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
      gap: spacing.lg
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
      color: theme.colors.textMuted,
      fontSize: 30,
      lineHeight: 58,
      textAlign: 'center'
    }
  });
}
