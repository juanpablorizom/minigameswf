import { useEffect, useRef, useState } from 'react';
import { Animated, Linking, Modal, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { featuredGames, lobbyScenarios } from '../data/mockData';
import { gameRegistry, getGamesByIds, normalizeGameIds } from '../data/gameRegistry';
import { impostorThemeWords } from '../data/themes';
import type { RoomDetails } from '../data/rooms';
import { buildRoomJoinUrl, extractRoomCodeFromValue, normalizeRoomCode } from '../lib/roomLinks';
import { loadStoredRoomResume, storeRoomResume } from '../lib/storage';
import type { GameId, LobbyActionId, LobbyScenario, Player } from './types';
import { useAppFlow } from '../state/AppFlowContext';
import { useAuth } from '../state/AuthContext';
import { useRoom } from '../state/RoomContext';
import { AccountScreen } from '../ui/screens/AccountScreen';
import { AppearanceScreen } from '../ui/screens/AppearanceScreen';
import { ChooseGamesScreen } from '../ui/screens/ChooseGamesScreen';
import { GamesCatalogScreen } from '../ui/screens/GamesCatalogScreen';
import { GameplayScreen } from '../ui/screens/GameplayScreen';
import { GuessWhoGameplayScreen } from '../ui/screens/GuessWhoGameplayScreen';
import { JoinRoomScreen } from '../ui/screens/JoinRoomScreen';
import { LobbyScreen } from '../ui/screens/LobbyScreen';
import { PrivateRoomScreen } from '../ui/screens/PrivateRoomScreen';
import { ProfileScreen } from '../ui/screens/ProfileScreen';
import { ResultsScreen } from '../ui/screens/ResultsScreen';
import { RoomSettingsScreen } from '../ui/screens/RoomSettingsScreen';
import { ScanRoomScreen } from '../ui/screens/ScanRoomScreen';
import { SettingsScreen } from '../ui/screens/SettingsScreen';
import { WelcomeScreen } from '../ui/screens/WelcomeScreen';
import { AppButton } from '../ui/components/AppButton';
import { GameSettingsModal } from '../ui/components/GameSettingsModal';
import { MinimalIcon, type MinimalIconName } from '../ui/components/MinimalIcon';
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

  if (error === 'ROUND_HOST_ONLY') {
    return translate('room.hostOnlyContinue');
  }

  if (error === 'ROUND_NO_MEMBERS') {
    return translate('lobby.errors.noActiveRoomFallback');
  }

  if (error === 'ROUND_MIN_PLAYERS') {
    return translate('room.minimumPlayersRequired');
  }

  if (error === 'GUESS_WHO_NO_ATTEMPTS') {
    return translate('guessWho.noAttempts');
  }

  if (error === 'GUESS_WHO_ALREADY_SOLVED') {
    return translate('guessWho.correct');
  }

  if (error === 'ROUND_THEME_NOT_FOUND') {
    return translate('room.themeUnavailable');
  }

  if (error === 'ROUND_NOT_FOUND') {
    return translate('gameplay.roundMissing');
  }

  if (error === 'ROUND_NOT_VOTING') {
    return translate('gameplay.voteNotOpen');
  }

  if (error === 'ROUND_NOT_ACTIVE') {
    return translate('gameplay.roundNotReady');
  }

  if (error === 'ROUND_TARGET_NOT_FOUND') {
    return translate('gameplay.voteTargetMissing');
  }

  if (error === 'ROUND_TARGET_ELIMINATED') {
    return translate('gameplay.voteTargetGone');
  }

  return error ?? null;
}

function buildLobbyScenario(
  activeRoom: RoomDetails | null,
  isGuest: boolean,
  translate: (key: string, options?: Record<string, unknown>) => string
): LobbyScenario {
  if (!activeRoom || activeRoom.room.status === 'finished') {
    const baseScenario = isGuest ? lobbyScenarios.guest : lobbyScenarios.noRoom;

    return {
      ...baseScenario,
      statusLabel: isGuest ? translate('lobby.guestStatus') : translate('lobby.noRoomStatus'),
      title: isGuest ? translate('lobby.guestTitle') : translate('lobby.noRoomTitle'),
      subtitle: isGuest ? translate('lobby.guestSubtitle') : translate('lobby.noRoomSubtitle'),
      primaryAction: { ...baseScenario.primaryAction, label: translate('lobby.createRoom') },
      secondaryAction: baseScenario.secondaryAction
        ? { ...baseScenario.secondaryAction, label: translate('lobby.joinByCode') }
        : undefined
    };
  }

  const selectedGameIds = activeRoom.selectedGameIds;

  return {
    key: 'activeRoom',
    statusLabel: activeRoom.room.status === 'active' ? translate('lobby.activeStatusActive') : translate('lobby.activeStatusWaiting'),
    title: translate('lobby.activeTitleReady', { code: activeRoom.room.code }),
    subtitle: activeRoom.isHost ? translate('lobby.activeSubtitleHost') : translate('lobby.activeSubtitleMember'),
    primaryAction: { id: 'continueRoom', label: translate('lobby.continueRoom') },
    secondaryAction: activeRoom.isHost ? { id: 'inviteFriends', label: translate('lobby.shareCode'), variant: 'secondary' } : undefined,
    modeIds: selectedGameIds.length ? selectedGameIds : ['impostor']
  };
}

