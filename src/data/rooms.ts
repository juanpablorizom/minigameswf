import { supabase } from '../lib/supabase';
import type { Database, RoomMemberRole, RoomStatus } from '../lib/supabase.types';
import type { ImpostorRoundSetup, ImpostorCategoryId } from '../navigation/types';

export type RoomRow = Database['public']['Tables']['rooms']['Row'];
export type RoomMemberRow = Database['public']['Tables']['room_members']['Row'];
export type RoomRoundRow = Database['public']['Tables']['room_rounds']['Row'];
export type RoomRoundVoteRow = Database['public']['Tables']['room_round_votes']['Row'];
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

export type RoomDetails = {
  room: RoomRow;
  members: RoomMemberView[];
  round: ImpostorRoundSetup | null;
  currentUserRole: RoomMemberRole | null;
  isHost: boolean;
};

export type RoomRealtimeState = 'idle' | 'connecting' | 'live' | 'error';

type SubscribeToRoomRealtimeOptions = {
  roomId: string;
  onRoomChange: () => void;
  onMembersChange: () => void;
  onRoundChange: () => void;
  onVotesChange: () => void;
  onConnectionStateChange?: (state: RoomRealtimeState, message?: string | null) => void;
};

function normalizeResult<T>(data: T | T[] | null) {
  if (!data) {
    return null;
  }

  return Array.isArray(data) ? data[0] ?? null : data;
}

function buildRoomErrorMessage(message: string) {
  if (
    message.includes('column room_rounds.round_number does not exist') ||
    message.includes('column "round_number" does not exist') ||
    message.includes('column room_rounds.phase does not exist') ||
    message.includes('relation "public.room_round_votes" does not exist') ||
    message.includes('room_rounds_theme_category_check')
  ) {
    return 'ROOMS_BACKEND_NOT_CONFIGURED';
  }

  if (message.includes('ROOM_NOT_FOUND')) {
    return 'ROOM_NOT_FOUND';
  }

  if (message.includes('ROOM_UNAVAILABLE')) {
    return 'ROOM_UNAVAILABLE';
  }

  if (message.includes('AUTH_REQUIRED')) {
    return 'AUTH_REQUIRED';
  }

  if (message.includes('ROOM_MEMBER_NOT_FOUND')) {
    return 'ROOM_MEMBER_NOT_FOUND';
  }

  if (message.includes('CANNOT_REMOVE_HOST')) {
    return 'CANNOT_REMOVE_HOST';
  }

  if (message.includes('ROUND_HOST_ONLY')) {
    return 'ROUND_HOST_ONLY';
  }

  if (message.includes('ROUND_THEME_NOT_FOUND')) {
    return 'ROUND_THEME_NOT_FOUND';
  }

  if (message.includes('ROUND_NO_MEMBERS')) {
    return 'ROUND_NO_MEMBERS';
  }

  if (message.includes('ROUND_MIN_PLAYERS')) {
    return 'ROUND_MIN_PLAYERS';
  }

  if (message.includes('ROUND_NOT_FOUND')) {
    return 'ROUND_NOT_FOUND';
  }

  if (message.includes('ROUND_NOT_VOTING')) {
    return 'ROUND_NOT_VOTING';
  }

  if (message.includes('ROUND_TARGET_NOT_FOUND')) {
    return 'ROUND_TARGET_NOT_FOUND';
  }

  if (message.includes('ROUND_TARGET_ELIMINATED')) {
    return 'ROUND_TARGET_ELIMINATED';
  }

  if (message.includes('ROUND_NOT_ACTIVE')) {
    return 'ROUND_NOT_ACTIVE';
  }

  if (message.includes('Failed to fetch') || message.includes('fetch failed') || message.includes('Network request failed')) {
    return 'BACKEND_UNREACHABLE';
  }

  if (message.includes('relation') && message.includes('does not exist')) {
    return 'ROOMS_BACKEND_NOT_CONFIGURED';
  }

  if (message.includes('infinite recursion detected in policy')) {
    return 'ROOMS_PERMISSION_DENIED';
  }

  if (message.includes('permission denied') || message.includes('42501')) {
    return 'ROOMS_PERMISSION_DENIED';
  }

  return message;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'UNKNOWN_ERROR';
}

