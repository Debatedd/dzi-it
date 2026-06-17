-- ============================================================================
--  ДЗИ по ИТ — схема на базата данни (изпълни я в Supabase → SQL Editor)
-- ============================================================================
--  Таблици:
--    profiles           — публичен профил + точки/серия (1:1 с auth.users)
--    question_progress  — прогрес на потребителя по всеки въпрос
--
--  Сигурност: Row Level Security (RLS) — всеки потребител вижда и променя
--  само своите редове.
-- ============================================================================

-- ── 1. ПРОФИЛИ ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  points      integer not null default 0,
  streak      integer not null default 0,
  last_active date,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Профилите се четат публично" on public.profiles;
create policy "Профилите се четат публично"
  on public.profiles for select
  using (true);

drop policy if exists "Потребителят редактира своя профил" on public.profiles;
create policy "Потребителят редактира своя профил"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Потребителят създава своя профил" on public.profiles;
create policy "Потребителят създава своя профил"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── 2. ПРОГРЕС ПО ВЪПРОСИ ───────────────────────────────────────────────────
create table if not exists public.question_progress (
  user_id       uuid not null references auth.users (id) on delete cascade,
  question_id   text not null,
  last_correct  boolean not null default false,
  attempts      integer not null default 0,
  correct_count integer not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.question_progress enable row level security;

drop policy if exists "Потребителят чете своя прогрес" on public.question_progress;
create policy "Потребителят чете своя прогрес"
  on public.question_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Потребителят пише своя прогрес" on public.question_progress;
create policy "Потребителят пише своя прогрес"
  on public.question_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. АВТОМАТИЧНО СЪЗДАВАНЕ НА ПРОФИЛ ПРИ РЕГИСТРАЦИЯ ──────────────────────
-- Когато се регистрира нов потребител в auth.users, създаваме му профил.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
