import { AppState, type AppStateStatus } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import {
  createPrivateRoom,
  getActiveRoomIdForUser,
  getRoomDetails,
  joinPrivateRoomByCode,
  subscribeToRoomRealtime,
  updateRoomMemberPresence,
  updateRoomSelectedGame,
  updateRoomStatus,
  type RoomDetails,
  type RoomRealtimeState
} from '../data/rooms';
import { useAuth } from './AuthContext';

type RoomActionResult = {
  error?: string;
  roomId?: string;
};

type RoomContextValue = {
  isReady: boolean;
  isBusy: boolean;
  activeRoom: RoomDetails | null;
  syncState: RoomRealtimeState;
  syncNotice: string | null;
  refreshActiveRoom: () => Promise<void>;
  createRoom: (selectedGameId: string | null) => Promise<RoomActionResult>;
  joinRoomByCode: (code: string) => Promise<RoomActionResult>;
  saveSelectedGame: (selectedGameId: string | null) => Promise<RoomActionResult>;
  markRoomActive: () => Promise<RoomActionResult>;
  setRoomScreenActive: (isActive: boolean) => void;
};

const RoomContext = createContext<RoomContextValue | null>(null);

function mapRoomError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'ROOM_NOT_FOUND') {
      return 'ROOM_NOT_FOUND';
    }

    if (error.message === 'ROOM_UNAVAILABLE') {
      return 'ROOM_UNAVAILABLE';
    }

    if (error.message === 'AUTH_REQUIRED') {
      return 'AUTH_REQUIRED';
    }

    return error.message;
  }

  return 'UNKNOWN_ERROR';
}

export function RoomProvider({ children }: PropsWithChildren) {
  const { isReady: authReady, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [activeRoom, setActiveRoom] = useState<RoomDetails | null>(null);
  const [syncState, setSyncState] = useState<RoomRealtimeState>('idle');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [roomScreenActive, setRoomScreenActive] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastPresenceRef = useRef<boolean | null>(null);

  const refreshResolvedActiveRoom = useCallback(async () => {
    if (!user) {
      setActiveRoom(null);
      setSyncState('idle');
      setSyncNotice(null);
      return;
    }

    const activeRoomId = await getActiveRoomIdForUser(user.id);

    if (!activeRoomId) {
      setActiveRoom(null);
      setSyncState('idle');
      setSyncNotice(null);
      return;
    }

    const roomDetails = await getRoomDetails(activeRoomId, user.id);
    setActiveRoom(roomDetails);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!authReady) {
        return;
      }

      if (!user) {
        if (isMounted) {
          setActiveRoom(null);
          setSyncState('idle');
          setSyncNotice(null);
          setIsReady(true);
        }
        return;
      }

      try {
        if (!isMounted) {
          return;
        }

        await refreshResolvedActiveRoom();

        if (isMounted) {
          setIsReady(true);
        }
      } catch {
        if (isMounted) {
          setActiveRoom(null);
          setSyncState('idle');
          setSyncNotice(null);
          setIsReady(true);
        }
      }
    }

    setIsReady(false);
    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [authReady, refreshResolvedActiveRoom, user]);

  useEffect(() => {
    if (!activeRoom?.room.id || !user) {
      setSyncState('idle');
      setSyncNotice(null);
      return;
    }

    const unsubscribe = subscribeToRoomRealtime({
      roomId: activeRoom.room.id,
      onRoomChange: () => {
        void refreshResolvedActiveRoom();
      },
      onMembersChange: () => {
        void refreshResolvedActiveRoom();
      },
      onConnectionStateChange: (nextState, message) => {
        setSyncState(nextState);
        setSyncNotice(message ?? null);

        if (nextState === 'error') {
          void refreshResolvedActiveRoom();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeRoom?.room.id, refreshResolvedActiveRoom, user]);

  useEffect(() => {
    if (!activeRoom?.room.id || !user) {
      lastPresenceRef.current = null;
      return;
    }

    let isMounted = true;
    const roomId = activeRoom.room.id;
    const userId = user.id;

    async function pushPresence(nextPresence: boolean) {
      if (!isMounted || lastPresenceRef.current === nextPresence) {
        return;
      }

      lastPresenceRef.current = nextPresence;

      try {
        await updateRoomMemberPresence(roomId, userId, nextPresence);
      } catch {
        // Keep realtime presence non-blocking.
      }
    }

    function resolvePresence(nextAppState: AppStateStatus) {
      const nextPresence = nextAppState === 'active' && roomScreenActive;
      void pushPresence(nextPresence);
    }

    resolvePresence(appStateRef.current);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState;
      resolvePresence(nextAppState);
    });

    return () => {
      isMounted = false;
      subscription.remove();
      void updateRoomMemberPresence(roomId, userId, false).catch(() => {
        // Cleanup best effort only.
      });
      lastPresenceRef.current = null;
    };
  }, [activeRoom?.room.id, roomScreenActive, user]);

  const value = useMemo<RoomContextValue>(
    () => ({
      isReady,
      isBusy,
      activeRoom,
      syncState,
      syncNotice,
      refreshActiveRoom: async () => {
        await refreshResolvedActiveRoom();
      },
      createRoom: async (selectedGameId) => {
        if (!user) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          const room = await createPrivateRoom(selectedGameId);
          const roomDetails = await getRoomDetails(room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      joinRoomByCode: async (code) => {
        if (!user) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          const room = await joinPrivateRoomByCode(code);
          const roomDetails = await getRoomDetails(room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      saveSelectedGame: async (selectedGameId) => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await updateRoomSelectedGame(activeRoom.room.id, user.id, selectedGameId);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      markRoomActive: async () => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await updateRoomStatus(activeRoom.room.id, user.id, 'active');
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      setRoomScreenActive
    }),
    [activeRoom, isBusy, isReady, refreshResolvedActiveRoom, syncNotice, syncState, user]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }

  return context;
}
