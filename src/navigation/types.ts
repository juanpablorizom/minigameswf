export type AppTab = 'account' | 'games' | 'settings';

export type ScreenName =
  | 'lobby'
  | 'joinRoom'
  | 'scanRoom'
  | 'room'
  | 'chooseGames'
  | 'roomSettings'
  | 'gameplay'
  | 'results';

export type Player = {
  id: string;
  name: string;
  status: 'host' | 'ready' | 'invited' | 'playing';
  mood: string;
  score: number;
  isCurrentUser?: boolean;
};

export type MiniGame = {
  id: string;
  name: string;
  category: 'Warm Up' | 'Social Reads' | 'Bluffing' | 'Social Deduction';
  duration: string;
  energy: 'Warm-up' | 'Social' | 'Chaotic';
  description: string;
};

export type ImpostorMode = 'friends' | 'multiplayer';
export type ImpostorCategoryId =
  | 'animals'
  | 'countries'
  | 'objects'
  | 'famous-people'
  | 'football-players'
  | 'movies-series'
  | 'youtubers'
  | 'basketball'
  | 'f1'
  | 'singers'
  | 'cartoons-fictional'
  | 'world-foods';

export type LobbyScenarioKey = 'guest' | 'noRoom' | 'activeRoom' | 'invited' | 'returning';

export type LobbyActionId =
  | 'createRoom'
  | 'joinByCode'
  | 'scanQr'
  | 'continueRoom'
  | 'inviteFriends'
  | 'resumeActivity'
  | 'quickPlay';

export type LobbyAction = {
  id: LobbyActionId;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export type LobbyScenario = {
  key: LobbyScenarioKey;
  statusLabel: string;
  title: string;
  subtitle: string;
  primaryAction: LobbyAction;
  secondaryAction?: LobbyAction;
  modeIds: string[];
};

export type ResultEntry = {
  id: string;
  name: string;
  points: number;
  change: string;
  badge: string;
};

export type RoomSettings = {
  turnSeconds: number;
  impostorCount: number;
  themeCategory: ImpostorCategoryId;
  missBehavior: 'repeat' | 'end';
  balanceEndsGame: boolean;
};

export type ImpostorRoundSetup = {
  roundId: string;
  roundNumber: number;
  categoryId: ImpostorCategoryId;
  secretWord: string;
  impostorIds: string[];
  eliminatedUserIds: string[];
  expelledUserId: string | null;
  phase: 'reveal' | 'voting' | 'result';
  voteDeadlineAt: string | null;
  voteDurationSeconds: number;
  missBehavior: 'repeat' | 'end';
  balanceEndsGame: boolean;
  votes: Array<{
    voterUserId: string;
    targetUserId: string;
  }>;
  startedAt: string;
  status: 'active' | 'finished';
  outcome: 'impostors_caught' | 'impostors_balanced' | 'missed_impostor' | 'continue';
};
