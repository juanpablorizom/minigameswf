import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import {
  ensureAccountRecords,
  providerLabelFromUser,
  updateLanguagePreference,
  updateThemePreference,
  type ProfileRow,
  type UserSettingsRow
} from '../data/account';
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

function isAnonymousUser(user: User | null) {
  if (!user) {
    return false;
  }

  return user.app_metadata?.provider === 'anonymous';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [settings, setSettings] = useState<UserSettingsRow | null>(null);
  const [language, setLanguage] = useState<AppLanguage>('es');
  const [themePreference, setThemePreference] = useState<AppThemePreference>('default');

  async function applyLanguage(nextLanguage: AppLanguage) {
    await i18n.changeLanguage(nextLanguage);
    await storeLanguage(nextLanguage);
    setLanguage(nextLanguage);
  }

  async function applyTheme(nextTheme: AppThemePreference) {
    await storeTheme(nextTheme);
    setThemePreference(nextTheme);
  }

  async function hydrateAccount(nextSession: Session | null, fallbackLanguage: AppLanguage, fallbackTheme: AppThemePreference) {
    setSession(nextSession);

    if (!nextSession?.user) {
      setProfile(null);
      setSettings(null);
      await applyLanguage(fallbackLanguage);
      await applyTheme(fallbackTheme);
      return;
    }

    try {
      const account = await ensureAccountRecords(nextSession.user, fallbackLanguage, fallbackTheme);
      setProfile(account.profile);
      setSettings(account.settings);

      const resolvedLanguage = account.settings.language ?? account.profile.preferred_language ?? fallbackLanguage;
      const resolvedTheme = account.settings.theme_preference ?? fallbackTheme;
      await applyLanguage(resolvedLanguage);
      await applyTheme(resolvedTheme);
    } catch {
      setProfile(null);
      setSettings(null);
      await applyLanguage(fallbackLanguage);
      await applyTheme(fallbackTheme);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const [storedLanguage, storedTheme] = await Promise.all([loadStoredLanguage(), loadStoredTheme()]);

      await i18n.changeLanguage(storedLanguage);

      if (!isMounted) {
        return;
      }

      setLanguage(storedLanguage);
      setThemePreference(storedTheme);

      if (!isSupabaseConfigured) {
        setIsReady(true);
        return;
      }

      const {
        data: { session: initialSession }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      try {
        await hydrateAccount(initialSession, storedLanguage, storedTheme);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      void Promise.all([loadStoredLanguage(), loadStoredTheme()]).then(([storedLanguage, storedTheme]) =>
        hydrateAccount(nextSession, storedLanguage, storedTheme)
      );
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const isGuest = isAnonymousUser(user);
    const linkedProviderLabel = settings?.linked_provider_label ?? (user ? providerLabelFromUser(user) : null);

    return {
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
      displayName:
        profile?.display_name ??
        (typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : null) ??
        null,
      username: profile?.username ?? null,
      email: user?.email ?? null,
      linkedProviderLabel,
      signInWithEmail: async (email, password) => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setIsBusy(false);

        return error ? { error: error.message } : {};
      },
      signUpWithEmail: async (email, password, displayName) => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || undefined
            }
          }
        });
        setIsBusy(false);

        if (error) {
          return { error: error.message };
        }

        if (!data.session) {
          return { message: 'SIGNUP_CONFIRMATION_REQUIRED' };
        }

        return {};
      },
      signInWithGoogle: async () => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        return { message: 'GOOGLE_SIGN_IN_SETUP_REQUIRED' };
      },
      continueAsGuest: async (displayName) => {
        if (!isSupabaseConfigured) {
          return { error: 'SUPABASE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { error } = await supabase.auth.signInAnonymously({
          options: {
            data: {
              display_name: displayName.trim() || 'Guest Player'
            }
          }
        });
        setIsBusy(false);

        return error ? { error: error.message } : {};
      },
      signOut: async () => {
        if (!isSupabaseConfigured) {
          return;
        }

        setIsBusy(true);
        await supabase.auth.signOut();
        setIsBusy(false);
      },
      changeLanguage: async (nextLanguage) => {
        await applyLanguage(nextLanguage);

        if (!user) {
          return {};
        }

        setIsBusy(true);

        try {
          await updateLanguagePreference(user.id, nextLanguage, linkedProviderLabel, settings?.theme_preference ?? themePreference);
          setProfile((current) => (current ? { ...current, preferred_language: nextLanguage } : current));
          setSettings((current) => (current ? { ...current, language: nextLanguage } : current));
          return {};
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'UNKNOWN_ERROR' };
        } finally {
          setIsBusy(false);
        }
      },
      changeTheme: async (nextTheme) => {
        await applyTheme(nextTheme);

        if (!user) {
          return {};
        }

        setIsBusy(true);

        try {
          await updateThemePreference(user.id, nextTheme, linkedProviderLabel);
          setSettings((current) => (current ? { ...current, theme_preference: nextTheme } : current));
          return {};
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'UNKNOWN_ERROR' };
        } finally {
          setIsBusy(false);
        }
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
    };
  }, [isBusy, isReady, language, profile, session, settings, themePreference]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