export async function createPrivateRoom(selectedGameId: string | null) {
  const { data, error } = await supabase.rpc('create_private_room', {
    p_selected_game_id: selectedGameId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  const room = normalizeResult(data as RoomRow | RoomRow[] | null);

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

  const room = normalizeResult(data as RoomRow | RoomRow[] | null);

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
    .eq('is_active', true)
    .order('joined_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
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
    throw new Error(buildRoomErrorMessage(error.message));
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
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

async function closeRoomIfSingleMemberLeft(roomId: string) {
  const { count, error } = await supabase
    .from('room_members')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('is_active', true);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  if ((count ?? 0) <= 1) {
    const { error: closeError } = await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('id', roomId)
      .in('status', ['waiting', 'active']);

    if (closeError) {
      throw new Error(buildRoomErrorMessage(closeError.message));
    }
  }
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
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

async function getRoomRound(roomId: string) {
  const { data, error } = await supabase
    .from('room_rounds')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data;
}

async function getRoomRoundVotes(roundId: string | null) {
  if (!roundId) {
    return [];
  }

  const { data, error } = await supabase
    .from('room_round_votes')
    .select('*')
    .eq('round_id', roundId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

function mapRoomRound(round: RoomRoundRow | null, votes: RoomRoundVoteRow[] = []): ImpostorRoundSetup | null {
  if (!round) {
    return null;
  }

  return {
    roundId: round.id,
    roundNumber: round.round_number,
    categoryId: round.theme_category as ImpostorCategoryId,
    secretWord: round.secret_word,
    impostorIds: round.impostor_ids,
    eliminatedUserIds: round.eliminated_user_ids,
    expelledUserId: round.expelled_user_id,
    phase: round.phase,
    voteDeadlineAt: round.vote_deadline_at,
    voteDurationSeconds: round.vote_duration_seconds,
    missBehavior: round.miss_behavior,
    balanceEndsGame: round.balance_rule_enabled,
    votes: votes.map((vote) => ({
      voterUserId: vote.voter_user_id,
      targetUserId: vote.target_user_id
    })),
    startedAt: round.created_at,
    status: round.status,
    outcome: round.outcome
  };
}

export async function getRoomDetails(roomId: string, currentUserId: string): Promise<RoomDetails | null> {
  const [room, members, round] = await Promise.all([
    getRoom(roomId),
    getRoomMembers(roomId),
    getRoomRound(roomId)
  ]);

  if (!room) {
    return null;
  }

  const [profiles, roundVotes] = await Promise.all([
    getProfilesForUsers(members.map((member) => member.user_id)),
    getRoomRoundVotes(round?.id ?? null)
  ]);
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

  const currentMember = memberViews.find((member) => member.userId === currentUserId) ?? null;

  return {
    room,
    members: memberViews,
    round: mapRoomRound(round, roundVotes),
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
    throw new Error(buildRoomErrorMessage(error.message));
  }
}

export async function updateRoomStatus(roomId: string, hostUserId: string, status: RoomStatus) {
  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId)
    .eq('host_user_id', hostUserId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
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

export async function leaveCurrentRoom(roomId: string, userId: string) {
  const { error } = await supabase
    .from('room_members')
    .update({ is_active: false })
    .eq('room_id', roomId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  await closeRoomIfSingleMemberLeft(roomId);
}

export async function closeRoomForHost(roomId: string, userId: string) {
  const { error } = await supabase
    .from('rooms')
    .update({ status: 'finished' })
    .eq('id', roomId)
    .eq('host_user_id', userId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }
}

export async function removeRoomMember(roomId: string, memberUserId: string) {
  const { data, error } = await supabase.rpc('remove_room_member', {
    p_room_id: roomId,
    p_member_user_id: memberUserId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  await closeRoomIfSingleMemberLeft(roomId);

  return normalizeResult(data as RoomMemberRow | RoomMemberRow[] | null);
}

export async function startImpostorRound(
  roomId: string,
  themeCategory: ImpostorCategoryId,
  impostorCount: number,
  voteDurationSeconds: number,
  missBehavior: 'repeat' | 'end',
  balanceRuleEnabled: boolean
) {
  const { data, error } = await supabase.rpc('start_impostor_round', {
    p_room_id: roomId,
    p_theme_category: themeCategory,
    p_impostor_count: impostorCount,
    p_vote_duration_seconds: voteDurationSeconds,
    p_miss_behavior: missBehavior,
    p_balance_rule_enabled: balanceRuleEnabled
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return mapRoomRound(normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null));
}

export async function advanceImpostorRound(roomId: string) {
  const { data, error } = await supabase.rpc('advance_impostor_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return mapRoomRound(normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null));
}

export async function castImpostorVote(roomId: string, targetUserId: string) {
  const { data, error } = await supabase.rpc('cast_impostor_vote', {
    p_room_id: roomId,
    p_target_user_id: targetUserId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundVoteRow | RoomRoundVoteRow[] | null);
}

export async function resolveImpostorVote(roomId: string) {
  const { data, error } = await supabase.rpc('resolve_impostor_vote', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return mapRoomRound(normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null));
}

export async function returnRoomToLobby(roomId: string) {
  const { data, error } = await supabase.rpc('return_room_to_lobby', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRow | RoomRow[] | null);
}

export function subscribeToRoomRealtime({
  roomId,
  onRoomChange,
  onMembersChange,
  onRoundChange,
  onVotesChange,
  onConnectionStateChange
}: SubscribeToRoomRealtimeOptions) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      () => onRoomChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${roomId}` },
      () => onMembersChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_rounds', filter: `room_id=eq.${roomId}` },
      () => onRoundChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_round_votes', filter: `room_id=eq.${roomId}` },
      () => onVotesChange()
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        onConnectionStateChange?.('live', null);
        return;
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        onConnectionStateChange?.('error', 'Realtime sync is temporarily unavailable.');
        return;
      }

      onConnectionStateChange?.('connecting', 'Connecting live room updates...');
    });

  onConnectionStateChange?.('connecting', 'Connecting live room updates...');

  return () => {
    void supabase.removeChannel(channel);
  };
}

export { getErrorMessage };
