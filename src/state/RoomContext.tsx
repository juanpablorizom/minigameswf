import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import {
  createPrivateRoom,
  getErrorMessage,
  getActiveRoomIdForUser,
  getRoomDetails,
  joinPrivateRoomByCode,
  removeRoomMember,
  leaveCurrentRoom,
  closeRoomForHost,
  startImpostorRound as startImpostorRoundRequest,
  startGuessWhoRound as startGuessWhoRoundRequest,
  submitGuessWhoAnswer as submitGuessWhoAnswerRequest,
  advanceImpostorRound as advanceImpostorRoundRequest,
  castImpostorVote as castImpostorVoteRequest,
  resolveImpostorVote as resolveImpostorVoteRequest,
  returnRoomToLobby as returnRoomToLobbyRequest,
  subscribeToRoomRealtime,
  updateRoomMemberPresence,
  updateRoomSelectedGame,
  updateRoomSelectedGames,
  updateRoomStatus,
  type RoomDetails,
  type RoomRealtimeState
} from '../data/rooms';
import type { GameId, GuessWhoCategoryId, ImpostorCategoryId } from '../navigation/types';
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
  createRoom: (selectedGameIds: GameId[]) => Promise<RoomActionResult>;
  joinRoomByCode: (code: string) => Promise<RoomActionResult>;
  removeMember: (memberUserId: string) => Promise<RoomActionResult>;
  leaveRoom: () => Promise<RoomActionResult>;
  startImpostorRound: (
    themeCategory: ImpostorCategoryId,
    impostorCount: number,
    voteDurationSeconds: number,
    missBehavior: 'repeat' | 'end',
    balanceRuleEnabled: boolean
  ) => Promise<RoomActionResult>;
  startGuessWhoRound: (categoryId: GuessWhoCategoryId) => Promise<RoomActionResult>;
  submitGuessWhoAnswer: (guess: string) => Promise<RoomActionResult & { correct?: boolean }>;
  advanceImpostorRound: () => Promise<RoomActionResult>;
  castImpostorVote: (targetUserId: string) => Promise<RoomActionResult>;
  resolveImpostorVote: () => Promise<RoomActionResult>;
  returnRoomToLobby: () => Promise<RoomActionResult>;
  saveSelectedGame: (selectedGameId: string | null) => Promise<RoomActionResult>;
  saveSelectedGames: (selectedGameIds: GameId[]) => Promise<RoomActionResult>;
  markRoomActive: () => Promise<RoomActionResult>;
  setRoomScreenActive: (isActive: boolean) => void;
};

const RoomContext = createContext<RoomContextValue | null>(null);

function mapRoomError(error: unknown) {
  const message = getErrorMessage(error);

  if (message === 'ROOM_NOT_FOUND') {
      return 'ROOM_NOT_FOUND';
  }

  if (message === 'ROOM_UNAVAILABLE') {
      return 'ROOM_UNAVAILABLE';
  }

  if (message === 'AUTH_REQUIRED') {
      return 'AUTH_REQUIRED';
  }

  if (message === 'ROOMS_PERMISSION_DENIED') {
    return 'ROOMS_PERMISSION_DENIED';
  }

  if (message === 'ROUND_NOT_FOUND') {
    return 'ROUND_NOT_FOUND';
  }

  if (message === 'ROUND_NOT_VOTING') {
    return 'ROUND_NOT_VOTING';
  }

  if (message === 'ROUND_TARGET_NOT_FOUND') {
    return 'ROUND_TARGET_NOT_FOUND';
  }

  if (message === 'ROUND_TARGET_ELIMINATED') {
    return 'ROUND_TARGET_ELIMINATED';
  }

  if (message === 'ROUND_NOT_ACTIVE') {
    return 'ROUND_NOT_ACTIVE';
  }

  return message;
}

