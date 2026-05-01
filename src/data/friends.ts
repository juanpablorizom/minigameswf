import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase.types';

export type FriendView = Database['public']['Views']['friend_list_view']['Row'];
export type FriendStatus = FriendView['presence_status'];

export async function listFriends() {
  const { data, error } = await supabase
    .from('friend_list_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function sendFriendRequest(targetUsername: string) {
  const { error } = await supabase.rpc('add_friend_by_username', {
    target_username: targetUsername.trim()
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function respondFriendRequest(friendshipId: string, accept: boolean) {
  const { error } = await supabase.rpc('respond_friend_request', {
    friendship_id: friendshipId,
    accept
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase.from('user_friendships').delete().eq('id', friendshipId);

  if (error) {
    throw new Error(error.message);
  }
}

export function subscribeToFriends(userId: string, onChange: () => void) {
  const channel = supabase
    .channel(`friends:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_friendships' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
