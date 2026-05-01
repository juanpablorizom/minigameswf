create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  avatar_id text not null default 'default',
  frame_id text not null default 'plain',
  preferred_language text not null default 'es' check (preferred_language in ('es', 'en')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'es' check (language in ('es', 'en')),
  linked_provider_label text,
  theme_preference text not null default 'default' check (theme_preference in ('default', 'geo-style')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index if not exists user_friendships_addressee_idx
on public.user_friendships (addressee_id, status);

create index if not exists user_friendships_requester_idx
on public.user_friendships (requester_id, status);

alter table public.user_settings
add column if not exists theme_preference text not null default 'default';

alter table public.profiles add column if not exists avatar_id text not null default 'default';
alter table public.profiles add column if not exists frame_id text not null default 'plain';

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  selected_game_id text,
  selected_game_ids text[] not null default array['impostor']::text[],
  mode text not null default 'tournament' check (mode in ('tournament', 'single')),
  single_game_round_count integer not null default 3 check (single_game_round_count between 1 and 10),
  visibility text not null default 'private' check (visibility in ('private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.rooms add column if not exists selected_game_ids text[] not null default array['impostor']::text[];
alter table public.rooms add column if not exists mode text not null default 'tournament';
alter table public.rooms add column if not exists single_game_round_count integer not null default 3;

update public.rooms
set selected_game_ids = case
  when selected_game_id is not null then array[selected_game_id]
  else array['impostor']::text[]
end
where selected_game_ids is null or array_length(selected_game_ids, 1) is null;

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('host', 'member')),
  joined_at timestamptz not null default timezone('utc', now()),
  is_active boolean not null default true,
  unique (room_id, user_id)
);

create table if not exists public.room_activity (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.room_rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.rooms (id) on delete cascade,
  round_number integer not null default 1,
  round_total integer not null default 1,
  game_id text not null default 'impostor',
  theme_category text not null check (
    theme_category in (
      'animals',
      'countries',
      'objects',
      'faces-gestures',
      'famous-people',
      'football-players',
      'popular',
      'movies-series',
      'trivia',
      'who-said',
      'whose-top',
      'majority',
      'youtubers',
      'basketball',
      'f1',
      'singers',
      'cartoons-fictional',
      'world-foods'
    )
  ),
  secret_word text not null,
  impostor_ids uuid[] not null default '{}'::uuid[],
  eliminated_user_ids uuid[] not null default '{}'::uuid[],
  expelled_user_id uuid references auth.users (id) on delete set null,
  phase text not null default 'reveal' check (phase in ('reveal', 'voting', 'result')),
  vote_deadline_at timestamptz,
  vote_duration_seconds integer not null default 45,
  answer_duration_seconds integer not null default 20,
  miss_behavior text not null default 'repeat' check (miss_behavior in ('repeat', 'end')),
  balance_rule_enabled boolean not null default true,
  outcome text not null default 'continue' check (outcome in ('impostors_caught', 'impostors_balanced', 'missed_impostor', 'troll_eliminated', 'impostor_eliminated', 'innocent_eliminated', 'continue')),
  actor_user_id uuid references auth.users (id) on delete set null,
  scored_at timestamptz,
  started_by_user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'finished')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.room_rounds
drop constraint if exists room_rounds_theme_category_check;

alter table public.room_rounds
add constraint room_rounds_theme_category_check check (
  theme_category in (
    'animals',
    'countries',
    'objects',
    'faces-gestures',
    'famous-people',
    'football-players',
    'popular',
    'movies-series',
    'trivia',
    'who-said',
    'whose-top',
    'majority',
    'troll',
    'youtubers',
    'basketball',
    'f1',
    'singers',
    'cartoons-fictional',
    'world-foods'
  )
);

alter table public.room_rounds
drop constraint if exists room_rounds_outcome_check;

alter table public.room_rounds
add constraint room_rounds_outcome_check check (
  outcome in (
    'impostors_caught',
    'impostors_balanced',
    'missed_impostor',
    'troll_eliminated',
    'impostor_eliminated',
    'innocent_eliminated',
    'continue'
  )
);

alter table public.room_rounds add column if not exists round_total integer not null default 1;
alter table public.room_rounds add column if not exists vote_duration_seconds integer not null default 45;
alter table public.room_rounds add column if not exists answer_duration_seconds integer not null default 20;
alter table public.room_rounds add column if not exists miss_behavior text not null default 'repeat';
alter table public.room_rounds add column if not exists balance_rule_enabled boolean not null default true;
alter table public.room_rounds add column if not exists outcome text not null default 'continue';
alter table public.room_rounds add column if not exists actor_user_id uuid references auth.users (id) on delete set null;
alter table public.room_rounds add column if not exists scored_at timestamptz;

create table if not exists public.room_round_votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  voter_user_id uuid not null references auth.users (id) on delete cascade,
  target_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (round_id, voter_user_id)
);

create table if not exists public.room_guess_who_assignments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  character_label text not null,
  normalized_character text not null,
  guess_count integer not null default 0,
  last_guess text,
  solved_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (round_id, user_id)
);

create index if not exists room_guess_who_assignments_room_id_idx
on public.room_guess_who_assignments (room_id);

create index if not exists room_guess_who_assignments_round_id_idx
on public.room_guess_who_assignments (round_id);

create table if not exists public.room_faces_gestures_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  guess_count integer not null default 0,
  last_guess text,
  normalized_last_guess text,
  solved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (round_id, user_id)
);

create index if not exists room_faces_gestures_answers_room_id_idx
on public.room_faces_gestures_answers (room_id);

create index if not exists room_faces_gestures_answers_round_id_idx
on public.room_faces_gestures_answers (round_id);

create table if not exists public.room_tournament_scores (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (room_id, user_id)
);

create table if not exists public.room_tournament_completed_games (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  game_id text not null,
  game_order integer not null default 1,
  completed_at timestamptz not null default timezone('utc', now()),
  unique (room_id, game_id)
);

create index if not exists room_tournament_scores_room_id_idx
on public.room_tournament_scores (room_id);

create index if not exists room_tournament_completed_games_room_id_idx
on public.room_tournament_completed_games (room_id);

create table if not exists public.room_trivia_questions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  question_order integer not null,
  source_question_id text not null,
  topic text not null,
  question text not null,
  answer text not null,
  aliases text[] not null default '{}'::text[],
  normalized_answer text not null,
  normalized_aliases text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  unique (round_id, question_order)
);

create table if not exists public.room_trivia_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  question_id uuid not null references public.room_trivia_questions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  answer_text text not null,
  normalized_answer text not null,
  is_correct boolean not null default false,
  answered_at timestamptz not null default timezone('utc', now()),
  unique (question_id, user_id)
);

create index if not exists room_trivia_questions_room_id_idx
on public.room_trivia_questions (room_id);

create index if not exists room_trivia_questions_round_id_idx
on public.room_trivia_questions (round_id);

create index if not exists room_trivia_answers_room_id_idx
on public.room_trivia_answers (room_id);

create index if not exists room_trivia_answers_round_id_idx
on public.room_trivia_answers (round_id);

create table if not exists public.room_who_said_phrases (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  author_user_id uuid not null references auth.users (id) on delete cascade,
  phrase_order integer,
  topic text not null,
  phrase_text text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (round_id, author_user_id)
);

create unique index if not exists room_who_said_phrases_round_order_idx
on public.room_who_said_phrases (round_id, phrase_order)
where phrase_order is not null;

create index if not exists room_who_said_phrases_room_id_idx
on public.room_who_said_phrases (room_id);

create index if not exists room_who_said_phrases_round_id_idx
on public.room_who_said_phrases (round_id);

create table if not exists public.room_who_said_guesses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  phrase_id uuid not null references public.room_who_said_phrases (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  guessed_user_id uuid not null references auth.users (id) on delete cascade,
  is_correct boolean not null default false,
  guessed_at timestamptz not null default timezone('utc', now()),
  unique (phrase_id, user_id)
);

create index if not exists room_who_said_guesses_room_id_idx
on public.room_who_said_guesses (room_id);

create index if not exists room_who_said_guesses_round_id_idx
on public.room_who_said_guesses (round_id);

create table if not exists public.room_whose_top_options (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  category text not null,
  top_size integer not null default 5,
  option_labels text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  unique (round_id)
);

create index if not exists room_whose_top_options_room_id_idx
on public.room_whose_top_options (room_id);

create table if not exists public.room_whose_top_submissions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  author_user_id uuid not null references auth.users (id) on delete cascade,
  top_order integer,
  category text not null,
  top_size integer not null,
  option_labels text[] not null default '{}'::text[],
  items text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (round_id, author_user_id)
);

create unique index if not exists room_whose_top_submissions_round_order_idx
on public.room_whose_top_submissions (round_id, top_order)
where top_order is not null;

create index if not exists room_whose_top_submissions_room_id_idx
on public.room_whose_top_submissions (room_id);

create index if not exists room_whose_top_submissions_round_id_idx
on public.room_whose_top_submissions (round_id);

create table if not exists public.room_whose_top_guesses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  top_id uuid not null references public.room_whose_top_submissions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  guessed_user_id uuid not null references auth.users (id) on delete cascade,
  is_correct boolean not null default false,
  guessed_at timestamptz not null default timezone('utc', now()),
  unique (top_id, user_id)
);

create index if not exists room_whose_top_guesses_room_id_idx
on public.room_whose_top_guesses (room_id);

create index if not exists room_whose_top_guesses_round_id_idx
on public.room_whose_top_guesses (round_id);

create table if not exists public.room_majority_questions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  question_order integer not null,
  source_question_id text not null,
  category text not null,
  question text not null,
  options text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  unique (round_id, question_order)
);

create index if not exists room_majority_questions_room_id_idx
on public.room_majority_questions (room_id);

create index if not exists room_majority_questions_round_id_idx
on public.room_majority_questions (round_id);

create table if not exists public.room_majority_responses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  question_id uuid not null references public.room_majority_questions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  answer_option text,
  prediction_option text,
  answered_at timestamptz,
  predicted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (question_id, user_id)
);

create index if not exists room_majority_responses_room_id_idx
on public.room_majority_responses (room_id);

create index if not exists room_majority_responses_round_id_idx
on public.room_majority_responses (round_id);

create table if not exists public.room_troll_assignments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('innocent', 'impostor', 'troll')),
  word text,
  is_eliminated boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (round_id, user_id)
);

create index if not exists room_troll_assignments_room_id_idx
on public.room_troll_assignments (room_id);

create index if not exists room_troll_assignments_round_id_idx
on public.room_troll_assignments (round_id);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_friendships enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_activity enable row level security;
alter table public.room_rounds enable row level security;
alter table public.room_round_votes enable row level security;
alter table public.room_guess_who_assignments enable row level security;
alter table public.room_faces_gestures_answers enable row level security;
alter table public.room_tournament_scores enable row level security;
alter table public.room_tournament_completed_games enable row level security;
alter table public.room_trivia_questions enable row level security;
alter table public.room_trivia_answers enable row level security;
alter table public.room_who_said_phrases enable row level security;
alter table public.room_who_said_guesses enable row level security;
alter table public.room_whose_top_options enable row level security;
alter table public.room_whose_top_submissions enable row level security;
alter table public.room_whose_top_guesses enable row level security;
alter table public.room_majority_questions enable row level security;
alter table public.room_majority_responses enable row level security;
alter table public.room_troll_assignments enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function private.is_room_member(target_room_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members
    where room_members.room_id = target_room_id
      and room_members.user_id = auth.uid()
      and room_members.is_active = true
  );
$$;

create or replace function private.is_room_host(target_room_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.rooms
    where rooms.id = target_room_id
      and rooms.host_user_id = auth.uid()
  );
$$;

create or replace function private.shares_active_room_with_user(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members viewer_membership
    join public.room_members target_membership
      on target_membership.room_id = viewer_membership.room_id
    where viewer_membership.user_id = auth.uid()
      and viewer_membership.is_active = true
      and target_membership.user_id = target_user_id
  );
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_rounds_updated_at on public.room_rounds;
create trigger set_room_rounds_updated_at
before update on public.room_rounds
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_guess_who_assignments_updated_at on public.room_guess_who_assignments;
create trigger set_room_guess_who_assignments_updated_at
before update on public.room_guess_who_assignments
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_faces_gestures_answers_updated_at on public.room_faces_gestures_answers;
create trigger set_room_faces_gestures_answers_updated_at
before update on public.room_faces_gestures_answers
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_tournament_scores_updated_at on public.room_tournament_scores;
create trigger set_room_tournament_scores_updated_at
before update on public.room_tournament_scores
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_who_said_phrases_updated_at on public.room_who_said_phrases;
create trigger set_room_who_said_phrases_updated_at
before update on public.room_who_said_phrases
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_whose_top_submissions_updated_at on public.room_whose_top_submissions;
create trigger set_room_whose_top_submissions_updated_at
before update on public.room_whose_top_submissions
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_majority_responses_updated_at on public.room_majority_responses;
create trigger set_room_majority_responses_updated_at
before update on public.room_majority_responses
for each row
execute function public.set_updated_at();

drop trigger if exists set_room_troll_assignments_updated_at on public.room_troll_assignments;
create trigger set_room_troll_assignments_updated_at
before update on public.room_troll_assignments
for each row
execute function public.set_updated_at();

create or replace function public.generate_room_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  output text := '';
  idx integer;
begin
  for idx in 1..5 loop
    output := output || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;

  return output;
end;
$$;

drop function if exists public.create_private_room(text);

create or replace function public.create_private_room(p_selected_game_ids text[] default array['impostor']::text[])
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  next_room public.rooms;
  next_code text;
  safe_game_ids text[] := coalesce(p_selected_game_ids, array['impostor']::text[]);
  first_game_id text;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  safe_game_ids := (
    select coalesce(array_agg(game_id order by first_order), array['impostor']::text[])
    from (
      select selected_game_id as game_id, min(selected_order) as first_order
      from unnest(safe_game_ids) with ordinality as selected(selected_game_id, selected_order)
      where selected_game_id in ('impostor', 'guess-who', 'faces-gestures', 'trivia', 'who-said', 'majority', 'troll', 'whose-top')
      group by selected_game_id
    ) selected
  );

  if array_length(safe_game_ids, 1) is null then
    safe_game_ids := array['impostor']::text[];
  end if;

  first_game_id := safe_game_ids[1];

  update public.room_members
  set is_active = false
  where user_id = current_user_id;

  loop
    next_code := public.generate_room_code();

    begin
      insert into public.rooms (code, host_user_id, status, selected_game_id, selected_game_ids, visibility)
      values (next_code, current_user_id, 'waiting', first_game_id, safe_game_ids, 'private')
      returning * into next_room;
      exit;
    exception
      when unique_violation then
        next_code := null;
    end;
  end loop;

  insert into public.room_members (room_id, user_id, role, is_active)
  values (next_room.id, current_user_id, 'host', true)
  on conflict (room_id, user_id) do update
  set role = 'host',
      is_active = true;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    next_room.id,
    current_user_id,
    'room_created',
    jsonb_build_object('code', next_room.code)
  );

  return next_room;
