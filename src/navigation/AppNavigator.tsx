import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames, lobbyHighlights, lobbyScenarios } from '../data/mockData';
import type { RoomDetails } from '../data/rooms';
import type { AppTab, LobbyActionId, LobbyScenario, Player } from './types';
import { useAppFlow } from '../state/AppFlowContext';
import { useAuth } from '../state/AuthContext';
import { useRoom } from '../state/RoomContext';
import { AccountScreen } from '../ui/screens/AccountScreen';
import { ChooseGamesScreen } from '../ui/screens/ChooseGamesScreen';
import { GameplayScreen } from '../ui/screens/GameplayScreen';
import { JoinRoomScreen } from '../ui/screens/JoinRoomScreen';
import { LobbyScreen } from '../ui/screens/LobbyScreen';
import { PrivateRoomScreen } from '../ui/screens/PrivateRoomScreen';
import { ResultsScreen } from '../ui/screens/ResultsScreen';
import { RoomSettingsScreen } from '../ui/screens/RoomSettingsScreen';
import { SettingsScreen } from '../ui/screens/SettingsScreen';
import { WelcomeScreen } from '../ui/screens/WelcomeScreen';
import { colors, radius, spacing, typography } from '../ui/theme';

function mapRoomNotice(error?: string | null) {
  if (error === 'ROOM_NOT_FOUND') {
    return 'That code does not match any open party.';
  }

  if (error === 'ROOM_UNAVAILABLE') {
    return 'That room is no longer available.';
  }

  if (error === 'AUTH_REQUIRED') {
    return 'Open a guest or account session first.';
  }

  return error ?? null;
}

function buildLobbyScenario(activeRoom: RoomDetails | null, isGuest: boolean): LobbyScenario {
  if (!activeRoom) {
    return isGuest ? lobbyScenarios.guest : lobbyScenarios.noRoom;
  }

  const activeMembers = activeRoom.members.filter((member) => member.isActive);
  const selectedGame = activeRoom.room.selected_game_id;
  const activityItems =
    activeRoom.activity.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle
    })) || [];

  return {
    key: 'activeRoom',
    greeting: activeRoom.isHost ? 'Your party is live' : 'Your party is waiting',
    statusLabel: activeRoom.room.status === 'active' ? 'Active room' : 'Waiting room',
    title: `${activeRoom.room.code} is ready.`,
    subtitle: activeRoom.isHost
      ? 'The room is persisted and the member list is live. Share the code or continue setup.'
      : 'Your room is still open. Jump back in and wait for the host to continue.',
    primaryAction: { id: 'continueRoom', label: 'Continue room' },
    secondaryAction: activeRoom.isHost ? { id: 'inviteFriends', label: 'Share code', variant: 'secondary' } : undefined,
    roomSummary: {
      title: `Private party ${activeRoom.room.code}`,
      subtitle: `${activeMembers.length} active members · ${activeRoom.room.status}`,
      meta: activeRoom.isHost ? 'You are hosting this party.' : 'You are a member of this party.',
      code: activeRoom.room.code,
      ctaLabel: 'Open room',
      ctaAction: 'continueRoom'
    },
    socialItems: activityItems.length ? activityItems : lobbyHighlights,
    recommendationItems: lobbyHighlights,
    modeIds: selectedGame ? [selectedGame] : ['mentiroso-profesional', 'signal-drop', 'close-call']
  };
}

