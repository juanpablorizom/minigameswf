import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { createPrivateRoom, getActiveRoomIdForUser, getRoomDetails, joinPrivateRoomByCode, updateRoomSelectedGame, updateRoomStatus, type RoomDetails } from '../data/rooms';
import { useAuth } from './AuthContext';

type RoomActionResult = {
  error?: string;
  roomId?: string;
};

type RoomContextValue = {
  isReady: boolean;
  isBusy: boolean;
  activeRoom: RoomDetails | null;
  refreshActiveRoom: () => Promise<void>;
  createRoom: (selectedGameId: string | null) => Promise<RoomActionResult>;
  joinRoomByCode: (code: string) => Promise<RoomActionResult>;
  saveSelectedGame: (selectedGameId: string | null) => Promise<RoomActionResult>;
  markRoomActive: () => Promise<RoomActionResult>;
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

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!authReady) {
        return;
      }

      if (!user) {
        if (isMounted) {
          setActiveRoom(null);
          setIsReady(true);
        }
        return;
      }

      try {
        const activeRoomId = await getActiveRoomIdForUser(user.id);

        if (!isMounted) {
          return;
        }

        if (!activeRoomId) {
          setActiveRoom(null);
          setIsReady(true);
          return;
        }

        const roomDetails = await getRoomDetails(activeRoomId, user.id);

        if (isMounted) {
          setActiveRoom(roomDetails);
          setIsReady(true);
        }
      } catch {
        if (isMounted) {
          setActiveRoom(null);
          setIsReady(true);
        }
      }
    }

    setIsReady(false);
    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [authReady, user]);

  const value = useMemo<RoomContextValue>(
    () => ({
      isReady,
      isBusy,
      activeRoom,
      refreshActiveRoom: async () => {
        if (!user) {
          setActiveRoom(null);
          return;
        }

        const activeRoomId = await getActiveRoomIdForUser(user.id);

        if (!activeRoomId) {
          setActiveRoom(null);
          return;
        }

        const roomDetails = await getRoomDetails(activeRoomId, user.id);
        setActiveRoom(roomDetails);
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
      }
    }),
    [activeRoom, isBusy, isReady, user]
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