end;
$$;

create or replace function public.join_private_room(p_code text)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where upper(code) = upper(trim(p_code))
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.status = 'finished' then
    raise exception 'ROOM_UNAVAILABLE';
  end if;

  update public.room_members
  set is_active = false
  where user_id = current_user_id
    and room_id <> target_room.id;

  insert into public.room_members (room_id, user_id, role, is_active)
  values (
    target_room.id,
    current_user_id,
    case when target_room.host_user_id = current_user_id then 'host' else 'member' end,
    true
  )
  on conflict (room_id, user_id) do update
  set is_active = true;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    target_room.id,
    current_user_id,
    'member_joined',
    jsonb_build_object('code', target_room.code)
  );

  return target_room;
end;
$$;

create or replace function public.remove_room_member(p_room_id uuid, p_member_user_id uuid)
returns public.room_members
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_membership public.room_members;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROOMS_PERMISSION_DENIED';
  end if;

  if p_member_user_id = current_user_id then
    raise exception 'CANNOT_REMOVE_HOST';
  end if;

  update public.room_members
  set is_active = false
  where room_id = p_room_id
    and user_id = p_member_user_id
  returning * into target_membership;

  if target_membership.id is null then
    raise exception 'ROOM_MEMBER_NOT_FOUND';
  end if;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'member_removed',
    jsonb_build_object('member_user_id', p_member_user_id)
  );

  return target_membership;
end;
$$;

create or replace function public.start_impostor_round(
  p_room_id uuid,
  p_theme_category text,
  p_impostor_count integer default 1,
  p_vote_duration_seconds integer default 45,
  p_miss_behavior text default 'repeat',
  p_balance_rule_enabled boolean default true
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  member_count integer := 0;
  total_impostors integer := 1;
  previous_round_number integer := 0;
  previous_impostor_ids uuid[] := '{}'::uuid[];
  theme_words text[];
  selected_word text;
  selected_impostor_ids uuid[];
  next_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  if member_count = 0 then
    raise exception 'ROUND_NO_MEMBERS';
  end if;

  if member_count < 3 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  total_impostors := least(greatest(coalesce(p_impostor_count, 1), 1), greatest(member_count - 1, 1));

  select coalesce(max(room_rounds.round_number), 0)
  into previous_round_number
  from public.room_rounds
  where room_id = p_room_id;

  select coalesce(room_rounds.impostor_ids, '{}'::uuid[])
  into previous_impostor_ids
  from public.room_rounds
  where room_id = p_room_id
  order by round_number desc
  limit 1;

  theme_words := case p_theme_category
    when 'animals' then array['Leon', 'Tigre', 'Elefante', 'Jirafa', 'Delfin', 'Lobo', 'Pinguino', 'Cebra', 'Koala', 'Zorro', 'Rinoceronte', 'Hipopotamo']
    when 'countries' then array['Mexico', 'Ciudad de Mexico', 'Japon', 'Tokio', 'Italia', 'Roma', 'Brasil', 'Brasilia', 'Canada', 'Ottawa', 'Argentina', 'Buenos Aires', 'Francia', 'Paris', 'India', 'Nueva Delhi', 'Egipto', 'El Cairo', 'Australia', 'Canberra', 'Portugal', 'Lisboa', 'Colombia', 'Bogota', 'España', 'Madrid', 'Alemania', 'Berlin', 'Reino Unido', 'Londres', 'Estados Unidos', 'Washington D. C.', 'China', 'Pekin', 'Rusia', 'Moscu', 'Corea del Sur', 'Seul', 'Indonesia', 'Yakarta', 'Tailandia', 'Bangkok', 'Chile', 'Santiago', 'Peru', 'Lima', 'Marruecos', 'Rabat']
    when 'objects' then array['Brujula', 'Lampara', 'Martillo', 'Mochila', 'Reloj', 'Camara', 'Paraguas', 'Llave', 'Telefono', 'Binoculares', 'Microfono', 'Guitarra']
    when 'faces-gestures' then array['Sonrisa', 'Carcajada', 'Guino', 'Cara seria', 'Cara de sorpresa', 'Cara de enojo', 'Cara triste', 'Cara confundida', 'Cara de miedo', 'Cara de sueño', 'Cara de asco', 'Cara de culpa', 'Cara de poker', 'Risa nerviosa', 'Risa malvada', 'Llanto falso', 'Mirada sospechosa', 'Ceja levantada', 'Ojos cerrados', 'Silencio', 'Pensando', 'Pulgar arriba', 'Pulgar abajo', 'Aplauso', 'Mano saludando', 'Cara de orgullo', 'Beso', 'Lengua afuera', 'Susto', 'Verguenza', 'Duda', 'Desprecio']
    when 'famous-people' then array['Zendaya', 'Margot Robbie', 'Tom Holland', 'Keanu Reeves', 'Emma Stone', 'Ryan Gosling', 'Jenna Ortega', 'Pedro Pascal', 'Timothee Chalamet', 'Ana de Armas', 'Robert Downey Jr.', 'Scarlett Johansson', 'Leonardo DiCaprio', 'Natalie Portman', 'Denzel Washington', 'Meryl Streep', 'Jennifer Lawrence', 'Christian Bale', 'Angelina Jolie', 'Chris Hemsworth', 'Florence Pugh']
    when 'football-players' then array['Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappe', 'Neymar', 'Erling Haaland', 'Kevin De Bruyne', 'Luka Modric', 'Jude Bellingham', 'Antoine Griezmann', 'Vinicius Jr.', 'Rodri', 'Harry Kane', 'Mohamed Salah', 'Robert Lewandowski', 'Sergio Ramos', 'Ronaldinho', 'Zinedine Zidane', 'Andres Iniesta', 'Xavi', 'Thierry Henry']
    when 'movies-series' then array['Breaking Bad', 'Stranger Things', 'Game of Thrones', 'Friends', 'The Office', 'Harry Potter', 'Star Wars', 'Avengers', 'Spider-Man', 'The Batman', 'Titanic', 'Avatar', 'Interstellar', 'The Simpsons', 'Narcos', 'Wednesday', 'Dark', 'The Last of Us', 'Shrek', 'Toy Story']
    when 'youtubers' then array['MrBeast', 'Ibai', 'AuronPlay', 'Rubius', 'Luisito Comunica', 'Fernanfloo', 'JuanSGuarnizo', 'Fede Vigevani', 'Kimberly Loaiza', 'Dross', 'Nate Gentile', 'ElMariana', 'Vegetta777', 'Wismichu', 'HolaSoyGerman', 'ThatWasEpic', 'Markiplier', 'PewDiePie', 'IShowSpeed', 'Kai Cenat']
    when 'basketball' then array['Michael Jordan', 'LeBron James', 'Stephen Curry', 'Kobe Bryant', 'Shaquille O''Neal', 'Magic Johnson', 'Larry Bird', 'Kevin Durant', 'Giannis Antetokounmpo', 'Nikola Jokic', 'Luka Doncic', 'Jayson Tatum', 'Kawhi Leonard', 'Allen Iverson', 'Tim Duncan', 'Dirk Nowitzki', 'James Harden', 'Damian Lillard', 'Anthony Davis', 'Victor Wembanyama']
    when 'f1' then array['Max Verstappen', 'Lewis Hamilton', 'Fernando Alonso', 'Charles Leclerc', 'Lando Norris', 'Carlos Sainz', 'Sergio Perez', 'George Russell', 'Oscar Piastri', 'Ayrton Senna', 'Michael Schumacher', 'Sebastian Vettel', 'Jenson Button', 'Kimi Raikkonen', 'Valtteri Bottas', 'Daniel Ricciardo', 'Nico Rosberg', 'Mika Hakkinen', 'Alain Prost', 'Niki Lauda']
    when 'singers' then array['Taylor Swift', 'Bad Bunny', 'Shakira', 'Billie Eilish', 'Ariana Grande', 'Karol G', 'Drake', 'Dua Lipa', 'The Weeknd', 'Rosalia', 'Feid', 'Bruno Mars', 'Rihanna', 'Ed Sheeran', 'Justin Bieber', 'Miley Cyrus', 'Selena Gomez', 'Olivia Rodrigo', 'Katy Perry', 'SZA']
    when 'cartoons-fictional' then array['Mickey Mouse', 'Bugs Bunny', 'SpongeBob', 'Goku', 'Naruto', 'Luffy', 'Batman', 'Superman', 'Spider-Man', 'Iron Man', 'Elsa', 'Shrek', 'Woody', 'Buzz Lightyear', 'Pikachu', 'Ash Ketchum', 'Scooby-Doo', 'Tom', 'Jerry', 'Hello Kitty']
    when 'world-foods' then array['Tacos', 'Pizza', 'Sushi', 'Ramen', 'Paella', 'Hamburguesa', 'Lasagna', 'Ceviche', 'Pho', 'Falafel', 'Croissant', 'Arepas', 'Empanadas', 'Pad Thai', 'Curry', 'Burrito', 'Chilaquiles', 'Gelato', 'Dim sum', 'Poutine']
    else null
  end;

  if theme_words is null or array_length(theme_words, 1) is null then
    raise exception 'ROUND_THEME_NOT_FOUND';
  end if;

  selected_word := theme_words[1 + floor(random() * array_length(theme_words, 1))::integer];

  selected_impostor_ids := (
    with active_members as (
      select distinct room_members.user_id
      from public.room_members
      where room_members.room_id = p_room_id
        and room_members.is_active = true
    ),
    preferred_members as (
      select active_members.user_id
      from active_members
      where not (active_members.user_id = any(coalesce(previous_impostor_ids, '{}'::uuid[])))
      order by random()
      limit total_impostors
    ),
    fallback_members as (
      select active_members.user_id
      from active_members
      where not exists (
        select 1
        from preferred_members
        where preferred_members.user_id = active_members.user_id
      )
      order by random()
      limit greatest(total_impostors - (select count(*) from preferred_members), 0)
    ),
    merged_members as (
      select user_id
      from preferred_members
      union all
      select user_id
      from fallback_members
    )
    select coalesce(array_agg(merged_members.user_id), '{}'::uuid[])
    from merged_members
  );

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    eliminated_user_ids,
    expelled_user_id,
    phase,
    vote_deadline_at,
    vote_duration_seconds,
    miss_behavior,
    balance_rule_enabled,
    outcome,
    started_by_user_id,
    status
  )
  values (
    p_room_id,
    previous_round_number + 1,
    'impostor',
    p_theme_category,
    selected_word,
    selected_impostor_ids,
    '{}'::uuid[],
    null,
    'voting',
    case
      when coalesce(p_vote_duration_seconds, 45) <= 0 then null
      else timezone('utc', now()) + make_interval(secs => greatest(coalesce(p_vote_duration_seconds, 45), 10))
    end,
    greatest(coalesce(p_vote_duration_seconds, 45), 0),
    case when p_miss_behavior = 'end' then 'end' else 'repeat' end,
    coalesce(p_balance_rule_enabled, true),
    'continue',
    current_user_id,
    'active'
  )
  returning * into next_round;

  update public.rooms
  set status = 'active',
      selected_game_id = 'impostor'
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'round_started',
    jsonb_build_object(
      'game_id', 'impostor',
      'theme_category', p_theme_category,
      'impostor_count', total_impostors,
      'vote_duration_seconds', greatest(coalesce(p_vote_duration_seconds, 45), 0),
      'miss_behavior', case when p_miss_behavior = 'end' then 'end' else 'repeat' end,
      'balance_rule_enabled', coalesce(p_balance_rule_enabled, true)
    )
  );

  return next_round;
end;
$$;

create or replace function public.normalize_guess_who_answer(p_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    translate(
      lower(trim(coalesce(p_value, ''))),
      'áàäâãåéèëêíìïîóòöôõúùüûñç',
      'aaaaaaeeeeiiiiooooouuuunc'
    ),
    '\s+',
    ' ',
    'g'
  );
$$;

create or replace function public.start_guess_who_round(
  p_room_id uuid,
  p_category_id text default 'popular'
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  member_count integer := 0;
  previous_round_number integer := 0;
  character_pool text[];
  next_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  if member_count < 2 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  character_pool := case coalesce(p_category_id, 'popular')
    when 'popular' then array['Juan Gabriel', 'Shakira', 'Bad Bunny', 'Taylor Swift', 'Michael Jackson', 'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappe', 'Serena Williams', 'Michael Jordan', 'LeBron James', 'Usain Bolt', 'Checo Perez', 'Max Verstappen', 'Darth Vader', 'Yoda', 'Harry Potter', 'Hermione Granger', 'Batman', 'Spider-Man', 'Iron Man', 'Elsa', 'Shrek', 'Woody', 'Buzz Lightyear', 'Mickey Mouse', 'SpongeBob', 'Goku', 'Naruto', 'Pikachu', 'Scooby-Doo', 'Hello Kitty']
    when 'movies-series' then array['Walter White', 'Jesse Pinkman', 'Saul Goodman', 'Eleven', 'Dustin Henderson', 'Wednesday Addams', 'Homer Simpson', 'Bart Simpson', 'Rick Sanchez', 'Morty Smith', 'Jon Snow', 'Daenerys Targaryen', 'Tyrion Lannister', 'Geralt of Rivia', 'Darth Vader', 'Luke Skywalker', 'Yoda', 'Frodo Baggins', 'Gandalf', 'Jack Sparrow', 'Indiana Jones', 'Forrest Gump', 'Tony Stark', 'Peter Parker', 'Bruce Wayne', 'Joker', 'Harley Quinn', 'Elsa', 'Simba', 'Moana', 'Shrek', 'Po']
    else null
  end;

  if character_pool is null or array_length(character_pool, 1) < member_count then
    raise exception 'ROUND_THEME_NOT_FOUND';
  end if;

  select coalesce(max(room_rounds.round_number), 0)
  into previous_round_number
  from public.room_rounds
  where room_id = p_room_id;

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    eliminated_user_ids,
    phase,
    vote_duration_seconds,
    miss_behavior,
    balance_rule_enabled,
    outcome,
    started_by_user_id,
    status
  )
  values (
    p_room_id,
    previous_round_number + 1,
    'guess-who',
    coalesce(p_category_id, 'popular'),
    'Adivina Quien Soy',
    '{}'::uuid[],
    '{}'::uuid[],
    'reveal',
    0,
    'repeat',
    false,
    'continue',
    current_user_id,
    'active'
  )
  returning * into next_round;

  with active_members as (
    select user_id, row_number() over (order by random()) as rn
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  ),
  selected_characters as (
    select character_label, row_number() over () as rn
    from (
      select character_label
      from unnest(character_pool) as pool(character_label)
      order by random()
      limit member_count
    ) picked
  )
  insert into public.room_guess_who_assignments (
    room_id,
    round_id,
    user_id,
    character_label,
    normalized_character
  )
  select
    p_room_id,
    next_round.id,
    active_members.user_id,
    selected_characters.character_label,
    public.normalize_guess_who_answer(selected_characters.character_label)
  from active_members
  join selected_characters on selected_characters.rn = active_members.rn;

  update public.rooms
  set status = 'active',
      selected_game_id = 'guess-who'
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'guess_who_round_started',
    jsonb_build_object('round_id', next_round.id, 'category_id', coalesce(p_category_id, 'popular'))
  );

  return next_round;
