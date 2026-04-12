import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import type { AuthSession, UserSchema } from '@insforge/sdk';

import i18n from '../i18n/i18n';
import { insforge, isAccountLinkingEnabled, isInsForgeConfigured } from '../lib/insforge';
import {
  clearStoredGuestProfile,
  loadStoredGuestProfile,
  loadStoredLanguage,
  loadStoredTheme,
  storeGuestProfile,
  storeLanguage,
  storeTheme,
  type AppLanguage,
  type AppThemePreference
} from '../lib/storage';

type AuthActionResult = {
  error?: string;
  message?: string;
};

type ProfileRow = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  preferred_language: AppLanguage | null;
};

type UserSettingsRow = {
  language: AppLanguage | null;
  linked_provider_label: string | null;
  theme_preference: AppThemePreference | null;
};

type GuestUser = {
  id: string;
  email: string;
  profile: {
    name: string;
    avatar_url?: string;
  } | null;
  metadata: Record<string, unknown> | null;
  providers?: string[];
};

type AuthUser = UserSchema | GuestUser;

type AuthContextValue = {
  isReady: boolean;
  isBusy: boolean;
  isInsForgeConfigured: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
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

function buildGuestUser(displayName: string): GuestUser {
  const resolvedName = displayName.trim() || 'Invitado';
  const username = buildGuestUsername(resolvedName);

  return {
    id: `guest-${username}`,
    email: `${username}@guest.minigameswf.local`,
    profile: {
      name: resolvedName
    },
    metadata: {
      provider: 'guest',
      username
    },
    providers: ['guest']
  };
}

function buildProfile(user: AuthUser | null, language: AppLanguage): ProfileRow | null {
  if (!user) {
    return null;
  }

  const metadata = user.metadata ?? {};
  const displayName =
    user.profile?.name ??
    (typeof metadata.display_name === 'string' ? metadata.display_name : null) ??
    (typeof metadata.name === 'string' ? metadata.name : null) ??
    null;
  const username = typeof metadata.username === 'string' ? metadata.username : null;
  const avatarUrl = typeof user.profile?.avatar_url === 'string' ? user.profile.avatar_url : null;

  return {
    display_name: displayName,
    username,
    avatar_url: avatarUrl,
    preferred_language: language
  };
}

function providerLabelFromUser(user: AuthUser | null, isGuest: boolean) {
  if (!user) {
    return null;
  }

  if (isGuest) {
    return 'Guest';
  }

  if (user.providers?.includes('google')) {
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
  const [session, setSession] = useState<AuthSession | null>(null);
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
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

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const [storedLanguage, storedTheme, storedGuest] = await Promise.all([
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

      if (isInsForgeConfigured) {
        const { data } = await insforge.auth.getCurrentUser();

        if (!isMounted) {
          return;
        }

        if (data?.user) {
          setSession({
            user: data.user,
            accessToken: ''
          });
          setGuestUser(null);
          await clearStoredGuestProfile();
        } else if (storedGuest) {
          setGuestUser(buildGuestUser(storedGuest.displayName));
        }
      } else if (storedGuest) {
        setGuestUser(buildGuestUser(storedGuest.displayName));
      }

      if (isMounted) {
        setIsReady(true);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? guestUser ?? null;
    const isGuest = Boolean(guestUser && !session);
    const linkedProviderLabel = providerLabelFromUser(user, isGuest);
    const profile = buildProfile(user, language);
    const settings: UserSettingsRow | null = {
      language,
      linked_provider_label: linkedProviderLabel,
      theme_preference: themePreference
    };
    const displayName = profile?.display_name ?? null;
    const username = profile?.username ?? (isGuest ? (guestUser?.metadata?.username as string | undefined) ?? null : null);

    return {
      isReady,
      isBusy,
      isInsForgeConfigured,
      session,
      user,
      isGuest,
      profile,
      settings,
      language,
      themePreference,
      displayName,
      username,
      email: isGuest ? null : user?.email ?? null,
      linkedProviderLabel,
      signInWithEmail: async (email, password) => {
        if (!isInsForgeConfigured) {
          return { error: 'INSFORGE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { data, error } = await insforge.auth.signInWithPassword({ email, password });
        setIsBusy(false);

        if (error || !data) {
          return { error: error?.message ?? 'AUTH_FAILED' };
        }

        setSession({
          user: data.user,
          accessToken: data.accessToken
        });
        setGuestUser(null);
        await clearStoredGuestProfile();
        return {};
      },
      signUpWithEmail: async (email, password, displayNameInput) => {
        if (!isInsForgeConfigured) {
          return { error: 'INSFORGE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { data, error } = await insforge.auth.signUp({
          email,
          password,
          name: displayNameInput || undefined,
          redirectTo: getGoogleRedirectUrl()
        });
        setIsBusy(false);

        if (error) {
          return { error: error.message };
        }

        if (data?.requireEmailVerification || !data?.accessToken || !data.user) {
          return { message: 'SIGNUP_CONFIRMATION_REQUIRED' };
        }

        setSession({
          user: data.user,
          accessToken: data.accessToken
        });
        setGuestUser(null);
        await clearStoredGuestProfile();
        return {};
      },
      signInWithGoogle: async () => {
        if (!isInsForgeConfigured) {
          return { error: 'INSFORGE_NOT_CONFIGURED' };
        }

        setIsBusy(true);
        const { error } = await insforge.auth.signInWithOAuth({
          provider: 'google',
          redirectTo: getGoogleRedirectUrl()
        });
        setIsBusy(false);

        return error ? { error: error.message } : {};
      },
      continueAsGuest: async (displayNameInput) => {
        const nextGuest = buildGuestUser(displayNameInput);
        await storeGuestProfile({
          displayName: nextGuest.profile?.name ?? 'Invitado',
          username: (nextGuest.metadata?.username as string) ?? 'guest'
        });
        setGuestUser(nextGuest);
        setSession(null);
        return {};
      },
      signOut: async () => {
        setIsBusy(true);

        if (isInsForgeConfigured) {
          await insforge.auth.signOut();
        }

        setSession(null);
        setGuestUser(null);
        await clearStoredGuestProfile();
        setIsBusy(false);
      },
      changeLanguage: async (nextLanguage) => {
        await applyLanguage(nextLanguage);
        return {};
      },
      changeTheme: async (nextTheme) => {
        await applyTheme(nextTheme);
        return {};
      },
      linkAccount: async () => {
        if (isGuest) {
          return { message: 'LINK_GUEST_ACCOUNT' };
        }

        if (!isInsForgeConfigured) {
          return { error: 'INSFORGE_NOT_CONFIGURED' };
        }

        if (!isAccountLinkingEnabled) {
          return { message: 'LINKING_REQUIRES_SETUP' };
        }

        return { message: 'LINKING_REQUIRES_SETUP' };
      }
    };
  }, [guestUser, isBusy, isReady, language, session, themePreference]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
