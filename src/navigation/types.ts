export type ScreenName =
  | 'welcome'
  | 'lobby'
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

export type UserProfile = {
  name: string;
};
