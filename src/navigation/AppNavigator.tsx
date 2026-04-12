import { useEffect, useRef, useState } from 'react';
import { Linking, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames, lobbyScenarios } from '../data/mockData';
import type { RoomDetails } from '../data/rooms';
import { buildRoomJoinUrl, extractRoomCodeFromValue, normalizeRoomCode } from '../lib/roomLinks';
import { loadStoredRoomResume, storeRoomResume } from '../lib/storage';
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
import { ScanRoomScreen } from '../ui/screens/ScanRoomScreen';
import { SettingsScreen } from '../ui/screens/SettingsScreen';
import { WelcomeScreen } from '../ui/screens/WelcomeScreen';
import { AppButton } from '../ui/components/AppButton';
import { radius, spacing, typography, useTheme } from '../ui/theme';

function mapRoomNotice(translate: (key: string, options?: Record<string, unknown>) => string, error?: string | null) {
  if (error === 'ROOM_NOT_FOUND') {
    return translate('lobby.errors.roomNotFound');
  }

  if (error === 'ROOM_UNAVAILABLE') {
    return translate('lobby.errors.roomUnavailable');
  }

  if (error === 'AUTH_REQUIRED') {
    return translate('lobby.errors.authRequired');
  }

  if (error === 'ROOM_FULL') {
    return translate('lobby.errors.roomFull');
  }

  if (error === 'ROOMS_BACKEND_NOT_CONFIGURED') {
    return translate('lobby.errors.backendNotConfigured');
  }

  if (error === 'BACKEND_UNREACHABLE') {
    return translate('lobby.errors.backendUnreachable');
  }

  if (error === 'ROOMS_PERMISSION_DENIED') {
    return translate('lobby.errors.permissionDenied');
  }

  if (error === 'ROOM_MEMBER_NOT_FOUND') {
    return translate('room.memberMissing');
  }

  if (error === 'CANNOT_REMOVE_HOST') {
    return translate('room.removeHostBlocked');
  }

  return error ?? null;
}

function buildLobbyScenario(
  activeRoom: RoomDetails | null,
  isGuest: boolean,
  translate: (key: string, options?: Record<string, unknown>) => string
): LobbyScenario {
  if (!activeRoom) {
    const baseScenario = isGuest ? lobbyScenarios.guest : lobbyScenarios.noRoom;

    return {
      ...baseScenario,
      greeting: isGuest ? translate('lobby.guestGreeting') : translate('lobby.noRoomGreeting'),
      statusLabel: isGuest ? translate('lobby.guestStatus') : translate('lobby.noRoomStatus'),
      title: isGuest ? translate('lobby.guestTitle') : translate('lobby.noRoomTitle'),
      subtitle: isGuest ? translate('lobby.guestSubtitle') : translate('lobby.noRoomSubtitle'),
      primaryAction: { ...baseScenario.primaryAction, label: translate('lobby.createRoom') },
      secondaryAction: baseScenario.secondaryAction
        ? { ...baseScenario.secondaryAction, label: translate('lobby.joinByCode') }
        : undefined,
      socialItems: [],
      recommendationItems: []
    };
  }

  const activeMembers = activeRoom.members.filter((member) => member.isActive);
  const selectedGame = activeRoom.room.selected_game_id;
  const roomStatusLabel =
    activeRoom.room.status === 'active'
      ? translate('room.statusActive')
      : activeRoom.room.status === 'finished'
        ? translate('room.statusFinished')
        : translate('room.statusWaiting');
  const activityItems =
    activeRoom.activity.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle
    })) || [];

  return {
    key: 'activeRoom',
    greeting: activeRoom.isHost ? translate('lobby.activeGreetingHost') : translate('lobby.activeGreetingMember'),
    statusLabel: activeRoom.room.status === 'active' ? translate('lobby.activeStatusActive') : translate('lobby.activeStatusWaiting'),
    title: translate('lobby.activeTitleReady', { code: activeRoom.room.code }),
    subtitle: activeRoom.isHost ? translate('lobby.activeSubtitleHost') : translate('lobby.activeSubtitleMember'),
    primaryAction: { id: 'continueRoom', label: translate('lobby.continueRoom') },
    secondaryAction: activeRoom.isHost ? { id: 'inviteFriends', label: translate('lobby.shareCode'), variant: 'secondary' } : undefined,
    roomSummary: {
      title: translate('lobby.privateParty', { code: activeRoom.room.code }),
      subtitle: translate('lobby.activeMembersStatus', { count: activeMembers.length, status: roomStatusLabel }),
      meta: activeRoom.isHost ? translate('lobby.hostingMeta') : translate('lobby.memberMeta'),
      code: activeRoom.room.code,
      ctaLabel: translate('lobby.openRoom'),
      ctaAction: 'continueRoom'
    },
    socialItems: activityItems,
    recommendationItems: [],
    modeIds: selectedGame ? [selectedGame] : ['mentiroso-profesional', 'signal-drop', 'close-call']
  };
}

