import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { getGamesByIds, normalizeGameIds } from '../data/gameRegistry';
import { initialRoomSettings, initialSelectedGameIds, lobbyScenarios } from '../data/mockData';
import type { AppTab, GameId, LobbyScenario, LobbyScenarioKey, MiniGame, RoomSettings, ScreenName } from '../navigation/types';

type AppFlowValue = {
  activeTab: AppTab;
  currentScreen: ScreenName;
  lobbyScenarioKey: LobbyScenarioKey;
  lobbyScenario: LobbyScenario;
  selectedGameIds: GameId[];
  selectedGames: MiniGame[];
  roomSettings: RoomSettings;
  canGoBack: boolean;
  goBack: () => void;
  openAccount: () => void;
  openSettings: () => void;
  openGamesTab: () => void;
  openRoom: () => void;
  openJoinRoom: () => void;
  openScanRoom: () => void;
  joinRoomByCode: () => void;
  continueRoom: () => void;
  inviteFriends: () => void;
  resumeLastActivity: () => void;
  openQuickPlay: () => void;
  openChooseGames: () => void;
  openRoomSettings: () => void;
  toggleGameSelection: (gameId: GameId) => void;
  hydrateSelectedGames: (gameIds: Array<string | null | undefined>) => void;
  saveGames: () => void;
  updateRoomSettings: (next: RoomSettings) => void;
  saveRoomSettings: () => void;
  startGameplay: () => void;
  revealResults: () => void;
  playAgain: () => void;
  backToLobby: () => void;
  resetToLobby: () => void;
};

const AppFlowContext = createContext<AppFlowValue | null>(null);

export function AppFlowProvider({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<AppTab>('games');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>(['lobby']);
  const [returnScreen, setReturnScreen] = useState<ScreenName>('lobby');
  const [lobbyScenarioKey, setLobbyScenarioKey] = useState<LobbyScenarioKey>('noRoom');
  const [selectedGameIds, setSelectedGameIds] = useState<GameId[]>(initialSelectedGameIds);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(initialRoomSettings);
  const currentScreen = screenHistory[screenHistory.length - 1] ?? 'lobby';

  const lobbyScenario = lobbyScenarios[lobbyScenarioKey];
  const selectedGames = useMemo(
    () => getGamesByIds(selectedGameIds),
    [selectedGameIds]
  );

  const canGoBack = screenHistory.length > 1 || activeTab !== 'games';

  function setScreen(nextScreen: ScreenName, mode: 'push' | 'replace' | 'reset' = 'push') {
    setScreenHistory((current) => {
      if (mode === 'reset') {
        return [nextScreen];
      }

      if (!current.length) {
        return [nextScreen];
      }

      if (mode === 'replace') {
        return [...current.slice(0, -1), nextScreen];
      }

      if (current[current.length - 1] === nextScreen) {
        return current;
      }

      return [...current, nextScreen];
    });
  }

  const value = useMemo<AppFlowValue>(
    () => ({
      activeTab,
      currentScreen,
      lobbyScenarioKey,
      lobbyScenario,
      selectedGameIds,
      selectedGames,
      roomSettings,
      canGoBack,
      goBack: () => {
        if (activeTab !== 'games') {
          setActiveTab('games');
          return;
        }

        setScreenHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
      },
      openAccount: () => {
        setReturnScreen(currentScreen);
        setActiveTab('account');
      },
      openSettings: () => {
        setReturnScreen(currentScreen);
        setActiveTab('settings');
      },
      openGamesTab: () => {
        setScreen(returnScreen, 'replace');
        setActiveTab('games');
      },
      openRoom: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setScreen('room');
      },
      openJoinRoom: () => {
        setActiveTab('games');
        setScreen('joinRoom');
      },
      openScanRoom: () => {
        setActiveTab('games');
        setScreen('scanRoom');
      },
      joinRoomByCode: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setScreen('room');
      },
      continueRoom: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setScreen('room');
      },
      inviteFriends: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setScreen('room');
      },
      resumeLastActivity: () => {
        setActiveTab('games');
        setLobbyScenarioKey('returning');
        setScreen('room');
      },
      openQuickPlay: () => {
        setActiveTab('games');
        setScreen('gameplay');
      },
      openChooseGames: () => {
        setActiveTab('games');
        setScreen('chooseGames');
      },
      openRoomSettings: () => {
        setActiveTab('games');
        setScreen('roomSettings');
      },
      toggleGameSelection: (gameId) => {
        setSelectedGameIds((current) => {
          if (current.includes(gameId)) {
            return current.filter((id) => id !== gameId);
          }

          return normalizeGameIds([...current, gameId]);
        });
      },
      hydrateSelectedGames: (gameIds) => {
        setSelectedGameIds(normalizeGameIds(gameIds));
      },
      saveGames: () => setScreen('room', 'replace'),
      updateRoomSettings: setRoomSettings,
      saveRoomSettings: () => setScreen('room', 'replace'),
      startGameplay: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setScreen('gameplay');
      },
      revealResults: () => {
        setActiveTab('games');
        setScreen('results');
      },
      playAgain: () => {
        setActiveTab('games');
        setScreen('gameplay', 'replace');
      },
      backToLobby: () => {
        setActiveTab('games');
        setLobbyScenarioKey('noRoom');
        setScreen('lobby', 'reset');
      },
      resetToLobby: () => {
        setReturnScreen('lobby');
        setActiveTab('games');
        setLobbyScenarioKey('noRoom');
        setScreen('lobby', 'reset');
      }
    }),
    [activeTab, canGoBack, currentScreen, lobbyScenario, lobbyScenarioKey, returnScreen, roomSettings, selectedGameIds, selectedGames]
  );

  return <AppFlowContext.Provider value={value}>{children}</AppFlowContext.Provider>;
}

export function useAppFlow() {
  const context = useContext(AppFlowContext);

  if (!context) {
    throw new Error('useAppFlow must be used within an AppFlowProvider');
  }

  return context;
}
