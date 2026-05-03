import type { ImageSourcePropType } from 'react-native';

export const DEFAULT_AVATAR_ID = 'devil';

export type AvatarCatalogItem = {
  id: string;
  labelKey: string;
  source: ImageSourcePropType;
};

export type FrameCatalogItem = {
  id: string;
  label: string;
  borderColor: string | null;
  borderWidth: number;
  borderStyle?: 'solid' | 'dashed';
};

export const AVATAR_CATALOG: AvatarCatalogItem[] = [
  { id: 'devil', labelKey: 'avatars.devil', source: require('../ui/assets/avatars/devil.png') },
  { id: 'joker', labelKey: 'avatars.joker', source: require('../ui/assets/avatars/joker.png') }
];

export const FRAME_CATALOG: FrameCatalogItem[] = [
  { id: 'plain', label: 'Sin marco', borderColor: null, borderWidth: 0 },
  { id: 'gold', label: 'Oro', borderColor: '#E0B544', borderWidth: 3 },
  { id: 'crimson', label: 'Carmesí', borderColor: '#B5394A', borderWidth: 3 },
  { id: 'mint', label: 'Menta', borderColor: '#5BC9A1', borderWidth: 3 },
  { id: 'dashed', label: 'Discontinuo', borderColor: '#9F8C70', borderWidth: 2, borderStyle: 'dashed' }
];

export function getAvatarById(avatarId: string | null | undefined) {
  return AVATAR_CATALOG.find((avatar) => avatar.id === avatarId) ?? AVATAR_CATALOG.find((avatar) => avatar.id === DEFAULT_AVATAR_ID) ?? AVATAR_CATALOG[0];
}

export function getFrameById(frameId: string | null | undefined) {
  return FRAME_CATALOG.find((frame) => frame.id === frameId) ?? FRAME_CATALOG[0];
}