end;
$$;

create or replace function public.get_guess_who_round_state(p_room_id uuid)
returns table (
  round_id uuid,
  round_number integer,
  category_id text,
  round_status text,
  round_phase text,
  started_at timestamptz,
  user_id uuid,
  character_label text,
  guess_count integer,
  remaining_guesses integer,
  last_guess text,
  solved_at timestamptz,
  failed_at timestamptz,
  is_current_user boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_MEMBER_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'guess-who'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  return query
  select
    target_round.id,
    target_round.round_number,
    target_round.theme_category,
    target_round.status,
    target_round.phase,
    target_round.created_at,
    assignments.user_id,
    case
      when assignments.user_id = current_user_id and target_round.status = 'active' then null
      else assignments.character_label
    end as character_label,
    assignments.guess_count,
    greatest(2 - assignments.guess_count, 0) as remaining_guesses,
    assignments.last_guess,
    assignments.solved_at,
    assignments.failed_at,
    assignments.user_id = current_user_id as is_current_user
  from public.room_guess_who_assignments assignments
  where assignments.round_id = target_round.id
  order by assignments.created_at asc;
end;
$$;

create or replace function public.submit_guess_who_answer(
  p_room_id uuid,
  p_guess text
)
returns public.room_guess_who_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  target_assignment public.room_guess_who_assignments;
  updated_assignment public.room_guess_who_assignments;
  normalized_guess text;
  next_guess_count integer := 0;
  is_correct boolean := false;
  pending_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'guess-who'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into target_assignment
  from public.room_guess_who_assignments
  where round_id = target_round.id
    and user_id = current_user_id
  limit 1;

  if target_assignment.id is null then
    raise exception 'ROOM_MEMBER_NOT_FOUND';
  end if;

  if target_assignment.solved_at is not null then
    raise exception 'GUESS_WHO_ALREADY_SOLVED';
  end if;

  if target_assignment.failed_at is not null or target_assignment.guess_count >= 2 then
    raise exception 'GUESS_WHO_NO_ATTEMPTS';
  end if;

  normalized_guess := public.normalize_guess_who_answer(p_guess);
  next_guess_count := target_assignment.guess_count + 1;
  is_correct := normalized_guess = target_assignment.normalized_character;

  update public.room_guess_who_assignments
  set guess_count = next_guess_count,
      last_guess = p_guess,
      solved_at = case when is_correct then timezone('utc', now()) else solved_at end,
      failed_at = case when not is_correct and next_guess_count >= 2 then timezone('utc', now()) else failed_at end
  where id = target_assignment.id
  returning * into updated_assignment;

  pending_count := (
    select count(*)
    from public.room_guess_who_assignments
    where round_id = target_round.id
      and solved_at is null
      and failed_at is null
  );

  if pending_count = 0 then
    update public.room_rounds
    set status = 'finished',
        phase = 'result',
        outcome = 'continue'
    where id = target_round.id;
  else
    update public.room_rounds
    set updated_at = timezone('utc', now())
    where id = target_round.id;
  end if;

  return updated_assignment;
end;
$$;

create or replace function public.finish_guess_who_round(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'guess-who'
  order by round_number desc
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    return target_round;
  end if;

  update public.room_guess_who_assignments
  set failed_at = timezone('utc', now())
  where round_id = target_round.id
    and solved_at is null
    and failed_at is null;

  update public.room_rounds
  set status = 'finished',
      phase = 'result',
      outcome = 'continue'
  where id = target_round.id
  returning * into target_round;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'guess_who_round_finished',
    jsonb_build_object('round_id', target_round.id)
  );

  return target_round;
end;
$$;

create or replace function public.start_faces_gestures_round(
  p_room_id uuid,
  p_turn_seconds integer default 60
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  member_count integer := 0;
  previous_round_number integer := 0;
  character_pool text[] := array[
    'Batman', 'Spider-Man', 'Mickey Mouse', 'Shrek', 'Goku', 'Naruto', 'Pikachu', 'Darth Vader',
    'Harry Potter', 'Elsa', 'Bob Esponja', 'Scooby-Doo', 'Mario Bros', 'Sonic', 'Buzz Lightyear',
    'Woody', 'Hulk', 'Iron Man', 'Joker', 'Harley Quinn', 'Godzilla', 'King Kong', 'Cenicienta',
    'Simba', 'Moana', 'La Sirenita', 'Minion', 'Wolverine', 'Capitan America', 'Barbie',
    'Juan Gabriel', 'Shakira', 'Bad Bunny', 'Messi', 'Cristiano Ronaldo', 'Michael Jackson',
    'Sombrero', 'Guitarra', 'Microfono', 'Robot', 'Dinosaurio', 'Pirata', 'Astronauta'
  ];
  selected_actor_id uuid;
  selected_character text;
  next_round public.room_rounds;
  safe_turn_seconds integer := greatest(coalesce(p_turn_seconds, 60), 10);
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  if member_count < 2 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  select user_id
  into selected_actor_id
  from public.room_members
  where room_id = p_room_id
    and is_active = true
  order by random()
  limit 1;

  selected_character := character_pool[1 + floor(random() * array_length(character_pool, 1))::integer];

  select coalesce(max(room_rounds.round_number), 0)
  into previous_round_number
  from public.room_rounds
  where room_id = p_room_id;

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    eliminated_user_ids,
    phase,
    vote_deadline_at,
    vote_duration_seconds,
    miss_behavior,
    balance_rule_enabled,
    outcome,
    actor_user_id,
    started_by_user_id,
    status
  )
  values (
    p_room_id,
    previous_round_number + 1,
    'faces-gestures',
    'faces-gestures',
    selected_character,
    '{}'::uuid[],
    '{}'::uuid[],
    'reveal',
    timezone('utc', now()) + make_interval(secs => safe_turn_seconds),
    safe_turn_seconds,
    'repeat',
    false,
    'continue',
    selected_actor_id,
    current_user_id,
    'active'
  )
  returning * into next_round;

  insert into public.room_faces_gestures_answers (
    room_id,
    round_id,
    user_id
  )
  select
    p_room_id,
    next_round.id,
    user_id
  from public.room_members
  where room_id = p_room_id
    and is_active = true
    and user_id <> selected_actor_id;

  update public.rooms
  set status = 'active',
      selected_game_id = 'faces-gestures'
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'faces_gestures_round_started',
    jsonb_build_object('round_id', next_round.id, 'actor_user_id', selected_actor_id)
  );

  return next_round;
end;
$$;

create or replace function public.get_faces_gestures_round_state(p_room_id uuid)
returns table (
  round_id uuid,
  round_number integer,
  actor_user_id uuid,
  character_label text,
  round_status text,
  round_phase text,
  vote_deadline_at timestamptz,
  vote_duration_seconds integer,
  started_at timestamptz,
  user_id uuid,
  guess_count integer,
  last_guess text,
  solved_at timestamptz,
  is_current_user boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_MEMBER_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'faces-gestures'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  return query
  select
    target_round.id,
    target_round.round_number,
    target_round.actor_user_id,
    case
      when target_round.status = 'active' and target_round.actor_user_id <> current_user_id then null
      else target_round.secret_word
    end as character_label,
    target_round.status,
    target_round.phase,
    target_round.vote_deadline_at,
    target_round.vote_duration_seconds,
    target_round.created_at,
    answers.user_id,
    answers.guess_count,
    answers.last_guess,
    answers.solved_at,
    answers.user_id = current_user_id as is_current_user
  from public.room_faces_gestures_answers answers
  where answers.round_id = target_round.id
  order by answers.created_at asc;
end;
$$;

create or replace function public.submit_faces_gestures_guess(
  p_room_id uuid,
  p_guess text
)
returns public.room_faces_gestures_answers
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  target_answer public.room_faces_gestures_answers;
  updated_answer public.room_faces_gestures_answers;
  normalized_guess text;
  is_correct boolean := false;
  pending_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'faces-gestures'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.actor_user_id = current_user_id then
    raise exception 'FACES_GESTURES_ACTOR_CANNOT_GUESS';
  end if;

  select *
  into target_answer
  from public.room_faces_gestures_answers
  where round_id = target_round.id
    and user_id = current_user_id
  limit 1;

  if target_answer.id is null then
    raise exception 'ROOM_MEMBER_NOT_FOUND';
  end if;

  if target_answer.solved_at is not null then
    raise exception 'FACES_GESTURES_ALREADY_SOLVED';
  end if;

  normalized_guess := public.normalize_guess_who_answer(p_guess);
  is_correct := normalized_guess = public.normalize_guess_who_answer(target_round.secret_word);

  update public.room_faces_gestures_answers
  set guess_count = target_answer.guess_count + 1,
      last_guess = p_guess,
      normalized_last_guess = normalized_guess,
      solved_at = case when is_correct then timezone('utc', now()) else solved_at end
  where id = target_answer.id
  returning * into updated_answer;

  pending_count := (
    select count(*)
    from public.room_faces_gestures_answers
    where round_id = target_round.id
      and solved_at is null
  );

  if pending_count = 0 then
    update public.room_rounds
    set status = 'finished',
        phase = 'result',
        outcome = 'continue'
    where id = target_round.id;
  else
    update public.room_rounds
    set updated_at = timezone('utc', now())
    where id = target_round.id;
  end if;

  return updated_answer;
end;
$$;

create or replace function public.finish_faces_gestures_round(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'faces-gestures'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    return target_round;
  end if;

  if target_room.host_user_id <> current_user_id
    and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now())) then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  update public.room_rounds
  set status = 'finished',
      phase = 'result',
      outcome = 'continue'
  where id = target_round.id
  returning * into target_round;

  return target_round;
end;
$$;

create or replace function public.start_trivia_round(
  p_room_id uuid,
  p_question_count integer default 5,
  p_turn_seconds integer default 20,
  p_topics text[] default array['famosos', 'f1', 'cultura-general']::text[]
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  member_count integer := 0;
  selected_count integer := 0;
  next_round public.room_rounds;
  safe_question_count integer := least(greatest(coalesce(p_question_count, 5), 1), 10);
  safe_turn_seconds integer := greatest(coalesce(p_turn_seconds, 20), 5);
  safe_topics text[] := coalesce(p_topics, array['famosos', 'f1', 'cultura-general']::text[]);
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  safe_topics := (
    select coalesce(array_agg(distinct selected_topic.topic), array['famosos', 'f1', 'cultura-general']::text[])
    from unnest(safe_topics) as selected_topic(topic)
    where selected_topic.topic in ('famosos', 'f1', 'cultura-general', 'marcas', 'personajes-ficticios', 'objetos')
  );

  member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  if member_count < 1 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    eliminated_user_ids,
    phase,
    vote_deadline_at,
    vote_duration_seconds,
    miss_behavior,
    balance_rule_enabled,
    outcome,
    started_by_user_id,
    status
  )
  values (
    p_room_id,
    1,
    'trivia',
    'trivia',
    'Trivia',
    '{}'::uuid[],
    '{}'::uuid[],
    'reveal',
    timezone('utc', now()) + make_interval(secs => safe_turn_seconds),
    safe_turn_seconds,
    'repeat',
    false,
    'continue',
    current_user_id,
    'active'
  )
  returning * into next_round;

  with question_pool(source_question_id, topic, question, answer, aliases) as (
    values
      ('famosos-1', 'famosos', 'Cantante mexicano conocido como El Divo de Juarez.', 'Juan Gabriel', array['Juanga']::text[]),
      ('famosos-2', 'famosos', 'Cantante colombiana de Hips Don’t Lie.', 'Shakira', '{}'::text[]),
      ('famosos-3', 'famosos', 'Artista puertorriqueno de Un Verano Sin Ti.', 'Bad Bunny', '{}'::text[]),
      ('famosos-4', 'famosos', 'Cantante de Thriller y Billie Jean.', 'Michael Jackson', array['MJ']::text[]),
      ('f1-1', 'f1', 'Piloto mexicano conocido como Checo.', 'Sergio Perez', array['Checo Perez', 'Perez']::text[]),
      ('f1-2', 'f1', 'Equipo rojo historico de Formula 1.', 'Ferrari', array['Scuderia Ferrari']::text[]),
      ('f1-3', 'f1', 'Piloto neerlandes campeon con Red Bull.', 'Max Verstappen', array['Verstappen']::text[]),
      ('f1-4', 'f1', 'Circuito famoso de Monaco.', 'Monaco', array['Monte Carlo']::text[]),
      ('cultura-1', 'cultura-general', 'Planeta conocido como el planeta rojo.', 'Marte', '{}'::text[]),
      ('cultura-2', 'cultura-general', 'Capital de Japon.', 'Tokio', array['Tokyo']::text[]),
      ('cultura-3', 'cultura-general', 'Oceano mas grande del mundo.', 'Pacifico', array['Oceano Pacifico']::text[]),
      ('cultura-4', 'cultura-general', 'Autor de Don Quijote.', 'Miguel de Cervantes', array['Cervantes']::text[]),
      ('marcas-1', 'marcas', 'Marca de la manzana mordida.', 'Apple', '{}'::text[]),
      ('marcas-2', 'marcas', 'Marca deportiva con el swoosh.', 'Nike', '{}'::text[]),
      ('marcas-3', 'marcas', 'Refresco famoso de color rojo.', 'Coca-Cola', array['Coca Cola']::text[]),
      ('marcas-4', 'marcas', 'Marca de autos electricos de Elon Musk.', 'Tesla', '{}'::text[]),
      ('ficcion-1', 'personajes-ficticios', 'Heroe que vive en Ciudad Gotica.', 'Batman', array['Bruce Wayne']::text[]),
      ('ficcion-2', 'personajes-ficticios', 'Plomero de Nintendo con gorra roja.', 'Mario', array['Mario Bros']::text[]),
      ('ficcion-3', 'personajes-ficticios', 'Saiyajin protagonista de Dragon Ball.', 'Goku', array['Son Goku']::text[]),
      ('ficcion-4', 'personajes-ficticios', 'Princesa de hielo de Frozen.', 'Elsa', '{}'::text[]),
      ('objetos-1', 'objetos', 'Objeto para abrir una puerta.', 'Llave', '{}'::text[]),
      ('objetos-2', 'objetos', 'Objeto para escribir en papel.', 'Lapiz', array['Lápiz']::text[]),
      ('objetos-3', 'objetos', 'Objeto que marca la hora.', 'Reloj', '{}'::text[]),
      ('objetos-4', 'objetos', 'Objeto para protegerse de la lluvia.', 'Paraguas', '{}'::text[])
  ),
  picked as (
    select *
    from question_pool
    where topic = any(safe_topics)
    order by random()
    limit safe_question_count
  ),
  ordered as (
    select row_number() over () as question_order, *
    from picked
  )
  insert into public.room_trivia_questions (
    room_id,
    round_id,
    question_order,
    source_question_id,
    topic,
    question,
    answer,
    aliases,
    normalized_answer,
    normalized_aliases
  )
  select
    p_room_id,
    next_round.id,
    ordered.question_order,
    ordered.source_question_id,
    ordered.topic,
    ordered.question,
    ordered.answer,
    ordered.aliases,
    public.normalize_guess_who_answer(ordered.answer),
    coalesce((select array_agg(public.normalize_guess_who_answer(alias)) from unnest(ordered.aliases) as alias), '{}'::text[])
  from ordered;

  selected_count := (
    select count(*)
    from public.room_trivia_questions
    where round_id = next_round.id
  );

  if selected_count = 0 then
    raise exception 'ROUND_THEME_NOT_FOUND';
  end if;

  update public.rooms
  set status = 'active',
      selected_game_id = 'trivia'
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'trivia_round_started',
    jsonb_build_object('round_id', next_round.id, 'question_count', selected_count)
  );

  return next_round;
