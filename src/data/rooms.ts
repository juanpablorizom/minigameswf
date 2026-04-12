import { supabase } from '../lib/supabase';
import type { Database, RoomMemberRole, RoomStatus } from '../lib/supabase.types';

export type RoomRow = Database['public']['Tables']['rooms']['Row'];
export type RoomMemberRow = Database['public']['Tables']['room_members']['Row'];
export type RoomActivityRow = Database['public']['Tables']['room_activity']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type RoomMemberView = {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: RoomMemberRole;
  joinedAt: string;
  isActive: boolean;
  isCurrentUser: boolean;
};

export type RoomActivityView = {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
};

export type RoomDetails = {
  room: RoomRow;
  members: RoomMemberView[];
  activity: RoomActivityView[];
  currentUserRole: RoomMemberRole | null;
  isHost: boolean;
};

export type RoomRealtimeState = 'idle' | 'connecting' | 'live' | 'error';

type SubscribeToRoomRealtimeOptions = {
  roomId: string;
  onRoomChange: () => void;
  onMembersChange: () => void;
  onConnectionStateChange?: (state: RoomRealtimeState, message?: string | null) => void;
};

function normalizeRoomResult(data: RoomRow | RoomRow[] | null) {
  if (!data) {
    return null;
  }

  return Array.isArray(data) ? data[0] ?? null : data;
}

function buildRoomErrorMessage(message: string) {
  if (message.includes('ROOM_NOT_FOUND')) {
    return 'ROOM_NOT_FOUND';
  }

  if (message.includes('ROOM_UNAVAILABLE')) {
    return 'ROOM_UNAVAILABLE';
  }

  if (message.includes('AUTH_REQUIRED')) {
    return 'AUTH_REQUIRED';
  }

  return message;
}

export async function createPrivateRoom(selectedGameId: string | null) {
  const { data, error } = await supabase.rpc('create_private_room', {
    p_selected_game_id: selectedGameId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  const room = normalizeRoomResult(data as RoomRow | RoomRow[] | null);

  if (!room) {
    throw new Error('ROOM_CREATE_FAILED');
  }

  return room;
}

export async function joinPrivateRoomByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  const { data, error } = await supabase.rpc('join_private_room', {
    p_code: normalizedCode
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  const room = normalizeRoomResult(data as RoomRow | RoomRow[] | null);

  if (!room) {
    throw new Error('ROOM_NOT_FOUND');
  }

  return room;
}

export async function getActiveRoomIdForUser(userId: string) {
  const { data, error } = await supabase
    .from('room_members')
    .select('room_id, joined_at, rooms!inner(id, status)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const activeMember = (data ?? []).find((entry) => {
    const status = (entry as { rooms?: { status?: RoomStatus } }).rooms?.status;
    return status === 'waiting' || status === 'active';
  }) as { room_id: string } | undefined;

  return activeMember?.room_id ?? null;
}

async function getRoom(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function getRoomMembers(roomId: string) {
  const { data, error } = await supabase
    .from('room_members')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getProfilesForUsers(userIds: string[]) {
  if (!userIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getRoomActivity(roomId: string) {
  const { data, error } = await supabase
    .from('room_activity')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getRoomDetails(roomId: string, currentUserId: string): Promise<RoomDetails | null> {
  const room = await getRoom(roomId);

  if (!room) {
    return null;
  }

  const members = await getRoomMembers(roomId);
  const profiles = await getProfilesForUsers(members.map((member) => member.user_id));
  const activity = await getRoomActivity(roomId);
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  const memberViews = members.map((member) => {
    const profile = profilesById.get(member.user_id);

    return {
      id: member.id,
      userId: member.user_id,
      displayName: profile?.display_name ?? profile?.username ?? 'Player',
      username: profile?.username ?? `user-${member.user_id.slice(0, 6)}`,
      avatarUrl: profile?.avatar_url ?? null,
      role: member.role,
      joinedAt: member.joined_at,
      isActive: member.is_active,
      isCurrentUser: member.user_id === currentUserId
    } satisfies RoomMemberView;
  });

  const activityViews = activity.map((entry) => {
    const actorProfile = entry.actor_user_id ? profilesById.get(entry.actor_user_id) : null;
    const actorLabel = actorProfile?.display_name ?? actorProfile?.username ?? 'Someone';

    if (entry.type === 'room_created') {
      return {
        id: entry.id,
        title: `${actorLabel} opened the room`,
        subtitle: `Code ${room.code} is ready to share.`,
        createdAt: entry.created_at
      } satisfies RoomActivityView;
    }

    if (entry.type === 'member_joined') {
      return {
        id: entry.id,
        title: `${actorLabel} joined the room`,
        subtitle: 'The party lineup was updated.',
        createdAt: entry.created_at
      } satisfies RoomActivityView;
    }

    return {
      id: entry.id,
      title: entry.type,
      subtitle: 'Room activity updated.',
      createdAt: entry.created_at
    } satisfies RoomActivityView;
  });

  const currentMember = memberViews.find((member) => member.userId === currentUserId) ?? null;

  return {
    room,
    members: memberViews,
    activity: activityViews,
    currentUserRole: currentMember?.role ?? null,
    isHost: currentMember?.role === 'host'
  };
}

export async function updateRoomSelectedGame(roomId: string, hostUserId: string, selectedGameId: string | null) {
  const { error } = await supabase
    .from('rooms')
    .update({ selected_game_id: selectedGameId })
    .eq('id', roomId)
    .eq('host_user_id', hostUserId);

  if (error) {
    throw error;
  }
}

export async function updateRoomStatus(roomId: string, hostUserId: string, status: RoomStatus) {
  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId)
    .eq('host_user_id', hostUserId);

  if (error) {
    throw error;
  }
}

export async function updateRoomMemberPresence(roomId: string, userId: string, isActive: boolean) {
  const { error } = await supabase
    .from('room_members')
    .update({ is_active: isActive })
    .eq('room_id', roomId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export function subscribeToRoomRealtime({
  roomId,
  onRoomChange,
  onMembersChange,
  onConnectionStateChange
}: SubscribeToRoomRealtimeOptions) {
  onConnectionStateChange?.('connecting', 'Syncing live room updates...');

  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_members',
        filter: `room_id=eq.${roomId}`
      },
      () => {
        onMembersChange();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`
      },
      () => {
        onRoomChange();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        onConnectionStateChange?.('live', null);
        return;
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        onConnectionStateChange?.('error', 'Live sync was interrupted. Trying to recover...');
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
