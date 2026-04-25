import type { ImpostorCategoryId, LobbyScenario, LobbyScenarioKey, MiniGame, Player, ResultEntry, RoomSettings } from '../navigation/types';

export const featuredGames: MiniGame[] = [
  {
    id: 'impostor',
    name: 'Impostor',
    category: 'Social Deduction',
    duration: '1 modo',
    energy: 'Social',
    description: 'One or more players do not know the secret word. The room talks, votes, and tries to expel every impostor.'
  },
  {
    id: 'guess-who',
    name: 'Adivina Quién Soy',
    category: 'Social Deduction',
    duration: '2 intentos',
    energy: 'Social',
    description: 'See everyone else, guess yourself.'
  }
];

export const roomPlayers: Player[] = [
  { id: 'p1', name: 'Sofia', status: 'host', mood: 'Setting the tone', score: 1260 },
  { id: 'p2', name: 'Mateo', status: 'ready', mood: 'Already trash talking', score: 1180 },
  { id: 'p3', name: 'Camila', status: 'ready', mood: 'Bringing the energy', score: 1105 },
  { id: 'p4', name: 'Diego', status: 'invited', mood: 'Joining in 2 min', score: 980 }
];

export const lobbyScenarios: Record<LobbyScenarioKey, LobbyScenario> = {
  guest: {
    key: 'guest',
    statusLabel: 'Guest mode',
    title: 'Start fast or jump into a room by code.',
    subtitle: 'You can get into a session in seconds. Create your own room or join the one your friends already opened.',
    primaryAction: { id: 'createRoom', label: 'Create room' },
    secondaryAction: { id: 'joinByCode', label: 'Join by code', variant: 'secondary' },
    modeIds: ['impostor']
  },
  noRoom: {
    key: 'noRoom',
    statusLabel: 'No active room',
    title: 'No room open yet.',
    subtitle: 'Create one when your group is ready, or jump in with a room code if someone already started.',
    primaryAction: { id: 'createRoom', label: 'Create room' },
    secondaryAction: { id: 'joinByCode', label: 'Join by code', variant: 'secondary' },
    modeIds: ['impostor']
  },
  activeRoom: {
    key: 'activeRoom',
    statusLabel: 'Active room',
    title: 'AX4N2 is filling up.',
    subtitle: 'Players are already inside. Keep the lineup tight and move the room into the first round.',
    primaryAction: { id: 'continueRoom', label: 'Continue room' },
    secondaryAction: { id: 'inviteFriends', label: 'Invite friends', variant: 'secondary' },
    modeIds: ['impostor']
  },
  invited: {
    key: 'invited',
    statusLabel: 'Waiting room',
    title: 'Sofia opened a room for tonight.',
    subtitle: 'Your friends already chose the tone. Join directly and finish the setup inside the room.',
    primaryAction: { id: 'continueRoom', label: 'Open invite' },
    secondaryAction: { id: 'createRoom', label: 'Create your room instead', variant: 'ghost' },
    modeIds: ['impostor']
  },
  returning: {
    key: 'returning',
    statusLabel: 'Recent session',
    title: 'Your last room is ready to continue.',
    subtitle: 'Resume the same group, replay the stack, or switch one game before the next round starts.',
    primaryAction: { id: 'resumeActivity', label: 'Resume last activity' },
    secondaryAction: { id: 'createRoom', label: 'Start fresh', variant: 'secondary' },
    modeIds: ['impostor']
  }
};

export const initialSelectedGameIds = ['impostor', 'guess-who'];

export const initialRoomSettings: RoomSettings = {
  turnSeconds: 45,
  impostorCount: 1,
  themeCategory: 'animals',
  guessWhoCategory: 'popular',
  missBehavior: 'repeat',
  balanceEndsGame: true
};

export const podium: ResultEntry[] = [
  { id: 'r1', name: 'Mateo', points: 1480, change: '+300', badge: 'Master Bluff' },
  { id: 'r2', name: 'Sofia', points: 1410, change: '+150', badge: 'Sharpest Read' },
  { id: 'r3', name: 'Camila', points: 1360, change: '+255', badge: 'Crowd Control' },
  { id: 'r4', name: 'Diego', points: 1120, change: '+140', badge: 'Late Hero' }
];
