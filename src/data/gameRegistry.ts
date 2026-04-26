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
const facesGesturesThumbnail = require('../ui/assets/game-covers/faces-gestures.png');
const triviaThumbnail = require('../ui/assets/game-covers/trivia.png');
const whoSaidThumbnail = require('../ui/assets/game-covers/who-said.png');
const majorityThumbnail = require('../ui/assets/game-covers/majority.png');
const trollThumbnail = require('../ui/assets/game-covers/troll.png');

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
  },
  'faces-gestures': {
    id: 'faces-gestures',
    name: 'Caras y Gestos',
    nameKey: 'gameMeta.names.faces-gestures',
    category: 'Warm Up',
    duration: '60s',
    energy: 'Warm-up',
    description: 'Un actor interpreta. Los demas adivinan.',
    descriptionKey: 'gameMeta.descriptions.faces-gestures',
    thumbnail: facesGesturesThumbnail,
    minPlayers: 2,
    startHandler: 'faces-gestures',
    hasSettings: true
  },
  trivia: {
    id: 'trivia',
    name: 'Trivia',
    nameKey: 'gameMeta.names.trivia',
    category: 'Warm Up',
    duration: 'Quiz',
    energy: 'Social',
    description: 'Preguntas rapidas por temas.',
    descriptionKey: 'gameMeta.descriptions.trivia',
    thumbnail: triviaThumbnail,
    minPlayers: 1,
    startHandler: 'trivia',
    hasSettings: true
  },
  'who-said': {
    id: 'who-said',
    name: '¿Quién dijo esto?',
    nameKey: 'gameMeta.names.who-said',
    category: 'Social Reads',
    duration: 'Frases',
    energy: 'Social',
    description: 'Escribe frases anonimas. La sala adivina.',
    descriptionKey: 'gameMeta.descriptions.who-said',
    thumbnail: whoSaidThumbnail,
    minPlayers: 2,
    startHandler: 'who-said',
    hasSettings: true
  },
  majority: {
    id: 'majority',
    name: 'Adivina la mayoría',
    nameKey: 'gameMeta.names.majority',
    category: 'Social Reads',
    duration: 'Mayoría',
    energy: 'Social',
    description: 'Elige. Luego predice la mayoría.',
    descriptionKey: 'gameMeta.descriptions.majority',
    thumbnail: majorityThumbnail,
    minPlayers: 2,
    startHandler: 'majority',
    hasSettings: true
  },
  troll: {
    id: 'troll',
    name: 'Troll Diferente',
    nameKey: 'gameMeta.names.troll',
    category: 'Social Deduction',
    duration: 'Roles',
    energy: 'Social',
    description: 'Una palabra real, un impostor y un troll.',
    descriptionKey: 'gameMeta.descriptions.troll',
    thumbnail: trollThumbnail,
    minPlayers: 4,
    startHandler: 'troll',
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
