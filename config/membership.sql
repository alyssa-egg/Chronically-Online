-- Run once in the Supabase SQL editor. No client may insert or update trials/purchases.
create table if not exists public.deep_cut_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  trial_started_at timestamptz not null,
  stripe_session_id text unique
);
alter table public.deep_cut_memberships enable row level security;
revoke all on public.deep_cut_memberships from anon, authenticated;
grant select, insert, update on public.deep_cut_memberships to service_role;
