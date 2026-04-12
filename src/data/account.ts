import type { User } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase.types';
import type { AppLanguage, AppThemePreference } from '../lib/storage';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];

export function buildGuestUsername(seed: string) {
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) % 100000;
  }

  return `guess${String(hash).padStart(5, '0')}`;
}

function resolveUsername(user: User) {
  if (isGuestUser(user)) {
    return buildGuestUsername(user.id);
  }

  const metadataUsername = typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : null;
  const metadataDisplayName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : null;
  const emailPrefix = user.email?.split('@')[0] ?? null;

  return (
    metadataUsername ??
    metadataDisplayName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ??
    emailPrefix?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') ??
    `user-${user.id.slice(0, 8)}`
  );
}

export function isGuestUser(user: User | null) {
  return Boolean(user?.is_anonymous || user?.app_metadata?.provider === 'anonymous');
}

export async function ensureAccountRecords(user: User, fallbackLanguage: AppLanguage, fallbackTheme: AppThemePreference) {
  const displayName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : isGuestUser(user)
          ? resolveUsername(user)
          : null;

  const username = resolveUsername(user);

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      username,
      display_name: displayName,
      preferred_language: fallbackLanguage
    },
    { onConflict: 'id' }
  );

  await supabase.from('user_settings').upsert(
    {
      user_id: user.id,
      language: fallbackLanguage,
      linked_provider_label: isGuestUser(user) ? 'Guest' : user.app_metadata?.provider === 'google' ? 'Google' : 'Email',
      theme_preference: fallbackTheme
    },
    { onConflict: 'user_id' }
  );

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
  ]);

  return {
    profile: profile ?? null,
    settings: settings ?? null
  };
}

export async function updateDisplayName(userId: string, displayName: string) {
  await supabase.from('profiles').update({ display_name: displayName }).eq('id', userId);
}

export async function updateLanguagePreference(userId: string, language: AppLanguage) {
  await Promise.all([
    supabase.from('profiles').update({ preferred_language: language }).eq('id', userId),
    supabase.from('user_settings').upsert({ user_id: userId, language }, { onConflict: 'user_id' })
  ]);
}

export async function updateThemePreference(userId: string, themePreference: AppThemePreference) {
  await supabase
    .from('user_settings')
    .upsert({ user_id: userId, theme_preference: themePreference }, { onConflict: 'user_id' });
}
