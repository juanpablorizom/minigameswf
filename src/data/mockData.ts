import type { ActivityItem, MiniGame, Player, ResultEntry, RoomSettings } from '../navigation/types';

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
  { id: 'a1', title: 'Tonight’s pick', subtitle: '3 fast games, 20-minute session, private room' },
  { id: 'a2', title: 'Featured mode', subtitle: 'Mentiroso Profesional is trending with friend groups tonight' },
  { id: 'a3', title: 'Good timing', subtitle: 'Peak friend activity between 9:00 and 11:00 PM' }
];

export const roomActivity: ActivityItem[] = [
  { id: 'ra1', title: 'Mateo reacted to the invite', subtitle: 'Said he is joining with zero trust in Sofia' },
  { id: 'ra2', title: 'Lineup updated', subtitle: 'Mentiroso Profesional moved to the first round' },
  { id: 'ra3', title: 'Room mood', subtitle: 'Casual banter on, quick pace, private lobby' }
];

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
