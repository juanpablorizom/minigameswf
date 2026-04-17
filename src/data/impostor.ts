import type { ImpostorRoundSetup, Player, RoomSettings } from '../navigation/types';

import { impostorThemeWords } from './themes';

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function buildImpostorRound(players: Player[], settings: RoomSettings): ImpostorRoundSetup {
  const eligiblePlayers = players.filter((player) => player.status !== 'invited');
  const safePlayers = eligiblePlayers.length ? eligiblePlayers : players;
  const words = impostorThemeWords[settings.themeCategory];
  
  if (!safePlayers.length) {
    return {
      roundId: 'local-round',
      roundNumber: 1,
      categoryId: settings.themeCategory,
      secretWord: randomItem(words),
      impostorIds: [],
      eliminatedUserIds: [],
      expelledUserId: null,
      phase: 'voting',
      voteDeadlineAt: null,
      voteDurationSeconds: settings.turnSeconds,
      missBehavior: settings.missBehavior,
      balanceEndsGame: settings.balanceEndsGame,
      votes: [],
      startedAt: new Date().toISOString(),
      status: 'active',
      outcome: 'continue'
    };
  }

  const totalImpostors = Math.min(Math.max(settings.impostorCount, 1), Math.max(1, safePlayers.length - 1 || 1));
  const impostorIds = shuffle(safePlayers)
    .slice(0, totalImpostors)
    .map((player) => player.id);

  return {
    roundId: 'local-round',
    roundNumber: 1,
    categoryId: settings.themeCategory,
    secretWord: randomItem(words),
    impostorIds,
    eliminatedUserIds: [],
    expelledUserId: null,
    phase: 'voting',
    voteDeadlineAt: null,
    voteDurationSeconds: settings.turnSeconds,
    missBehavior: settings.missBehavior,
    balanceEndsGame: settings.balanceEndsGame,
    votes: [],
    startedAt: new Date().toISOString(),
    status: 'active',
    outcome: 'continue'
  };
}