export function AppNavigator() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const isCompactScreen = width < 820;
  const isNarrowScreen = width < 540;
  const styles = createStyles(theme, isCompactScreen, isNarrowScreen);
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
    leaveRoom,
    startImpostorRound,
    startGuessWhoRound,
    submitGuessWhoAnswer,
    castImpostorVote,
    resolveImpostorVote,
    returnRoomToLobby,
    saveSelectedGames,
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
    openScanRoom,
    toggleGameSelection,
    hydrateSelectedGames,
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
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const [isAppearancePanelOpen, setIsAppearancePanelOpen] = useState(false);
  const [isGamesCatalogOpen, setIsGamesCatalogOpen] = useState(false);
  const [isLeaveRoomConfirmOpen, setIsLeaveRoomConfirmOpen] = useState(false);
  const [isGameSettingsOpen, setIsGameSettingsOpen] = useState(false);
  const [draftRoomSettings, setDraftRoomSettings] = useState(roomSettings);
  const [resumeRoomReady, setResumeRoomReady] = useState(false);
  const [shouldResumeRoom, setShouldResumeRoom] = useState(false);
  const autoCloseSinglePlayerRoomRef = useRef<string | null>(null);
  const hadAccessRef = useRef(false);
  const attemptedRoomResumeRef = useRef(false);
  const screenFade = useRef(new Animated.Value(1)).current;
  const roomFlowScreens = ['room', 'chooseGames', 'roomSettings', 'gameplay', 'results'] as const;

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

  function canStartSelectedTheme() {
    return Boolean(impostorThemeWords[roomSettings.games.impostor.themeCategory]?.length);
  }

  function getActiveMemberCount(room: RoomDetails | null) {
    return room?.members.filter((member) => member.isActive).length ?? 0;
  }

  function canStartImpostorRound(room: RoomDetails | null) {
    return getActiveMemberCount(room) >= 3;
  }

  function canStartGuessWhoRound(room: RoomDetails | null) {
    return getActiveMemberCount(room) >= 2;
  }

  function getRoomSelectedGameIds(room: RoomDetails | null) {
    return room ? room.selectedGameIds : selectedGameIds;
  }

  function getSelectedGameId(room: RoomDetails | null): GameId {
    return getRoomSelectedGameIds(room)[0] ?? 'impostor';
  }

  function runStartImpostorRound(onSuccess?: () => void) {
    if (!activeRoom || activeRoom.room.status === 'finished') {
      setRoomNotice(t('lobby.errors.noActiveRoomFallback'));
      backToLobby();
      return;
    }

    if (!canStartImpostorRound(activeRoom)) {
      setRoomNotice(t('room.minimumPlayersRequired'));
      continueRoom();
      return;
    }

    if (!canStartSelectedTheme()) {
      setRoomNotice(t('room.themeUnavailable'));
      return;
    }

    const impostorSettings = roomSettings.games.impostor;

    setRoomNotice(t('room.roundStarting'));

    void startImpostorRound(
      impostorSettings.themeCategory,
      impostorSettings.impostorCount,
      impostorSettings.turnSeconds,
      impostorSettings.missBehavior,
      impostorSettings.balanceEndsGame
    ).then((result) => {
      if (result.error) {
        setRoomNotice(mapRoomNotice(t, result.error));
        return;
      }

      setRoomNotice(null);
      if (onSuccess) {
        onSuccess();
        return;
      }

      startGameplay();
    });
  }

  function runStartGuessWhoRound(onSuccess?: () => void) {
    if (!activeRoom || activeRoom.room.status === 'finished') {
      setRoomNotice(t('lobby.errors.noActiveRoomFallback'));
      backToLobby();
      return;
    }

    if (!canStartGuessWhoRound(activeRoom)) {
      setRoomNotice(t('room.minimumPlayersRequiredGuessWho'));
      continueRoom();
      return;
    }

    setRoomNotice(t('room.roundStarting'));

    void startGuessWhoRound(roomSettings.games['guess-who'].category).then((result) => {
      if (result.error) {
        setRoomNotice(
          result.error === 'ROUND_MIN_PLAYERS' ? t('room.minimumPlayersRequiredGuessWho') : mapRoomNotice(t, result.error)
        );
        return;
      }

      setRoomNotice(null);
      if (onSuccess) {
        onSuccess();
        return;
      }

      startGameplay();
    });
  }

  function runStartSelectedRound(onSuccess?: () => void) {
    const selectedGameId = getSelectedGameId(activeRoom);
    const startHandler = gameRegistry[selectedGameId]?.startHandler ?? 'none';

    if (startHandler === 'guess-who') {
      runStartGuessWhoRound(onSuccess);
      return;
    }

    if (startHandler === 'impostor') {
      runStartImpostorRound(onSuccess);
      return;
    }

    setRoomNotice(t('room.gameUnavailable'));
  }

  useEffect(() => {
    if (!session && !isGuest) {
      setIsAppearancePanelOpen(false);
      setIsSettingsPanelOpen(false);
      setIsAccountPanelOpen(false);
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
      roomFlowScreens.includes(currentScreen as (typeof roomFlowScreens)[number]);

    void storeRoomResume(shouldPersistResume);
    setShouldResumeRoom(shouldPersistResume);

    if (!shouldPersistResume) {
      attemptedRoomResumeRef.current = false;
    }
  }, [activeRoom, activeTab, currentScreen, isReady, resumeRoomReady, roomFlowScreens, roomsReady]);

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
    if (!roomsReady || activeRoom || !roomFlowScreens.includes(currentScreen as (typeof roomFlowScreens)[number])) {
      return;
    }

    setIsLeaveRoomConfirmOpen(false);
    setRoomNotice(t('lobby.errors.noActiveRoomFallback'));
    backToLobby();
  }, [activeRoom, backToLobby, currentScreen, roomFlowScreens, roomsReady, t]);

  useEffect(() => {
    if (!activeRoom || activeRoom.room.status !== 'finished') {
      return;
    }

    setIsLeaveRoomConfirmOpen(false);
    setIsGameSettingsOpen(false);
    setIsGamesCatalogOpen(false);
    setIsAppearancePanelOpen(false);
    setIsAccountPanelOpen(false);
    setIsSettingsPanelOpen(false);
    setRoomNotice(t('room.roomClosedNotice', { defaultValue: 'La sala se cerró correctamente.' }));
    void storeRoomResume(false);
    backToLobby();
  }, [activeRoom?.room.id, activeRoom?.room.status, backToLobby, t]);

  useEffect(() => {
    if (activeRoom) {
      hydrateSelectedGames(activeRoom.selectedGameIds);
    }
  }, [activeRoom?.room.id, activeRoom?.room.selected_game_id, activeRoom?.room.selected_game_ids, hydrateSelectedGames]);

  useEffect(() => {
    if (!isGameSettingsOpen) {
      setDraftRoomSettings(roomSettings);
    }
  }, [isGameSettingsOpen, roomSettings]);

  useEffect(() => {
    if (!activeRoom?.round) {
      return;
    }

    if (currentScreen === 'gameplay') {
      return;
    }

    startGameplay();
  }, [activeRoom?.round?.roundId, activeRoom?.round?.phase, activeRoom?.round?.status, currentScreen, startGameplay]);

  useEffect(() => {
    if (!activeRoom || activeRoom.round || (currentScreen !== 'gameplay' && currentScreen !== 'results')) {
      return;
    }

    continueRoom();
  }, [activeRoom, continueRoom, currentScreen]);

  useEffect(() => {
    if (!activeRoom) {
      return;
    }

    if (activeRoom.room.status !== 'waiting') {
      return;
    }

    if (currentScreen !== 'gameplay' && currentScreen !== 'results') {
      return;
    }

    continueRoom();
  }, [activeRoom?.room.status, activeRoom?.round?.roundId, continueRoom, currentScreen]);

  useEffect(() => {
    if (!activeRoom || activeRoom.room.status !== 'active') {
      autoCloseSinglePlayerRoomRef.current = null;
      return;
    }

    const activeMemberCount = activeRoom.members.filter((member) => member.isActive).length;

    if (activeMemberCount > 1) {
      autoCloseSinglePlayerRoomRef.current = null;
      return;
    }

    const closeKey = `${activeRoom.room.id}:${activeRoom.room.status}:${activeMemberCount}`;

    if (autoCloseSinglePlayerRoomRef.current === closeKey) {
      return;
    }

    autoCloseSinglePlayerRoomRef.current = closeKey;
    setRoomNotice(t('room.roomClosedNotice', { defaultValue: 'La sala se cerró correctamente.' }));
    setIsLeaveRoomConfirmOpen(false);
    setIsGameSettingsOpen(false);
    setIsGamesCatalogOpen(false);
    backToLobby();
    void leaveRoom();
  }, [activeRoom, backToLobby, leaveRoom, t]);

  useEffect(() => {
    setRoomScreenActive(
      activeTab === 'games' &&
        roomFlowScreens.includes(currentScreen as (typeof roomFlowScreens)[number])
    );
  }, [activeTab, currentScreen, roomFlowScreens, setRoomScreenActive]);

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

  useEffect(() => {
    screenFade.setValue(0);
    Animated.timing(screenFade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true
    }).start();
  }, [activeTab, currentScreen, screenFade]);

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
        void createRoom(normalizeGameIds(selectedGameIds)).then((result) => {
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
      case 'openGamesCatalog':
        openGamesTab();
        setIsGamesCatalogOpen(true);
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

  function handleBackPress() {
    goBack();
  }

  function handleOpenHomeTab() {
    setIsGamesCatalogOpen(false);
    backToLobby();
  }

  function handleOpenCatalogTab() {
    if (!activeRoom && roomFlowScreens.includes(currentScreen as (typeof roomFlowScreens)[number])) {
      backToLobby();
    } else {
      openGamesTab();
    }

    setIsGamesCatalogOpen(true);
  }

  function getNextSelectedGameIds(currentGameIds: GameId[], gameId: GameId) {
    if (currentGameIds.includes(gameId)) {
      const nextGameIds = currentGameIds.filter((selectedGameId) => selectedGameId !== gameId);
      return nextGameIds.length ? nextGameIds : currentGameIds;
    }

    return normalizeGameIds([...currentGameIds, gameId]);
  }

  function selectCatalogGame(gameId: GameId, closePanel = false) {
    const nextGameIds = getNextSelectedGameIds(getRoomSelectedGameIds(activeRoom), gameId);

    if (activeRoom) {
      void saveSelectedGames(nextGameIds).then((result) => {
        if (result.error) {
          setRoomNotice(mapRoomNotice(t, result.error));
          return;
        }

        setRoomNotice(null);
        if (closePanel) {
          setIsGamesCatalogOpen(false);
          return;
        }

        continueRoom();
      });
      return;
    }

    toggleGameSelection(gameId);
    setRoomNotice(null);
    if (closePanel) {
      setIsGamesCatalogOpen(false);
      return;
    }

    backToLobby();
  }

  function requestLeaveRoom() {
    if (!activeRoom || !roomFlowScreens.includes(currentScreen as (typeof roomFlowScreens)[number])) {
      backToLobby();
      return;
    }

    setIsLeaveRoomConfirmOpen(true);
  }

  function confirmLeaveRoom() {
    const wasHost = activeRoom?.isHost ?? false;

    setIsLeaveRoomConfirmOpen(false);
    setIsGameSettingsOpen(false);
    setIsGamesCatalogOpen(false);
    setIsAppearancePanelOpen(false);
    setIsAccountPanelOpen(false);
    setIsSettingsPanelOpen(false);
    setRoomNotice(null);
    void storeRoomResume(false);
    backToLobby();

    void leaveRoom().then((result) => {
      if (result.error) {
        setRoomNotice(mapRoomNotice(t, result.error));
        return;
      }

      setRoomNotice(
        wasHost
          ? t('room.roomClosedNotice', { defaultValue: 'La sala se cerró correctamente.' })
          : t('room.roomLeftNotice', { defaultValue: 'Saliste de la sala.' })
      );
    });
  }

  function handleExitPress() {
    requestLeaveRoom();
  }

  function renderGamesTab() {
    if (activeRoom?.room.status === 'finished') {
      return (
        <LobbyScreen
          displayName={displayName ?? email?.split('@')[0] ?? (isGuest ? t('common.guest') : t('common.player'))}
          scenario={buildLobbyScenario(null, isGuest, t)}
          onAction={handleLobbyAction}
          notice={roomNotice ?? t('room.roomClosedNotice', { defaultValue: 'La sala se cerró correctamente.' })}
        />
      );
    }

    const resolvedScreen =
      activeRoom && !activeRoom.round && (currentScreen === 'gameplay' || currentScreen === 'results')
        ? 'room'
        : currentScreen;

    if (!activeRoom && roomFlowScreens.includes(resolvedScreen as (typeof roomFlowScreens)[number])) {
      return (
        <LobbyScreen
          displayName={displayName ?? email?.split('@')[0] ?? (isGuest ? t('common.guest') : t('common.player'))}
          scenario={resolvedLobbyScenario}
          onAction={handleLobbyAction}
          notice={roomNotice ?? t('lobby.errors.noActiveRoomFallback')}
        />
      );
    }

    if (resolvedScreen === 'lobby') {
      return (
        <LobbyScreen
          displayName={displayName ?? email?.split('@')[0] ?? (isGuest ? t('common.guest') : t('common.player'))}
          scenario={resolvedLobbyScenario}
          onAction={handleLobbyAction}
          notice={roomNotice}
        />
      );
    }

    if (resolvedScreen === 'joinRoom') {
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

    if (resolvedScreen === 'scanRoom') {
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

    if (resolvedScreen === 'room' && activeRoom) {
      const selectedGameIdsForRoom = getRoomSelectedGameIds(activeRoom);
      const selectedGamesForRoom = getGamesByIds(selectedGameIdsForRoom);
      const selectedGameId = selectedGameIdsForRoom[0] ?? 'impostor';
      const selectedGameConfig = gameRegistry[selectedGameId];
      const canStartGame =
        selectedGameConfig.startHandler === 'guess-who'
          ? canStartGuessWhoRound(activeRoom)
          : selectedGameConfig.startHandler === 'impostor'
            ? canStartImpostorRound(activeRoom)
            : false;

      return (
        <PrivateRoomScreen
          roomCode={activeRoom.room.code}
          roomUrl={buildRoomJoinUrl(activeRoom.room.code)}
          roomStatus={activeRoom.room.status}
          members={activeRoom.members}
          selectedGames={selectedGamesForRoom}
          settings={roomSettings}
          canManageRoom={activeRoom.isHost}
          canStartGame={canStartGame}
          startDisabledReason={
            canStartGame
              ? null
              : selectedGameConfig.startHandler === 'none'
                ? t('room.gameUnavailable')
                : selectedGameId === 'guess-who'
                ? t('room.minimumPlayersRequiredGuessWho')
                : t('room.minimumPlayersRequired')
          }
          isBusy={roomBusy}
          notice={roomNotice ?? syncNotice}
          syncState={syncState}
          onShareCode={() => {
            void shareRoomCode();
          }}
          onChooseGames={() => {
            setIsGamesCatalogOpen(true);
          }}
          onOpenSettings={() => {
            setDraftRoomSettings(roomSettings);
            setIsGameSettingsOpen(true);
          }}
          onStart={() => {
            if (!activeRoom.isHost) {
              setRoomNotice(t('room.hostOnlyContinue'));
              return;
            }

            runStartSelectedRound();
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
          onLeaveRoom={() => {
            requestLeaveRoom();
          }}
        />
      );
    }

    if (resolvedScreen === 'chooseGames') {
      return (
        <ChooseGamesScreen
          selectedGameIds={selectedGameIds}
          onToggleGame={toggleGameSelection}
          onSave={() => {
            const nextGameIds = normalizeGameIds(selectedGameIds);

            if (!activeRoom) {
              saveGames();
              return;
            }

            void saveSelectedGames(nextGameIds).then((result) => {
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

    if (resolvedScreen === 'roomSettings') {
      return (
        <RoomSettingsScreen
          settings={roomSettings}
          selectedGameIds={getRoomSelectedGameIds(activeRoom)}
          onChangeSettings={updateRoomSettings}
          onSave={saveRoomSettings}
        />
      );
    }

    if (resolvedScreen === 'gameplay') {
      const gameplayPlayers: Player[] = (activeRoom?.members ?? [])
        .filter((member) => member.isActive)
        .map((member, index) => ({
        id: member.userId,
        name: member.displayName,
        status: member.role === 'host' ? 'host' : 'ready',
        mood: member.isCurrentUser ? 'You are in this round' : `Joined #${index + 1}`,
        score: 0,
        isCurrentUser: member.isCurrentUser
      }));

      if (activeRoom?.round?.gameId === 'guess-who') {
        return (
          <GuessWhoGameplayScreen
            players={gameplayPlayers}
            roundSetup={activeRoom.round}
            isBusy={roomBusy}
            notice={roomNotice}
            onSubmitGuess={(guess) => {
              void submitGuessWhoAnswer(guess).then((result) => {
                if (result.error) {
                  setRoomNotice(mapRoomNotice(t, result.error));
                  return;
                }

                setRoomNotice(result.correct ? t('guessWho.correct') : t('guessWho.tryAgain'));
              });
            }}
          />
        );
      }

      return (
        <GameplayScreen
          players={gameplayPlayers}
          activeGame={featuredGames.find((game) => game.id === 'impostor') ?? featuredGames[0]}
          roomSettings={roomSettings}
          roundSetup={activeRoom?.round?.gameId === 'impostor' ? activeRoom.round : null}
          canManageRoom={activeRoom?.isHost ?? false}
          isBusy={roomBusy}
          notice={roomNotice}
          onCastVote={(targetUserId) => {
            void castImpostorVote(targetUserId).then((result) => {
              if (result.error) {
                setRoomNotice(mapRoomNotice(t, result.error));
                return;
              }

              setRoomNotice(t('gameplay.voteRegistered'));
            });
          }}
          onResolveVote={() => {
            void resolveImpostorVote().then((result) => {
              if (result.error && result.error !== 'ROUND_NOT_VOTING') {
                setRoomNotice(mapRoomNotice(t, result.error));
                return;
              }

              setRoomNotice(null);
            });
          }}
          onBackToRoom={() => {
            if (!activeRoom?.isHost) {
              setRoomNotice(t('room.hostOnlyContinue'));
              return;
            }

            setRoomNotice(t('gameplay.returningToRoom'));
            void returnRoomToLobby().then((result) => {
              if (result.error) {
                setRoomNotice(mapRoomNotice(t, result.error));
                return;
              }

              setRoomNotice(null);
              continueRoom();
            });
          }}
          onPlayAgain={() => {
            if (!activeRoom?.isHost) {
              setRoomNotice(t('room.hostOnlyContinue'));
              return;
            }

            runStartSelectedRound(() => {
              playAgain();
            });
          }}
          onRevealResults={revealResults}
        />
      );
    }

    return (
      <ResultsScreen
        members={activeRoom?.members}
        round={activeRoom?.round?.gameId === 'impostor' ? activeRoom.round : null}
        onPlayAgain={() => {
          if (!activeRoom?.isHost) {
            setRoomNotice(t('room.hostOnlyContinue'));
            return;
          }

          runStartSelectedRound(() => {
            playAgain();
          });
        }}
        onBackToLobby={backToLobby}
      />
    );
  }

  function renderProfileTab() {
    return (
      <ProfileScreen
        displayName={displayName}
        username={username}
        email={email}
        isGuest={isGuest}
        language={language}
        themePreference={themePreference}
        isBusy={isBusy}
        notice={settingsNotice}
        onOpenAccount={() => {
          setAccountNotice(null);
          setIsAccountPanelOpen(true);
        }}
        onOpenAppearance={() => {
          setSettingsNotice(null);
          setIsAppearancePanelOpen(true);
        }}
        onChangeLanguage={(nextLanguage) => {
          void changeLanguage(nextLanguage).then((result) => {
            setSettingsNotice(
              resolveAccountNotice(result.message) ??
                (result.error === 'SUPABASE_NOT_CONFIGURED' ? t('account.notConfigured') : result.error ?? null)
            );
          });
        }}
        onLogout={() => {
          setIsAppearancePanelOpen(false);
          setIsAccountPanelOpen(false);
          setIsSettingsPanelOpen(false);
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

  function renderCurrentTab() {
    if (activeTab === 'account') {
      return renderProfileTab();
    }

    if (activeTab === 'settings') {
      return (
        <GamesCatalogScreen
          selectedGameIds={selectedGameIds}
          onToggleGame={selectCatalogGame}
        />
      );
    }

    return renderGamesTab();
  }

  function renderSettingsPanel() {
    return (
      <SettingsScreen
        embedded
        accountLabel={displayName ?? username ?? email?.split('@')[0] ?? (isGuest ? t('common.guest') : t('common.player'))}
        accountStateLabel={isGuest ? t('account.accountStateGuest') : t('account.accountStateAuthenticated')}
        language={language}
        themePreference={themePreference}
        isBusy={isBusy}
        notice={settingsNotice}
        onOpenAccount={() => {
          setAccountNotice(null);
          setIsAccountPanelOpen(true);
        }}
        onOpenAppearance={() => {
          setSettingsNotice(null);
          setIsAppearancePanelOpen(true);
        }}
        onChangeLanguage={(nextLanguage) => {
          void changeLanguage(nextLanguage).then((result) => {
            setSettingsNotice(
              resolveAccountNotice(result.message) ??
                (result.error === 'SUPABASE_NOT_CONFIGURED' ? t('account.notConfigured') : result.error ?? null)
            );
          });
        }}
        onLogout={() => {
          setIsAppearancePanelOpen(false);
          setIsAccountPanelOpen(false);
          setIsSettingsPanelOpen(false);
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

  function renderAccountPanel() {
    return (
      <AccountScreen
        embedded
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

  function renderAppearancePanel() {
    return (
      <AppearanceScreen
        embedded
        themePreference={themePreference}
        onChangeTheme={(nextTheme) => {
          void changeTheme(nextTheme).then((result) => {
            setSettingsNotice(result.error ?? null);

            if (!result.error) {
              setIsAppearancePanelOpen(false);
            }
          });
        }}
      />
    );
  }

  function renderGamesCatalogPanel() {
    return (
      <GamesCatalogScreen
        embedded
        selectedGameIds={getRoomSelectedGameIds(activeRoom)}
        onToggleGame={selectCatalogGame}
      />
    );
  }

  function renderRoundResultOverlay() {
    if (!activeRoom?.round || activeRoom.round.gameId !== 'impostor' || activeRoom.round.phase !== 'result') {
      return null;
    }

    const round = activeRoom.round;
    const expelledPlayer = activeRoom.members.find((member) => member.userId === round.expelledUserId) ?? null;
    const expelledWasImpostor = expelledPlayer ? round.impostorIds.includes(expelledPlayer.userId) : false;
    const remainingImpostorIds = round.impostorIds.filter((playerId) => !round.eliminatedUserIds.includes(playerId));
    const resultHint =
      round.outcome === 'impostors_balanced'
        ? t('gameplay.balanceWin', { count: remainingImpostorIds.length })
        : round.outcome === 'missed_impostor'
          ? t('gameplay.missedImpostorEnd')
          : round.outcome === 'continue'
            ? t('gameplay.nextRoundAuto')
            : null;

    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.overlayBackdropCentered}>
          <View style={styles.resultPanel}>
            <Text style={styles.resultTitle}>
              {expelledWasImpostor ? t('gameplay.voteSuccessTitle') : t('gameplay.voteFailTitle')}
            </Text>
            <Text style={styles.resultBody}>
              {expelledPlayer
                ? expelledWasImpostor
                  ? t('gameplay.revealedImpostor', { player: expelledPlayer.displayName })
                  : t('gameplay.revealedCivilian', { player: expelledPlayer.displayName })
                : t('gameplay.votePending')}
            </Text>
            {resultHint ? <Text style={styles.resultHint}>{resultHint}</Text> : null}

            {activeRoom.isHost ? (
              <View style={styles.confirmActions}>
                <AppButton
                  label={round.status === 'finished' ? t('gameplay.playAgain') : t('gameplay.nextRound')}
                  onPress={() => {
                    runStartImpostorRound(() => {
                      playAgain();
                    });
                  }}
                  disabled={roomBusy}
                />
                <AppButton
                  label={t('gameplay.backToRoom')}
                  onPress={() => {
                    setRoomNotice(t('gameplay.returningToRoom'));
                    void returnRoomToLobby().then((result) => {
                      if (result.error) {
                        setRoomNotice(mapRoomNotice(t, result.error));
                        return;
                      }

                      setRoomNotice(null);
                      continueRoom();
                    });
                  }}
                  variant="secondary"
                  disabled={roomBusy}
                />
              </View>
            ) : (
              <Text style={styles.resultWait}>{t('gameplay.waitingForHostDecision')}</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  const isLobbyShell = activeTab === 'games' && currentScreen === 'lobby';

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <View style={[styles.topBar, isLobbyShell && styles.topBarLobby]}>
        {!isLobbyShell ? (
          <View style={styles.headerIdentity}>
            <Text style={styles.headerGreeting}>
              {t('lobby.headerGreeting', {
                name: displayName ?? username ?? email?.split('@')[0] ?? (isGuest ? t('common.guest') : t('common.player'))
              })}
            </Text>
            {isGuest ? <Text style={styles.headerStatus}>{t('lobby.guestHeaderStatus')}</Text> : null}
          </View>
        ) : null}
        <View style={styles.topBarActions}>
          {canGoBack ? (
            <View style={styles.topBarNavActions}>
              <Pressable onPress={handleBackPress} style={styles.topBarAction}>
                <Text style={styles.back}>{t('common.back')}</Text>
              </Pressable>
              <Pressable onPress={handleExitPress} style={styles.topBarAction}>
                <Text style={styles.exit}>{t('common.exit')}</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={styles.topBarUtilityActions}>
            <Pressable
              onPress={() => {
                setAccountNotice(null);
                openAccount();
              }}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
              style={({ pressed, hovered }) => [
                styles.settingsTrigger,
                hovered && styles.settingsTriggerHover,
                pressed && styles.settingsTriggerPressed
              ]}
            >
              <MinimalIcon name="settings" size={22} color={theme.colors.textPrimary} strokeWidth={2.1} />
            </Pressable>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: screenFade }]}>{renderCurrentTab()}</Animated.View>
      <View style={styles.bottomNav}>
        <TabButton label="Inicio" icon="home" active={activeTab === 'games' && !isGamesCatalogOpen} onPress={handleOpenHomeTab} />
        <TabButton
          label="Juegos"
          icon="games"
          active={isGamesCatalogOpen}
          onPress={handleOpenCatalogTab}
        />
        <TabButton label="Perfil" icon="profile" active={activeTab === 'account'} onPress={openAccount} />
      </View>

      {isSettingsPanelOpen ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => {
            setIsAppearancePanelOpen(false);
            setIsAccountPanelOpen(false);
            setIsSettingsPanelOpen(false);
          }}
        >
          <View style={styles.overlayBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => {
                setIsAppearancePanelOpen(false);
                setIsAccountPanelOpen(false);
                setIsSettingsPanelOpen(false);
              }}
            />
            <View style={styles.settingsPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{t('settings.title')}</Text>
                <Pressable onPress={() => setIsSettingsPanelOpen(false)} style={styles.panelClose}>
                  <Text style={styles.panelCloseLabel}>{t('auth.modalClose')}</Text>
                </Pressable>
              </View>
              <View style={styles.panelBody}>{renderSettingsPanel()}</View>
            </View>
          </View>
        </Modal>
      ) : null}

      {isAccountPanelOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setIsAccountPanelOpen(false)}>
          <View style={styles.overlayBackdrop}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setIsAccountPanelOpen(false)} />
            <View style={styles.accountPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{t('account.title')}</Text>
                <Pressable onPress={() => setIsAccountPanelOpen(false)} style={styles.panelClose}>
                  <Text style={styles.panelCloseLabel}>{t('auth.modalClose')}</Text>
                </Pressable>
              </View>
              <View style={styles.panelBody}>{renderAccountPanel()}</View>
            </View>
          </View>
        </Modal>
      ) : null}

      {isAppearancePanelOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setIsAppearancePanelOpen(false)}>
          <View style={styles.overlayBackdrop}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setIsAppearancePanelOpen(false)} />
            <View style={styles.appearancePanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{t('settings.appearanceSection')}</Text>
                <Pressable onPress={() => setIsAppearancePanelOpen(false)} style={styles.panelClose}>
                  <Text style={styles.panelCloseLabel}>{t('auth.modalClose')}</Text>
                </Pressable>
              </View>
              <View style={styles.panelBody}>{renderAppearancePanel()}</View>
            </View>
          </View>
        </Modal>
      ) : null}

      {isGamesCatalogOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setIsGamesCatalogOpen(false)}>
          <View style={styles.overlayBackdropCentered}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setIsGamesCatalogOpen(false)} />
            <View style={styles.gamesCatalogPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{t('gamesCatalog.title')}</Text>
                <Pressable onPress={() => setIsGamesCatalogOpen(false)} style={styles.panelClose}>
                  <Text style={styles.panelCloseLabel}>{t('auth.modalClose')}</Text>
                </Pressable>
              </View>
              <View style={styles.panelBody}>
                <Text style={styles.catalogCopy}>{t('gamesCatalog.subtitle')}</Text>
                {renderGamesCatalogPanel()}
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      <GameSettingsModal
        visible={isGameSettingsOpen}
        gameLabel={t('common.games')}
        selectedGameIds={getRoomSelectedGameIds(activeRoom)}
        settings={draftRoomSettings}
        onChangeSettings={setDraftRoomSettings}
        onCancel={() => {
          setDraftRoomSettings(roomSettings);
          setIsGameSettingsOpen(false);
        }}
        onSave={() => {
          updateRoomSettings(draftRoomSettings);
          setIsGameSettingsOpen(false);
        }}
      />

      {renderRoundResultOverlay()}

      {isLeaveRoomConfirmOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setIsLeaveRoomConfirmOpen(false)}>
          <View style={styles.overlayBackdropCentered}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setIsLeaveRoomConfirmOpen(false)} />
            <View style={styles.confirmPanel}>
              <Text style={styles.panelTitle}>
                {activeRoom?.isHost ? t('room.leaveConfirmHostTitle') : t('room.leaveConfirmMemberTitle')}
              </Text>
              <Text style={styles.confirmCopy}>
                {activeRoom?.isHost ? t('room.leaveConfirmHostBody') : t('room.leaveConfirmMemberBody')}
              </Text>
              <View style={styles.confirmActions}>
                <AppButton label={t('common.stay')} variant="secondary" onPress={() => setIsLeaveRoomConfirmOpen(false)} />
                <AppButton
                  label={activeRoom?.isHost ? t('room.leaveConfirmHostAction') : t('room.leaveConfirmMemberAction')}
                  onPress={confirmLeaveRoom}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

function AmbientBackground() {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]}>
      <View style={[ambientStyles.paperWashTop, { backgroundColor: theme.colors.surface }]} />
      <View style={[ambientStyles.paperWashBottom, { backgroundColor: theme.colors.backgroundElevated }]} />
      <View style={[ambientStyles.paperFiber, { borderColor: theme.colors.border }]} />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  icon: MinimalIconName;
  active: boolean;
  onPress: () => void;
};

function TabButton({ label, icon, active, onPress }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [tabStyles.item, active && { borderTopColor: theme.colors.primary }, pressed && tabStyles.itemPressed]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <View style={tabStyles.icon}>
        <MinimalIcon name={icon} size={23} color={active ? theme.colors.textPrimary : theme.colors.textMuted} strokeWidth={2} />
      </View>
      <Text style={[tabStyles.label, { color: active ? theme.colors.highlight : theme.colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const ambientStyles = StyleSheet.create({
  paperWashTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    right: -80,
    height: 420,
    opacity: 0.42,
    transform: [{ rotate: '-7deg' }]
  },
  paperWashBottom: {
    position: 'absolute',
    left: -80,
    right: -80,
    bottom: -160,
    height: 560,
    opacity: 0.26,
    transform: [{ rotate: '8deg' }]
  },
  paperFiber: {
    position: 'absolute',
    top: 120,
    left: 24,
    right: 24,
    bottom: 120,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    opacity: 0.16
  }
});

const tabStyles = StyleSheet.create({
  item: {
    flex: 1,
    minHeight: 66,
    paddingTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderTopWidth: 3,
    borderTopColor: 'transparent'
  },
  itemPressed: {
    transform: [{ scale: 0.98 }]
  },
  icon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: typography.caption,
    lineHeight: 18,
    letterSpacing: 1,
    fontWeight: '800',
    textTransform: 'uppercase'
  }
});

function createStyles(theme: ReturnType<typeof useTheme>, isCompactScreen: boolean, isNarrowScreen: boolean) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  topBar: {
    paddingTop: isCompactScreen ? spacing.md : 20,
    paddingHorizontal: isCompactScreen ? spacing.md : spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: isCompactScreen ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: isCompactScreen ? 'stretch' : 'center',
    gap: spacing.md,
    backgroundColor: 'transparent'
  },
  topBarLobby: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: isNarrowScreen ? spacing.xs : spacing.md,
    width: isCompactScreen ? '100%' : undefined,
    alignSelf: isCompactScreen ? 'stretch' : 'auto'
  },
  topBarNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    rowGap: spacing.xs,
    justifyContent: 'flex-end'
  },
  topBarUtilityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'flex-end'
  },
  topBarAction: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 38,
    justifyContent: 'center'
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
  headerIdentity: {
    flexGrow: isCompactScreen ? 0 : 1,
    flexShrink: 1,
    flexBasis: isCompactScreen ? '100%' : 'auto',
    width: isCompactScreen ? '100%' : undefined,
    gap: spacing.xs,
    minWidth: 0,
    maxWidth: isCompactScreen ? '100%' : '58%'
  },
  headerGreeting: {
    color: theme.colors.textPrimary,
    fontSize: isNarrowScreen ? typography.section : typography.title,
    fontWeight: '800',
    flexShrink: 1
  },
  headerStatus: {
    color: theme.colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    flexShrink: 1
  },
  back: {
    color: theme.colors.highlight,
    fontSize: typography.body,
    fontWeight: '700'
  },
  exit: {
    color: theme.colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  settingsTrigger: {
    width: 64,
    minHeight: 64,
    borderRadius: 32,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    flexShrink: 0
  },
  settingsTriggerHover: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceMuted
  },
  settingsTriggerPressed: {
    transform: [{ scale: 0.985 }]
  },
  settingsTriggerLabel: {
    color: theme.colors.textPrimary,
    fontSize: isNarrowScreen ? typography.caption : typography.body,
    fontWeight: '700',
    flexShrink: 1
  },
  catalogTrigger: {
    minHeight: isNarrowScreen ? 40 : 42,
    borderRadius: radius.pill,
    paddingHorizontal: isNarrowScreen ? spacing.sm : spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 1,
    minWidth: isNarrowScreen ? 112 : undefined,
    flex: isNarrowScreen ? 1 : undefined
  },
  catalogTriggerHover: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceMuted
  },
  catalogTriggerPressed: {
    transform: [{ scale: 0.985 }]
  },
  catalogTriggerLabel: {
    color: theme.colors.textPrimary,
    fontSize: isNarrowScreen ? typography.caption : typography.body,
    fontWeight: '700'
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: isCompactScreen ? spacing.md : spacing.xl,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center'
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.42)',
    paddingHorizontal: isCompactScreen ? spacing.md : spacing.lg,
    paddingVertical: isCompactScreen ? spacing.lg : spacing.xl,
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  settingsPanel: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '88%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  accountPanel: {
    width: '100%',
    maxWidth: isCompactScreen ? 620 : 660,
    maxHeight: '88%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: isCompactScreen ? spacing.lg : spacing.xl * 1.5
  },
  appearancePanel: {
    width: '100%',
    maxWidth: isCompactScreen ? 640 : 680,
    maxHeight: '88%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: spacing.lg
  },
  gamesCatalogPanel: {
    width: '100%',
    maxWidth: isCompactScreen ? 680 : 900,
    maxHeight: '88%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'center'
  },
  panelHeader: {
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  panelTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '800'
  },
  panelClose: {
    minHeight: 38,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  panelCloseLabel: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '700'
  },
  panelBody: {
    flex: 1
  },
  catalogCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    paddingHorizontal: isCompactScreen ? spacing.md : spacing.lg,
    paddingTop: isCompactScreen ? spacing.md : spacing.lg
  },
  overlayBackdropCentered: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.52)',
    paddingHorizontal: isCompactScreen ? spacing.md : spacing.lg,
    paddingVertical: isCompactScreen ? spacing.lg : spacing.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  confirmPanel: {
    width: '100%',
    maxWidth: 520,
    borderRadius: radius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  resultPanel: {
    width: '100%',
    maxWidth: 560,
    borderRadius: radius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: spacing.xl,
    gap: spacing.md
  },
  resultTitle: {
    color: theme.colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800'
  },
  resultBody: {
    color: theme.colors.textPrimary,
    fontSize: typography.section,
    fontWeight: '700',
    lineHeight: 34
  },
  resultHint: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24
  },
  resultWait: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: 'center'
  },
  confirmCopy: {
    color: theme.colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap'
  }
  });
}
