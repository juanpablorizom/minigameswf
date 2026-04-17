import type { ActivityItem, ImpostorCategoryId, LobbyScenario, LobbyScenarioKey, MiniGame, Player, ResultEntry, RoomSettings } from '../navigation/types';

export const featuredGames: MiniGame[] = [
  {
    id: 'impostor',
    name: 'Impostor',
    category: 'Social Deduction',
    duration: '1 modo',
    energy: 'Social',
    description: 'One or more players do not know the secret word. The room talks, votes, and tries to expel every impostor.'
  }
];

export const roomPlayers: Player[] = [
  { id: 'p1', name: 'Sofia', status: 'host', mood: 'Setting the tone', score: 1260 },
  { id: 'p2', name: 'Mateo', status: 'ready', mood: 'Already trash talking', score: 1180 },
  { id: 'p3', name: 'Camila', status: 'ready', mood: 'Bringing the energy', score: 1105 },
  { id: 'p4', name: 'Diego', status: 'invited', mood: 'Joining in 2 min', score: 980 }
];

export const onlineFriends: ActivityItem[] = [
  { id: 'f1', title: 'Ana is online', subtitle: 'Down for party games after 9:30' },
  { id: 'f2', title: 'Luis opened your invite', subtitle: 'Seen 3 min ago' },
  { id: 'f3', title: 'Mar joined a public lobby', subtitle: 'Looking for 2 more players' }
];

export const lobbyHighlights: ActivityItem[] = [
  { id: 'a1', title: 'Quick table', subtitle: '3 short rounds are enough to get a room moving' },
  { id: 'a2', title: 'Best opener', subtitle: 'Impostor starts fast when everyone already knows the rules' },
  { id: 'a3', title: 'Busy hour', subtitle: 'Most friend groups are forming between 9:00 and 11:00 PM' }
];

export const roomActivity: ActivityItem[] = [
  { id: 'ra1', title: 'Mateo reacted to the invite', subtitle: 'Said he is joining with zero trust in Sofia' },
  { id: 'ra2', title: 'Lineup updated', subtitle: 'Impostor is ready as soon as the host starts the round' },
  { id: 'ra3', title: 'Room mood', subtitle: 'Private lobby, quick setup, direct vote flow' }
];

export const recentLobbyActivity: ActivityItem[] = [
  { id: 'rl1', title: 'Last session', subtitle: 'You closed a 2-round Impostor session with Sofia, Mateo, and Camila' },
  { id: 'rl2', title: 'Friend invite', subtitle: 'Ana is waiting in a private room with 2 seats open' },
  { id: 'rl3', title: 'Ready to restart', subtitle: 'Your saved room still has Impostor ready to start' }
];

export const lobbyScenarios: Record<LobbyScenarioKey, LobbyScenario> = {
  guest: {
    key: 'guest',
    greeting: 'Welcome back',
    statusLabel: 'Guest mode',
    title: 'Start fast or jump into a room by code.',
    subtitle: 'You can get into a session in seconds. Create your own room or join the one your friends already opened.',
    primaryAction: { id: 'createRoom', label: 'Create room' },
    secondaryAction: { id: 'joinByCode', label: 'Join by code', variant: 'secondary' },
    socialItems: onlineFriends.slice(0, 2),
    recommendationItems: [],
    modeIds: ['impostor']
  },
  noRoom: {
    key: 'noRoom',
    greeting: 'Tonight',
    statusLabel: 'No active room',
    title: 'No room open yet.',
    subtitle: 'Create one when your group is ready, or jump in with a room code if someone already started.',
    primaryAction: { id: 'createRoom', label: 'Create room' },
    secondaryAction: { id: 'joinByCode', label: 'Join by code', variant: 'secondary' },
    socialItems: onlineFriends,
    recommendationItems: [],
    modeIds: ['impostor']
  },
  activeRoom: {
    key: 'activeRoom',
    greeting: 'Your room is live',
    statusLabel: 'Active room',
    title: 'AX4N2 is filling up.',
    subtitle: 'Players are already inside. Keep the lineup tight and move the room into the first round.',
    primaryAction: { id: 'continueRoom', label: 'Continue room' },
    secondaryAction: { id: 'inviteFriends', label: 'Invite friends', variant: 'secondary' },
    roomSummary: {
      title: 'Private room AX4N2',
      subtitle: '4 players, Impostor listo para empezar',
      meta: 'Sofia hosting • la ronda se prepara en cuanto la abras',
      code: 'AX4N2',
      ctaLabel: 'Open room',
      ctaAction: 'continueRoom'
    },
    socialItems: roomActivity,
    recommendationItems: [],
    modeIds: ['impostor']
  },
  invited: {
    key: 'invited',
    greeting: 'You have an invite',
    statusLabel: 'Waiting room',
    title: 'Sofia opened a room for tonight.',
    subtitle: 'Your friends already chose the tone. Join directly and finish the setup inside the room.',
    primaryAction: { id: 'continueRoom', label: 'Open invite' },
    secondaryAction: { id: 'createRoom', label: 'Create your room instead', variant: 'ghost' },
    invite: {
      title: 'Invite from Sofia',
      subtitle: '3 players are in. The host left Impostor ready to start.',
      fromLabel: 'Starts when you join',
      code: 'AX4N2',
      ctaLabel: 'Join room',
      ctaAction: 'continueRoom'
    },
    socialItems: onlineFriends,
    recommendationItems: [],
    modeIds: ['impostor']
  },
  returning: {
    key: 'returning',
    greeting: 'Pick up where you left off',
    statusLabel: 'Recent session',
    title: 'Your last room is ready to continue.',
    subtitle: 'Resume the same group, replay the stack, or switch one game before the next round starts.',
    primaryAction: { id: 'resumeActivity', label: 'Resume last activity' },
    secondaryAction: { id: 'createRoom', label: 'Start fresh', variant: 'secondary' },
    roomSummary: {
      title: 'Last room AX4N2',
      subtitle: 'Same 4-player group, same Impostor setup still active',
      meta: 'Finished 1 session • ready for replay',
      code: 'AX4N2',
      ctaLabel: 'Reopen room',
      ctaAction: 'continueRoom'
    },
    recentActivity: {
      title: 'Results are still fresh',
      subtitle: 'The room can jump straight back into another Impostor round.',
      ctaLabel: 'Replay now',
      ctaAction: 'resumeActivity'
    },
    socialItems: recentLobbyActivity,
    recommendationItems: [],
    modeIds: ['impostor']
  }
};

export const sessionRecognitions: ActivityItem[] = [
  { id: 'sr1', title: 'Smoothest bluff', subtitle: 'Mateo sold the room on an obviously bad answer' },
  { id: 'sr2', title: 'Best read', subtitle: 'Sofia called the fake answer before the timer ended' },
  { id: 'sr3', title: 'Crowd favorite', subtitle: 'Camila kept the table moving every round' }
];

export const initialSelectedGameIds = ['impostor'];

export const initialRoomSettings: RoomSettings = {
  turnSeconds: 45,
  impostorCount: 1,
  themeCategory: 'animals',
  missBehavior: 'repeat',
  balanceEndsGame: true
};

export const podium: ResultEntry[] = [
  { id: 'r1', name: 'Mateo', points: 1480, change: '+300', badge: 'Master Bluff' },
  { id: 'r2', name: 'Sofia', points: 1410, change: '+150', badge: 'Sharpest Read' },
  { id: 'r3', name: 'Camila', points: 1360, change: '+255', badge: 'Crowd Control' },
  { id: 'r4', name: 'Diego', points: 1120, change: '+140', badge: 'Late Hero' }
];