export function AppNavigator() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const {
    isReady,
    isBusy,
    isSupabaseConfigured,
    session,
    isGuest,
    displayName,
    username,
    email,
    language,
    themePreference,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    continueAsGuest,
    updateDisplayName,
    linkGuestAccountWithEmail,
    signOut,
    changeLanguage,
    changeTheme
  } = useAuth();
  const {
    isReady: roomsReady,
    isBusy: roomBusy,
    activeRoom,
    syncState,
    syncNotice,
    createRoom,
    joinRoomByCode,
    removeMember,
    saveSelectedGame,
    markRoomActive,
    setRoomScreenActive
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
    openScanRoom,
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
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);
  const [isAutoGuestingForJoin, setIsAutoGuestingForJoin] = useState(false);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);
  const [resumeRoomReady, setResumeRoomReady] = useState(false);
  const [shouldResumeRoom, setShouldResumeRoom] = useState(false);
  const hadAccessRef = useRef(false);
  const attemptedRoomResumeRef = useRef(false);

  function mapAuthNotice(error?: string | null) {
    if (!error) {
      return null;
    }

    if (error === 'SUPABASE_NOT_CONFIGURED') {
      return t('auth.supabaseMissing');
    }

    if (error === 'GOOGLE_SIGN_IN_SETUP_REQUIRED') {
      return t('auth.googleNotReady');
    }

    if (error === 'AUTH_CANCELLED') {
      return t('auth.authCancelled');
    }

    if (error === 'AUTH_CALLBACK_INCOMPLETE') {
      return t('auth.authCallbackIncomplete');
    }

    if (/anonymous/i.test(error) && /disabled|enable|provider/i.test(error)) {
      return t('auth.guestNotReady');
    }

    if (/provider/i.test(error) && /google|oauth/i.test(error)) {
      return t('auth.googleNotReady');
    }

    return error;
  }

  useEffect(() => {
    if (!session && !isGuest) {
      resetToLobby();
    }
  }, [isGuest, resetToLobby, session]);

  useEffect(() => {
    let isMounted = true;

    void loadStoredRoomResume().then((shouldRestore) => {
      if (!isMounted) {
        return;
      }

      setShouldResumeRoom(shouldRestore);
      setResumeRoomReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const hasAccess = Boolean(session || isGuest);

    if (hasAccess && !hadAccessRef.current) {
      resetToLobby();
      setAccountNotice(null);
      setSettingsNotice(null);
      setAuthNotice(null);
      setJoinNotice(null);
      setRoomNotice(null);
    }

    hadAccessRef.current = hasAccess;
  }, [isGuest, resetToLobby, session]);

  useEffect(() => {
    if (!isReady || !roomsReady || !resumeRoomReady) {
      return;
    }

    const shouldPersistResume =
      activeTab === 'games' &&
      Boolean(activeRoom) &&
      ['room', 'chooseGames', 'roomSettings', 'gameplay', 'results'].includes(currentScreen);

    void storeRoomResume(shouldPersistResume);
    setShouldResumeRoom(shouldPersistResume);

    if (!shouldPersistResume) {
      attemptedRoomResumeRef.current = false;
    }
  }, [activeRoom, activeTab, currentScreen, isReady, resumeRoomReady, roomsReady]);

  useEffect(() => {
    if (!resumeRoomReady || attemptedRoomResumeRef.current) {
      return;
    }

    if (shouldResumeRoom && activeRoom && currentScreen === 'lobby') {
      attemptedRoomResumeRef.current = true;
      continueRoom();
      return;
    }

    if (shouldResumeRoom && !activeRoom && !roomBusy) {
      attemptedRoomResumeRef.current = true;
      void storeRoomResume(false);
      setShouldResumeRoom(false);
    }
  }, [activeRoom, continueRoom, currentScreen, resumeRoomReady, roomBusy, shouldResumeRoom]);

  useEffect(() => {
    if (activeRoom?.room.selected_game_id) {
      hydrateSelectedGame(activeRoom.room.selected_game_id);
    }
  }, [activeRoom?.room.selected_game_id, hydrateSelectedGame]);

  useEffect(() => {
    setRoomScreenActive(
      activeTab === 'games' &&
        ['room', 'chooseGames', 'roomSettings', 'gameplay', 'results'].includes(currentScreen)
    );
  }, [activeTab, currentScreen, setRoomScreenActive]);

  useEffect(() => {
    if (session || isGuest) {
      setIsAutoGuestingForJoin(false);
    }
  }, [isGuest, session]);

  useEffect(() => {
    let isMounted = true;

    function queueJoinFromLink(rawValue: string | null | undefined) {
      const code = extractRoomCodeFromValue(rawValue);

      if (!code) {
        if (rawValue && /join/i.test(rawValue)) {
          setAuthNotice(t('lobby.roomLinkInvalid'));
        }
        return;
      }

      if (!isMounted) {
        return;
      }

      setPendingJoinCode(code);
      setJoinNotice(null);
      setRoomNotice(
        activeRoom && activeRoom.room.code !== code
          ? t('lobby.switchingRoom', { from: activeRoom.room.code, to: code })
          : t('lobby.openingRoom', { code })
      );
    }

    void Linking.getInitialURL().then(queueJoinFromLink);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      queueJoinFromLink(url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [activeRoom]);

  useEffect(() => {
    if (!pendingJoinCode || !isReady || !roomsReady) {
      return;
    }

    if (!session && !isGuest) {
      if (!isSupabaseConfigured) {
        setAuthNotice(t('lobby.roomLinkNeedsAuth'));
        setPendingJoinCode(null);
        return;
      }

      if (isBusy || isAutoGuestingForJoin) {
        return;
      }

      setIsAutoGuestingForJoin(true);
      setAuthNotice(t('lobby.joinAsGuest', { code: pendingJoinCode }));

      void continueAsGuest('Guest Player').then((result) => {
        if (result.error) {
          setAuthNotice(result.error);
          setPendingJoinCode(null);
          setIsAutoGuestingForJoin(false);
        }
      });
      return;
    }

    if (roomBusy) {
      return;
    }

    void joinRoomByCode(pendingJoinCode).then((result) => {
      if (result.error) {
        const nextNotice = mapRoomNotice(t, result.error);
        setJoinNotice(nextNotice);
        setRoomNotice(nextNotice);
        setAuthNotice(nextNotice);
        setPendingJoinCode(null);
        openJoinRoom();
        return;
      }

      setAuthNotice(null);
      setJoinNotice(null);
      setRoomNotice(null);
      setPendingJoinCode(null);
      continueRoom();
    });
  }, [
    continueAsGuest,
    continueRoom,
    isAutoGuestingForJoin,
    isBusy,
    isGuest,
    isReady,
    isSupabaseConfigured,
    joinRoomByCode,
    openJoinRoom,
    pendingJoinCode,
    roomBusy,
    roomsReady,
    session
  ]);

  const loadingShell = !isReady || !roomsReady;
  const resolvedLobbyScenario = buildLobbyScenario(activeRoom, isGuest, t);

  if (loadingShell) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingShell}>
          <Text style={styles.loadingTitle}>MiniGamesWF</Text>
          <Text style={styles.loadingCopy}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!session && !isGuest) {
    return (
      <View style={styles.container}>
        <WelcomeScreen
          isBusy={isBusy || roomBusy}
          notice={authNotice ?? (!isSupabaseConfigured ? t('auth.supabaseMissing') : null)}
          onSignInWithGoogle={() => {
            void signInWithGoogle().then((result) => {
              setAuthNotice(mapAuthNotice(result.error));
            });
          }}
          onSignIn={(nextEmail, password) => {
            void signInWithEmail(nextEmail, password).then((result) => {
              setAuthNotice(mapAuthNotice(result.error));
            });
          }}
          onSignUp={(nextEmail, password, nextDisplayName) => {
            void signUpWithEmail(nextEmail, password, nextDisplayName).then((result) => {
              if (result.message === 'SIGNUP_CONFIRMATION_REQUIRED') {
                setAuthNotice(t('auth.signUpSuccess'));
                return;
              }

              setAuthNotice(mapAuthNotice(result.error));
            });
          }}
          onContinueAsGuest={(nextDisplayName) => {
            void continueAsGuest(nextDisplayName).then((result) => {
              setAuthNotice(mapAuthNotice(result.error));
            });
          }}
        />
      </View>
    );
  }

  function resolveAccountNotice(message?: string) {
    if (message === 'DISPLAY_NAME_UPDATED') {
      return t('account.displayNameSaved');
    }

    if (message === 'EMAIL_LINK_VERIFICATION_REQUIRED') {
      return t('account.emailLinkVerification');
    }

    if (message === 'ACCOUNT_ALREADY_LINKED') {
      return t('account.accountAlreadyLinked');
    }

    return null;
  }

  async function shareRoomCode() {
    if (!activeRoom) {
      setRoomNotice(t('lobby.noRoomToShare'));
      return;
    }

    const roomUrl = buildRoomJoinUrl(activeRoom.room.code);
    const shareMessage = `Join my MiniGamesWF room with code ${activeRoom.room.code}\n${roomUrl}`;

    try {
      await Share.share({
        message: shareMessage
      });
      setRoomNotice(t('lobby.shareReady', { code: activeRoom.room.code }));
    } catch {
      setRoomNotice(t('lobby.shareReady', { code: activeRoom.room.code }));
    }
  }

  function handleLobbyAction(actionId: LobbyActionId) {
    switch (actionId) {
      case 'createRoom':
        void createRoom(selectedGameIds[0] ?? null).then((result) => {
          if (result.error) {
            setRoomNotice(mapRoomNotice(t, result.error));
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
      case 'scanQr':
        setJoinNotice(null);
        openScanRoom();
        break;
      case 'continueRoom':
        if (activeRoom) {
          setRoomNotice(null);
          continueRoom();
          return;
        }

        setRoomNotice(t('lobby.noRoomToContinue'));
        break;
      case 'inviteFriends':
        void shareRoomCode();
        break;
      case 'resumeActivity':
        if (activeRoom) {
          resumeLastActivity();
        } else {
          setRoomNotice(t('lobby.noRoomToResume'));
        }
        break;
      case 'quickPlay':
        openQuickPlay();
        break;
    }
  }

  function handleTabPress(tab: AppTab) {
    if (activeTab === 'games' && ['room', 'chooseGames', 'roomSettings', 'gameplay', 'results'].includes(currentScreen) && tab !== 'games') {
      setShowLeavePrompt(true);
      return;
    }

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

  function handleBackPress() {
    if (['room', 'chooseGames', 'roomSettings', 'gameplay', 'results'].includes(currentScreen)) {
      setShowLeavePrompt(true);
      return;
    }

    goBack();
  }

  function renderGamesTab() {
    if (currentScreen === 'lobby') {
      return (
        <LobbyScreen
          displayName={displayName ?? email?.split('@')[0] ?? (isGuest ? t('common.guest') : t('common.player'))}
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
          onOpenScanner={() => {
            setJoinNotice(null);
            openScanRoom();
          }}
          onJoin={(code) => {
            const normalizedCode = normalizeRoomCode(code);

            if (!normalizedCode || normalizedCode.length !== 5) {
              setJoinNotice(t('joinRoom.invalidCode'));
              return;
            }

            if (activeRoom && activeRoom.room.code !== normalizedCode) {
              setRoomNotice(t('lobby.switchingRoom', { from: activeRoom.room.code, to: normalizedCode }));
            }

            void joinRoomByCode(normalizedCode).then((result) => {
              if (result.error) {
                setJoinNotice(mapRoomNotice(t, result.error));
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

    if (currentScreen === 'scanRoom') {
      return (
        <ScanRoomScreen
          isBusy={roomBusy}
          notice={joinNotice}
          onFallbackToManual={() => {
            setJoinNotice(null);
            openJoinRoom();
          }}
          onScanCode={async (code) => {
            const normalizedCode = normalizeRoomCode(code);

            if (!normalizedCode) {
              setJoinNotice(t('scanRoom.invalidQr'));
              return;
            }

            if (activeRoom && activeRoom.room.code !== normalizedCode) {
              setRoomNotice(t('lobby.switchingRoom', { from: activeRoom.room.code, to: normalizedCode }));
            }

            setJoinNotice(t('scanRoom.joining', { code: normalizedCode }));

            const result = await joinRoomByCode(normalizedCode);

            if (result.error) {
              setJoinNotice(mapRoomNotice(t, result.error));
              return;
            }

            setJoinNotice(null);
            setRoomNotice(null);
            continueRoom();
          }}
        />
      );
    }

    if (currentScreen === 'room' && activeRoom) {
      const selectedGame = featuredGames.find((game) => game.id === activeRoom.room.selected_game_id) ?? selectedGames[0] ?? null;

      return (
        <PrivateRoomScreen
          roomCode={activeRoom.room.code}
          roomUrl={buildRoomJoinUrl(activeRoom.room.code)}
          roomStatus={activeRoom.room.status}
          members={activeRoom.members}
          activity={activeRoom.activity}
          selectedGame={selectedGame}
          settings={roomSettings}
          canManageRoom={activeRoom.isHost}
          isBusy={roomBusy}
          notice={roomNotice ?? syncNotice}
          syncState={syncState}
          onShareCode={() => {
            void shareRoomCode();
          }}
          onChooseGames={openChooseGames}
          onOpenSettings={openRoomSettings}
          onStart={() => {
            if (!activeRoom.isHost) {
              setRoomNotice(t('room.hostOnlyContinue'));
              return;
            }

            void markRoomActive().then((result) => {
              if (result.error) {
                setRoomNotice(mapRoomNotice(t, result.error));
                return;
              }

              setRoomNotice(null);
              startGameplay();
            });
          }}
          onRemoveMember={(memberUserId) => {
            void removeMember(memberUserId).then((result) => {
              if (result.error) {
                setRoomNotice(mapRoomNotice(t, result.error));
                return;
              }

              setRoomNotice(t('room.memberRemoved'));
            });
          }}
        />
      );
    }

    if (currentScreen === 'room' && !activeRoom) {
      return (
        <LobbyScreen
          displayName={displayName ?? email?.split('@')[0] ?? (isGuest ? t('common.guest') : t('common.player'))}
          scenario={resolvedLobbyScenario}
          onAction={handleLobbyAction}
          notice={t('lobby.errors.noActiveRoomFallback')}
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
                setRoomNotice(mapRoomNotice(t, result.error));
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
        score: 0,
        isCurrentUser: member.isCurrentUser
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
          isBusy={isBusy}
          notice={accountNotice}
          onSaveDisplayName={(nextDisplayName) => {
            void updateDisplayName(nextDisplayName).then((result) => {
              setAccountNotice(
                resolveAccountNotice(result.message) ??
                  (result.error === 'SUPABASE_NOT_CONFIGURED'
                    ? t('account.notConfigured')
                    : result.error === 'DISPLAY_NAME_REQUIRED'
                      ? t('account.displayNameRequired')
                      : result.error ?? null)
              );
            });
          }}
          onLinkWithEmail={(nextEmail) => {
            void linkGuestAccountWithEmail(nextEmail, '').then((result) => {
              setAccountNotice(
                resolveAccountNotice(result.message) ??
                  (result.error === 'SUPABASE_NOT_CONFIGURED' ? t('account.notConfigured') : result.error ?? null)
              );
            });
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
            void storeRoomResume(false);
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
          <Text style={styles.brand}>MiniGamesWF</Text>
          <Text style={styles.brandSub}>{activeTab === 'games' ? t('common.games') : activeTab === 'account' ? t('common.account') : t('common.settings')}</Text>
        </View>
        {canGoBack ? (
          <Pressable onPress={handleBackPress}>
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

      <Modal visible={showLeavePrompt} transparent animationType="fade" onRequestClose={() => setShowLeavePrompt(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowLeavePrompt(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('room.leavePromptTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('room.leavePromptSubtitle')}</Text>
            <View style={styles.modalActions}>
              <AppButton label={t('common.stay')} onPress={() => setShowLeavePrompt(false)} variant="secondary" />
              <AppButton
                label={t('common.continue')}
                onPress={() => {
                  setShowLeavePrompt(false);
                  backToLobby();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={[styles.tabButton, prominent && styles.tabButtonProminent, active && styles.tabButtonActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  content: {
    flex: 1
  },
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl
  },
  loadingTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: '800'
  },
  loadingCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body
  },
  brand: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '800'
  },
  brandSub: {
    color: theme.colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  back: {
    color: theme.colors.highlight,
    fontSize: typography.body,
    fontWeight: '700'
  },
  statusPill: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  statusPillLabel: {
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.background
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.lg,
    justifyContent: 'center'
  },
  modalCard: {
    borderRadius: radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800'
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  modalActions: {
    gap: spacing.sm
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm
  },
  tabButtonProminent: {
    backgroundColor: theme.colors.backgroundElevated
  },
  tabButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceMuted
  },
  tabLabel: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  tabLabelActive: {
    color: theme.colors.textPrimary
  }
  });
}
