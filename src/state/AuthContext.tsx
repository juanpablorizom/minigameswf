import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { ensureAccountRecords, providerLabelFromUser, updateLanguagePreference, type ProfileRow, type UserSettingsRow } from '../data/account';
import i18n from '../i18n/i18n';
import { isAccountLinkingEnabled, isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  clearStoredGuestProfile,
  loadStoredGuestProfile,
  loadStoredLanguage,
  loadStoredTheme,
  storeGuestProfile,
  storeLanguage,
  storeTheme,
  type AppLanguage,
  type AppThemePreference,
  type GuestProfile
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
  linkedProviderLabel: string | null;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<AuthActionResult>;
  continueAsGuest: (displayName: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  changeLanguage: (language: AppLanguage) => Promise<AuthActionResult>;
  changeTheme: (theme: AppThemePreference) => Promise<AuthActionResult>;
  linkAccount: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildGuestUsername(displayName: string) {
  const base =
    displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'guest-player';

  return `guest-${base}`;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [settings, setSettings] = useState<UserSettingsRow | null>(null);
  const [language, setLanguage] = useState<AppLanguage>('es');
  const [themePreference, setThemePreference] = useState<AppThemePreference>('warm-night');

  async function applyLanguage(nextLanguage: AppLanguage) {
    await i18n.changeLanguage(nextLanguage);
    await storeLanguage(nextLanguage);
    setLanguage(nextLanguage);
  }

  async function applyTheme(nextTheme: AppThemePreference) {
    await storeTheme(nextTheme);
    setThemePreference(nextTheme);
  }

  async function hydrateAccount(nextSession: Session | null, fallbackLanguage: AppLanguage, storedGuestProfile: GuestProfile | null) {
    setSession(nextSession);

    if (!nextSession?.user) {
      setProfile(null);
      setSettings(null);
      setGuestProfile(storedGuestProfile);
      await applyLanguage(fallbackLanguage);
      return;
    }

    try {
      setGuestProfile(null);
      await clearStoredGuestProfile();

      const account = await ensureAccountRecords(nextSession.user, fallbackLanguage);
      setProfile(account.profile);
      setSettings(account.settings);

      const resolvedLanguage = account.settings.language ?? account.profile.preferred_language ?? fallbackLanguage;
      await applyLanguage(resolvedLanguage);
    } catch {
      setProfile(null);
      setSettings(null);
      await applyLanguage(fallbackLanguage);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const [storedLanguage, storedTheme, storedGuestProfile] = await Promise.all([
        loadStoredLanguage(),
        loadStoredTheme(),
        loadStoredGuestProfile()
      ]);

      await i18n.changeLanguage(storedLanguage);

      if (!isMounted) {
        return;
      }

      setLanguage(storedLanguage);
      setThemePreference(storedTheme);

      if (!isSupabaseConfigured) {
        setGuestProfile(storedGuestProfile);
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
        await hydrateAccount(initialSession, storedLanguage, storedGuestProfile);
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

      void Promise.all([loadStoredLanguage(), loadStoredGuestProfile()]).then(([storedLanguage, storedGuestProfile]) =>
        hydrateAccount(nextSession, storedLanguage, storedGuestProfile)
      );
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const isGuest = !user && !!guestProfile;
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
      displayName: profile?.display_name ?? guestProfile?.displayName ?? null,
      username: profile?.username ?? guestProfile?.username ?? null,
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
      continueAsGuest: async (displayName) => {
        const trimmedName = displayName.trim() || 'Guest Player';
        const nextGuestProfile = {
          displayName: trimmedName,
          username: buildGuestUsername(trimmedName)
        };

        await storeGuestProfile(nextGuestProfile);
        setGuestProfile(nextGuestProfile);
        setSession(null);
        setProfile(null);
        setSettings(null);

        return {};
      },
      signOut: async () => {
        if (isGuest) {
          await clearStoredGuestProfile();
          setGuestProfile(null);
          setSession(null);
          setProfile(null);
          setSettings(null);
          return;
        }

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
          await updateLanguagePreference(user.id, nextLanguage, linkedProviderLabel);
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
    };
  }, [guestProfile, isBusy, isReady, language, profile, session, settings, themePreference]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
