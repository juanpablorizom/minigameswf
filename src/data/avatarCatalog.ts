export type AvatarCatalogItem = {
  id: string;
  label: string;
  kind: 'default' | 'emoji';
  emoji?: string;
};

export type FrameCatalogItem = {
  id: string;
  label: string;
  borderColor: string | null;
  borderWidth: number;
  borderStyle?: 'solid' | 'dashed';
};

export const AVATAR_CATALOG: AvatarCatalogItem[] = [
  { id: 'default', label: 'Silueta', kind: 'default' },
  { id: 'devil', label: 'Diablito', kind: 'emoji', emoji: '😈' },
  { id: 'joker', label: 'Joker', kind: 'emoji', emoji: '🃏' },
  { id: 'masked', label: 'Enmascarado', kind: 'emoji', emoji: '🎭' },
  { id: 'innocent', label: 'Inocente', kind: 'emoji', emoji: '🙂' },
  { id: 'star', label: 'Estrella', kind: 'emoji', emoji: '⭐' },
  { id: 'spark', label: 'Chispa', kind: 'emoji', emoji: '⚡' }
];

export const FRAME_CATALOG: FrameCatalogItem[] = [
  { id: 'plain', label: 'Sin marco', borderColor: null, borderWidth: 0 },
  { id: 'gold', label: 'Oro', borderColor: '#E0B544', borderWidth: 3 },
  { id: 'crimson', label: 'Carmesí', borderColor: '#B5394A', borderWidth: 3 },
  { id: 'mint', label: 'Menta', borderColor: '#5BC9A1', borderWidth: 3 },
  { id: 'dashed', label: 'Discontinuo', borderColor: '#9F8C70', borderWidth: 2, borderStyle: 'dashed' }
];

export function getAvatarById(avatarId: string | null | undefined) {
  return AVATAR_CATALOG.find((avatar) => avatar.id === avatarId) ?? AVATAR_CATALOG[0];
}

export function getFrameById(frameId: string | null | undefined) {
  return FRAME_CATALOG.find((frame) => frame.id === frameId) ?? FRAME_CATALOG[0];
}
