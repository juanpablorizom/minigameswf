import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { featuredGames, initialRoomSettings, initialSelectedGameIds } from '../data/mockData';
import { screenOrder } from '../navigation/routes';
import type { MiniGame, RoomSettings, ScreenName, UserProfile } from '../navigation/types';

type AppFlowValue = {
  currentScreen: ScreenName;
  profile: UserProfile;
  selectedGameIds: string[];
  selectedGames: MiniGame[];
  roomSettings: RoomSettings;
  canGoBack: boolean;
  goBack: () => void;
  continueFromWelcome: (name: string) => void;
  continueAsGuest: () => void;
  openRoom: () => void;
  openQuickPlay: () => void;
  openChooseGames: () => void;
  openRoomSettings: () => void;
  toggleGameSelection: (gameId: string) => void;
  saveGames: () => void;
  updateRoomSettings: (next: RoomSettings) => void;
  saveRoomSettings: () => void;
  startGameplay: () => void;
  revealResults: () => void;
  playAgain: () => void;
  backToLobby: () => void;
};

const AppFlowContext = createContext<AppFlowValue | null>(null);

export function AppFlowProvider({ children }: PropsWithChildren) {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('welcome');
  const [profile, setProfile] = useState<UserProfile>({ name: 'Player One' });
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(initialSelectedGameIds);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(initialRoomSettings);

  const selectedGames = useMemo(
    () => featuredGames.filter((game) => selectedGameIds.includes(game.id)),
    [selectedGameIds]
  );

  const canGoBack = currentScreen !== 'welcome' && currentScreen !== 'lobby';

  const value = useMemo<AppFlowValue>(
    () => ({
      currentScreen,
      profile,
      selectedGameIds,
      selectedGames,
      roomSettings,
      canGoBack,
      goBack: () => {
        const currentIndex = screenOrder.indexOf(currentScreen);

        if (currentIndex > 0) {
          setCurrentScreen(screenOrder[currentIndex - 1]);
        }
      },
      continueFromWelcome: (name) => {
        setProfile({ name: name.trim() || 'Guest Player' });
        setCurrentScreen('lobby');
      },
      continueAsGuest: () => {
        setProfile({ name: 'Guest Player' });
        setCurrentScreen('lobby');
      },
      openRoom: () => setCurrentScreen('room'),
      openQuickPlay: () => setCurrentScreen('gameplay'),
      openChooseGames: () => setCurrentScreen('chooseGames'),
      openRoomSettings: () => setCurrentScreen('roomSettings'),
      toggleGameSelection: (gameId) => {
        setSelectedGameIds((current) =>
          current.includes(gameId) ? current.filter((id) => id !== gameId) : [...current, gameId]
        );
      },
      saveGames: () => setCurrentScreen('room'),
      updateRoomSettings: setRoomSettings,
      saveRoomSettings: () => setCurrentScreen('room'),
      startGameplay: () => setCurrentScreen('gameplay'),
      revealResults: () => setCurrentScreen('results'),
      playAgain: () => setCurrentScreen('gameplay'),
      backToLobby: () => setCurrentScreen('lobby')
    }),
    [canGoBack, currentScreen, profile, roomSettings, selectedGameIds, selectedGames]
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
