import { supabase } from '../lib/supabase';
import type { Database, RoomMemberRole, RoomStatus } from '../lib/supabase.types';
import { gameRegistry, normalizeGameIds } from './gameRegistry';
import type {
  ActiveRoundSetup,
  FacesGesturesAnswer,
  FacesGesturesRoundSetup,
  GameId,
  GuessWhoAssignment,
  GuessWhoCategoryId,
  GuessWhoRoundSetup,
  ImpostorCategoryId,
  ImpostorRoundSetup,
  MajorityCategoryId,
  MajorityPlayerState,
  MajorityRoundSetup,
  TournamentScore,
  TriviaAnswerState,
  TriviaRoundSetup,
  TriviaTopicId,
  TrollAssignment,
  TrollRole,
  TrollRoundSetup,
  WhoseTopCategoryId,
  WhoseTopGuessState,
  WhoseTopRoundSetup,
  WhoSaidGuessState,
  WhoSaidRoundSetup,
  WhoSaidTopicId
} from '../navigation/types';

export type RoomRow = Database['public']['Tables']['rooms']['Row'];
export type RoomMemberRow = Database['public']['Tables']['room_members']['Row'];
export type RoomRoundRow = Database['public']['Tables']['room_rounds']['Row'];
export type RoomRoundVoteRow = Database['public']['Tables']['room_round_votes']['Row'];
export type RoomGuessWhoAssignmentRow = Database['public']['Tables']['room_guess_who_assignments']['Row'];
export type RoomFacesGesturesAnswerRow = Database['public']['Tables']['room_faces_gestures_answers']['Row'];
export type RoomTriviaAnswerRow = Database['public']['Tables']['room_trivia_answers']['Row'];
export type RoomWhoSaidPhraseRow = Database['public']['Tables']['room_who_said_phrases']['Row'];
export type RoomWhoSaidGuessRow = Database['public']['Tables']['room_who_said_guesses']['Row'];
export type RoomMajorityResponseRow = Database['public']['Tables']['room_majority_responses']['Row'];
export type RoomTrollAssignmentRow = Database['public']['Tables']['room_troll_assignments']['Row'];
export type RoomWhoseTopSubmissionRow = Database['public']['Tables']['room_whose_top_submissions']['Row'];
export type RoomWhoseTopGuessRow = Database['public']['Tables']['room_whose_top_guesses']['Row'];
export type RoomTournamentScoreRow = Database['public']['Tables']['room_tournament_scores']['Row'];
export type RoomTournamentCompletedGameRow = Database['public']['Tables']['room_tournament_completed_games']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type RoomMemberView = {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: RoomMemberRole;
  joinedAt: string;
  isActive: boolean;
  isCurrentUser: boolean;
};

export type RoomDetails = {
  room: RoomRow;
  members: RoomMemberView[];
  round: ActiveRoundSetup | null;
  selectedGameIds: GameId[];
  tournament: {
    scores: TournamentScore[];
    completedGameIds: GameId[];
  };
  currentUserRole: RoomMemberRole | null;
  isHost: boolean;
};

export type RoomRealtimeState = 'idle' | 'connecting' | 'live' | 'error';

type SubscribeToRoomRealtimeOptions = {
  roomId: string;
  onRoomChange: () => void;
  onMembersChange: () => void;
  onRoundChange: () => void;
  onVotesChange: () => void;
  onConnectionStateChange?: (state: RoomRealtimeState, message?: string | null) => void;
};

type GuessWhoRoundStateRow = {
  round_id: string;
  round_number: number;
  category_id: string;
  round_status: 'active' | 'finished';
  round_phase: 'reveal' | 'result';
  started_at: string;
  user_id: string;
  character_label: string | null;
  guess_count: number;
  remaining_guesses: number;
  last_guess: string | null;
  solved_at: string | null;
  failed_at: string | null;
  is_current_user: boolean;
};

type FacesGesturesRoundStateRow = {
  round_id: string;
  round_number: number;
  actor_user_id: string;
  character_label: string | null;
  round_status: 'active' | 'finished';
  round_phase: 'reveal' | 'result';
  vote_deadline_at: string | null;
  vote_duration_seconds: number;
  started_at: string;
  user_id: string;
  guess_count: number;
  last_guess: string | null;
  solved_at: string | null;
  is_current_user: boolean;
};

type TriviaRoundStateRow = {
  round_id: string;
  question_id: string;
  question_order: number;
  question_count: number;
  topic: string;
  question: string;
  round_status: 'active' | 'finished';
  round_phase: 'reveal' | 'result';
  vote_deadline_at: string | null;
  vote_duration_seconds: number;
  started_at: string;
  user_id: string;
  answer_text: string | null;
  is_correct: boolean | null;
  answered_at: string | null;
  correct_count: number;
  is_current_user: boolean;
};

