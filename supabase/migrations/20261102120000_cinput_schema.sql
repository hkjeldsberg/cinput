-- CInput: 30-day Spanish comprehensible-input tracker.
-- Everything lives in schema `cinput`. Access is server-side only via service_role;
-- RLS is enabled with no policies so anon/authenticated get nothing.

create schema if not exists cinput;

-- Single-row app settings. start_date null = not started yet (chosen in app).
create table cinput.settings (
  id smallint primary key default 1 check (id = 1),
  start_date date,
  daily_goal_min int not null default 30,
  hours_goal int not null default 12,
  days_goal int not null default 25
);

-- The fixed 30-day plan from V0.
create table cinput.plan_days (
  day_number int primary key check (day_number between 1 and 30),
  week int not null check (week between 1 and 5),
  focus text not null,
  level_label text not null,
  target text not null,
  is_review boolean not null default false
);

create table cinput.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text unique,
  url text not null,
  title text not null,
  channel text not null default '',
  level text not null check (level in ('beginner', 'intermediate', 'upper', 'advanced')),
  ds_level int check (ds_level between 1 and 7),
  duration_min int not null check (duration_min between 1 and 60),
  topic text not null default '',
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

-- Suggested videos per day.
create table cinput.day_videos (
  day_number int not null references cinput.plan_days (day_number) on delete cascade,
  video_id uuid not null references cinput.videos (id) on delete cascade,
  position int not null default 0,
  primary key (day_number, video_id)
);

-- One log per watched video per day.
create table cinput.watch_logs (
  id uuid primary key default gen_random_uuid(),
  day_number int not null references cinput.plan_days (day_number) on delete cascade,
  video_id uuid not null references cinput.videos (id) on delete cascade,
  minutes int not null check (minutes between 1 and 60),
  comprehension_pct int not null check (comprehension_pct between 0 and 100),
  rewound boolean not null default false,
  watched_at timestamptz not null default now(),
  unique (day_number, video_id)
);

create index watch_logs_watched_at_idx on cinput.watch_logs (watched_at);

create table cinput.phrases (
  id uuid primary key default gen_random_uuid(),
  watch_log_id uuid not null references cinput.watch_logs (id) on delete cascade,
  phrase text not null check (length(trim(phrase)) > 0),
  meaning text not null default '',
  created_at timestamptz not null default now()
);

create index phrases_watch_log_id_idx on cinput.phrases (watch_log_id);

-- The method allows at most 5 phrases per video.
create function cinput.enforce_phrase_limit() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.watch_log_id::text));
  if (select count(*) from cinput.phrases where watch_log_id = new.watch_log_id) >= 5 then
    raise exception 'phrase_limit: max 5 phrases per video' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger phrases_limit
  before insert on cinput.phrases
  for each row execute function cinput.enforce_phrase_limit();

-- V0 weekly check.
create table cinput.weekly_reviews (
  week int primary key check (week between 1 and 5),
  comprehension_pct int check (comprehension_pct between 0 and 100),
  what_felt_hard text not null default '',
  next_topic text not null default '',
  updated_at timestamptz not null default now()
);

-- Lock down: service_role only.
alter table cinput.settings enable row level security;
alter table cinput.plan_days enable row level security;
alter table cinput.videos enable row level security;
alter table cinput.day_videos enable row level security;
alter table cinput.watch_logs enable row level security;
alter table cinput.phrases enable row level security;
alter table cinput.weekly_reviews enable row level security;

revoke all on schema cinput from anon, authenticated;
grant usage on schema cinput to service_role;
grant all on all tables in schema cinput to service_role;
grant all on all routines in schema cinput to service_role;
alter default privileges in schema cinput grant all on tables to service_role;

insert into cinput.settings (id) values (1);
