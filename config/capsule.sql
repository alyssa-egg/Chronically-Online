-- Run in the EXISTING Supabase project's SQL editor. This does not touch payments.
create table if not exists public.capsule_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
 avatar text not null default 'folder' check (avatar in ('folder','heart','music','star')),
 timezone text not null default 'America/New_York',
 public boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.capsule_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 mode text not null check (mode in ('daily','infinite','challenge')),
 day date not null,
 filter text not null,
 question_ids jsonb not null check (jsonb_array_length(question_ids)=5),
 state jsonb not null,
 version integer not null default 0,
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 score integer check (score between 0 and 100),
 correct integer check (correct between 0 and 5),
 elapsed_ms bigint check (elapsed_ms between 0 and 432000000),
 strongest text
);
create unique index if not exists capsule_one_daily on public.capsule_attempts(user_id,day) where mode='daily';
create unique index if not exists capsule_one_open_infinite on public.capsule_attempts(user_id) where mode='infinite' and finished_at is null;
create index if not exists capsule_finished_days on public.capsule_attempts(day,user_id) where finished_at is not null;
alter table public.capsule_profiles enable row level security;
alter table public.capsule_attempts enable row level security;
-- No browser role may read private attempts, impersonate another player, or submit scores.
revoke all on public.capsule_profiles,public.capsule_attempts from public,anon,authenticated;
grant select,insert,update,delete on public.capsule_profiles,public.capsule_attempts to service_role;

create or replace function public.capsule_leaderboard(board_period text,for_day date,friend_names text[] default '{}')
returns table(username text,avatar text,score bigint,completed bigint,elapsed_ms bigint,longest_streak bigint,active_streak bigint,strongest text)
language sql stable security definer set search_path=public,pg_temp as $$
 with all_days as (
  select distinct user_id,day from capsule_attempts where mode='daily' and finished_at is not null and day<=for_day
 ), islands as (
  select user_id,day,day-(row_number() over(partition by user_id order by day))::integer as island from all_days
 ), streaks as (
  select user_id,count(*) as length,max(day) as last_day from islands group by user_id,island
 ), streak_summary as (
  select user_id,max(length) as longest,max(case when last_day>=for_day-1 then length else 0 end) as active from streaks group by user_id
 ), records as (
  select a.* from capsule_attempts a join capsule_profiles p using(user_id)
  where p.public and a.mode=(case when board_period='infinite' then 'infinite' else 'daily' end) and a.finished_at is not null and a.day<=for_day
  and case when board_period in ('daily','friends') then a.day=for_day when board_period='weekly' then a.day>=for_day-6 when board_period in ('all-time','infinite') then true else false end
  and (board_period<>'friends' or p.username=any(friend_names))
 ), ranked_records as (
  select *,rank() over(partition by user_id order by score desc,elapsed_ms) as best_rank from records
 ), totals as (
  select user_id,(case when board_period='infinite' then max(score) else sum(score) end)::bigint as points,count(*) as challenges,
   (case when board_period='infinite' then min(elapsed_ms) filter(where best_rank=1) else sum(elapsed_ms) end)::bigint as elapsed,
   mode() within group(order by strongest) as category from ranked_records group by user_id
 )
 select p.username,p.avatar,t.points,t.challenges,t.elapsed,coalesce(s.longest,0),coalesce(s.active,0),t.category
 from totals t join capsule_profiles p using(user_id) left join streak_summary s using(user_id)
 order by t.points desc,t.elapsed,p.username limit 100;
$$;
revoke all on function public.capsule_leaderboard(text,date,text[]) from public,anon,authenticated;
grant execute on function public.capsule_leaderboard(text,date,text[]) to service_role;