type WhoSaidRoundStateRow = {
  round_id: string;
  round_number: number;
  topic: string;
  round_status: 'active' | 'finished';
  round_phase: 'reveal' | 'voting' | 'result';
  vote_deadline_at: string | null;
  vote_duration_seconds: number;
  started_at: string;
  phrase_count: number;
  submitted_count: number;
  current_phrase_id: string | null;
  current_phrase_text: string | null;
  current_phrase_order: number | null;
  current_phrase_author_user_id: string | null;
  is_current_phrase_author: boolean;
  user_id: string;
  has_submitted_phrase: boolean;
  guessed_user_id: string | null;
  is_correct: boolean | null;
  guessed_at: string | null;
  is_current_user: boolean;
};

type WhoseTopRoundStateRow = {
  round_id: string;
  round_number: number;
  category: string;
  top_size: number;
  option_labels: string[];
  round_status: 'active' | 'finished';
  round_phase: 'reveal' | 'voting' | 'result';
  vote_deadline_at: string | null;
  vote_duration_seconds: number;
  started_at: string;
  top_count: number;
  submitted_count: number;
  current_top_id: string | null;
  current_top_items: string[];
  current_top_order: number | null;
  current_top_author_user_id: string | null;
  is_current_top_author: boolean;
  user_id: string;
  has_submitted_top: boolean;
  guessed_user_id: string | null;
  is_correct: boolean | null;
  guessed_at: string | null;
  is_current_user: boolean;
};

type MajorityRoundStateRow = {
  round_id: string;
  question_id: string;
  round_number: number;
  round_count: number;
  category: string;
  question: string;
  options: string[];
  majority_options: string[];
  option_counts: Record<string, number>;
  round_status: 'active' | 'finished';
  round_phase: 'reveal' | 'voting' | 'result';
  vote_deadline_at: string | null;
  vote_duration_seconds: number;
  started_at: string;
  user_id: string;
  answer_option: string | null;
  prediction_option: string | null;
  answered_at: string | null;
  predicted_at: string | null;
  is_prediction_correct: boolean | null;
  is_current_user: boolean;
};

type TrollRoundStateRow = {
  round_id: string;
  round_number: number;
  round_count: number;
  category_id: string;
  real_word: string | null;
  troll_word: string | null;
  round_status: 'active' | 'finished';
  round_phase: 'reveal' | 'voting' | 'result';
  vote_deadline_at: string | null;
  vote_duration_seconds: number;
  discussion_duration_seconds: number;
  started_at: string;
  outcome: 'troll_eliminated' | 'impostor_eliminated' | 'innocent_eliminated' | 'continue';
  expelled_user_id: string | null;
  eliminated_user_ids: string[];
  user_id: string;
  role: TrollRole | null;
  word: string | null;
  is_eliminated: boolean;
  is_current_user: boolean;
};

function normalizeResult<T>(data: T | T[] | null) {
  if (!data) {
    return null;
  }

  return Array.isArray(data) ? data[0] ?? null : data;
}

function buildRoomErrorMessage(message: string) {
  if (
    message.includes('column room_rounds.round_number does not exist') ||
    message.includes('column "round_number" does not exist') ||
    message.includes('column room_rounds.phase does not exist') ||
    message.includes('relation "public.room_round_votes" does not exist') ||
    message.includes('relation "public.room_who_said_phrases" does not exist') ||
    message.includes('relation "public.room_who_said_guesses" does not exist') ||
    message.includes('relation "public.room_whose_top_submissions" does not exist') ||
    message.includes('relation "public.room_whose_top_guesses" does not exist') ||
    message.includes('relation "public.room_majority_questions" does not exist') ||
    message.includes('relation "public.room_majority_responses" does not exist') ||
    message.includes('relation "public.room_troll_assignments" does not exist') ||
    message.includes('start_troll_round') ||
    message.includes('cast_troll_vote') ||
    message.includes('advance_troll_round') ||
    message.includes('get_troll_round_state') ||
    message.includes('start_whose_top_round') ||
    message.includes('submit_whose_top') ||
    message.includes('submit_whose_top_guess') ||
    message.includes('advance_whose_top_round') ||
    message.includes('get_whose_top_round_state') ||
    message.includes('room_rounds_theme_category_check')
  ) {
    return 'ROOMS_BACKEND_NOT_CONFIGURED';
  }

  if (message.includes('ROOM_NOT_FOUND')) {
    return 'ROOM_NOT_FOUND';
  }

  if (message.includes('ROOM_UNAVAILABLE')) {
    return 'ROOM_UNAVAILABLE';
  }

  if (message.includes('AUTH_REQUIRED')) {
    return 'AUTH_REQUIRED';
  }

  if (message.includes('ROOM_MEMBER_NOT_FOUND')) {
    return 'ROOM_MEMBER_NOT_FOUND';
  }

  if (message.includes('CANNOT_REMOVE_HOST')) {
    return 'CANNOT_REMOVE_HOST';
  }

  if (message.includes('ROUND_HOST_ONLY')) {
    return 'ROUND_HOST_ONLY';
  }

  if (message.includes('ROUND_THEME_NOT_FOUND')) {
    return 'ROUND_THEME_NOT_FOUND';
  }

  if (message.includes('ROUND_NO_MEMBERS')) {
    return 'ROUND_NO_MEMBERS';
  }

  if (message.includes('ROUND_MIN_PLAYERS')) {
    return 'ROUND_MIN_PLAYERS';
  }

  if (message.includes('GUESS_WHO_NO_ATTEMPTS')) {
    return 'GUESS_WHO_NO_ATTEMPTS';
  }

  if (message.includes('GUESS_WHO_ALREADY_SOLVED')) {
    return 'GUESS_WHO_ALREADY_SOLVED';
  }

  if (message.includes('FACES_GESTURES_ALREADY_SOLVED')) {
    return 'FACES_GESTURES_ALREADY_SOLVED';
  }

  if (message.includes('FACES_GESTURES_ACTOR_CANNOT_GUESS')) {
    return 'FACES_GESTURES_ACTOR_CANNOT_GUESS';
  }

  if (message.includes('ROUND_NOT_FOUND')) {
    return 'ROUND_NOT_FOUND';
  }

  if (message.includes('ROUND_NOT_VOTING')) {
    return 'ROUND_NOT_VOTING';
  }

  if (message.includes('ROUND_TARGET_NOT_FOUND')) {
    return 'ROUND_TARGET_NOT_FOUND';
  }

  if (message.includes('ROUND_TARGET_ELIMINATED')) {
    return 'ROUND_TARGET_ELIMINATED';
  }

  if (message.includes('ROUND_NOT_ACTIVE')) {
    return 'ROUND_NOT_ACTIVE';
  }

  if (message.includes('Failed to fetch') || message.includes('fetch failed') || message.includes('Network request failed')) {
    return 'BACKEND_UNREACHABLE';
  }

  if (message.includes('relation') && message.includes('does not exist')) {
    return 'ROOMS_BACKEND_NOT_CONFIGURED';
  }

  if (message.includes('infinite recursion detected in policy')) {
    return 'ROOMS_PERMISSION_DENIED';
  }

  if (message.includes('permission denied') || message.includes('42501')) {
    return 'ROOMS_PERMISSION_DENIED';
  }

  return message;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'UNKNOWN_ERROR';
}

