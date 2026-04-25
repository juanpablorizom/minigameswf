create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
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

alter table public.user_settings
add column if not exists theme_preference text not null default 'default';

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  selected_game_id text,
  visibility text not null default 'private' check (visibility in ('private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

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
  game_id text not null default 'impostor',
  theme_category text not null check (
    theme_category in (
      'animals',
      'countries',
      'objects',
      'famous-people',
      'football-players',
      'movies-series',
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
  miss_behavior text not null default 'repeat' check (miss_behavior in ('repeat', 'end')),
  balance_rule_enabled boolean not null default true,
  outcome text not null default 'continue' check (outcome in ('impostors_caught', 'impostors_balanced', 'missed_impostor', 'continue')),
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
    'famous-people',
    'football-players',
    'movies-series',
    'youtubers',
    'basketball',
    'f1',
    'singers',
    'cartoons-fictional',
    'world-foods'
  )
);

alter table public.room_rounds add column if not exists vote_duration_seconds integer not null default 45;
alter table public.room_rounds add column if not exists miss_behavior text not null default 'repeat';
alter table public.room_rounds add column if not exists balance_rule_enabled boolean not null default true;
alter table public.room_rounds add column if not exists outcome text not null default 'continue';

create table if not exists public.room_round_votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_id uuid not null references public.room_rounds (id) on delete cascade,
  voter_user_id uuid not null references auth.users (id) on delete cascade,
  target_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (round_id, voter_user_id)
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_activity enable row level security;
alter table public.room_rounds enable row level security;
alter table public.room_round_votes enable row level security;

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

create or replace function public.create_private_room(p_selected_game_id text default null)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  next_room public.rooms;
  next_code text;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.room_members
  set is_active = false
  where user_id = current_user_id;

  loop
    next_code := public.generate_room_code();

    begin
      insert into public.rooms (code, host_user_id, status, selected_game_id, visibility)
      values (next_code, current_user_id, 'waiting', p_selected_game_id, 'private')
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
