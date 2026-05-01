import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import {
  listFriends,
  removeFriend as removeFriendRequest,
  respondFriendRequest,
  sendFriendRequest,
  subscribeToFriends,
  type FriendView
} from '../data/friends';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

type FriendActionResult = {
  error?: string;
};

type FriendsContextValue = {
  isReady: boolean;
  isBusy: boolean;
  friends: FriendView[];
  pendingRequests: FriendView[];
  refreshFriends: () => Promise<void>;
  sendRequest: (username: string) => Promise<FriendActionResult>;
  respondRequest: (friendshipId: string, accept: boolean) => Promise<FriendActionResult>;
  removeFriend: (friendshipId: string) => Promise<FriendActionResult>;
};

const FriendsContext = createContext<FriendsContextValue | null>(null);

function mapFriendError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'FRIENDS_ERROR';
}

export function FriendsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [rows, setRows] = useState<FriendView[]>([]);

  const refreshFriends = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setRows([]);
      setIsReady(true);
      return;
    }

    const nextRows = await listFriends();
    setRows(nextRows);
    setIsReady(true);
  }, [user]);

  useEffect(() => {
    void refreshFriends();
  }, [refreshFriends]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToFriends(user.id, () => {
      void refreshFriends();
    });
  }, [refreshFriends, user]);

  const value = useMemo<FriendsContextValue>(() => {
    const friends = rows.filter((row) => row.friendship_status === 'accepted');
    const pendingRequests = rows.filter((row) => row.friendship_status === 'pending' && row.request_direction === 'incoming');

    return {
      isReady,
      isBusy,
      friends,
      pendingRequests,
      refreshFriends,
      sendRequest: async (username) => {
        if (!username.trim()) {
          return { error: 'FRIEND_USERNAME_REQUIRED' };
        }

        setIsBusy(true);
        try {
          await sendFriendRequest(username);
          await refreshFriends();
          return {};
        } catch (error) {
          return { error: mapFriendError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      respondRequest: async (friendshipId, accept) => {
        setIsBusy(true);
        try {
          await respondFriendRequest(friendshipId, accept);
          await refreshFriends();
          return {};
        } catch (error) {
          return { error: mapFriendError(error) };
        } finally {
          setIsBusy(false);
        }
      },
      removeFriend: async (friendshipId) => {
        setIsBusy(true);
        try {
          await removeFriendRequest(friendshipId);
          await refreshFriends();
          return {};
        } catch (error) {
          return { error: mapFriendError(error) };
        } finally {
          setIsBusy(false);
        }
      }
    };
  }, [isBusy, isReady, refreshFriends, rows]);

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends() {
  const context = useContext(FriendsContext);

  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }

  return context;
}
