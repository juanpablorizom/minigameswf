create extension if not exists pgcrypto;

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

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_activity enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
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
    initcap(coalesce(new.app_metadata ->> 'provider', 'email')),
    'default'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1
    from public.room_members viewer_membership
    join public.room_members target_membership
      on target_membership.room_id = viewer_membership.room_id
    where viewer_membership.user_id = auth.uid()
      and viewer_membership.is_active = true
      and target_membership.user_id = profiles.id
  )
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
  or exists (
    select 1
    from public.room_members
    where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
      and room_members.is_active = true
  )
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
  or exists (
    select 1
    from public.room_members viewer_membership
    where viewer_membership.room_id = room_members.room_id
      and viewer_membership.user_id = auth.uid()
      and viewer_membership.is_active = true
  )
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
  exists (
    select 1
    from public.room_members viewer_membership
    where viewer_membership.room_id = room_activity.room_id
      and viewer_membership.user_id = auth.uid()
      and viewer_membership.is_active = true
  )
);
