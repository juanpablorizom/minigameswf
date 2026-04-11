export type AppTab = 'account' | 'games' | 'settings';

export type ScreenName =
  | 'lobby'
  | 'joinRoom'
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
};

export type MiniGame = {
  id: string;
  name: string;
  category: 'Warm Up' | 'Social Reads' | 'Bluffing';
  duration: string;
  energy: 'Warm-up' | 'Social' | 'Chaotic';
  description: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
};

export type LobbyScenarioKey = 'guest' | 'noRoom' | 'activeRoom' | 'invited' | 'returning';

export type LobbyActionId =
  | 'createRoom'
  | 'joinByCode'
  | 'continueRoom'
  | 'inviteFriends'
  | 'resumeActivity'
  | 'quickPlay';

export type LobbyAction = {
  id: LobbyActionId;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export type LobbyRoomSummary = {
  title: string;
  subtitle: string;
  meta: string;
  code: string;
  ctaLabel: string;
  ctaAction: LobbyActionId;
};

export type LobbyInvite = {
  title: string;
  subtitle: string;
  fromLabel: string;
  code: string;
  ctaLabel: string;
  ctaAction: LobbyActionId;
};

export type LobbyRecentActivity = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaAction: LobbyActionId;
};

export type LobbyScenario = {
  key: LobbyScenarioKey;
  greeting: string;
  statusLabel: string;
  title: string;
  subtitle: string;
  primaryAction: LobbyAction;
  secondaryAction?: LobbyAction;
  roomSummary?: LobbyRoomSummary;
  invite?: LobbyInvite;
  recentActivity?: LobbyRecentActivity;
  socialItems: ActivityItem[];
  recommendationItems: ActivityItem[];
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
  maxPlayers: number;
  rounds: number;
  turnSeconds: number;
  privacy: 'Invite only' | 'Friends of friends';
  vibe: 'Balanced' | 'Fast' | 'Talkative';
  format: 'Casual' | 'Competitive';
  chatEnabled: boolean;
};