end;
$$;

create or replace function public.get_trivia_round_state(p_room_id uuid)
returns table (
  round_id uuid,
  question_id uuid,
  question_order integer,
  question_count integer,
  topic text,
  question text,
  round_status text,
  round_phase text,
  vote_deadline_at timestamptz,
  vote_duration_seconds integer,
  started_at timestamptz,
  user_id uuid,
  answer_text text,
  is_correct boolean,
  answered_at timestamptz,
  correct_count integer,
  is_current_user boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_question public.room_trivia_questions;
  total_questions integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_MEMBER_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'trivia'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  select count(*)
  into total_questions
  from public.room_trivia_questions
  where round_id = target_round.id;

  select *
  into current_question
  from public.room_trivia_questions
  where round_id = target_round.id
    and question_order = least(target_round.round_number, total_questions)
  limit 1;

  if current_question.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  return query
  select
    target_round.id,
    current_question.id,
    current_question.question_order,
    total_questions,
    current_question.topic,
    current_question.question,
    target_round.status,
    target_round.phase,
    target_round.vote_deadline_at,
    target_round.vote_duration_seconds,
    target_round.created_at,
    members.user_id,
    current_answer.answer_text,
    current_answer.is_correct,
    current_answer.answered_at,
    coalesce(correct_totals.correct_count, 0)::integer,
    members.user_id = current_user_id
  from public.room_members members
  left join public.room_trivia_answers current_answer
    on current_answer.question_id = current_question.id
    and current_answer.user_id = members.user_id
  left join (
    select user_id, count(*) filter (where is_correct) as correct_count
    from public.room_trivia_answers
    where round_id = target_round.id
    group by user_id
  ) correct_totals on correct_totals.user_id = members.user_id
  where members.room_id = p_room_id
    and members.is_active = true
  order by members.joined_at asc;
end;
$$;

create or replace function public.submit_trivia_answer(
  p_room_id uuid,
  p_answer text
)
returns public.room_trivia_answers
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_question public.room_trivia_questions;
  existing_answer public.room_trivia_answers;
  next_answer public.room_trivia_answers;
  normalized_value text;
  is_answer_correct boolean := false;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'trivia'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.vote_deadline_at is not null and target_round.vote_deadline_at < timezone('utc', now()) then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into current_question
  from public.room_trivia_questions
  where round_id = target_round.id
    and question_order = target_round.round_number
  limit 1;

  if current_question.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  select *
  into existing_answer
  from public.room_trivia_answers
  where question_id = current_question.id
    and user_id = current_user_id
  limit 1;

  if existing_answer.id is not null then
    return existing_answer;
  end if;

  normalized_value := public.normalize_guess_who_answer(p_answer);
  is_answer_correct := normalized_value = current_question.normalized_answer
    or normalized_value = any(current_question.normalized_aliases);

  insert into public.room_trivia_answers (
    room_id,
    round_id,
    question_id,
    user_id,
    answer_text,
    normalized_answer,
    is_correct
  )
  values (
    p_room_id,
    target_round.id,
    current_question.id,
    current_user_id,
    p_answer,
    normalized_value,
    is_answer_correct
  )
  returning * into next_answer;

  update public.room_rounds
  set updated_at = timezone('utc', now())
  where id = target_round.id;

  return next_answer;
end;
$$;

create or replace function public.advance_trivia_question(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_round public.room_rounds;
  total_questions integer := 0;
  active_member_count integer := 0;
  answered_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'trivia'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    return target_round;
  end if;

  select count(*)
  into total_questions
  from public.room_trivia_questions
  where round_id = target_round.id;

  active_member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  answered_count := (
    select count(*)
    from public.room_trivia_answers answers
    join public.room_trivia_questions questions on questions.id = answers.question_id
    where answers.round_id = target_round.id
      and questions.question_order = target_round.round_number
  );

  if target_room.host_user_id <> current_user_id
    and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now()))
    and answered_count < active_member_count then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  if target_round.round_number >= total_questions then
    update public.room_rounds
    set status = 'finished',
        phase = 'result',
        outcome = 'continue',
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;
  else
    update public.room_rounds
    set round_number = target_round.round_number + 1,
        vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.vote_duration_seconds, 20), 5)),
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;
  end if;

  return target_round;
end;
$$;

create or replace function public.start_who_said_round(
  p_room_id uuid,
  p_topic text default 'libre',
  p_write_seconds integer default 45,
  p_guess_seconds integer default 20
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  active_member_count integer := 0;
  safe_topic text := coalesce(p_topic, 'libre');
  next_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  select count(*)
  into active_member_count
  from public.room_members
  where room_id = p_room_id
    and is_active = true;

  if active_member_count < 2 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  if safe_topic not in ('comida', 'famosos', 'peliculas-series', 'musica', 'deportes', 'libre') then
    safe_topic := 'libre';
  end if;

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    phase,
    vote_deadline_at,
    vote_duration_seconds,
    answer_duration_seconds,
    started_by_user_id
  )
  values (
    p_room_id,
    0,
    'who-said',
    'who-said',
    safe_topic,
    '{}'::uuid[],
    'reveal',
    timezone('utc', now()) + make_interval(secs => greatest(coalesce(p_write_seconds, 45), 10)),
    greatest(coalesce(p_guess_seconds, 20), 5),
    current_user_id
  )
  returning * into next_round;

  update public.rooms
  set status = 'active',
      selected_game_id = 'who-said'
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'who_said_round_started',
    jsonb_build_object('topic', safe_topic)
  );

  return next_round;
end;
$$;

create or replace function public.submit_who_said_phrase(
  p_room_id uuid,
  p_phrase text
)
returns public.room_who_said_phrases
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  next_phrase public.room_who_said_phrases;
  cleaned_phrase text := nullif(btrim(coalesce(p_phrase, '')), '');
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if cleaned_phrase is null then
    raise exception 'PHRASE_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = current_user_id
      and is_active = true
  ) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'who-said'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'reveal' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.vote_deadline_at is not null and target_round.vote_deadline_at < timezone('utc', now()) then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  insert into public.room_who_said_phrases (
    room_id,
    round_id,
    author_user_id,
    topic,
    phrase_text
  )
  values (
    p_room_id,
    target_round.id,
    current_user_id,
    target_round.secret_word,
    cleaned_phrase
  )
  on conflict (round_id, author_user_id) do update
  set phrase_text = excluded.phrase_text,
      updated_at = timezone('utc', now())
  returning * into next_phrase;

  update public.room_rounds
  set updated_at = timezone('utc', now())
  where id = target_round.id;

  return next_phrase;
end;
$$;

create or replace function public.get_who_said_round_state(p_room_id uuid)
returns table (
  round_id uuid,
  round_number integer,
  topic text,
  round_status text,
  round_phase text,
  vote_deadline_at timestamptz,
  vote_duration_seconds integer,
  started_at timestamptz,
  phrase_count integer,
  submitted_count integer,
  current_phrase_id uuid,
  current_phrase_text text,
  current_phrase_order integer,
  current_phrase_author_user_id uuid,
  is_current_phrase_author boolean,
  user_id uuid,
  has_submitted_phrase boolean,
  guessed_user_id uuid,
  is_correct boolean,
  guessed_at timestamptz,
  is_current_user boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_phrase public.room_who_said_phrases;
  total_phrases integer := 0;
  total_submitted integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'who-said'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  select count(*), count(*) filter (where phrase_text is not null)
  into total_phrases, total_submitted
  from public.room_who_said_phrases
  where round_id = target_round.id;

  if target_round.round_number > 0 then
    select *
    into current_phrase
    from public.room_who_said_phrases
    where round_id = target_round.id
      and phrase_order = target_round.round_number
    limit 1;
  end if;

  return query
  select
    target_round.id,
    target_round.round_number,
    target_round.secret_word,
    target_round.status,
    target_round.phase,
    target_round.vote_deadline_at,
    target_round.vote_duration_seconds,
    target_round.created_at,
    total_phrases,
    total_submitted,
    current_phrase.id,
    current_phrase.phrase_text,
    current_phrase.phrase_order,
    case
      when current_phrase.author_user_id = current_user_id
        or target_round.phase = 'result'
        or target_round.status = 'finished'
      then current_phrase.author_user_id
      else null
    end,
    current_phrase.author_user_id = current_user_id,
    members.user_id,
    exists (
      select 1
      from public.room_who_said_phrases submitted_phrase
      where submitted_phrase.round_id = target_round.id
        and submitted_phrase.author_user_id = members.user_id
    ),
    guesses.guessed_user_id,
    guesses.is_correct,
    guesses.guessed_at,
    members.user_id = current_user_id
  from public.room_members members
  left join public.room_who_said_guesses guesses
    on guesses.phrase_id = current_phrase.id
    and guesses.user_id = members.user_id
  where members.room_id = p_room_id
    and members.is_active = true
  order by members.joined_at asc;
end;
$$;

create or replace function public.submit_who_said_guess(
  p_room_id uuid,
  p_guessed_user_id uuid
)
returns public.room_who_said_guesses
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_phrase public.room_who_said_phrases;
  existing_guess public.room_who_said_guesses;
  next_guess public.room_who_said_guesses;
  eligible_guessers integer := 0;
  guessed_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = current_user_id
      and is_active = true
  ) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'who-said'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'voting' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.vote_deadline_at is not null and target_round.vote_deadline_at < timezone('utc', now()) then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into current_phrase
  from public.room_who_said_phrases
  where round_id = target_round.id
    and phrase_order = target_round.round_number
  limit 1;

  if current_phrase.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if current_phrase.author_user_id = current_user_id then
    raise exception 'AUTHOR_CANNOT_GUESS';
  end if;

  if p_guessed_user_id = current_user_id then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = p_guessed_user_id
      and is_active = true
  ) then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  select *
  into existing_guess
  from public.room_who_said_guesses
  where phrase_id = current_phrase.id
    and user_id = current_user_id
  limit 1;

  if existing_guess.id is not null then
    return existing_guess;
  end if;

  insert into public.room_who_said_guesses (
    room_id,
    round_id,
    phrase_id,
    user_id,
    guessed_user_id,
    is_correct
  )
  values (
    p_room_id,
    target_round.id,
    current_phrase.id,
    current_user_id,
    p_guessed_user_id,
    p_guessed_user_id = current_phrase.author_user_id
  )
  returning * into next_guess;

  eligible_guessers := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
      and user_id <> current_phrase.author_user_id
  );

  guessed_count := (
    select count(*)
    from public.room_who_said_guesses
    where phrase_id = current_phrase.id
  );

  if eligible_guessers > 0 and guessed_count >= eligible_guessers then
    update public.room_rounds
    set phase = 'result',
        vote_deadline_at = null,
        updated_at = timezone('utc', now())
    where id = target_round.id;
  else
    update public.room_rounds
    set updated_at = timezone('utc', now())
    where id = target_round.id;
  end if;

  return next_guess;
end;
$$;

create or replace function public.advance_who_said_round(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_round public.room_rounds;
  current_phrase public.room_who_said_phrases;
  active_member_count integer := 0;
  submitted_count integer := 0;
  guessed_count integer := 0;
  eligible_guessers integer := 0;
  next_order integer;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'who-said'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    return target_round;
  end if;

  active_member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  if target_round.phase = 'reveal' then
    submitted_count := (
      select count(*)
      from public.room_who_said_phrases
      where round_id = target_round.id
    );

    if target_room.host_user_id <> current_user_id
      and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now()))
      and submitted_count < active_member_count then
      raise exception 'ROUND_HOST_ONLY';
    end if;

    if submitted_count < 2 then
      raise exception 'ROUND_MIN_PLAYERS';
    end if;

    with ordered as (
      select
        phrases.id,
        row_number() over (order by random()) as phrase_order
      from public.room_who_said_phrases phrases
      where phrases.round_id = target_round.id
    )
    update public.room_who_said_phrases phrases
    set phrase_order = ordered.phrase_order
    from ordered
    where phrases.id = ordered.id;

    update public.room_rounds
    set round_number = 1,
        phase = 'voting',
        vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.vote_duration_seconds, 20), 5)),
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    return target_round;
  end if;

  select *
  into current_phrase
  from public.room_who_said_phrases
  where round_id = target_round.id
    and phrase_order = target_round.round_number
  limit 1;

  if current_phrase.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.phase = 'voting' then
    eligible_guessers := greatest(active_member_count - 1, 0);

    guessed_count := (
      select count(*)
      from public.room_who_said_guesses
      where phrase_id = current_phrase.id
    );

    if target_room.host_user_id <> current_user_id
      and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now()))
      and guessed_count < eligible_guessers then
      raise exception 'ROUND_HOST_ONLY';
    end if;

    update public.room_rounds
    set phase = 'result',
        vote_deadline_at = null,
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    return target_round;
  end if;

  if target_round.phase = 'result' then
    select min(phrase_order)
    into next_order
    from public.room_who_said_phrases
    where round_id = target_round.id
      and phrase_order > target_round.round_number;

    if next_order is null then
      update public.room_rounds
      set status = 'finished',
          phase = 'result',
          outcome = 'continue',
          updated_at = timezone('utc', now())
      where id = target_round.id
      returning * into target_round;
    else
      update public.room_rounds
      set round_number = next_order,
          phase = 'voting',
          vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.vote_duration_seconds, 20), 5)),
          updated_at = timezone('utc', now())
      where id = target_round.id
      returning * into target_round;
    end if;
  end if;

  return target_round;
