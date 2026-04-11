import type { User } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import type { AppLanguage } from '../lib/storage';
import type { Database } from '../lib/supabase.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];

function buildUsername(user: User) {
  const metadataName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()
      : null;
  const emailBase = user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || metadataName || 'player';

  return `${emailBase}-${user.id.slice(0, 6)}`;
}

export function providerLabelFromUser(user: User) {
  const provider = typeof user.app_metadata?.provider === 'string' ? user.app_metadata.provider : 'email';

  if (provider === 'google') {
    return 'Google';
  }

  if (provider === 'apple') {
    return 'Apple';
  }

  if (provider === 'anonymous') {
    return 'Guest';
  }

  return 'Email';
}

export async function ensureAccountRecords(user: User, fallbackLanguage: AppLanguage) {
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileFetchError) {
    throw profileFetchError;
  }

  const nextProfile = {
    id: user.id,
    username: existingProfile?.username ?? buildUsername(user),
    display_name:
      existingProfile?.display_name ?? (typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : null),
    avatar_url: existingProfile?.avatar_url ?? null,
    preferred_language: existingProfile?.preferred_language ?? fallbackLanguage
  };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(nextProfile, { onConflict: 'id' })
    .select('*')
    .single();

  if (profileError) {
    throw profileError;
  }

  const { data: existingSettings, error: settingsFetchError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (settingsFetchError) {
    throw settingsFetchError;
  }

  const nextSettings = {
    user_id: user.id,
    language: existingSettings?.language ?? profile.preferred_language ?? fallbackLanguage,
    linked_provider_label: existingSettings?.linked_provider_label ?? providerLabelFromUser(user)
  };

  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .upsert(nextSettings, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (settingsError) {
    throw settingsError;
  }

  return { profile, settings };
}

export async function updateLanguagePreference(userId: string, language: AppLanguage, linkedProviderLabel: string | null) {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ preferred_language: language })
    .eq('id', userId);

  if (profileError) {
    throw profileError;
  }

  const { error: settingsError } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      language,
      linked_provider_label: linkedProviderLabel
    },
    { onConflict: 'user_id' }
  );

  if (settingsError) {
    throw settingsError;
  }
}