export function AppNavigator() {
  const { t } = useTranslation();
  const {
    isReady,
    isBusy,
    isSupabaseConfigured,
    session,
    isGuest,
    displayName,
    username,
    email,
    linkedProviderLabel,
    language,
    themePreference,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    signOut,
    changeLanguage,
    changeTheme,
    linkAccount
  } = useAuth();
  const {
    isReady: roomsReady,
    isBusy: roomBusy,
    activeRoom,
    createRoom,
    joinRoomByCode,
    saveSelectedGame,
    markRoomActive
  } = useRoom();
  const {
    activeTab,
    currentScreen,
    selectedGameIds,
    selectedGames,
    roomSettings,
    canGoBack,
    goBack,
    openAccount,
    openSettings,
    openGamesTab,
    openRoom,
    openJoinRoom,
    continueRoom,
    resumeLastActivity,
    openQuickPlay,
    openChooseGames,
    openRoomSettings,
    toggleGameSelection,
    hydrateSelectedGame,
    saveGames,
    updateRoomSettings,
    saveRoomSettings,
    startGameplay,
    revealResults,
    playAgain,
    backToLobby,
    resetToLobby
  } = useAppFlow();
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);
  const [roomNotice, setRoomNotice] = useState<string | null>(null);
  const [joinNotice, setJoinNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isGuest) {
      resetToLobby();
    }
  }, [isGuest, resetToLobby, session]);

  useEffect(() => {
    if (activeRoom?.room.selected_game_id) {
      hydrateSelectedGame(activeRoom.room.selected_game_id);
    }
  }, [activeRoom?.room.selected_game_id, hydrateSelectedGame]);

  const loadingShell = !isReady || !roomsReady;
  const resolvedLobbyScenario = buildLobbyScenario(activeRoom, isGuest);

  if (loadingShell || (!session && !isGuest)) {
    return (
      <View style={styles.container}>
        <WelcomeScreen
          isBusy={isBusy || roomBusy || loadingShell}
          isSupabaseConfigured={isSupabaseConfigured}
          notice={loadingShell ? t('common.loading') : authNotice}
          onSignIn={(nextEmail, password) => {
            void signInWithEmail(nextEmail, password).then((result) => {
              setAuthNotice(result.error ?? null);
            });
          }}
          onSignUp={(nextEmail, password, nextDisplayName) => {
            void signUpWithEmail(nextEmail, password, nextDisplayName).then((result) => {
              if (result.message === 'SIGNUP_CONFIRMATION_REQUIRED') {
                setAuthNotice(t('auth.signUpSuccess'));
                return;
              }

              setAuthNotice(result.error ?? null);
            });
          }}
          onContinueAsGuest={(nextDisplayName) => {
            void continueAsGuest(nextDisplayName).then((result) => {
              setAuthNotice(result.error ?? null);
            });
          }}
        />
      </View>
    );
  }

  function resolveAccountNotice(message?: string) {
    if (message === 'LINKING_REQUIRES_SETUP') {
      return t('account.linkingRequiresSetup');
    }

    if (message === 'LINK_GUEST_ACCOUNT') {
      return t('account.linkingGuestEntry');
    }

    return null;
  }

  async function shareRoomCode() {
    if (!activeRoom) {
      setRoomNotice('No active room to share right now.');
      return;
    }

    const shareMessage = `Join my JUNTADA party with code ${activeRoom.room.code}`;

    try {
      await Share.share({
        message: shareMessage
      });
      setRoomNotice(`Room code ${activeRoom.room.code} ready to share.`);
    } catch {
      setRoomNotice(`Share this code with your group: ${activeRoom.room.code}`);
    }
  }

  function handleLobbyAction(actionId: LobbyActionId) {
    switch (actionId) {
      case 'createRoom':
        void createRoom(selectedGameIds[0] ?? null).then((result) => {
          if (result.error) {
            setRoomNotice(mapRoomNotice(result.error));
            return;
          }

          setRoomNotice(null);
          openRoom();
        });
        break;
      case 'joinByCode':
        setJoinNotice(null);
        openJoinRoom();
        break;
      case 'continueRoom':
        if (activeRoom) {
          setRoomNotice(null);
          continueRoom();
          return;
        }

        setRoomNotice('No active room found to continue.');
        break;
      case 'inviteFriends':
        void shareRoomCode();
        break;
      case 'resumeActivity':
        if (activeRoom) {
          resumeLastActivity();
        } else {
          setRoomNotice('No active room found to resume.');
        }
        break;
      case 'quickPlay':
        openQuickPlay();
        break;
    }
  }

  function handleTabPress(tab: AppTab) {
    if (tab === 'account') {
      openAccount();
      return;
    }

    if (tab === 'settings') {
      openSettings();
      return;
    }

    openGamesTab();
  }

  function renderGamesTab() {
    if (currentScreen === 'lobby') {
      return (
        <LobbyScreen
          displayName={displayName ?? email?.split('@')[0] ?? 'Player'}
          scenario={resolvedLobbyScenario}
          onAction={handleLobbyAction}
          notice={roomNotice}
        />
      );
    }

    if (currentScreen === 'joinRoom') {
      return (
        <JoinRoomScreen
          isBusy={roomBusy}
          notice={joinNotice}
          onJoin={(code) => {
            void joinRoomByCode(code).then((result) => {
              if (result.error) {
                setJoinNotice(mapRoomNotice(result.error));
                return;
              }

              setJoinNotice(null);
              setRoomNotice(null);
              continueRoom();
            });
          }}
        />
      );
    }

    if (currentScreen === 'room' && activeRoom) {
      const selectedGame = featuredGames.find((game) => game.id === activeRoom.room.selected_game_id) ?? selectedGames[0] ?? null;

      return (
        <PrivateRoomScreen
          roomCode={activeRoom.room.code}
          roomStatus={activeRoom.room.status}
          members={activeRoom.members}
          activity={activeRoom.activity}
          selectedGame={selectedGame}
          settings={roomSettings}
          canManageRoom={activeRoom.isHost}
          isBusy={roomBusy}
          notice={roomNotice}
          onShareCode={() => {
            void shareRoomCode();
          }}
          onChooseGames={openChooseGames}
          onOpenSettings={openRoomSettings}
          onStart={() => {
            if (!activeRoom.isHost) {
              setRoomNotice('Only the host can continue the party flow.');
              return;
            }

            void markRoomActive().then((result) => {
              if (result.error) {
                setRoomNotice(mapRoomNotice(result.error));
                return;
              }

              setRoomNotice(null);
              startGameplay();
            });
          }}
        />
      );
    }

    if (currentScreen === 'room' && !activeRoom) {
      return (
        <LobbyScreen
          displayName={displayName ?? email?.split('@')[0] ?? 'Player'}
          scenario={isGuest ? lobbyScenarios.guest : lobbyScenarios.noRoom}
          onAction={handleLobbyAction}
          notice="No active room found. Create one or join by code."
        />
      );
    }

    if (currentScreen === 'chooseGames') {
      return (
        <ChooseGamesScreen
          selectedGameIds={selectedGameIds}
          onToggleGame={toggleGameSelection}
          onSave={() => {
            void saveSelectedGame(selectedGameIds[0] ?? null).then((result) => {
              if (result.error) {
                setRoomNotice(mapRoomNotice(result.error));
                return;
              }

              setRoomNotice(null);
              saveGames();
            });
          }}
        />
      );
    }

    if (currentScreen === 'roomSettings') {
      return <RoomSettingsScreen settings={roomSettings} onChangeSettings={updateRoomSettings} onSave={saveRoomSettings} />;
    }

    if (currentScreen === 'gameplay') {
      const gameplayPlayers: Player[] = (activeRoom?.members ?? []).map((member, index) => ({
        id: member.id,
        name: member.displayName,
        status: member.role === 'host' ? 'host' : 'ready',
        mood: member.isCurrentUser ? 'You are in this round' : `Joined #${index + 1}`,
        score: 0
      }));

      return <GameplayScreen players={gameplayPlayers} activeGame={selectedGames[0] ?? featuredGames[0]} onRevealResults={revealResults} />;
    }

    return <ResultsScreen onPlayAgain={playAgain} onBackToLobby={backToLobby} />;
  }

  function renderTabContent() {
    if (activeTab === 'account') {
      return (
        <AccountScreen
          isGuest={isGuest}
          displayName={displayName}
          username={username}
          email={email}
          linkedProviderLabel={linkedProviderLabel}
          isBusy={isBusy}
          notice={accountNotice}
          onLinkAccount={() => {
            void linkAccount().then((result) => {
              setAccountNotice(
                resolveAccountNotice(result.message) ??
                  (result.error === 'SUPABASE_NOT_CONFIGURED' ? t('account.notConfigured') : result.error ?? null)
              );
            });
          }}
          onManageBilling={() => {
            setAccountNotice(t('account.billingNotReady'));
          }}
        />
      );
    }

    if (activeTab === 'settings') {
      return (
        <SettingsScreen
          language={language}
          themePreference={themePreference}
          isBusy={isBusy}
          notice={settingsNotice}
          onChangeLanguage={(nextLanguage) => {
            void changeLanguage(nextLanguage).then((result) => {
              setSettingsNotice(
                resolveAccountNotice(result.message) ??
                  (result.error === 'SUPABASE_NOT_CONFIGURED' ? t('account.notConfigured') : result.error ?? null)
              );
            });
          }}
          onChangeTheme={(nextTheme) => {
            void changeTheme(nextTheme).then((result) => {
              setSettingsNotice(result.error ?? null);
            });
          }}
          onLogout={() => {
            setAccountNotice(null);
            setSettingsNotice(null);
            setAuthNotice(null);
            setJoinNotice(null);
            setRoomNotice(null);
            void signOut();
          }}
        />
      );
    }

    return renderGamesTab();
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>JUNTADA</Text>
          <Text style={styles.brandSub}>{activeTab === 'games' ? t('common.games') : activeTab === 'account' ? t('common.account') : t('common.settings')}</Text>
        </View>
        {canGoBack ? (
          <Pressable onPress={goBack}>
            <Text style={styles.back}>{t('common.back')}</Text>
          </Pressable>
        ) : (
          <View style={styles.statusPill}>
            <Text style={styles.statusPillLabel}>{isGuest ? t('account.accountStateGuest') : t('account.accountStateAuthenticated')}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>{renderTabContent()}</View>

      <View style={styles.tabBar}>
        <TabButton label={t('navigation.accountTab')} active={activeTab === 'account'} onPress={() => handleTabPress('account')} />
        <TabButton label={t('navigation.gamesTab')} active={activeTab === 'games'} prominent onPress={() => handleTabPress('games')} />
        <TabButton label={t('navigation.settingsTab')} active={activeTab === 'settings'} onPress={() => handleTabPress('settings')} />
      </View>
    </View>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  prominent?: boolean;
  onPress: () => void;
};

function TabButton({ label, active, prominent = false, onPress }: TabButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, prominent && styles.tabButtonProminent, active && styles.tabButtonActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  brand: {
    color: colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '800'
  },
  brandSub: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  back: {
    color: colors.accentSoft,
    fontSize: typography.body,
    fontWeight: '700'
  },
  statusPill: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border
  },
  statusPillLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm
  },
  tabButtonProminent: {
    backgroundColor: colors.backgroundElevated
  },
  tabButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.panelMuted
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  tabLabelActive: {
    color: colors.textPrimary
  }
});