end;
$$;

create or replace function public.start_whose_top_round(
  p_room_id uuid,
  p_category text default 'mejores-comidas',
  p_top_size integer default 5,
  p_create_seconds integer default 60,
  p_guess_seconds integer default 25
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  active_member_count integer := 0;
  safe_category text := coalesce(p_category, 'mejores-comidas');
  safe_top_size integer := case when p_top_size in (3, 5, 10) then p_top_size else 5 end;
  option_labels text[];
  next_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  select count(*)
  into active_member_count
  from public.room_members
  where room_id = p_room_id
    and is_active = true;

  if active_member_count < 2 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  option_labels := case safe_category
    when 'mejores-actores' then array['Leonardo DiCaprio','Denzel Washington','Meryl Streep','Tom Hanks','Robert Downey Jr.','Margot Robbie','Emma Stone','Ryan Gosling','Keanu Reeves','Zendaya','Pedro Pascal','Jenna Ortega','Christian Bale','Natalie Portman','Scarlett Johansson','Morgan Freeman','Viola Davis','Florence Pugh','Al Pacino','Robert De Niro','Samuel L. Jackson','Anne Hathaway','Hugh Jackman','Brad Pitt','Angelina Jolie','Cate Blanchett','Timothee Chalamet','Ana de Armas','Will Smith','Jackie Chan']
    when 'mejores-comidas' then array['Tacos','Pizza','Sushi','Hamburguesa','Ramen','Pasta','Asado','Ceviche','Pozole','Chilaquiles','Enchiladas','Quesadillas','Paella','Lasagna','Curry','Burrito','Hot dog','Alitas','Falafel','Arepas','Empanadas','Croissant','Dim sum','Pho','Pad Thai','Tamales','Torta','Mole','Poke','Gelato']
    when 'mejores-peliculas' then array['Titanic','Avatar','Interstellar','Inception','The Batman','Avengers: Endgame','Spider-Man: No Way Home','Harry Potter','Star Wars','Jurassic Park','The Matrix','Toy Story','Shrek','Coco','Up','El Rey Leon','Back to the Future','Forrest Gump','The Godfather','Pulp Fiction','La La Land','Parasite','Whiplash','Gladiator','The Dark Knight','Finding Nemo','WALL-E','Ratatouille','Black Panther','Oppenheimer']
    when 'mejores-videojuegos' then array['Minecraft','Fortnite','GTA V','Mario Kart','Super Mario Odyssey','Zelda: Breath of the Wild','Zelda: Tears of the Kingdom','The Last of Us','God of War','FIFA','EA Sports FC','Call of Duty','Halo','Roblox','Among Us','Fall Guys','Rocket League','Valorant','League of Legends','Overwatch','Pokemon','Animal Crossing','Red Dead Redemption 2','Elden Ring','Resident Evil 4','Mortal Kombat','Street Fighter','The Sims','Clash Royale','Mario Party']
    when 'mejores-cantantes' then array['Taylor Swift','Bad Bunny','Shakira','Juan Gabriel','Luis Miguel','Michael Jackson','Beyonce','Rihanna','Ariana Grande','Billie Eilish','Dua Lipa','The Weeknd','Drake','Karol G','Feid','Rosalia','Bruno Mars','Ed Sheeran','Justin Bieber','Olivia Rodrigo','Miley Cyrus','Selena Gomez','Katy Perry','SZA','Adele','Lady Gaga','Harry Styles','Peso Pluma','Natanael Cano','Rauw Alejandro']
    when 'mejores-marcas' then array['Apple','Nike','Adidas','Coca-Cola','Pepsi','McDonalds','Starbucks','Netflix','Disney','Google','Amazon','Tesla','Samsung','Sony','Nintendo','PlayStation','Xbox','Spotify','YouTube','Instagram','TikTok','WhatsApp','Uber','Airbnb','Zara','H&M','Gucci','Louis Vuitton','Rolex','Red Bull']
    else null
  end;

  if option_labels is null or array_length(option_labels, 1) < safe_top_size then
    safe_category := 'mejores-comidas';
    option_labels := array['Tacos','Pizza','Sushi','Hamburguesa','Ramen','Pasta','Asado','Ceviche','Pozole','Chilaquiles','Enchiladas','Quesadillas','Paella','Lasagna','Curry','Burrito','Hot dog','Alitas','Falafel','Arepas','Empanadas','Croissant','Dim sum','Pho','Pad Thai','Tamales','Torta','Mole','Poke','Gelato'];
  end if;

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    phase,
    vote_deadline_at,
    vote_duration_seconds,
    answer_duration_seconds,
    started_by_user_id
  )
  values (
    p_room_id,
    0,
    'whose-top',
    'whose-top',
    safe_category,
    '{}'::uuid[],
    'reveal',
    timezone('utc', now()) + make_interval(secs => greatest(coalesce(p_create_seconds, 60), 10)),
    greatest(coalesce(p_guess_seconds, 25), 5),
    greatest(coalesce(p_create_seconds, 60), 10),
    current_user_id
  )
  returning * into next_round;

  insert into public.room_whose_top_options (room_id, round_id, category, top_size, option_labels)
  values (p_room_id, next_round.id, safe_category, safe_top_size, option_labels);

  update public.rooms
  set status = 'active',
      selected_game_id = 'whose-top',
      updated_at = timezone('utc', now())
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'whose_top_round_started',
    jsonb_build_object('category', safe_category, 'top_size', safe_top_size)
  );

  return next_round;
end;
$$;

create or replace function public.submit_whose_top(
  p_room_id uuid,
  p_items text[]
)
returns public.room_whose_top_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  top_config public.room_whose_top_options;
  clean_items text[];
  next_top public.room_whose_top_submissions;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'whose-top'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'reveal' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into top_config
  from public.room_whose_top_options
  where round_id = target_round.id
  limit 1;

  clean_items := (
    select coalesce(array_agg(distinct btrim(item)), '{}'::text[])
    from unnest(coalesce(p_items, '{}'::text[])) as item
    where btrim(item) <> ''
      and btrim(item) = any(top_config.option_labels)
  );

  if array_length(clean_items, 1) <> top_config.top_size then
    raise exception 'TOP_REQUIRED';
  end if;

  insert into public.room_whose_top_submissions (
    room_id,
    round_id,
    author_user_id,
    category,
    top_size,
    option_labels,
    items
  )
  values (
    p_room_id,
    target_round.id,
    current_user_id,
    top_config.category,
    top_config.top_size,
    top_config.option_labels,
    clean_items
  )
  on conflict (round_id, author_user_id) do update
  set items = excluded.items,
      updated_at = timezone('utc', now())
  returning * into next_top;

  update public.room_rounds
  set updated_at = timezone('utc', now())
  where id = target_round.id;

  return next_top;
end;
$$;

create or replace function public.get_whose_top_round_state(p_room_id uuid)
returns table (
  round_id uuid,
  round_number integer,
  category text,
  top_size integer,
  option_labels text[],
  round_status text,
  round_phase text,
  vote_deadline_at timestamptz,
  vote_duration_seconds integer,
  started_at timestamptz,
  top_count integer,
  submitted_count integer,
  current_top_id uuid,
  current_top_items text[],
  current_top_order integer,
  current_top_author_user_id uuid,
  is_current_top_author boolean,
  user_id uuid,
  has_submitted_top boolean,
  guessed_user_id uuid,
  is_correct boolean,
  guessed_at timestamptz,
  is_current_user boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  top_config public.room_whose_top_options;
  current_top public.room_whose_top_submissions;
  total_tops integer := 0;
  total_submitted integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'whose-top'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  select *
  into top_config
  from public.room_whose_top_options
  where round_id = target_round.id
  limit 1;

  select count(*), count(*) filter (where array_length(items, 1) = top_config.top_size)
  into total_tops, total_submitted
  from public.room_whose_top_submissions
  where round_id = target_round.id;

  if target_round.round_number > 0 then
    select *
    into current_top
    from public.room_whose_top_submissions
    where round_id = target_round.id
      and top_order = target_round.round_number
    limit 1;
  end if;

  return query
  select
    target_round.id,
    target_round.round_number,
    top_config.category,
    top_config.top_size,
    top_config.option_labels,
    target_round.status,
    target_round.phase,
    target_round.vote_deadline_at,
    target_round.vote_duration_seconds,
    target_round.created_at,
    total_tops,
    total_submitted,
    current_top.id,
    coalesce(current_top.items, '{}'::text[]),
    current_top.top_order,
    case
      when current_top.author_user_id = current_user_id
        or target_round.phase = 'result'
        or target_round.status = 'finished'
      then current_top.author_user_id
      else null
    end,
    current_top.author_user_id = current_user_id,
    members.user_id,
    exists (
      select 1
      from public.room_whose_top_submissions submitted_top
      where submitted_top.round_id = target_round.id
        and submitted_top.author_user_id = members.user_id
    ),
    guesses.guessed_user_id,
    guesses.is_correct,
    guesses.guessed_at,
    members.user_id = current_user_id
  from public.room_members members
  left join public.room_whose_top_guesses guesses
    on guesses.top_id = current_top.id
    and guesses.user_id = members.user_id
  where members.room_id = p_room_id
    and members.is_active = true
  order by members.joined_at asc;
end;
$$;

create or replace function public.submit_whose_top_guess(
  p_room_id uuid,
  p_guessed_user_id uuid
)
returns public.room_whose_top_guesses
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_top public.room_whose_top_submissions;
  existing_guess public.room_whose_top_guesses;
  next_guess public.room_whose_top_guesses;
  eligible_guessers integer := 0;
  guessed_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'whose-top'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'voting' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into current_top
  from public.room_whose_top_submissions
  where round_id = target_round.id
    and top_order = target_round.round_number
  limit 1;

  if current_top.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if current_top.author_user_id = current_user_id then
    raise exception 'AUTHOR_CANNOT_GUESS';
  end if;

  if p_guessed_user_id = current_user_id then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = p_guessed_user_id
      and is_active = true
  ) then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  select *
  into existing_guess
  from public.room_whose_top_guesses
  where top_id = current_top.id
    and user_id = current_user_id
  limit 1;

  if existing_guess.id is not null then
    return existing_guess;
  end if;

  insert into public.room_whose_top_guesses (
    room_id,
    round_id,
    top_id,
    user_id,
    guessed_user_id,
    is_correct
  )
  values (
    p_room_id,
    target_round.id,
    current_top.id,
    current_user_id,
    p_guessed_user_id,
    p_guessed_user_id = current_top.author_user_id
  )
  returning * into next_guess;

  eligible_guessers := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
      and user_id <> current_top.author_user_id
  );

  guessed_count := (
    select count(*)
    from public.room_whose_top_guesses
    where top_id = current_top.id
  );

  if eligible_guessers > 0 and guessed_count >= eligible_guessers then
    update public.room_rounds
    set phase = 'result',
        vote_deadline_at = null,
        updated_at = timezone('utc', now())
    where id = target_round.id;
  else
    update public.room_rounds
    set updated_at = timezone('utc', now())
    where id = target_round.id;
  end if;

  return next_guess;
end;
$$;

create or replace function public.advance_whose_top_round(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_round public.room_rounds;
  current_top public.room_whose_top_submissions;
  active_member_count integer := 0;
  submitted_count integer := 0;
  guessed_count integer := 0;
  eligible_guessers integer := 0;
  next_order integer;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'whose-top'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    return target_round;
  end if;

  active_member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  if target_round.phase = 'reveal' then
    submitted_count := (
      select count(*)
      from public.room_whose_top_submissions
      where round_id = target_round.id
    );

    if target_room.host_user_id <> current_user_id
      and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now()))
      and submitted_count < active_member_count then
      raise exception 'ROUND_HOST_ONLY';
    end if;

    if submitted_count < 2 then
      raise exception 'ROUND_MIN_PLAYERS';
    end if;

    with ordered as (
      select
        submissions.id,
        row_number() over (order by random()) as top_order
      from public.room_whose_top_submissions submissions
      where submissions.round_id = target_round.id
    )
    update public.room_whose_top_submissions submissions
    set top_order = ordered.top_order
    from ordered
    where submissions.id = ordered.id;

    update public.room_rounds
    set round_number = 1,
        phase = 'voting',
        vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.vote_duration_seconds, 25), 5)),
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    return target_round;
  end if;

  select *
  into current_top
  from public.room_whose_top_submissions
  where round_id = target_round.id
    and top_order = target_round.round_number
  limit 1;

  if current_top.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.phase = 'voting' then
    eligible_guessers := greatest(active_member_count - 1, 0);

    guessed_count := (
      select count(*)
      from public.room_whose_top_guesses
      where top_id = current_top.id
    );

    if target_room.host_user_id <> current_user_id
      and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now()))
      and guessed_count < eligible_guessers then
      raise exception 'ROUND_HOST_ONLY';
    end if;

    update public.room_rounds
    set phase = 'result',
        vote_deadline_at = null,
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    return target_round;
  end if;

  if target_round.phase = 'result' then
    select min(top_order)
    into next_order
    from public.room_whose_top_submissions
    where round_id = target_round.id
      and top_order > target_round.round_number;

    if next_order is null then
      update public.room_rounds
      set status = 'finished',
          phase = 'result',
          outcome = 'continue',
          updated_at = timezone('utc', now())
      where id = target_round.id
      returning * into target_round;
    else
      update public.room_rounds
      set round_number = next_order,
          phase = 'voting',
          vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.vote_duration_seconds, 25), 5)),
          updated_at = timezone('utc', now())
      where id = target_round.id
      returning * into target_round;
    end if;
  end if;

  return target_round;
end;
$$;

