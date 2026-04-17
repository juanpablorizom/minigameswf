import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';

import {
  buildGuestUsername,
  ensureAccountRecords,
  isGuestUser,
  updateDisplayName as updateProfileDisplayName,
  updateLanguagePreference,
  updateThemePreference,
  type ProfileRow,
  type UserSettingsRow
} from '../data/account';
import i18n from '../i18n/i18n';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  loadStoredLanguage,
  loadStoredTheme,
  normalizeThemePreference,
  storeLanguage,
  storeTheme,
  type AppLanguage,
  type AppThemePreference
} from '../lib/storage';

type AuthActionResult = {
  error?: string;
  message?: string;
};

type AuthContextValue = {
  isReady: boolean;
  isBusy: boolean;
  isSupabaseConfigured: boolean;
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  profile: ProfileRow | null;
  settings: UserSettingsRow | null;
  language: AppLanguage;
  themePreference: AppThemePreference;
  displayName: string | null;
  username: string | null;
  email: string | null;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  continueAsGuest: (displayName: string) => Promise<AuthActionResult>;
  updateDisplayName: (displayName: string) => Promise<AuthActionResult>;
  linkGuestAccountWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  changeLanguage: (language: AppLanguage) => Promise<AuthActionResult>;
  changeTheme: (theme: AppThemePreference) => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

WebBrowser.maybeCompleteAuthSession();

function getGoogleRedirectUrl() {
  if (Platform.OS === 'web' && typeof globalThis.location !== 'undefined') {
    return `${globalThis.location.origin}/`;
  }

  return 'minigameswf://auth/callback';
}

function readAuthParamsFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const hash = parsedUrl.hash.startsWith('#') ? parsedUrl.hash.slice(1) : parsedUrl.hash;
  const hashParams = new URLSearchParams(hash);
  const queryParams = parsedUrl.searchParams;

  return {
    accessToken: hashParams.get('access_token') ?? queryParams.get('access_token'),
    refreshToken: hashParams.get('refresh_token') ?? queryParams.get('refresh_token'),
    error: hashParams.get('error_description') ?? queryParams.get('error_description') ?? hashParams.get('error') ?? queryParams.get('error')
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [language, setLanguage] = useState<AppLanguage>('es');
  const [themePreference, setThemePreference] = useState<AppThemePreference>('neutral-dark');
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [settings, setSettings] = useState<UserSettingsRow | null>(null);
  const languageRef = useRef<AppLanguage>('es');
  const themePreferenceRef = useRef<AppThemePreference>('neutral-dark');

  async function applyLanguage(nextLanguage: AppLanguage) {
    await i18n.changeLanguage(nextLanguage);
    await storeLanguage(nextLanguage);
    languageRef.current = nextLanguage;
    setLanguage(nextLanguage);
  }

  async function applyTheme(nextTheme: AppThemePreference) {
    await storeTheme(nextTheme);
    themePreferenceRef.current = nextTheme;
    setThemePreference(nextTheme);
  }

  async function refreshAccountState(nextUser: User | null, fallbackLanguage: AppLanguage, fallbackTheme: AppThemePreference) {
    if (!nextUser) {
      setProfile(null);
      setSettings(null);
      return;
    }

    const accountState = await ensureAccountRecords(nextUser, fallbackLanguage, fallbackTheme);
    setProfile(accountState.profile);
    setSettings(accountState.settings);

    const resolvedLanguage = accountState.settings?.language ?? accountState.profile?.preferred_language ?? fallbackLanguage;
    const resolvedTheme = normalizeThemePreference(accountState.settings?.theme_preference ?? fallbackTheme);

    if (resolvedLanguage !== fallbackLanguage) {
      await applyLanguage(resolvedLanguage);
    }

    if (resolvedTheme !== fallbackTheme) {
      await applyTheme(resolvedTheme);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const [storedLanguage, storedTheme] = await Promise.all([loadStoredLanguage(), loadStoredTheme()]);

      await i18n.changeLanguage(storedLanguage);

      if (!isMounted) {
        return () => {};
      }

      setLanguage(storedLanguage);
      setThemePreference(storedTheme);
      languageRef.current = storedLanguage;
      themePreferenceRef.current = storedTheme;

      if (!isSupabaseConfigured) {
        setProfile(null);
        setSettings(null);
        setIsReady(true);
        return () => {};
      }

      const {
        data: { session: initialSession }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return () => {};
      }

      setSession(initialSession);
      await refreshAccountState(initialSession?.user ?? null, storedLanguage, storedTheme);
      setIsReady(true);

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        void refreshAccountState(nextSession?.user ?? null, languageRef.current, themePreferenceRef.current);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    let cleanup: (() => void) | undefined;

    void bootstrap().then((nextCleanup) => {
      cleanup = nextCleanup;
    });

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, []);

  const user = session?.user ?? null;
  const isGuest = isGuestUser(user);
  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : null) ??
    (typeof user?.user_metadata?.name === 'string' ? user.user_metadata.name : null) ??
    (isGuest && user ? buildGuestUsername(user.id) : null) ??
    null;
  const username = profile?.username ?? (isGuest && user ? buildGuestUsername(user.id) : null);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isBusy,
      isSupabaseConfigured,
      session,
      user,
      isGuest,
      profile,
      settings,
      language,
      themePreference,
      displayName,
      username,
      email: user?.email ?? null,
      signInWithEmail: async (email, password) => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setIsBusy(false);

        if (error || !data.session) {
          return { error: error?.message ?? 'AUTH_FAILED' };
        }

        setSession(data.session);
        await refreshAccountState(data.session.user, language, themePreference);
        return {};
      },
      signUpWithEmail: async (email, password, displayNameInput) => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              emailRedirectTo: getGoogleRedirectUrl(),
              data: {
                display_name: displayNameInput || undefined,
                username:
                  displayNameInput
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '') || email.split('@')[0] || 'player'
              }
            }
          });
        setIsBusy(false);

        if (error) {
          return { error: error.message };
        }

        if (!data.session || !data.user) {
          return { message: 'SIGNUP_CONFIRMATION_REQUIRED' };
        }

        setSession(data.session);
        await refreshAccountState(data.session.user, language, themePreference);
        return {};
      },
      signInWithGoogle: async () => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const redirectTo = getGoogleRedirectUrl();
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: Platform.OS !== 'web'
          }
        });

        if (error) {
          setIsBusy(false);
          return { error: error.message };
        }

        if (Platform.OS === 'web') {
          setIsBusy(false);
          return {};
        }

        if (!data?.url) {
          setIsBusy(false);
          return { error: 'GOOGLE_SIGN_IN_SETUP_REQUIRED' };
        }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type !== 'success') {
          setIsBusy(false);
          return { error: 'AUTH_CANCELLED' };
        }

        const { accessToken, refreshToken, error: callbackError } = readAuthParamsFromUrl(result.url);

        if (callbackError) {
          setIsBusy(false);
          return { error: callbackError };
        }

        if (!accessToken || !refreshToken) {
          setIsBusy(false);
          return { error: 'AUTH_CALLBACK_INCOMPLETE' };
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        setIsBusy(false);

        if (sessionError || !sessionData.session) {
          return { error: sessionError?.message ?? 'AUTH_FAILED' };
        }

        setSession(sessionData.session);
        await refreshAccountState(sessionData.session.user, language, themePreference);
        return {};
      },
      continueAsGuest: async (displayNameInput) => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        const resolvedName = displayNameInput.trim() || `guess${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

        setIsBusy(true);
        const { data, error } = await supabase.auth.signInAnonymously({
          options: {
            data: {
              display_name: resolvedName,
              username: resolvedName
            }
          }
        });
        setIsBusy(false);

        if (error || !data.session) {
          return { error: error?.message ?? 'AUTH_FAILED' };
        }

        setSession(data.session);
        await refreshAccountState(data.session.user, language, themePreference);
        return {};
      },
      updateDisplayName: async (nextDisplayName) => {
        if (!user) {
          return { error: 'AUTH_REQUIRED' };
        }

        const resolvedDisplayName = nextDisplayName.trim();

        if (!resolvedDisplayName) {
          return { error: 'DISPLAY_NAME_REQUIRED' };
        }

        setIsBusy(true);
        const { data, error } = await supabase.auth.updateUser({
          data: {
            display_name: resolvedDisplayName,
            username: profile?.username ?? (isGuest ? buildGuestUsername(user.id) : undefined)
          }
        });

        if (error) {
          setIsBusy(false);
          return { error: error.message };
        }

        await updateProfileDisplayName(user.id, resolvedDisplayName);
        const nextUser = data.user ?? user;
        await refreshAccountState(nextUser, language, themePreference);
        setIsBusy(false);
        return { message: 'DISPLAY_NAME_UPDATED' };
      },
      linkGuestAccountWithEmail: async (email, _password) => {
        if (!user) {
          return { error: 'AUTH_REQUIRED' };
        }

        if (!isGuest) {
          return { message: 'ACCOUNT_ALREADY_LINKED' };
        }

        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { error } = await supabase.auth.updateUser(
          {
            email,
            data: {
              display_name: displayName ?? buildGuestUsername(user.id),
              username: profile?.username ?? buildGuestUsername(user.id)
            }
          },
          {
            emailRedirectTo: getGoogleRedirectUrl()
          }
        );
        setIsBusy(false);

        if (error) {
          return { error: error.message };
        }
        return { message: 'EMAIL_LINK_VERIFICATION_REQUIRED' };
      },
      signOut: async () => {
        setIsBusy(true);

        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }

        setSession(null);
        setProfile(null);
        setSettings(null);
        setIsBusy(false);
      },
      changeLanguage: async (nextLanguage) => {
        await applyLanguage(nextLanguage);

        if (user) {
          await updateLanguagePreference(user.id, nextLanguage);
          setSettings((current) => (current ? { ...current, language: nextLanguage } : current));
        }

        return {};
      },
      changeTheme: async (nextTheme) => {
        await applyTheme(nextTheme);

        if (user) {
          await updateThemePreference(user.id, nextTheme);
          setSettings((current) => (current ? { ...current, theme_preference: nextTheme } : current));
        }

        return {};
      }
    }),
    [
      displayName,
      isBusy,
      isGuest,
      isReady,
      language,
      profile,
      session,
      settings,
      themePreference,
      user,
      username
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
