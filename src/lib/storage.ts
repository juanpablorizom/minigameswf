import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type AppLanguage = 'es' | 'en';
export type AppThemePreference = 'default' | 'geo-style';
export type GuestProfile = {
  displayName: string;
  username: string;
};

const LANGUAGE_STORAGE_KEY = 'minigameswf.language';
const THEME_STORAGE_KEY = 'minigameswf.theme';
const GUEST_PROFILE_STORAGE_KEY = 'minigameswf.guest-profile';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const webStorage: StorageAdapter = {
  async getItem(key) {
    if (typeof globalThis.localStorage === 'undefined') {
      return null;
    }

    return globalThis.localStorage.getItem(key);
  },
  async setItem(key, value) {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.setItem(key, value);
  },
  async removeItem(key) {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.removeItem(key);
  }
};

export const appStorage: StorageAdapter = Platform.OS === 'web' ? webStorage : AsyncStorage;

export async function loadStoredLanguage() {
  const value = await appStorage.getItem(LANGUAGE_STORAGE_KEY);

  return value === 'en' ? 'en' : 'es';
}

export async function storeLanguage(language: AppLanguage) {
  await appStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export async function loadStoredTheme() {
  const value = await appStorage.getItem(THEME_STORAGE_KEY);

  if (value === 'geo-style') {
    return value;
  }

  return 'default';
}

export async function storeTheme(theme: AppThemePreference) {
  await appStorage.setItem(THEME_STORAGE_KEY, theme);
}

export async function loadStoredGuestProfile() {
  const value = await appStorage.getItem(GUEST_PROFILE_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<GuestProfile>;

    if (typeof parsed.displayName !== 'string' || typeof parsed.username !== 'string') {
      return null;
    }

    return {
      displayName: parsed.displayName,
      username: parsed.username
    };
  } catch {
    return null;
  }
}

export async function storeGuestProfile(profile: GuestProfile) {
  await appStorage.setItem(GUEST_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function clearStoredGuestProfile() {
  await appStorage.removeItem(GUEST_PROFILE_STORAGE_KEY);
}