create or replace function public.start_majority_round(
  p_room_id uuid,
  p_category text default 'comida',
  p_round_count integer default 5,
  p_answer_seconds integer default 20,
  p_prediction_seconds integer default 15
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  active_member_count integer := 0;
  safe_category text := coalesce(p_category, 'comida');
  safe_round_count integer := greatest(1, least(coalesce(p_round_count, 5), 10));
  next_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  select count(*)
  into active_member_count
  from public.room_members
  where room_id = p_room_id
    and is_active = true;

  if active_member_count < 2 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  if safe_category not in ('comida', 'gustos', 'peliculas-series', 'musica', 'random', 'amigos') then
    safe_category := 'comida';
  end if;

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    phase,
    vote_deadline_at,
    vote_duration_seconds,
    started_by_user_id
  )
  values (
    p_room_id,
    1,
    'majority',
    'majority',
    safe_category,
    '{}'::uuid[],
    'reveal',
    timezone('utc', now()) + make_interval(secs => greatest(coalesce(p_answer_seconds, 20), 5)),
    greatest(coalesce(p_prediction_seconds, 15), 5),
    greatest(coalesce(p_answer_seconds, 20), 5),
    current_user_id
  )
  returning * into next_round;

  with question_pool(source_question_id, category, question, options) as (
    values
      ('comida-1', 'comida', '¿Pizza o sushi?', array['Pizza', 'Sushi']::text[]),
      ('comida-2', 'comida', '¿Tacos o hamburguesa?', array['Tacos', 'Hamburguesa']::text[]),
      ('comida-3', 'comida', '¿Dulce o salado?', array['Dulce', 'Salado']::text[]),
      ('comida-4', 'comida', '¿Cafe o te?', array['Cafe', 'Te']::text[]),
      ('gustos-1', 'gustos', '¿Playa o montaña?', array['Playa', 'Montaña']::text[]),
      ('gustos-2', 'gustos', '¿Dia o noche?', array['Dia', 'Noche']::text[]),
      ('gustos-3', 'gustos', '¿Perros o gatos?', array['Perros', 'Gatos']::text[]),
      ('gustos-4', 'gustos', '¿Salir o quedarse?', array['Salir', 'Quedarse']::text[]),
      ('peliculas-1', 'peliculas-series', '¿Marvel o DC?', array['Marvel', 'DC']::text[]),
      ('peliculas-2', 'peliculas-series', '¿Comedia o terror?', array['Comedia', 'Terror']::text[]),
      ('peliculas-3', 'peliculas-series', '¿Series o peliculas?', array['Series', 'Peliculas']::text[]),
      ('peliculas-4', 'peliculas-series', '¿Netflix o cine?', array['Netflix', 'Cine']::text[]),
      ('musica-1', 'musica', '¿Pop o rock?', array['Pop', 'Rock']::text[]),
      ('musica-2', 'musica', '¿Reggaeton o regional?', array['Reggaeton', 'Regional']::text[]),
      ('musica-3', 'musica', '¿Playlist o album?', array['Playlist', 'Album']::text[]),
      ('musica-4', 'musica', '¿Concierto o festival?', array['Concierto', 'Festival']::text[]),
      ('random-1', 'random', '¿Pasado o futuro?', array['Pasado', 'Futuro']::text[]),
      ('random-2', 'random', '¿Volar o teletransportarte?', array['Volar', 'Teletransportarme']::text[]),
      ('random-3', 'random', '¿Invisible o superfuerte?', array['Invisible', 'Superfuerte']::text[]),
      ('random-4', 'random', '¿Risa o drama?', array['Risa', 'Drama']::text[]),
      ('amigos-1', 'amigos', '¿Plan tranquilo o fiesta?', array['Tranquilo', 'Fiesta']::text[]),
      ('amigos-2', 'amigos', '¿Chat o llamada?', array['Chat', 'Llamada']::text[]),
      ('amigos-3', 'amigos', '¿Organizado o espontaneo?', array['Organizado', 'Espontaneo']::text[]),
      ('amigos-4', 'amigos', '¿Broma o foto grupal?', array['Broma', 'Foto']::text[])
  ),
  ordered as (
    select
      row_number() over (order by random()) as question_order,
      source_question_id,
      category,
      question,
      options
    from question_pool
    where category = safe_category
    limit safe_round_count
  )
  insert into public.room_majority_questions (
    room_id,
    round_id,
    question_order,
    source_question_id,
    category,
    question,
    options
  )
  select
    p_room_id,
    next_round.id,
    question_order,
    source_question_id,
    category,
    question,
    options
  from ordered;

  update public.rooms
  set status = 'active',
      selected_game_id = 'majority'
  where id = p_room_id;

  return next_round;
end;
$$;

create or replace function public.get_majority_round_state(p_room_id uuid)
returns table (
  round_id uuid,
  question_id uuid,
  round_number integer,
  round_count integer,
  category text,
  question text,
  options text[],
  majority_options text[],
  option_counts jsonb,
  round_status text,
  round_phase text,
  vote_deadline_at timestamptz,
  vote_duration_seconds integer,
  started_at timestamptz,
  user_id uuid,
  answer_option text,
  prediction_option text,
  answered_at timestamptz,
  predicted_at timestamptz,
  is_prediction_correct boolean,
  is_current_user boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_question public.room_majority_questions;
  total_questions integer := 0;
  majority_result text[] := '{}'::text[];
  counts_result jsonb := '{}'::jsonb;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'majority'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  select *
  into current_question
  from public.room_majority_questions
  where round_id = target_round.id
    and question_order = target_round.round_number
  limit 1;

  if current_question.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  select count(*)
  into total_questions
  from public.room_majority_questions
  where round_id = target_round.id;

  if target_round.phase = 'result' or target_round.status = 'finished' then
    with answer_counts as (
      select responses.answer_option, count(*)::integer as answer_count
      from public.room_majority_responses responses
      where responses.question_id = current_question.id
        and responses.answer_option is not null
      group by responses.answer_option
    ),
    max_count as (
      select coalesce(max(answer_count), 0) as value
      from answer_counts
    )
    select
      coalesce(array_agg(answer_counts.answer_option order by answer_counts.answer_option) filter (where answer_counts.answer_count = max_count.value and max_count.value > 0), '{}'::text[]),
      coalesce(jsonb_object_agg(answer_counts.answer_option, answer_counts.answer_count), '{}'::jsonb)
    into majority_result, counts_result
    from answer_counts, max_count;
  end if;

  return query
  select
    target_round.id,
    current_question.id,
    target_round.round_number,
    total_questions,
    current_question.category,
    current_question.question,
    current_question.options,
    majority_result,
    counts_result,
    target_round.status,
    target_round.phase,
    target_round.vote_deadline_at,
    target_round.vote_duration_seconds,
    target_round.created_at,
    members.user_id,
    case
      when members.user_id = current_user_id
        or target_round.phase = 'result'
        or target_round.status = 'finished'
      then responses.answer_option
      else null
    end,
    case
      when members.user_id = current_user_id
        or target_round.phase = 'result'
        or target_round.status = 'finished'
      then responses.prediction_option
      else null
    end,
    responses.answered_at,
    responses.predicted_at,
    case
      when target_round.phase = 'result' or target_round.status = 'finished'
      then responses.prediction_option = any(majority_result)
      else null
    end,
    members.user_id = current_user_id
  from public.room_members members
  left join public.room_majority_responses responses
    on responses.question_id = current_question.id
    and responses.user_id = members.user_id
  where members.room_id = p_room_id
    and members.is_active = true
  order by members.joined_at asc;
end;
$$;

create or replace function public.submit_majority_answer(
  p_room_id uuid,
  p_option text
)
returns public.room_majority_responses
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_question public.room_majority_questions;
  next_response public.room_majority_responses;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = current_user_id
      and is_active = true
  ) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'majority'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'reveal' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.vote_deadline_at is not null and target_round.vote_deadline_at < timezone('utc', now()) then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into current_question
  from public.room_majority_questions
  where round_id = target_round.id
    and question_order = target_round.round_number
  limit 1;

  if current_question.id is null or p_option <> all(current_question.options) then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  insert into public.room_majority_responses (
    room_id,
    round_id,
    question_id,
    user_id,
    answer_option,
    answered_at
  )
  values (
    p_room_id,
    target_round.id,
    current_question.id,
    current_user_id,
    p_option,
    timezone('utc', now())
  )
  on conflict (question_id, user_id) do update
  set answer_option = excluded.answer_option,
      answered_at = excluded.answered_at,
      updated_at = timezone('utc', now())
  returning * into next_response;

  update public.room_rounds
  set updated_at = timezone('utc', now())
  where id = target_round.id;

  return next_response;
end;
$$;

create or replace function public.submit_majority_prediction(
  p_room_id uuid,
  p_option text
)
returns public.room_majority_responses
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_question public.room_majority_questions;
  next_response public.room_majority_responses;
  active_member_count integer := 0;
  predicted_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = current_user_id
      and is_active = true
  ) then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'majority'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'voting' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.vote_deadline_at is not null and target_round.vote_deadline_at < timezone('utc', now()) then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into current_question
  from public.room_majority_questions
  where round_id = target_round.id
    and question_order = target_round.round_number
  limit 1;

  if current_question.id is null or p_option <> all(current_question.options) then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  insert into public.room_majority_responses (
    room_id,
    round_id,
    question_id,
    user_id,
    prediction_option,
    predicted_at
  )
  values (
    p_room_id,
    target_round.id,
    current_question.id,
    current_user_id,
    p_option,
    timezone('utc', now())
  )
  on conflict (question_id, user_id) do update
  set prediction_option = excluded.prediction_option,
      predicted_at = excluded.predicted_at,
      updated_at = timezone('utc', now())
  returning * into next_response;

  active_member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  predicted_count := (
    select count(*)
    from public.room_majority_responses
    where question_id = current_question.id
      and predicted_at is not null
  );

  if predicted_count >= active_member_count then
    update public.room_rounds
    set phase = 'result',
        vote_deadline_at = null,
        updated_at = timezone('utc', now())
    where id = target_round.id;
  else
    update public.room_rounds
    set updated_at = timezone('utc', now())
    where id = target_round.id;
  end if;

  return next_response;
end;
$$;

create or replace function public.advance_majority_round(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_round public.room_rounds;
  current_question public.room_majority_questions;
  active_member_count integer := 0;
  answered_count integer := 0;
  predicted_count integer := 0;
  total_questions integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'majority'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    return target_round;
  end if;

  select *
  into current_question
  from public.room_majority_questions
  where round_id = target_round.id
    and question_order = target_round.round_number
  limit 1;

  if current_question.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  active_member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  select count(*)
  into total_questions
  from public.room_majority_questions
  where round_id = target_round.id;

  if target_round.phase = 'reveal' then
    answered_count := (
      select count(*)
      from public.room_majority_responses
      where question_id = current_question.id
        and answered_at is not null
    );

    if target_room.host_user_id <> current_user_id
      and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now()))
      and answered_count < active_member_count then
      raise exception 'ROUND_HOST_ONLY';
    end if;

    update public.room_rounds
    set phase = 'voting',
        vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.vote_duration_seconds, 15), 5)),
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    return target_round;
  end if;

  if target_round.phase = 'voting' then
    predicted_count := (
      select count(*)
      from public.room_majority_responses
      where question_id = current_question.id
        and predicted_at is not null
    );

    if target_room.host_user_id <> current_user_id
      and (target_round.vote_deadline_at is null or target_round.vote_deadline_at > timezone('utc', now()))
      and predicted_count < active_member_count then
      raise exception 'ROUND_HOST_ONLY';
    end if;

    update public.room_rounds
    set phase = 'result',
        vote_deadline_at = null,
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    return target_round;
  end if;

  if target_round.phase = 'result' then
    if target_round.round_number >= total_questions then
      update public.room_rounds
      set status = 'finished',
          phase = 'result',
          outcome = 'continue',
          updated_at = timezone('utc', now())
      where id = target_round.id
      returning * into target_round;
    else
      update public.room_rounds
      set round_number = target_round.round_number + 1,
          phase = 'reveal',
          vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.answer_duration_seconds, 20), 5)),
          updated_at = timezone('utc', now())
      where id = target_round.id
      returning * into target_round;
    end if;
  end if;

  return target_round;
end;
$$;

