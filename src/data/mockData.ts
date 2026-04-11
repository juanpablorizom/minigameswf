import type { ActivityItem, LobbyScenario, LobbyScenarioKey, MiniGame, Player, ResultEntry, RoomSettings } from '../navigation/types';

export const featuredGames: MiniGame[] = [
  {
    id: 'signal-drop',
    name: 'Signal Drop',
    category: 'Warm Up',
    duration: '4 min',
    energy: 'Warm-up',
    description: 'Everyone guesses the hidden word from half-finished clues and fake confidence.'
  },
  {
    id: 'hot-seat',
    name: 'Hot Seat',
    category: 'Social Reads',
    duration: '6 min',
    energy: 'Social',
    description: 'One player answers fast prompts while the room piles on the pressure.'
  },
  {
    id: 'mentiroso-profesional',
    name: 'Mentiroso Profesional',
    category: 'Bluffing',
    duration: '5 min',
    energy: 'Chaotic',
    description: 'Pick the most believable lie under pressure, then defend it like you meant it all along.'
  },
  {
    id: 'after-hours',
    name: 'After Hours',
    category: 'Bluffing',
    duration: '7 min',
    energy: 'Chaotic',
    description: 'Players bluff their way through impossible social scenarios and vote on the smoothest save.'
  },
  {
    id: 'close-call',
    name: 'Close Call',
    category: 'Social Reads',
    duration: '5 min',
    energy: 'Social',
    description: 'The room ranks wild choices, then fights over who really knows the group best.'
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
  { id: 'a2', title: 'Best opener', subtitle: 'Mentiroso Profesional keeps invites from stalling' },
  { id: 'a3', title: 'Busy hour', subtitle: 'Most friend groups are forming between 9:00 and 11:00 PM' }
];

export const roomActivity: ActivityItem[] = [
  { id: 'ra1', title: 'Mateo reacted to the invite', subtitle: 'Said he is joining with zero trust in Sofia' },
  { id: 'ra2', title: 'Lineup updated', subtitle: 'Mentiroso Profesional moved to the first round' },
  { id: 'ra3', title: 'Room mood', subtitle: 'Casual banter on, quick pace, private lobby' }
];

export const recentLobbyActivity: ActivityItem[] = [
  { id: 'rl1', title: 'Last session', subtitle: 'You ended on a 2-round bluff stack with Sofia, Mateo, and Camila' },
  { id: 'rl2', title: 'Friend invite', subtitle: 'Ana is waiting in a private room with 2 seats open' },
  { id: 'rl3', title: 'Ready to restart', subtitle: 'Your saved lineup still opens with Mentiroso Profesional' }
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
    recommendationItems: [
      { id: 'gr1', title: 'Best first game', subtitle: 'Mentiroso Profesional lands fast even with mixed groups' },
      { id: 'gr2', title: 'Short stack', subtitle: 'Signal Drop + Hot Seat + Mentiroso Profesional' }
    ],
    modeIds: ['mentiroso-profesional', 'signal-drop', 'hot-seat']
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
    recommendationItems: lobbyHighlights,
    modeIds: ['mentiroso-profesional', 'close-call', 'signal-drop']
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
      subtitle: '4 players, 3 games selected, casual pacing',
      meta: 'Sofia hosting • Mentiroso Profesional starts first',
      code: 'AX4N2',
      ctaLabel: 'Open room',
      ctaAction: 'continueRoom'
    },
    socialItems: roomActivity,
    recommendationItems: [
      { id: 'ar1', title: 'Best next step', subtitle: 'Lock invites now so the first round starts clean' },
      { id: 'ar2', title: 'Room tempo', subtitle: 'Current stack runs about 18 minutes with your settings' }
    ],
    modeIds: ['mentiroso-profesional', 'after-hours', 'close-call']
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
      subtitle: '3 players are in. First game starts with Mentiroso Profesional.',
      fromLabel: 'Starts when you join',
      code: 'AX4N2',
      ctaLabel: 'Join room',
      ctaAction: 'continueRoom'
    },
    socialItems: onlineFriends,
    recommendationItems: recentLobbyActivity.slice(0, 2),
    modeIds: ['mentiroso-profesional', 'hot-seat', 'close-call']
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
      subtitle: 'Same 4-player group, saved settings still active',
      meta: 'Finished 1 session • ready for replay',
      code: 'AX4N2',
      ctaLabel: 'Reopen room',
      ctaAction: 'continueRoom'
    },
    recentActivity: {
      title: 'Results are still fresh',
      subtitle: 'Mateo took the last podium. Run it back before the room cools down.',
      ctaLabel: 'Replay now',
      ctaAction: 'resumeActivity'
    },
    socialItems: recentLobbyActivity,
    recommendationItems: [
      { id: 'rr1', title: 'Fast rematch', subtitle: 'Keep the same stack and shorten the timer to 35 seconds' },
      { id: 'rr2', title: 'Small change', subtitle: 'Swap After Hours for Signal Drop if the room wants a lighter start' }
    ],
    modeIds: ['mentiroso-profesional', 'signal-drop', 'after-hours']
  }
};

export const sessionRecognitions: ActivityItem[] = [
  { id: 'sr1', title: 'Smoothest bluff', subtitle: 'Mateo sold the room on an obviously bad answer' },
  { id: 'sr2', title: 'Best read', subtitle: 'Sofia called the fake answer before the timer ended' },
  { id: 'sr3', title: 'Crowd favorite', subtitle: 'Camila kept the table moving every round' }
];

export const initialSelectedGameIds = ['mentiroso-profesional', 'after-hours', 'close-call'];

export const initialRoomSettings: RoomSettings = {
  maxPlayers: 8,
  rounds: 3,
  turnSeconds: 45,
  privacy: 'Invite only',
  vibe: 'Balanced',
  format: 'Casual',
  chatEnabled: true
};

export const podium: ResultEntry[] = [
  { id: 'r1', name: 'Mateo', points: 1480, change: '+300', badge: 'Master Bluff' },
  { id: 'r2', name: 'Sofia', points: 1410, change: '+150', badge: 'Sharpest Read' },
  { id: 'r3', name: 'Camila', points: 1360, change: '+255', badge: 'Crowd Control' },
  { id: 'r4', name: 'Diego', points: 1120, change: '+140', badge: 'Late Hero' }
];
