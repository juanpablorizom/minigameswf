import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { featuredGames, initialRoomSettings, initialSelectedGameIds, lobbyScenarios } from '../data/mockData';
import { screenOrder } from '../navigation/routes';
import type { AppTab, LobbyScenario, LobbyScenarioKey, MiniGame, RoomSettings, ScreenName } from '../navigation/types';

type AppFlowValue = {
  activeTab: AppTab;
  currentScreen: ScreenName;
  lobbyScenarioKey: LobbyScenarioKey;
  lobbyScenario: LobbyScenario;
  selectedGameIds: string[];
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
  toggleGameSelection: (gameId: string) => void;
  hydrateSelectedGame: (gameId: string | null) => void;
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
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('lobby');
  const [returnScreen, setReturnScreen] = useState<ScreenName>('lobby');
  const [lobbyScenarioKey, setLobbyScenarioKey] = useState<LobbyScenarioKey>('invited');
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(initialSelectedGameIds);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(initialRoomSettings);

  const lobbyScenario = lobbyScenarios[lobbyScenarioKey];
  const selectedGames = useMemo(
    () => featuredGames.filter((game) => selectedGameIds.includes(game.id)),
    [selectedGameIds]
  );

  const canGoBack = activeTab === 'games' && currentScreen !== 'lobby';

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

        const currentIndex = screenOrder.indexOf(currentScreen);

        if (currentIndex > 0) {
          setCurrentScreen(screenOrder[currentIndex - 1]);
        }
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
        setCurrentScreen(returnScreen);
        setActiveTab('games');
      },
      openRoom: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setCurrentScreen('room');
      },
      openJoinRoom: () => {
        setActiveTab('games');
        setCurrentScreen('joinRoom');
      },
      openScanRoom: () => {
        setActiveTab('games');
        setCurrentScreen('scanRoom');
      },
      joinRoomByCode: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setCurrentScreen('room');
      },
      continueRoom: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setCurrentScreen('room');
      },
      inviteFriends: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setCurrentScreen('room');
      },
      resumeLastActivity: () => {
        setActiveTab('games');
        setLobbyScenarioKey('returning');
        setCurrentScreen('room');
      },
      openQuickPlay: () => {
        setActiveTab('games');
        setCurrentScreen('gameplay');
      },
      openChooseGames: () => {
        setActiveTab('games');
        setCurrentScreen('chooseGames');
      },
      openRoomSettings: () => {
        setActiveTab('games');
        setCurrentScreen('roomSettings');
      },
      toggleGameSelection: (gameId) => {
        setSelectedGameIds((current) =>
          current.includes(gameId) ? current.filter((id) => id !== gameId) : [...current, gameId]
        );
      },
      hydrateSelectedGame: (gameId) => {
        if (!gameId) {
          return;
        }

        setSelectedGameIds((current) => [gameId, ...current.filter((id) => id !== gameId)]);
      },
      saveGames: () => setCurrentScreen('room'),
      updateRoomSettings: setRoomSettings,
      saveRoomSettings: () => setCurrentScreen('room'),
      startGameplay: () => {
        setActiveTab('games');
        setLobbyScenarioKey('activeRoom');
        setCurrentScreen('gameplay');
      },
      revealResults: () => {
        setActiveTab('games');
        setCurrentScreen('results');
      },
      playAgain: () => {
        setActiveTab('games');
        setCurrentScreen('gameplay');
      },
      backToLobby: () => {
        setActiveTab('games');
        setLobbyScenarioKey('returning');
        setCurrentScreen('lobby');
      },
      resetToLobby: () => {
        setReturnScreen('lobby');
        setActiveTab('games');
        setLobbyScenarioKey('noRoom');
        setCurrentScreen('lobby');
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