create or replace function public.add_room_tournament_points(
  p_room_id uuid,
  p_user_id uuid,
  p_points integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_points <= 0 then
    return;
  end if;

  insert into public.room_tournament_scores (room_id, user_id, points)
  values (p_room_id, p_user_id, p_points)
  on conflict (room_id, user_id) do update
  set points = public.room_tournament_scores.points + excluded.points,
      updated_at = timezone('utc', now());
end;
$$;

create or replace function public.score_room_tournament_round(p_room_id uuid)
returns table (
  user_id uuid,
  points integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  target_round public.room_rounds;
  current_phrase public.room_who_said_phrases;
  selected_order integer := 1;
  correct_guessers integer := 0;
  total_guessers integer := 0;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'finished' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.scored_at is not null then
    return query
    select scores.user_id, scores.points
    from public.room_tournament_scores scores
    where scores.room_id = p_room_id
    order by scores.points desc, scores.updated_at asc;
    return;
  end if;

  selected_order := coalesce(array_position(target_room.selected_game_ids, target_round.game_id), 1);

  if target_round.game_id = 'impostor' then
    if target_round.outcome = 'impostors_caught' then
      insert into public.room_tournament_scores (room_id, user_id, points)
      select p_room_id, members.user_id, 1
      from public.room_members members
      where members.room_id = p_room_id
        and members.is_active = true
        and members.user_id <> all(target_round.impostor_ids)
      on conflict (room_id, user_id) do update
      set points = public.room_tournament_scores.points + excluded.points,
          updated_at = timezone('utc', now());
    else
      insert into public.room_tournament_scores (room_id, user_id, points)
      select p_room_id, impostor_id, 3
      from unnest(target_round.impostor_ids) as impostor_id
      on conflict (room_id, user_id) do update
      set points = public.room_tournament_scores.points + excluded.points,
          updated_at = timezone('utc', now());
    end if;
  elsif target_round.game_id = 'guess-who' then
    insert into public.room_tournament_scores (room_id, user_id, points)
    select p_room_id, assignments.user_id, 1
    from public.room_guess_who_assignments assignments
    where assignments.round_id = target_round.id
      and assignments.solved_at is not null
    on conflict (room_id, user_id) do update
    set points = public.room_tournament_scores.points + excluded.points,
        updated_at = timezone('utc', now());
  elsif target_round.game_id = 'faces-gestures' then
    select
      count(*) filter (where answers.solved_at is not null),
      count(*)
    into correct_guessers, total_guessers
    from public.room_faces_gestures_answers answers
    where answers.round_id = target_round.id;

    insert into public.room_tournament_scores (room_id, user_id, points)
    select p_room_id, answers.user_id, 1
    from public.room_faces_gestures_answers answers
    where answers.round_id = target_round.id
      and answers.solved_at is not null
    on conflict (room_id, user_id) do update
    set points = public.room_tournament_scores.points + excluded.points,
        updated_at = timezone('utc', now());

    if target_round.actor_user_id is not null and correct_guessers > 0 then
      perform public.add_room_tournament_points(
        p_room_id,
        target_round.actor_user_id,
        case when correct_guessers = total_guessers then 2 else 1 end
      );
    end if;
  elsif target_round.game_id = 'trivia' then
    with correct_counts as (
      select
        members.user_id,
        count(answers.id) filter (where answers.is_correct) as correct_count
      from public.room_members members
      left join public.room_trivia_answers answers
        on answers.user_id = members.user_id
        and answers.round_id = target_round.id
      where members.room_id = p_room_id
        and members.is_active = true
      group by members.user_id
    ),
    ranked as (
      select
        user_id,
        dense_rank() over (order by correct_count desc) as trivia_rank
      from correct_counts
    ),
    scored as (
      select
        user_id,
        case
          when trivia_rank = 1 then 3
          when trivia_rank = 2 then 2
          when trivia_rank = 3 then 1
          else 0
        end as points
      from ranked
    )
    insert into public.room_tournament_scores (room_id, user_id, points)
    select p_room_id, scored.user_id, scored.points
    from scored
    where scored.points > 0
    on conflict (room_id, user_id) do update
    set points = public.room_tournament_scores.points + excluded.points,
        updated_at = timezone('utc', now());
  elsif target_round.game_id = 'who-said' then
    insert into public.room_tournament_scores (room_id, user_id, points)
    select p_room_id, guesses.user_id, count(*)::integer
    from public.room_who_said_guesses guesses
    where guesses.round_id = target_round.id
      and guesses.is_correct = true
    group by guesses.user_id
    having count(*) > 0
    on conflict (room_id, user_id) do update
    set points = public.room_tournament_scores.points + excluded.points,
        updated_at = timezone('utc', now());

    for current_phrase in
      select *
      from public.room_who_said_phrases
      where round_id = target_round.id
    loop
      select
        count(*) filter (where guesses.is_correct),
        greatest(
          (
            select count(*)
            from public.room_members members
            where members.room_id = p_room_id
              and members.is_active = true
              and members.user_id <> current_phrase.author_user_id
          ),
          0
        )
      into correct_guessers, total_guessers
      from public.room_who_said_guesses guesses
      where guesses.phrase_id = current_phrase.id;

      if correct_guessers > 0 and correct_guessers < total_guessers then
        perform public.add_room_tournament_points(p_room_id, current_phrase.author_user_id, 1);
      end if;
    end loop;
  elsif target_round.game_id = 'majority' then
    with question_majorities as (
      select
        questions.id as question_id,
        responses.answer_option,
        count(*)::integer as answer_count
      from public.room_majority_questions questions
      join public.room_majority_responses responses
        on responses.question_id = questions.id
      where questions.round_id = target_round.id
        and responses.answer_option is not null
      group by questions.id, responses.answer_option
    ),
    max_counts as (
      select question_id, max(answer_count) as max_count
      from question_majorities
      group by question_id
    ),
    majority_options as (
      select question_majorities.question_id, question_majorities.answer_option
      from question_majorities
      join max_counts
        on max_counts.question_id = question_majorities.question_id
        and max_counts.max_count = question_majorities.answer_count
    )
    insert into public.room_tournament_scores (room_id, user_id, points)
    select p_room_id, responses.user_id, count(*)::integer
    from public.room_majority_responses responses
    join majority_options
      on majority_options.question_id = responses.question_id
      and majority_options.answer_option = responses.prediction_option
    where responses.round_id = target_round.id
      and responses.prediction_option is not null
    group by responses.user_id
    having count(*) > 0
    on conflict (room_id, user_id) do update
    set points = public.room_tournament_scores.points + excluded.points,
        updated_at = timezone('utc', now());
  elsif target_round.game_id = 'troll' then
    if target_round.outcome = 'troll_eliminated' then
      insert into public.room_tournament_scores (room_id, user_id, points)
      select p_room_id, assignments.user_id, 1
      from public.room_troll_assignments assignments
      where assignments.round_id = target_round.id
      on conflict (room_id, user_id) do update
      set points = public.room_tournament_scores.points + excluded.points,
          updated_at = timezone('utc', now());
    elsif target_round.outcome = 'impostor_eliminated' then
      insert into public.room_tournament_scores (room_id, user_id, points)
      select
        p_room_id,
        assignments.user_id,
        case
          when assignments.role = 'troll' and assignments.is_eliminated = false then 4
          when assignments.role = 'innocent' and assignments.is_eliminated = false then 1
          else 0
        end
      from public.room_troll_assignments assignments
      where assignments.round_id = target_round.id
        and (
          (assignments.role = 'troll' and assignments.is_eliminated = false)
          or (assignments.role = 'innocent' and assignments.is_eliminated = false)
        )
      on conflict (room_id, user_id) do update
      set points = public.room_tournament_scores.points + excluded.points,
          updated_at = timezone('utc', now());
    end if;
  end if;

  insert into public.room_tournament_completed_games (room_id, game_id, game_order)
  values (p_room_id, target_round.game_id, selected_order)
  on conflict (room_id, game_id) do update
  set completed_at = timezone('utc', now()),
      game_order = excluded.game_order;

  update public.room_rounds
  set scored_at = timezone('utc', now())
  where id = target_round.id;

  return query
  select scores.user_id, scores.points
  from public.room_tournament_scores scores
  where scores.room_id = p_room_id
  order by scores.points desc, scores.updated_at asc;
end;
$$;

create or replace function public.reset_room_tournament(p_room_id uuid)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  delete from public.room_rounds
  where room_id = p_room_id;

  delete from public.room_tournament_scores
  where room_id = p_room_id;

  delete from public.room_tournament_completed_games
  where room_id = p_room_id;

  update public.rooms
  set status = 'waiting',
      selected_game_id = coalesce(selected_game_ids[1], selected_game_id, 'impostor'),
      updated_at = timezone('utc', now())
  where id = p_room_id
  returning * into target_room;

  return target_room;
end;
$$;

create or replace function public.start_troll_round(
  p_room_id uuid,
  p_category text default 'animals',
  p_discussion_seconds integer default 45,
  p_voting_seconds integer default 30,
  p_round_count integer default 1
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
  member_count integer := 0;
  theme_words text[];
  real_word text;
  troll_word text;
  next_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  member_count := (
    select count(*)
    from public.room_members
    where room_id = p_room_id
      and is_active = true
  );

  if member_count < 4 then
    raise exception 'ROUND_MIN_PLAYERS';
  end if;

  theme_words := case p_category
    when 'animals' then array['Leon', 'Tigre', 'Elefante', 'Delfin', 'Lobo', 'Zorro']
    when 'countries' then array['Mexico', 'Japon', 'Italia', 'Brasil', 'Canada', 'Argentina']
    when 'objects' then array['Brujula', 'Lampara', 'Martillo', 'Mochila', 'Reloj', 'Camara']
    when 'faces-gestures' then array['Sonrisa', 'Carcajada', 'Cara seria', 'Sorpresa', 'Enojo', 'Duda']
    when 'famous-people' then array['Zendaya', 'Tom Holland', 'Keanu Reeves', 'Emma Stone', 'Pedro Pascal', 'Shakira']
    when 'football-players' then array['Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappe', 'Neymar', 'Ronaldinho', 'Vinicius Jr.']
    when 'movies-series' then array['Breaking Bad', 'Stranger Things', 'Harry Potter', 'Star Wars', 'Shrek', 'Toy Story']
    when 'youtubers' then array['MrBeast', 'Ibai', 'AuronPlay', 'Rubius', 'Luisito Comunica', 'Dross']
    when 'basketball' then array['Michael Jordan', 'LeBron James', 'Stephen Curry', 'Kobe Bryant', 'Shaquille O''Neal', 'Kevin Durant']
    when 'f1' then array['Max Verstappen', 'Lewis Hamilton', 'Fernando Alonso', 'Charles Leclerc', 'Lando Norris', 'Sergio Perez']
    when 'singers' then array['Taylor Swift', 'Bad Bunny', 'Billie Eilish', 'Karol G', 'Drake', 'Dua Lipa']
    when 'cartoons-fictional' then array['Mickey Mouse', 'Goku', 'Naruto', 'Batman', 'Spider-Man', 'Pikachu']
    when 'world-foods' then array['Tacos', 'Pizza', 'Sushi', 'Ramen', 'Paella', 'Hamburguesa']
    else null
  end;

  if theme_words is null or array_length(theme_words, 1) < 2 then
    raise exception 'ROUND_THEME_NOT_FOUND';
  end if;

  real_word := theme_words[1 + floor(random() * array_length(theme_words, 1))::integer];

  loop
    troll_word := theme_words[1 + floor(random() * array_length(theme_words, 1))::integer];
    exit when troll_word <> real_word;
  end loop;

  delete from public.room_rounds
  where room_id = p_room_id;

  insert into public.room_rounds (
    room_id,
    round_number,
    round_total,
    game_id,
    theme_category,
    secret_word,
    impostor_ids,
    eliminated_user_ids,
    expelled_user_id,
    phase,
    vote_deadline_at,
    vote_duration_seconds,
    answer_duration_seconds,
    outcome,
    started_by_user_id,
    status
  )
  values (
    p_room_id,
    1,
    greatest(coalesce(p_round_count, 1), 1),
    'troll',
    p_category,
    real_word,
    '{}'::uuid[],
    '{}'::uuid[],
    null,
    'reveal',
    timezone('utc', now()) + make_interval(secs => greatest(coalesce(p_discussion_seconds, 45), 10)),
    greatest(coalesce(p_voting_seconds, 30), 10),
    greatest(coalesce(p_discussion_seconds, 45), 10),
    'continue',
    current_user_id,
    'active'
  )
  returning * into next_round;

  with shuffled_members as (
    select
      room_members.user_id,
      row_number() over (order by random()) as role_order
    from public.room_members
    where room_members.room_id = p_room_id
      and room_members.is_active = true
  ),
  role_rows as (
    select
      user_id,
      case
        when role_order = 1 then 'impostor'
        when role_order = 2 then 'troll'
        else 'innocent'
      end as role
    from shuffled_members
  )
  insert into public.room_troll_assignments (room_id, round_id, user_id, role, word)
  select
    p_room_id,
    next_round.id,
    role_rows.user_id,
    role_rows.role,
    case
      when role_rows.role = 'impostor' then null
      when role_rows.role = 'troll' then troll_word
      else real_word
    end
  from role_rows;

  update public.room_rounds
  set impostor_ids = (
    select array_agg(assignments.user_id)
    from public.room_troll_assignments assignments
    where assignments.round_id = next_round.id
      and assignments.role = 'impostor'
  )
  where id = next_round.id
  returning * into next_round;

  update public.rooms
  set status = 'active',
      selected_game_id = 'troll',
      updated_at = timezone('utc', now())
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'round_started',
    jsonb_build_object('game_id', 'troll', 'round_id', next_round.id)
  );

  return next_round;
end;
$$;

create or replace function public.get_troll_round_state(p_room_id uuid)
returns table (
  round_id uuid,
  round_number integer,
  round_count integer,
  category_id text,
  real_word text,
  troll_word text,
  round_status text,
  round_phase text,
  vote_deadline_at timestamptz,
  vote_duration_seconds integer,
  discussion_duration_seconds integer,
  started_at timestamptz,
  outcome text,
  expelled_user_id uuid,
  eliminated_user_ids uuid[],
  user_id uuid,
  role text,
  word text,
  is_eliminated boolean,
  is_current_user boolean
)
language sql
security definer
set search_path = public
as $$
  select
    rounds.id as round_id,
    rounds.round_number,
    rounds.round_total as round_count,
    rounds.theme_category as category_id,
    case when rounds.phase = 'result' or rounds.status = 'finished' then rounds.secret_word else null end as real_word,
    case
      when rounds.phase = 'result' or rounds.status = 'finished' then (
        select troll_assignment.word
        from public.room_troll_assignments troll_assignment
        where troll_assignment.round_id = rounds.id
          and troll_assignment.role = 'troll'
        limit 1
      )
      else null
    end as troll_word,
    rounds.status as round_status,
    rounds.phase as round_phase,
    rounds.vote_deadline_at,
    rounds.vote_duration_seconds,
    rounds.answer_duration_seconds as discussion_duration_seconds,
    rounds.created_at as started_at,
    rounds.outcome,
    rounds.expelled_user_id,
    rounds.eliminated_user_ids,
    assignments.user_id,
    case
      when assignments.user_id = auth.uid() or rounds.phase = 'result' or rounds.status = 'finished' then assignments.role
      else null
    end as role,
    case
      when assignments.user_id = auth.uid() or rounds.phase = 'result' or rounds.status = 'finished' then assignments.word
      else null
    end as word,
    assignments.is_eliminated,
    assignments.user_id = auth.uid() as is_current_user
  from public.room_rounds rounds
  join public.room_troll_assignments assignments
    on assignments.round_id = rounds.id
  where rounds.room_id = p_room_id
    and rounds.game_id = 'troll'
    and private.is_room_member(p_room_id)
  order by assignments.created_at asc;
$$;

create or replace function public.cast_troll_vote(
  p_room_id uuid,
  p_target_user_id uuid
)
returns public.room_round_votes
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  current_assignment public.room_troll_assignments;
  target_assignment public.room_troll_assignments;
  next_vote public.room_round_votes;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'troll'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'voting' then
    raise exception 'ROUND_NOT_VOTING';
  end if;

  select *
  into current_assignment
  from public.room_troll_assignments
  where round_id = target_round.id
    and user_id = current_user_id
  limit 1;

  if current_assignment.id is null or current_assignment.is_eliminated then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  select *
  into target_assignment
  from public.room_troll_assignments
  where round_id = target_round.id
    and user_id = p_target_user_id
  limit 1;

  if target_assignment.id is null then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  if target_assignment.is_eliminated then
    raise exception 'ROUND_TARGET_ELIMINATED';
  end if;

  insert into public.room_round_votes (room_id, round_id, voter_user_id, target_user_id)
  values (p_room_id, target_round.id, current_user_id, p_target_user_id)
  on conflict (round_id, voter_user_id) do update
  set target_user_id = excluded.target_user_id,
      created_at = timezone('utc', now())
  returning * into next_vote;

  return next_vote;
end;
$$;

create or replace function public.advance_troll_round(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  winning_target_id uuid;
  winning_role text;
  next_eliminated_ids uuid[];
  next_outcome text := 'continue';
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
    and game_id = 'troll'
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if target_round.phase = 'reveal' then
    update public.room_rounds
    set phase = 'voting',
        vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(vote_duration_seconds, 30), 10)),
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    delete from public.room_round_votes
    where round_id = target_round.id;

    return target_round;
  end if;

  if target_round.phase = 'result' and target_round.outcome = 'continue' then
    if target_round.round_number >= target_round.round_total then
      update public.room_rounds
      set status = 'finished',
          updated_at = timezone('utc', now())
      where id = target_round.id
      returning * into target_round;

      return target_round;
    end if;

    update public.room_rounds
    set round_number = target_round.round_number + 1,
        phase = 'reveal',
        vote_deadline_at = timezone('utc', now()) + make_interval(secs => greatest(coalesce(answer_duration_seconds, 45), 10)),
        expelled_user_id = null,
        updated_at = timezone('utc', now())
    where id = target_round.id
    returning * into target_round;

    delete from public.room_round_votes
    where round_id = target_round.id;

    return target_round;
  end if;

  if target_round.phase <> 'voting' then
    raise exception 'ROUND_NOT_VOTING';
  end if;

  select vote_row.target_user_id
  into winning_target_id
  from public.room_round_votes vote_row
  join public.room_troll_assignments assignments
    on assignments.round_id = vote_row.round_id
    and assignments.user_id = vote_row.target_user_id
    and assignments.is_eliminated = false
  where vote_row.round_id = target_round.id
  group by vote_row.target_user_id
  order by count(*) desc, min(vote_row.created_at) asc
  limit 1;

  next_eliminated_ids := coalesce(target_round.eliminated_user_ids, '{}'::uuid[]);

  if winning_target_id is not null then
    select role
    into winning_role
    from public.room_troll_assignments
    where round_id = target_round.id
      and user_id = winning_target_id
    limit 1;

    next_eliminated_ids := (
      select array_agg(distinct value_item)
      from unnest(array_append(next_eliminated_ids, winning_target_id)) as value_item
    );

    update public.room_troll_assignments
    set is_eliminated = true
    where round_id = target_round.id
      and user_id = winning_target_id;

    next_outcome := case
      when winning_role = 'troll' then 'troll_eliminated'
      when winning_role = 'impostor' then 'impostor_eliminated'
      else 'innocent_eliminated'
    end;
  end if;

  update public.room_rounds
  set phase = 'result',
      vote_deadline_at = null,
      expelled_user_id = winning_target_id,
      eliminated_user_ids = coalesce(next_eliminated_ids, '{}'::uuid[]),
      outcome = next_outcome,
      status = case
        when next_outcome in ('troll_eliminated', 'impostor_eliminated') then 'finished'
        when round_number >= round_total then 'finished'
        else 'active'
      end,
      updated_at = timezone('utc', now())
  where id = target_round.id
  returning * into target_round;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'vote_resolved',
    jsonb_build_object(
      'game_id', 'troll',
      'round_id', target_round.id,
      'expelled_user_id', winning_target_id,
      'outcome', target_round.outcome
    )
  );

  return target_round;
