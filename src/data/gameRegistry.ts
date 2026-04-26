import type { ImageSourcePropType } from 'react-native';

import type { GameId, GameStartHandler, MiniGame } from '../navigation/types';

type GameRegistryEntry = MiniGame & {
  nameKey: string;
  descriptionKey: string;
  thumbnail: ImageSourcePropType;
  minPlayers: number;
  startHandler: GameStartHandler;
  hasSettings: boolean;
};

const impostorThumbnail = require('../ui/assets/impostor-catalog-cover.png');
const guessWhoThumbnail = require('../ui/assets/game-covers/guess-who.png');

export const gameRegistry: Record<GameId, GameRegistryEntry> = {
  impostor: {
    id: 'impostor',
    name: 'Impostor',
    nameKey: 'gameMeta.names.impostor',
    category: 'Social Deduction',
    duration: '1 modo',
    energy: 'Social',
    description: 'One or more players do not know the secret word. The room talks, votes, and tries to expel every impostor.',
    descriptionKey: 'gameMeta.descriptions.impostor',
    thumbnail: impostorThumbnail,
    minPlayers: 3,
    startHandler: 'impostor',
    hasSettings: true
  },
  'guess-who': {
    id: 'guess-who',
    name: 'Adivina Quién Soy',
    nameKey: 'gameMeta.names.guess-who',
    category: 'Social Deduction',
    duration: '2 intentos',
    energy: 'Social',
    description: 'See everyone else, guess yourself.',
    descriptionKey: 'gameMeta.descriptions.guess-who',
    thumbnail: guessWhoThumbnail,
    minPlayers: 2,
    startHandler: 'guess-who',
    hasSettings: true
  }
};

export const gameRegistryList = Object.values(gameRegistry);

export function normalizeGameIds(gameIds: Array<string | null | undefined>) {
  const selected = gameIds.filter((gameId): gameId is GameId => Boolean(gameId && gameId in gameRegistry));
  const uniqueSelected = Array.from(new Set(selected));

  return uniqueSelected.length ? uniqueSelected : (['impostor'] satisfies GameId[]);
}

export function getGamesByIds(gameIds: Array<string | null | undefined>) {
  return normalizeGameIds(gameIds).map((gameId) => gameRegistry[gameId]);
}
