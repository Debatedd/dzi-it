-- ============================================================================
--  Quiz система — стаи и резултати (изпълни в Supabase → SQL Editor)
-- ============================================================================
--  quiz_rooms        — тест, създаден от влязъл потребител (учител)
--  quiz_participants — резултат на ученик (само с име, без акаунт)
-- ============================================================================

-- ── СТАИ ────────────────────────────────────────────────────────────────────
create table if not exists public.quiz_rooms (
  id                 uuid primary key default gen_random_uuid(),
  code               text unique not null,
  host_id            uuid not null references auth.users (id) on delete cascade,
  title              text,
  topics             text[] not null default '{}',
  num_closed         integer not null default 0,
  num_open           integer not null default 0,
  time_limit_seconds integer not null default 600,
  question_ids       jsonb not null default '{"closed":[],"open":[]}',
  created_at         timestamptz not null default now()
);

alter table public.quiz_rooms enable row level security;

drop policy if exists "Стаите се четат публично" on public.quiz_rooms;
create policy "Стаите се четат публично"
  on public.quiz_rooms for select using (true);

drop policy if exists "Влезли потребители създават стаи" on public.quiz_rooms;
create policy "Влезли потребители създават стаи"
  on public.quiz_rooms for insert with check (auth.uid() = host_id);

drop policy if exists "Домакинът управлява своите стаи" on public.quiz_rooms;
create policy "Домакинът управлява своите стаи"
  on public.quiz_rooms for update using (auth.uid() = host_id);

drop policy if exists "Домакинът трие своите стаи" on public.quiz_rooms;
create policy "Домакинът трие своите стаи"
  on public.quiz_rooms for delete using (auth.uid() = host_id);

-- ── РЕЗУЛТАТИ НА УЧЕНИЦИ ─────────────────────────────────────────────────────
create table if not exists public.quiz_participants (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.quiz_rooms (id) on delete cascade,
  name        text not null,
  score       integer not null default 0,
  max_score   integer not null default 0,
  answers     jsonb not null default '{}',
  finished_at timestamptz not null default now()
);

alter table public.quiz_participants enable row level security;

-- Всеки ученик може да предаде резултат, стига стаята да съществува.
drop policy if exists "Всеки предава резултат за валидна стая" on public.quiz_participants;
create policy "Всеки предава резултат за валидна стая"
  on public.quiz_participants for insert
  with check (exists (select 1 from public.quiz_rooms r where r.id = room_id));

-- Само домакинът на стаята вижда резултатите.
drop policy if exists "Домакинът вижда резултатите" on public.quiz_participants;
create policy "Домакинът вижда резултатите"
  on public.quiz_participants for select
  using (exists (
    select 1 from public.quiz_rooms r
    where r.id = quiz_participants.room_id and r.host_id = auth.uid()
  ));

create index if not exists quiz_participants_room_idx
  on public.quiz_participants (room_id);