end;
$$;

create or replace function public.advance_impostor_round(
  p_room_id uuid
)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.status <> 'active' or target_round.phase <> 'result' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  update public.room_rounds
  set round_number = target_round.round_number + 1,
      phase = 'voting',
      vote_deadline_at = case
        when coalesce(target_round.vote_duration_seconds, 45) <= 0 then null
        else timezone('utc', now()) + make_interval(secs => greatest(coalesce(target_round.vote_duration_seconds, 45), 10))
      end,
      expelled_user_id = null,
      outcome = 'continue',
      updated_at = timezone('utc', now())
  where id = target_round.id
  returning * into target_round;

  delete from public.room_round_votes
  where round_id = target_round.id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'round_started',
    jsonb_build_object('round_id', target_round.id, 'round_number', target_round.round_number)
  );

  return target_round;
end;
$$;

create or replace function public.cast_impostor_vote(
  p_room_id uuid,
  p_target_user_id uuid
)
returns public.room_round_votes
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  next_vote public.room_round_votes;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.phase <> 'voting' then
    raise exception 'ROUND_NOT_VOTING';
  end if;

  if p_target_user_id = any(target_round.eliminated_user_ids) then
    raise exception 'ROUND_TARGET_ELIMINATED';
  end if;

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = p_target_user_id
      and is_active = true
  ) then
    raise exception 'ROUND_TARGET_NOT_FOUND';
  end if;

  insert into public.room_round_votes (room_id, round_id, voter_user_id, target_user_id)
  values (p_room_id, target_round.id, current_user_id, p_target_user_id)
  on conflict (round_id, voter_user_id) do update
  set target_user_id = excluded.target_user_id,
      created_at = timezone('utc', now())
  returning * into next_vote;

  return next_vote;
end;
$$;

create or replace function public.resolve_impostor_vote(p_room_id uuid)
returns public.room_rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_round public.room_rounds;
  winning_target_id uuid;
  next_eliminated_ids uuid[];
  remaining_impostor_count integer := 0;
  remaining_innocent_count integer := 0;
  all_impostors_eliminated boolean := false;
  impostors_balanced boolean := false;
  missed_impostor boolean := false;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_room_member(p_room_id) then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_round
  from public.room_rounds
  where room_id = p_room_id
  limit 1;

  if target_round.id is null then
    raise exception 'ROUND_NOT_FOUND';
  end if;

  if target_round.phase <> 'voting' then
    raise exception 'ROUND_NOT_VOTING';
  end if;

  select vote_row.target_user_id
  into winning_target_id
  from public.room_round_votes vote_row
  where vote_row.round_id = target_round.id
  group by vote_row.target_user_id
  order by count(*) desc, min(vote_row.created_at) asc
  limit 1;

  next_eliminated_ids := target_round.eliminated_user_ids;

  if winning_target_id is not null then
    next_eliminated_ids := (
      select array_agg(distinct value_item)
      from unnest(array_append(coalesce(target_round.eliminated_user_ids, '{}'::uuid[]), winning_target_id)) as value_item
    );
  end if;

  all_impostors_eliminated := coalesce(target_round.impostor_ids <@ coalesce(next_eliminated_ids, '{}'::uuid[]), false);
  missed_impostor := winning_target_id is null or not (winning_target_id = any(target_round.impostor_ids));

  remaining_impostor_count := (
    select count(*)
    from unnest(target_round.impostor_ids) as impostor_id
    where not (impostor_id = any(coalesce(next_eliminated_ids, '{}'::uuid[])))
  );

  remaining_innocent_count := greatest(
    (
      select count(*)
      from public.room_members
      where room_id = p_room_id
        and is_active = true
        and not (user_id = any(coalesce(next_eliminated_ids, '{}'::uuid[])))
    ) - remaining_impostor_count,
    0
  );

  impostors_balanced := coalesce(target_round.balance_rule_enabled, true)
    and remaining_impostor_count > 0
    and remaining_impostor_count >= remaining_innocent_count;

  update public.room_rounds
  set phase = 'result',
      vote_deadline_at = null,
      expelled_user_id = winning_target_id,
      eliminated_user_ids = coalesce(next_eliminated_ids, '{}'::uuid[]),
      outcome = case
        when all_impostors_eliminated then 'impostors_caught'
        when impostors_balanced then 'impostors_balanced'
        when missed_impostor and target_round.miss_behavior = 'end' then 'missed_impostor'
        else 'continue'
      end,
      status = case
        when all_impostors_eliminated then 'finished'
        when impostors_balanced then 'finished'
        when missed_impostor and target_round.miss_behavior = 'end' then 'finished'
        else 'active'
      end,
      updated_at = timezone('utc', now())
  where id = target_round.id
  returning * into target_round;

  update public.rooms
  set status = 'active',
      updated_at = timezone('utc', now())
  where id = p_room_id;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'vote_resolved',
    jsonb_build_object(
      'round_id', target_round.id,
      'expelled_user_id', winning_target_id,
      'all_impostors_eliminated', all_impostors_eliminated,
      'impostors_balanced', impostors_balanced,
      'missed_impostor', missed_impostor,
      'outcome', target_round.outcome
    )
  );

  return target_round;
end;
$$;

create or replace function public.return_room_to_lobby(
  p_room_id uuid
)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_room public.rooms;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_room
  from public.rooms
  where id = p_room_id
  limit 1;

  if target_room.id is null then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if target_room.host_user_id <> current_user_id then
    raise exception 'ROUND_HOST_ONLY';
  end if;

  delete from public.room_round_votes
  where room_id = p_room_id;

  delete from public.room_rounds
  where room_id = p_room_id;

  update public.rooms
  set status = 'waiting',
      updated_at = timezone('utc', now())
  where id = p_room_id
  returning * into target_room;

  insert into public.room_activity (room_id, actor_user_id, type, payload)
  values (
    p_room_id,
    current_user_id,
    'room_reset',
    jsonb_build_object('destination', 'room')
  );

  return target_room;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, preferred_language)
  values (
    new.id,
    concat('user-', left(new.id::text, 8)),
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    'es'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id, language, linked_provider_label, theme_preference)
  values (
    new.id,
    'es',
    initcap(
      coalesce(
        new.raw_app_meta_data ->> 'provider',
        case when coalesce(new.is_anonymous, false) then 'guest' else 'email' end
      )
    ),
    'default'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.update_profile_appearance(
  p_avatar_id text,
  p_frame_id text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_profile public.profiles;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.profiles
  set avatar_id = coalesce(nullif(p_avatar_id, ''), 'default'),
      frame_id = coalesce(nullif(p_frame_id, ''), 'plain'),
      updated_at = timezone('utc', now())
  where id = current_user_id
  returning * into target_profile;

  return target_profile;
end;
$$;

create or replace function public.add_friend_by_username(target_username text)
returns public.user_friendships
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_profile public.profiles;
  existing_friendship public.user_friendships;
  next_friendship public.user_friendships;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into target_profile
  from public.profiles
  where lower(username) = lower(trim(target_username))
  limit 1;

  if target_profile.id is null then
    raise exception 'FRIEND_NOT_FOUND';
  end if;

  if target_profile.id = current_user_id then
    raise exception 'FRIEND_SELF';
  end if;

  select *
  into existing_friendship
  from public.user_friendships
  where (requester_id = current_user_id and addressee_id = target_profile.id)
     or (requester_id = target_profile.id and addressee_id = current_user_id)
  limit 1;

  if existing_friendship.id is not null then
    raise exception 'FRIEND_ALREADY_EXISTS';
  end if;

  insert into public.user_friendships (requester_id, addressee_id, status)
  values (current_user_id, target_profile.id, 'pending')
  returning * into next_friendship;

  return next_friendship;
end;
$$;

create or replace function public.respond_friend_request(friendship_id uuid, accept boolean)
returns public.user_friendships
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  next_friendship public.user_friendships;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if accept then
    update public.user_friendships
    set status = 'accepted',
        responded_at = timezone('utc', now())
    where id = friendship_id
      and addressee_id = current_user_id
      and status = 'pending'
    returning * into next_friendship;
  else
    delete from public.user_friendships
    where id = friendship_id
      and addressee_id = current_user_id
      and status = 'pending'
    returning * into next_friendship;
  end if;

  return next_friendship;
end;
$$;

create or replace view public.friend_list_view as
select
  friendship.id as friendship_id,
  case
    when friendship.requester_id = auth.uid() then friendship.addressee_id
    else friendship.requester_id
  end as friend_id,
  profile.display_name,
  profile.username,
  profile.avatar_id,
  profile.frame_id,
  friendship.status as friendship_status,
  case
    when friendship.status = 'accepted' and room_member.is_active is true then 'online'
    when friendship.status = 'accepted' then 'offline'
    else 'pending'
  end as presence_status,
  case
    when friendship.requester_id = auth.uid() then 'outgoing'
    else 'incoming'
  end as request_direction,
  friendship.created_at,
  friendship.responded_at
from public.user_friendships friendship
join public.profiles profile
  on profile.id = case
    when friendship.requester_id = auth.uid() then friendship.addressee_id
    else friendship.requester_id
  end
left join public.room_members room_member
  on room_member.user_id = profile.id
 and room_member.is_active = true
where auth.uid() = friendship.requester_id
   or auth.uid() = friendship.addressee_id;

do $$
begin
  if not exists (
    select 1
    from pg_trigger trigger_row
    join pg_class class_row on class_row.oid = trigger_row.tgrelid
    join pg_namespace namespace_row on namespace_row.oid = class_row.relnamespace
    where trigger_row.tgname = 'on_auth_user_created'
      and class_row.relname = 'users'
      and namespace_row.nspname = 'auth'
  ) then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();
  end if;
end;
$$;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (
  auth.uid() = id
  or private.shares_active_room_with_user(id)
);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
on public.user_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings
for update
using (auth.uid() = user_id);

drop policy if exists "Users can read own friendships" on public.user_friendships;
create policy "Users can read own friendships"
on public.user_friendships
for select
using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Users can create friend requests" on public.user_friendships;
create policy "Users can create friend requests"
on public.user_friendships
for insert
with check (auth.uid() = requester_id);

drop policy if exists "Users can respond to received requests" on public.user_friendships;
create policy "Users can respond to received requests"
on public.user_friendships
for update
using (auth.uid() = addressee_id)
with check (auth.uid() = addressee_id);

drop policy if exists "Users can delete own friendships" on public.user_friendships;
create policy "Users can delete own friendships"
on public.user_friendships
for delete
using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Members can read rooms" on public.rooms;
create policy "Members can read rooms"
on public.rooms
for select
using (
  auth.uid() = host_user_id
  or private.is_room_member(id)
);

drop policy if exists "Hosts can update rooms" on public.rooms;
create policy "Hosts can update rooms"
on public.rooms
for update
using (auth.uid() = host_user_id);

drop policy if exists "Members can read room_members" on public.room_members;
create policy "Members can read room_members"
on public.room_members
for select
using (
  user_id = auth.uid()
  or private.is_room_member(room_id)
);

drop policy if exists "Users can update own room membership" on public.room_members;
create policy "Users can update own room membership"
on public.room_members
for update
using (user_id = auth.uid());

drop policy if exists "Members can read room activity" on public.room_activity;
create policy "Members can read room activity"
on public.room_activity
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read room rounds" on public.room_rounds;
create policy "Members can read room rounds"
on public.room_rounds
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read room round votes" on public.room_round_votes;
create policy "Members can read room round votes"
on public.room_round_votes
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read faces gestures answers" on public.room_faces_gestures_answers;
create policy "Members can read faces gestures answers"
on public.room_faces_gestures_answers
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read tournament scores" on public.room_tournament_scores;
create policy "Members can read tournament scores"
on public.room_tournament_scores
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read tournament completed games" on public.room_tournament_completed_games;
create policy "Members can read tournament completed games"
on public.room_tournament_completed_games
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read trivia questions" on public.room_trivia_questions;
create policy "Members can read trivia questions"
on public.room_trivia_questions
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read trivia answers" on public.room_trivia_answers;
create policy "Members can read trivia answers"
on public.room_trivia_answers
for select
using (
  private.is_room_member(room_id)
);

drop policy if exists "Members can read who said phrases" on public.room_who_said_phrases;

drop policy if exists "Members can read who said guesses" on public.room_who_said_guesses;

drop policy if exists "Members can read majority questions" on public.room_majority_questions;

drop policy if exists "Members can read majority responses" on public.room_majority_responses;

drop policy if exists "Members can read troll assignments" on public.room_troll_assignments;
create policy "Members can read troll assignments"
on public.room_troll_assignments
for select
using (
  private.is_room_member(room_id)
);
