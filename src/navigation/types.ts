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
  id: GameId;
  name: string;
  category: 'Warm Up' | 'Social Reads' | 'Bluffing' | 'Social Deduction';
  duration: string;
  energy: 'Warm-up' | 'Social' | 'Chaotic';
  description: string;
};

export type GameId =
  | 'impostor'
  | 'guess-who'
  | 'faces-gestures'
  | 'trivia'
  | 'who-said'
  | 'majority'
  | 'troll'
  | 'whose-top';

export type GameStartHandler = GameId | 'none';

export type ImpostorMode = 'friends' | 'multiplayer';
export type ImpostorCategoryId =
  | 'animals'
  | 'countries'
  | 'objects'
  | 'faces-gestures'
  | 'famous-people'
  | 'football-players'
  | 'movies-series'
  | 'youtubers'
  | 'basketball'
  | 'f1'
  | 'singers'
  | 'cartoons-fictional'
  | 'world-foods';

export type GuessWhoCategoryId = 'popular' | 'movies-series';
export type TriviaTopicId =
  | 'famosos'
  | 'f1'
  | 'cultura-general'
  | 'marcas'
  | 'personajes-ficticios'
  | 'objetos';

export type WhoSaidTopicId =
  | 'comida'
  | 'famosos'
  | 'peliculas-series'
  | 'musica'
  | 'deportes'
  | 'libre';

export type MajorityCategoryId =
  | 'comida'
  | 'gustos'
  | 'peliculas-series'
  | 'musica'
  | 'random'
  | 'amigos';

export type WhoseTopCategoryId =
  | 'mejores-actores'
  | 'mejores-comidas'
  | 'mejores-peliculas'
  | 'mejores-videojuegos'
  | 'mejores-cantantes'
  | 'mejores-marcas';

export type LobbyScenarioKey = 'guest' | 'noRoom' | 'activeRoom' | 'invited' | 'returning';

export type LobbyActionId =
  | 'createRoom'
  | 'joinByCode'
  | 'scanQr'
  | 'continueRoom'
  | 'openGamesCatalog'
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

export type TournamentScore = {
  userId: string;
  points: number;
};

export type ImpostorSettings = {
  turnSeconds: number;
  impostorCount: number;
  themeCategory: ImpostorCategoryId;
  missBehavior: 'repeat' | 'end';
  balanceEndsGame: boolean;
};

export type GuessWhoSettings = {
  category: GuessWhoCategoryId;
};

export type FacesGesturesSettings = {
  turnSeconds: number;
};

export type TriviaSettings = {
  questionCount: number;
  turnSeconds: number;
  topics: TriviaTopicId[];
};

export type WhoSaidSettings = {
  topic: WhoSaidTopicId;
  writeSeconds: number;
  guessSeconds: number;
};

export type MajoritySettings = {
  category: MajorityCategoryId;
  roundCount: number;
  answerSeconds: number;
  predictionSeconds: number;
};

export type TrollSettings = {
  category: ImpostorCategoryId;
  discussionSeconds: number;
  votingSeconds: number;
  roundCount: number;
};

export type WhoseTopSettings = {
  category: WhoseTopCategoryId;
  topSize: 3 | 5 | 10;
  createSeconds: number;
  guessSeconds: number;
};

export type RoomSettings = {
  mode: 'tournament' | 'single';
  singleGameRoundCount: number;
  games: {
    impostor: ImpostorSettings;
    'guess-who': GuessWhoSettings;
    'faces-gestures': FacesGesturesSettings;
    trivia: TriviaSettings;
    'who-said': WhoSaidSettings;
    majority: MajoritySettings;
    troll: TrollSettings;
    'whose-top': WhoseTopSettings;
  };
};

