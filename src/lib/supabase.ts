import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

import { appStorage } from './storage';
import type { Database } from './supabase.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const isAccountLinkingEnabled = process.env.EXPO_PUBLIC_ENABLE_ACCOUNT_LINKING === 'true';

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder-publishable-key',
  {
    auth: {
      storage: appStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);