export function RoomProvider({ children }: PropsWithChildren) {
  const { isReady: authReady, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [activeRoom, setActiveRoom] = useState<RoomDetails | null>(null);
  const [syncState, setSyncState] = useState<RoomRealtimeState>('idle');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
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
        if (isMounted) {
          setIsReady(true);
        }

        await refreshResolvedActiveRoom();
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
      onRoundChange: () => {
        void refreshResolvedActiveRoom();
      },
      onVotesChange: () => {
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
      return;
    }

    const shouldPoll =
      syncState !== 'live' ||
      (activeRoom.room.status === 'active' && !activeRoom.round);

    if (!shouldPoll) {
      return;
    }

    const interval = setInterval(() => {
      void refreshResolvedActiveRoom().catch(() => {
        // Polling is only a safety net when realtime hasn't fully caught up.
      });
    }, activeRoom.room.status === 'active' ? 1800 : 2500);

    return () => {
      clearInterval(interval);
    };
  }, [activeRoom?.room.id, activeRoom?.room.status, activeRoom?.round, refreshResolvedActiveRoom, syncState, user]);

  useEffect(() => {
    if (!activeRoom?.room.id || !user) {
      lastPresenceRef.current = null;
      return;
    }

    const roomId = activeRoom.room.id;
    const userId = user.id;

    if (lastPresenceRef.current == true) {
      return;
    }

    lastPresenceRef.current = true;
    void updateRoomMemberPresence(roomId, userId, true).catch(() => {
      // Presence sync is best-effort only.
    });

    return () => {
      // Keep membership active across refreshes and screen changes.
    };
  }, [activeRoom?.room.id, user]);

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
      createRoom: async (selectedGameIds) => {
        if (!user) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          const room = await createPrivateRoom(selectedGameIds);
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
      removeMember: async (memberUserId) => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await removeRoomMember(activeRoom.room.id, memberUserId);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      leaveRoom: async () => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        const roomId = activeRoom.room.id;
        const wasHost = activeRoom.isHost;
        const previousRoom = activeRoom;

        setIsBusy(true);
        setActiveRoom(null);
        setSyncState('idle');
        setSyncNotice(null);

        try {
          if (wasHost) {
            await closeRoomForHost(roomId, user.id);
          }

          await leaveCurrentRoom(roomId, user.id);
          return { roomId };
        } catch (error) {
          setActiveRoom(previousRoom);
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      startImpostorRound: async (themeCategory, impostorCount, voteDurationSeconds, missBehavior, balanceRuleEnabled) => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await startImpostorRoundRequest(
            activeRoom.room.id,
            themeCategory,
            impostorCount,
            voteDurationSeconds,
            missBehavior,
            balanceRuleEnabled
          );
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      startGuessWhoRound: async (categoryId) => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await startGuessWhoRoundRequest(activeRoom.room.id, categoryId);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      submitGuessWhoAnswer: async (guess) => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          const result = await submitGuessWhoAnswerRequest(activeRoom.room.id, guess);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id, correct: Boolean(result?.solved_at) };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      advanceImpostorRound: async () => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await advanceImpostorRoundRequest(activeRoom.room.id);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      castImpostorVote: async (targetUserId) => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await castImpostorVoteRequest(activeRoom.room.id, targetUserId);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      resolveImpostorVote: async () => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await resolveImpostorVoteRequest(activeRoom.room.id);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
        } catch (error) {
          return { error: mapRoomError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      returnRoomToLobby: async () => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await returnRoomToLobbyRequest(activeRoom.room.id);
          const roomDetails = await getRoomDetails(activeRoom.room.id, user.id);
          setActiveRoom(roomDetails);
          return { roomId: activeRoom.room.id };
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
      saveSelectedGames: async (selectedGameIds) => {
        if (!user || !activeRoom) {
          return { error: 'AUTH_REQUIRED' };
        }

        setIsBusy(true);

        try {
          await updateRoomSelectedGames(activeRoom.room.id, user.id, selectedGameIds);
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
      setRoomScreenActive: () => {
        // Presence no longer depends on screen focus.
      }
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
