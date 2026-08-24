-- Vocab IELTS: run this in Supabase SQL Editor (once)

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  exam_date date not null,
  target_vocab_size int not null default 9000,
  baseline_vocab_size int not null default 0,
  notify_interval_minutes int not null default 30,
  daily_review_time text not null default '08:00',
  last_daily_review_date date,
  onboarding_complete boolean not null default false,
  streak int not null default 0,
  last_streak_date date,
  game_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.words (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  meaning text not null,
  example text,
  phonetic text,
  part_of_speech text,
  tags text[] not null default '{}',
  added_date date not null,
  due timestamptz not null,
  stability double precision not null default 0,
  difficulty double precision not null default 0,
  elapsed_days double precision not null default 0,
  scheduled_days double precision not null default 0,
  learning_steps int not null default 0,
  reps int not null default 0,
  lapses int not null default 0,
  state text not null,
  last_review timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists words_user_id_idx on public.words(user_id);
create index if not exists words_user_due_idx on public.words(user_id, due);

create table if not exists public.review_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null,
  rating int not null check (rating between 1 and 4),
  reviewed_at timestamptz not null,
  response_time_ms int not null default 0
);

create index if not exists review_logs_user_id_idx on public.review_logs(user_id);

alter table public.user_settings enable row level security;
alter table public.words enable row level security;
alter table public.review_logs enable row level security;

drop policy if exists "settings_own" on public.user_settings;
create policy "settings_own" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "words_own" on public.words;
create policy "words_own" on public.words
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "logs_own" on public.review_logs;
create policy "logs_own" on public.review_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.user_settings add column if not exists game_state jsonb not null default '{}'::jsonb;
