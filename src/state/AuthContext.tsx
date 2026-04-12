import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';

import { ensureAccountRecords, isGuestUser, updateLanguagePreference, updateThemePreference, type ProfileRow, type UserSettingsRow } from '../data/account';
import i18n from '../i18n/i18n';
import { isAccountLinkingEnabled, isSupabaseConfigured, supabase } from '../lib/supabase';
import { loadStoredLanguage, loadStoredTheme, storeLanguage, storeTheme, type AppLanguage, type AppThemePreference } from '../lib/storage';

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
  linkedProviderLabel: string | null;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  continueAsGuest: (displayName: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  changeLanguage: (language: AppLanguage) => Promise<AuthActionResult>;
  changeTheme: (theme: AppThemePreference) => Promise<AuthActionResult>;
  linkAccount: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildGuestUsername(displayName: string) {
  const base = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || `guest-${Math.random().toString(36).slice(2, 7)}`;
}

function providerLabelFromUser(user: User | null, isGuest: boolean) {
  if (!user) {
    return null;
  }

  if (isGuest) {
    return 'Guest';
  }

  if (user.app_metadata?.provider === 'google') {
    return 'Google';
  }

  return 'Email';
}

function getGoogleRedirectUrl() {
  if (Platform.OS === 'web' && typeof globalThis.location !== 'undefined') {
    return `${globalThis.location.origin}/`;
  }

  return 'minigameswf://auth/callback';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [language, setLanguage] = useState<AppLanguage>('es');
  const [themePreference, setThemePreference] = useState<AppThemePreference>('default');
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [settings, setSettings] = useState<UserSettingsRow | null>(null);

  async function applyLanguage(nextLanguage: AppLanguage) {
    await i18n.changeLanguage(nextLanguage);
    await storeLanguage(nextLanguage);
    setLanguage(nextLanguage);
  }

  async function applyTheme(nextTheme: AppThemePreference) {
    await storeTheme(nextTheme);
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
    const resolvedTheme = accountState.settings?.theme_preference ?? fallbackTheme;

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
        void refreshAccountState(nextSession?.user ?? null, storedLanguage, storedTheme);
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
  const linkedProviderLabel = providerLabelFromUser(user, isGuest);
  const displayName =
    profile?.display_name ??
    (typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : null) ??
    (typeof user?.user_metadata?.name === 'string' ? user.user_metadata.name : null) ??
    null;
  const username = profile?.username ?? (isGuest && displayName ? buildGuestUsername(displayName) : null);

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
      linkedProviderLabel,
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
              username: buildGuestUsername(displayNameInput || email.split('@')[0] || 'player')
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
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: getGoogleRedirectUrl()
          }
        });
        setIsBusy(false);

        return error ? { error: error.message } : {};
      },
      continueAsGuest: async (displayNameInput) => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        const resolvedName = displayNameInput.trim() || 'Invitado';

        setIsBusy(true);
        const { data, error } = await supabase.auth.signInAnonymously({
          options: {
            data: {
              display_name: resolvedName,
              username: buildGuestUsername(resolvedName)
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
      },
      linkAccount: async () => {
        if (isGuest) {
          return { message: 'LINK_GUEST_ACCOUNT' };
        }

        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        if (!isAccountLinkingEnabled) {
          return { message: 'LINKING_REQUIRES_SETUP' };
        }

        return { message: 'LINKING_REQUIRES_SETUP' };
      }
    }),
    [
      displayName,
      isBusy,
      isGuest,
      isReady,
      language,
      linkedProviderLabel,
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