export type ImpostorRoundSetup = {
  gameId: 'impostor';
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

export type GuessWhoAssignment = {
  userId: string;
  characterLabel: string | null;
  guessCount: number;
  remainingGuesses: number;
  lastGuess: string | null;
  solvedAt: string | null;
  failedAt: string | null;
  isCurrentUser: boolean;
};

export type GuessWhoRoundSetup = {
  gameId: 'guess-who';
  roundId: string;
  roundNumber: number;
  categoryId: GuessWhoCategoryId;
  assignments: GuessWhoAssignment[];
  startedAt: string;
  status: 'active' | 'finished';
  phase: 'reveal' | 'result';
};

export type FacesGesturesAnswer = {
  userId: string;
  guessCount: number;
  lastGuess: string | null;
  solvedAt: string | null;
  isCurrentUser: boolean;
};

export type FacesGesturesRoundSetup = {
  gameId: 'faces-gestures';
  roundId: string;
  roundNumber: number;
  actorUserId: string;
  characterLabel: string | null;
  answers: FacesGesturesAnswer[];
  voteDeadlineAt: string | null;
  voteDurationSeconds: number;
  startedAt: string;
  status: 'active' | 'finished';
  phase: 'reveal' | 'result';
};

export type TriviaAnswerState = {
  userId: string;
  answerText: string | null;
  isCorrect: boolean | null;
  answeredAt: string | null;
  correctCount: number;
  isCurrentUser: boolean;
};

export type TriviaRoundSetup = {
  gameId: 'trivia';
  roundId: string;
  questionId: string;
  questionOrder: number;
  questionCount: number;
  topic: TriviaTopicId;
  question: string;
  answers: TriviaAnswerState[];
  voteDeadlineAt: string | null;
  voteDurationSeconds: number;
  startedAt: string;
  status: 'active' | 'finished';
  phase: 'reveal' | 'result';
};

export type WhoSaidGuessState = {
  userId: string;
  hasSubmittedPhrase: boolean;
  guessedUserId: string | null;
  isCorrect: boolean | null;
  guessedAt: string | null;
  isCurrentUser: boolean;
};

export type WhoSaidRoundSetup = {
  gameId: 'who-said';
  roundId: string;
  roundNumber: number;
  topic: WhoSaidTopicId;
  phraseCount: number;
  submittedCount: number;
  currentPhraseId: string | null;
  currentPhraseText: string | null;
  currentPhraseOrder: number | null;
  currentPhraseAuthorUserId: string | null;
  isCurrentPhraseAuthor: boolean;
  guesses: WhoSaidGuessState[];
  voteDeadlineAt: string | null;
  voteDurationSeconds: number;
  startedAt: string;
  status: 'active' | 'finished';
  phase: 'reveal' | 'voting' | 'result';
};

export type MajorityPlayerState = {
  userId: string;
  answerOption: string | null;
  predictionOption: string | null;
  answeredAt: string | null;
  predictedAt: string | null;
  isPredictionCorrect: boolean | null;
  isCurrentUser: boolean;
};

export type MajorityRoundSetup = {
  gameId: 'majority';
  roundId: string;
  questionId: string;
  roundNumber: number;
  roundCount: number;
  category: MajorityCategoryId;
  question: string;
  options: string[];
  majorityOptions: string[];
  optionCounts: Record<string, number>;
  players: MajorityPlayerState[];
  voteDeadlineAt: string | null;
  voteDurationSeconds: number;
  startedAt: string;
  status: 'active' | 'finished';
  phase: 'reveal' | 'voting' | 'result';
};

export type TrollRole = 'innocent' | 'impostor' | 'troll';

export type TrollAssignment = {
  userId: string;
  role: TrollRole | null;
  word: string | null;
  isEliminated: boolean;
  isCurrentUser: boolean;
};

export type TrollVote = {
  voterUserId: string;
  targetUserId: string;
};

export type TrollRoundSetup = {
  gameId: 'troll';
  roundId: string;
  roundNumber: number;
  roundCount: number;
  categoryId: ImpostorCategoryId;
  realWord: string | null;
  trollWord: string | null;
  assignments: TrollAssignment[];
  votes: TrollVote[];
  eliminatedUserIds: string[];
  expelledUserId: string | null;
  voteDeadlineAt: string | null;
  voteDurationSeconds: number;
  discussionDurationSeconds: number;
  startedAt: string;
  status: 'active' | 'finished';
  phase: 'reveal' | 'voting' | 'result';
  outcome: 'troll_eliminated' | 'impostor_eliminated' | 'innocent_eliminated' | 'continue';
};

export type WhoseTopGuessState = {
  userId: string;
  hasSubmittedTop: boolean;
  guessedUserId: string | null;
  isCorrect: boolean | null;
  guessedAt: string | null;
  isCurrentUser: boolean;
};

export type WhoseTopRoundSetup = {
  gameId: 'whose-top';
  roundId: string;
  roundNumber: number;
  category: WhoseTopCategoryId;
  topSize: 3 | 5 | 10;
  optionLabels: string[];
  status: 'active' | 'finished';
  phase: 'reveal' | 'voting' | 'result';
  voteDeadlineAt: string | null;
  voteDurationSeconds: number;
  startedAt: string;
  topCount: number;
  submittedCount: number;
  currentTopId: string | null;
  currentTopItems: string[];
  currentTopOrder: number | null;
  currentTopAuthorUserId: string | null;
  isCurrentTopAuthor: boolean;
  guesses: WhoseTopGuessState[];
};

export type ActiveRoundSetup =
  | ImpostorRoundSetup
  | GuessWhoRoundSetup
  | FacesGesturesRoundSetup
  | TriviaRoundSetup
  | WhoSaidRoundSetup
  | MajorityRoundSetup
  | TrollRoundSetup
  | WhoseTopRoundSetup;
