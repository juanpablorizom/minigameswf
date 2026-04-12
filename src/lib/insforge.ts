import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.EXPO_PUBLIC_INSFORGE_URL;
const insforgeAnonKey = process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY;

export const isInsForgeConfigured = Boolean(insforgeUrl && insforgeAnonKey);
export const isAccountLinkingEnabled = process.env.EXPO_PUBLIC_ENABLE_ACCOUNT_LINKING === 'true';

export const insforge = createClient({
  baseUrl: insforgeUrl ?? 'https://placeholder.insforge.app',
  anonKey: insforgeAnonKey,
  autoRefreshToken: true
});