export async function createPrivateRoom(selectedGameIds: GameId[]) {
  const { data, error } = await supabase.rpc('create_private_room', {
    p_selected_game_ids: normalizeGameIds(selectedGameIds)
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  const room = normalizeResult(data as RoomRow | RoomRow[] | null);

  if (!room) {
    throw new Error('ROOM_CREATE_FAILED');
  }

  return room;
}

export async function joinPrivateRoomByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  const { data, error } = await supabase.rpc('join_private_room', {
    p_code: normalizedCode
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  const room = normalizeResult(data as RoomRow | RoomRow[] | null);

  if (!room) {
    throw new Error('ROOM_NOT_FOUND');
  }

  return room;
}

export async function getActiveRoomIdForUser(userId: string) {
  const { data, error } = await supabase
    .from('room_members')
    .select('room_id, joined_at, rooms!inner(id, status)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('joined_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  const activeMember = (data ?? []).find((entry) => {
    const status = (entry as { rooms?: { status?: RoomStatus } }).rooms?.status;
    return status === 'waiting' || status === 'active';
  }) as { room_id: string } | undefined;

  return activeMember?.room_id ?? null;
}

async function getRoom(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data;
}

async function getRoomMembers(roomId: string) {
  const { data, error } = await supabase
    .from('room_members')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

async function closeRoomIfSingleMemberLeft(roomId: string) {
  const { count, error } = await supabase
    .from('room_members')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('is_active', true);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  if ((count ?? 0) <= 1) {
    const { error: closeError } = await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('id', roomId)
      .in('status', ['waiting', 'active']);

    if (closeError) {
      throw new Error(buildRoomErrorMessage(closeError.message));
    }
  }
}

async function getProfilesForUsers(userIds: string[]) {
  if (!userIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

async function getRoomRound(roomId: string) {
  const { data, error } = await supabase
    .from('room_rounds')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data;
}

async function getRoomRoundVotes(roundId: string | null) {
  if (!roundId) {
    return [];
  }

  const { data, error } = await supabase
    .from('room_round_votes')
    .select('*')
    .eq('round_id', roundId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

async function getRoomTournamentScores(roomId: string) {
  const { data, error } = await supabase
    .from('room_tournament_scores')
    .select('*')
    .eq('room_id', roomId)
    .order('points', { ascending: false })
    .order('updated_at', { ascending: true });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

async function getRoomTournamentCompletedGames(roomId: string) {
  const { data, error } = await supabase
    .from('room_tournament_completed_games')
    .select('*')
    .eq('room_id', roomId)
    .order('game_order', { ascending: true });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return data ?? [];
}

async function getGuessWhoRoundState(roomId: string) {
  const { data, error } = await supabase.rpc('get_guess_who_round_state', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []) as GuessWhoRoundStateRow[];
}

async function getFacesGesturesRoundState(roomId: string) {
  const { data, error } = await supabase.rpc('get_faces_gestures_round_state', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []) as FacesGesturesRoundStateRow[];
}

async function getTriviaRoundState(roomId: string) {
  const { data, error } = await supabase.rpc('get_trivia_round_state', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []) as TriviaRoundStateRow[];
}

async function getWhoSaidRoundState(roomId: string) {
  const { data, error } = await supabase.rpc('get_who_said_round_state', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []) as WhoSaidRoundStateRow[];
}

async function getWhoseTopRoundState(roomId: string) {
  const { data, error } = await supabase.rpc('get_whose_top_round_state', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []) as WhoseTopRoundStateRow[];
}

async function getMajorityRoundState(roomId: string) {
  const { data, error } = await supabase.rpc('get_majority_round_state', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []) as MajorityRoundStateRow[];
}

async function getTrollRoundState(roomId: string) {
  const { data, error } = await supabase.rpc('get_troll_round_state', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []) as TrollRoundStateRow[];
}

function mapGuessWhoRound(rows: GuessWhoRoundStateRow[]): GuessWhoRoundSetup | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const assignments: GuessWhoAssignment[] = rows.map((row) => ({
    userId: row.user_id,
    characterLabel: row.character_label,
    guessCount: row.guess_count,
    remainingGuesses: row.remaining_guesses,
    lastGuess: row.last_guess,
    solvedAt: row.solved_at,
    failedAt: row.failed_at,
    isCurrentUser: row.is_current_user
  }));

  return {
    gameId: 'guess-who',
    roundId: firstRow.round_id,
    roundNumber: firstRow.round_number,
    categoryId: firstRow.category_id as GuessWhoCategoryId,
    assignments,
    startedAt: firstRow.started_at,
    status: firstRow.round_status,
    phase: firstRow.round_phase
  };
}

function mapFacesGesturesRound(rows: FacesGesturesRoundStateRow[]): FacesGesturesRoundSetup | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const answers: FacesGesturesAnswer[] = rows.map((row) => ({
    userId: row.user_id,
    guessCount: row.guess_count,
    lastGuess: row.last_guess,
    solvedAt: row.solved_at,
    isCurrentUser: row.is_current_user
  }));

  return {
    gameId: 'faces-gestures',
    roundId: firstRow.round_id,
    roundNumber: firstRow.round_number,
    actorUserId: firstRow.actor_user_id,
    characterLabel: firstRow.character_label,
    answers,
    voteDeadlineAt: firstRow.vote_deadline_at,
    voteDurationSeconds: firstRow.vote_duration_seconds,
    startedAt: firstRow.started_at,
    status: firstRow.round_status,
    phase: firstRow.round_phase
  };
}

function mapTriviaRound(rows: TriviaRoundStateRow[]): TriviaRoundSetup | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const answers: TriviaAnswerState[] = rows.map((row) => ({
    userId: row.user_id,
    answerText: row.answer_text,
    isCorrect: row.is_correct,
    answeredAt: row.answered_at,
    correctCount: row.correct_count,
    isCurrentUser: row.is_current_user
  }));

  return {
    gameId: 'trivia',
    roundId: firstRow.round_id,
    questionId: firstRow.question_id,
    questionOrder: firstRow.question_order,
    questionCount: firstRow.question_count,
    topic: firstRow.topic as TriviaTopicId,
    question: firstRow.question,
    answers,
    voteDeadlineAt: firstRow.vote_deadline_at,
    voteDurationSeconds: firstRow.vote_duration_seconds,
    startedAt: firstRow.started_at,
    status: firstRow.round_status,
    phase: firstRow.round_phase
  };
}

function mapWhoSaidRound(rows: WhoSaidRoundStateRow[]): WhoSaidRoundSetup | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const guesses: WhoSaidGuessState[] = rows.map((row) => ({
    userId: row.user_id,
    hasSubmittedPhrase: row.has_submitted_phrase,
    guessedUserId: row.guessed_user_id,
    isCorrect: row.is_correct,
    guessedAt: row.guessed_at,
    isCurrentUser: row.is_current_user
  }));

  return {
    gameId: 'who-said',
    roundId: firstRow.round_id,
    roundNumber: firstRow.round_number,
    topic: firstRow.topic as WhoSaidTopicId,
    phraseCount: firstRow.phrase_count,
    submittedCount: firstRow.submitted_count,
    currentPhraseId: firstRow.current_phrase_id,
    currentPhraseText: firstRow.current_phrase_text,
    currentPhraseOrder: firstRow.current_phrase_order,
    currentPhraseAuthorUserId: firstRow.current_phrase_author_user_id,
    isCurrentPhraseAuthor: firstRow.is_current_phrase_author,
    guesses,
    voteDeadlineAt: firstRow.vote_deadline_at,
    voteDurationSeconds: firstRow.vote_duration_seconds,
    startedAt: firstRow.started_at,
    status: firstRow.round_status,
    phase: firstRow.round_phase
  };
}

function mapWhoseTopRound(rows: WhoseTopRoundStateRow[]): WhoseTopRoundSetup | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const guesses: WhoseTopGuessState[] = rows.map((row) => ({
    userId: row.user_id,
    hasSubmittedTop: row.has_submitted_top,
    guessedUserId: row.guessed_user_id,
    isCorrect: row.is_correct,
    guessedAt: row.guessed_at,
    isCurrentUser: row.is_current_user
  }));

  return {
    gameId: 'whose-top',
    roundId: firstRow.round_id,
    roundNumber: firstRow.round_number,
    category: firstRow.category as WhoseTopCategoryId,
    topSize: firstRow.top_size === 3 || firstRow.top_size === 5 || firstRow.top_size === 10 ? firstRow.top_size : 5,
    optionLabels: firstRow.option_labels,
    status: firstRow.round_status,
    phase: firstRow.round_phase,
    voteDeadlineAt: firstRow.vote_deadline_at,
    voteDurationSeconds: firstRow.vote_duration_seconds,
    startedAt: firstRow.started_at,
    topCount: firstRow.top_count,
    submittedCount: firstRow.submitted_count,
    currentTopId: firstRow.current_top_id,
    currentTopItems: firstRow.current_top_items,
    currentTopOrder: firstRow.current_top_order,
    currentTopAuthorUserId: firstRow.current_top_author_user_id,
    isCurrentTopAuthor: firstRow.is_current_top_author,
    guesses
  };
}

function mapMajorityRound(rows: MajorityRoundStateRow[]): MajorityRoundSetup | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const players: MajorityPlayerState[] = rows.map((row) => ({
    userId: row.user_id,
    answerOption: row.answer_option,
    predictionOption: row.prediction_option,
    answeredAt: row.answered_at,
    predictedAt: row.predicted_at,
    isPredictionCorrect: row.is_prediction_correct,
    isCurrentUser: row.is_current_user
  }));

  return {
    gameId: 'majority',
    roundId: firstRow.round_id,
    questionId: firstRow.question_id,
    roundNumber: firstRow.round_number,
    roundCount: firstRow.round_count,
    category: firstRow.category as MajorityCategoryId,
    question: firstRow.question,
    options: firstRow.options,
    majorityOptions: firstRow.majority_options,
    optionCounts: firstRow.option_counts,
    players,
    voteDeadlineAt: firstRow.vote_deadline_at,
    voteDurationSeconds: firstRow.vote_duration_seconds,
    startedAt: firstRow.started_at,
    status: firstRow.round_status,
    phase: firstRow.round_phase
  };
}

function mapTrollRound(rows: TrollRoundStateRow[], votes: RoomRoundVoteRow[]): TrollRoundSetup | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const assignments: TrollAssignment[] = rows.map((row) => ({
    userId: row.user_id,
    role: row.role,
    word: row.word,
    isEliminated: row.is_eliminated,
    isCurrentUser: row.is_current_user
  }));

  return {
    gameId: 'troll',
    roundId: firstRow.round_id,
    roundNumber: firstRow.round_number,
    roundCount: firstRow.round_count,
    categoryId: firstRow.category_id as ImpostorCategoryId,
    realWord: firstRow.real_word,
    trollWord: firstRow.troll_word,
    assignments,
    votes: votes.map((vote) => ({
      voterUserId: vote.voter_user_id,
      targetUserId: vote.target_user_id
    })),
    eliminatedUserIds: firstRow.eliminated_user_ids,
    expelledUserId: firstRow.expelled_user_id,
    voteDeadlineAt: firstRow.vote_deadline_at,
    voteDurationSeconds: firstRow.vote_duration_seconds,
    discussionDurationSeconds: firstRow.discussion_duration_seconds,
    startedAt: firstRow.started_at,
    status: firstRow.round_status,
    phase: firstRow.round_phase,
    outcome: firstRow.outcome
  };
}

function mapRoomRound(round: RoomRoundRow | null, votes: RoomRoundVoteRow[] = []): ImpostorRoundSetup | null {
  if (!round) {
    return null;
  }

  const outcome: ImpostorRoundSetup['outcome'] =
    round.outcome === 'impostors_caught' ||
    round.outcome === 'impostors_balanced' ||
    round.outcome === 'missed_impostor' ||
    round.outcome === 'continue'
      ? round.outcome
      : 'continue';

  return {
    gameId: 'impostor',
    roundId: round.id,
    roundNumber: round.round_number,
    categoryId: round.theme_category as ImpostorCategoryId,
    secretWord: round.secret_word,
    impostorIds: round.impostor_ids,
    eliminatedUserIds: round.eliminated_user_ids,
    expelledUserId: round.expelled_user_id,
    phase: round.phase,
    voteDeadlineAt: round.vote_deadline_at,
    voteDurationSeconds: round.vote_duration_seconds,
    missBehavior: round.miss_behavior,
    balanceEndsGame: round.balance_rule_enabled,
    votes: votes.map((vote) => ({
      voterUserId: vote.voter_user_id,
      targetUserId: vote.target_user_id
    })),
    startedAt: round.created_at,
    status: round.status,
    outcome
  };
}

export async function getRoomDetails(roomId: string, currentUserId: string): Promise<RoomDetails | null> {
  const [room, members, round] = await Promise.all([
    getRoom(roomId),
    getRoomMembers(roomId),
    getRoomRound(roomId)
  ]);

  if (!room) {
    return null;
  }

  const [profiles, roundVotes, guessWhoState, facesGesturesState, triviaState, whoSaidState, whoseTopState, majorityState, trollState, tournamentScores, tournamentCompletedGames] = await Promise.all([
    getProfilesForUsers(members.map((member) => member.user_id)),
    round?.game_id === 'impostor' || round?.game_id === 'troll' ? getRoomRoundVotes(round?.id ?? null) : Promise.resolve([]),
    round?.game_id === 'guess-who' ? getGuessWhoRoundState(roomId) : Promise.resolve([]),
    round?.game_id === 'faces-gestures' ? getFacesGesturesRoundState(roomId) : Promise.resolve([]),
    round?.game_id === 'trivia' ? getTriviaRoundState(roomId) : Promise.resolve([]),
    round?.game_id === 'who-said' ? getWhoSaidRoundState(roomId) : Promise.resolve([]),
    round?.game_id === 'whose-top' ? getWhoseTopRoundState(roomId) : Promise.resolve([]),
    round?.game_id === 'majority' ? getMajorityRoundState(roomId) : Promise.resolve([]),
    round?.game_id === 'troll' ? getTrollRoundState(roomId) : Promise.resolve([]),
    getRoomTournamentScores(roomId),
    getRoomTournamentCompletedGames(roomId)
  ]);
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  const memberViews = members.map((member) => {
    const profile = profilesById.get(member.user_id);

    return {
      id: member.id,
      userId: member.user_id,
      displayName: profile?.display_name ?? profile?.username ?? 'Player',
      username: profile?.username ?? `user-${member.user_id.slice(0, 6)}`,
      avatarUrl: profile?.avatar_url ?? null,
      role: member.role,
      joinedAt: member.joined_at,
      isActive: member.is_active,
      isCurrentUser: member.user_id === currentUserId
    } satisfies RoomMemberView;
  });

  const currentMember = memberViews.find((member) => member.userId === currentUserId) ?? null;

  return {
    room,
    members: memberViews,
    round:
      round?.game_id === 'guess-who'
        ? mapGuessWhoRound(guessWhoState)
        : round?.game_id === 'faces-gestures'
          ? mapFacesGesturesRound(facesGesturesState)
          : round?.game_id === 'trivia'
            ? mapTriviaRound(triviaState)
            : round?.game_id === 'who-said'
              ? mapWhoSaidRound(whoSaidState)
              : round?.game_id === 'whose-top'
                ? mapWhoseTopRound(whoseTopState)
                : round?.game_id === 'majority'
                  ? mapMajorityRound(majorityState)
                  : round?.game_id === 'troll'
                    ? mapTrollRound(trollState, roundVotes)
                    : mapRoomRound(round, roundVotes),
    selectedGameIds: normalizeGameIds(room.selected_game_ids?.length ? room.selected_game_ids : [room.selected_game_id]),
    tournament: {
      scores: tournamentScores.map((score) => ({ userId: score.user_id, points: score.points })),
      completedGameIds: tournamentCompletedGames
        .map((entry) => entry.game_id)
        .filter((gameId): gameId is GameId => Boolean(gameId && gameId in gameRegistry))
    },
    currentUserRole: currentMember?.role ?? null,
    isHost: currentMember?.role === 'host'
  };
}

export async function updateRoomSelectedGame(roomId: string, hostUserId: string, selectedGameId: string | null) {
  const { error } = await supabase
    .from('rooms')
    .update({ selected_game_id: selectedGameId, selected_game_ids: selectedGameId ? [selectedGameId] : [] })
    .eq('id', roomId)
    .eq('host_user_id', hostUserId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }
}

export async function updateRoomSelectedGames(roomId: string, hostUserId: string, selectedGameIds: GameId[]) {
  const safeGameIds = normalizeGameIds(selectedGameIds);

  const { error } = await supabase
    .from('rooms')
    .update({ selected_game_id: safeGameIds[0] ?? null, selected_game_ids: safeGameIds })
    .eq('id', roomId)
    .eq('host_user_id', hostUserId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }
}

export async function updateRoomStatus(roomId: string, hostUserId: string, status: RoomStatus) {
  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId)
    .eq('host_user_id', hostUserId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }
}

export async function updateRoomMemberPresence(roomId: string, userId: string, isActive: boolean) {
  const { error } = await supabase
    .from('room_members')
    .update({ is_active: isActive })
    .eq('room_id', roomId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function leaveCurrentRoom(roomId: string, userId: string) {
  const { error } = await supabase
    .from('room_members')
    .update({ is_active: false })
    .eq('room_id', roomId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  await closeRoomIfSingleMemberLeft(roomId);
}

export async function closeRoomForHost(roomId: string, userId: string) {
  const { error } = await supabase
    .from('rooms')
    .update({ status: 'finished' })
    .eq('id', roomId)
    .eq('host_user_id', userId);

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }
}

export async function removeRoomMember(roomId: string, memberUserId: string) {
  const { data, error } = await supabase.rpc('remove_room_member', {
    p_room_id: roomId,
    p_member_user_id: memberUserId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  await closeRoomIfSingleMemberLeft(roomId);

  return normalizeResult(data as RoomMemberRow | RoomMemberRow[] | null);
}

export async function startImpostorRound(
  roomId: string,
  themeCategory: ImpostorCategoryId,
  impostorCount: number,
  voteDurationSeconds: number,
  missBehavior: 'repeat' | 'end',
  balanceRuleEnabled: boolean
) {
  const { data, error } = await supabase.rpc('start_impostor_round', {
    p_room_id: roomId,
    p_theme_category: themeCategory,
    p_impostor_count: impostorCount,
    p_vote_duration_seconds: voteDurationSeconds,
    p_miss_behavior: missBehavior,
    p_balance_rule_enabled: balanceRuleEnabled
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return mapRoomRound(normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null));
}

export async function advanceImpostorRound(roomId: string) {
  const { data, error } = await supabase.rpc('advance_impostor_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return mapRoomRound(normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null));
}

export async function castImpostorVote(roomId: string, targetUserId: string) {
  const { data, error } = await supabase.rpc('cast_impostor_vote', {
    p_room_id: roomId,
    p_target_user_id: targetUserId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundVoteRow | RoomRoundVoteRow[] | null);
}

export async function resolveImpostorVote(roomId: string) {
  const { data, error } = await supabase.rpc('resolve_impostor_vote', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return mapRoomRound(normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null));
}

export async function returnRoomToLobby(roomId: string) {
  const { data, error } = await supabase.rpc('return_room_to_lobby', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRow | RoomRow[] | null);
}

export async function startGuessWhoRound(roomId: string, categoryId: GuessWhoCategoryId) {
  const { data, error } = await supabase.rpc('start_guess_who_round', {
    p_category_id: categoryId,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function submitGuessWhoAnswer(roomId: string, guess: string) {
  const { data, error } = await supabase.rpc('submit_guess_who_answer', {
    p_guess: guess,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomGuessWhoAssignmentRow | RoomGuessWhoAssignmentRow[] | null);
}

export async function finishGuessWhoRound(roomId: string) {
  const { data, error } = await supabase.rpc('finish_guess_who_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function startFacesGesturesRound(roomId: string, turnSeconds: number) {
  const { data, error } = await supabase.rpc('start_faces_gestures_round', {
    p_room_id: roomId,
    p_turn_seconds: turnSeconds
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function submitFacesGesturesGuess(roomId: string, guess: string) {
  const { data, error } = await supabase.rpc('submit_faces_gestures_guess', {
    p_guess: guess,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomFacesGesturesAnswerRow | RoomFacesGesturesAnswerRow[] | null);
}

export async function finishFacesGesturesRound(roomId: string) {
  const { data, error } = await supabase.rpc('finish_faces_gestures_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function startTriviaRound(
  roomId: string,
  questionCount: number,
  turnSeconds: number,
  topics: TriviaTopicId[]
) {
  const { data, error } = await supabase.rpc('start_trivia_round', {
    p_question_count: questionCount,
    p_room_id: roomId,
    p_topics: topics,
    p_turn_seconds: turnSeconds
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function submitTriviaAnswer(roomId: string, answer: string) {
  const { data, error } = await supabase.rpc('submit_trivia_answer', {
    p_answer: answer,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomTriviaAnswerRow | RoomTriviaAnswerRow[] | null);
}

export async function advanceTriviaQuestion(roomId: string) {
  const { data, error } = await supabase.rpc('advance_trivia_question', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function startWhoSaidRound(
  roomId: string,
  topic: WhoSaidTopicId,
  writeSeconds: number,
  guessSeconds: number
) {
  const { data, error } = await supabase.rpc('start_who_said_round', {
    p_guess_seconds: guessSeconds,
    p_room_id: roomId,
    p_topic: topic,
    p_write_seconds: writeSeconds
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function submitWhoSaidPhrase(roomId: string, phrase: string) {
  const { data, error } = await supabase.rpc('submit_who_said_phrase', {
    p_phrase: phrase,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomWhoSaidPhraseRow | RoomWhoSaidPhraseRow[] | null);
}

export async function submitWhoSaidGuess(roomId: string, guessedUserId: string) {
  const { data, error } = await supabase.rpc('submit_who_said_guess', {
    p_guessed_user_id: guessedUserId,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomWhoSaidGuessRow | RoomWhoSaidGuessRow[] | null);
}

export async function advanceWhoSaidRound(roomId: string) {
  const { data, error } = await supabase.rpc('advance_who_said_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function startWhoseTopRound(
  roomId: string,
  category: WhoseTopCategoryId,
  topSize: 3 | 5 | 10,
  createSeconds: number,
  guessSeconds: number
) {
  const { data, error } = await supabase.rpc('start_whose_top_round', {
    p_category: category,
    p_create_seconds: createSeconds,
    p_guess_seconds: guessSeconds,
    p_room_id: roomId,
    p_top_size: topSize
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function submitWhoseTop(roomId: string, items: string[]) {
  const { data, error } = await supabase.rpc('submit_whose_top', {
    p_items: items,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomWhoseTopSubmissionRow | RoomWhoseTopSubmissionRow[] | null);
}

export async function submitWhoseTopGuess(roomId: string, guessedUserId: string) {
  const { data, error } = await supabase.rpc('submit_whose_top_guess', {
    p_guessed_user_id: guessedUserId,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomWhoseTopGuessRow | RoomWhoseTopGuessRow[] | null);
}

export async function advanceWhoseTopRound(roomId: string) {
  const { data, error } = await supabase.rpc('advance_whose_top_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function startMajorityRound(
  roomId: string,
  category: MajorityCategoryId,
  roundCount: number,
  answerSeconds: number,
  predictionSeconds: number
) {
  const { data, error } = await supabase.rpc('start_majority_round', {
    p_answer_seconds: answerSeconds,
    p_category: category,
    p_prediction_seconds: predictionSeconds,
    p_room_id: roomId,
    p_round_count: roundCount
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function submitMajorityAnswer(roomId: string, option: string) {
  const { data, error } = await supabase.rpc('submit_majority_answer', {
    p_option: option,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomMajorityResponseRow | RoomMajorityResponseRow[] | null);
}

export async function submitMajorityPrediction(roomId: string, option: string) {
  const { data, error } = await supabase.rpc('submit_majority_prediction', {
    p_option: option,
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomMajorityResponseRow | RoomMajorityResponseRow[] | null);
}

export async function advanceMajorityRound(roomId: string) {
  const { data, error } = await supabase.rpc('advance_majority_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function startTrollRound(
  roomId: string,
  category: ImpostorCategoryId,
  discussionSeconds: number,
  votingSeconds: number,
  roundCount: number
) {
  const { data, error } = await supabase.rpc('start_troll_round', {
    p_category: category,
    p_discussion_seconds: discussionSeconds,
    p_room_id: roomId,
    p_round_count: roundCount,
    p_voting_seconds: votingSeconds
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function castTrollVote(roomId: string, targetUserId: string) {
  const { data, error } = await supabase.rpc('cast_troll_vote', {
    p_room_id: roomId,
    p_target_user_id: targetUserId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundVoteRow | RoomRoundVoteRow[] | null);
}

export async function advanceTrollRound(roomId: string) {
  const { data, error } = await supabase.rpc('advance_troll_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRoundRow | RoomRoundRow[] | null);
}

export async function scoreRoomTournamentRound(roomId: string) {
  const { data, error } = await supabase.rpc('score_room_tournament_round', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return (data ?? []).map((score) => ({
    userId: score.user_id,
    points: score.points
  })) satisfies TournamentScore[];
}

export async function resetRoomTournament(roomId: string) {
  const { data, error } = await supabase.rpc('reset_room_tournament', {
    p_room_id: roomId
  });

  if (error) {
    throw new Error(buildRoomErrorMessage(error.message));
  }

  return normalizeResult(data as RoomRow | RoomRow[] | null);
}

export function subscribeToRoomRealtime({
  roomId,
  onRoomChange,
  onMembersChange,
  onRoundChange,
  onVotesChange,
  onConnectionStateChange
}: SubscribeToRoomRealtimeOptions) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      () => onRoomChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${roomId}` },
      () => onMembersChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_rounds', filter: `room_id=eq.${roomId}` },
      () => onRoundChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_round_votes', filter: `room_id=eq.${roomId}` },
      () => onVotesChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_faces_gestures_answers', filter: `room_id=eq.${roomId}` },
      () => onRoundChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_tournament_scores', filter: `room_id=eq.${roomId}` },
      () => onRoomChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_tournament_completed_games', filter: `room_id=eq.${roomId}` },
      () => onRoomChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_trivia_answers', filter: `room_id=eq.${roomId}` },
      () => onRoundChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_who_said_phrases', filter: `room_id=eq.${roomId}` },
      () => onRoundChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_who_said_guesses', filter: `room_id=eq.${roomId}` },
      () => onRoundChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_majority_responses', filter: `room_id=eq.${roomId}` },
      () => onRoundChange()
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        onConnectionStateChange?.('live', null);
        return;
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        onConnectionStateChange?.('error', 'Realtime sync is temporarily unavailable.');
        return;
      }

      onConnectionStateChange?.('connecting', 'Connecting live room updates...');
    });

  onConnectionStateChange?.('connecting', 'Connecting live room updates...');

  return () => {
    void supabase.removeChannel(channel);
  };
}

export { getErrorMessage };
