import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from './supabase.types';

const fallbackSupabaseUrl = 'https://faqtsdzuznetutyhpsjy.supabase.co';
const fallbackSupabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcXRzZHp1em5ldHV0eWhwc2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjIwNzgsImV4cCI6MjA5MTUzODA3OH0.155r4PKBNQbqJsYYhaG8CyTmcdXuzN3tdvBmCRjP19E';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? fallbackSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isAccountLinkingEnabled = process.env.EXPO_PUBLIC_ENABLE_ACCOUNT_LINKING === 'true';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web'
    }
  }
);
