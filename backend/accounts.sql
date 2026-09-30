-- Run once in the project's Supabase SQL editor. No credentials belong in GitHub.
begin;
create schema if not exists pw_private;
revoke all on schema pw_private from public, anon, authenticated;
create table if not exists pw_private.owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);
revoke all on pw_private.owners from public, anon, authenticated;

create table if not exists public.pw_account_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now()
);
alter table public.pw_account_activity enable row level security;
revoke all on public.pw_account_activity from public, anon, authenticated;

create table if not exists public.pw_account_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_key text not null check (state_key in (
    'projectWatchVesselProfileV2','projectWatchVesselSetupSeenV2',
    'projectWatchCustomVesselV1','projectWatchOperationalStateV1','projectWatchCustomHeroFrameV1',
    'projectWatchCourseProgressV1','projectWatchAisTasksV1','pwAisStage8Reviewed',
    'pwCevniDone','pwCevniProgressV2','pwCevniMock177',
    'pw-safety-awareness-reviewed-v1','pw-tides-reviewed-v1','pw-boat-systems-reviewed-v1',
    'pw-compass-reviewed-v1','pw-chartwork-reviewed-v1','pw-passage-reviewed-v1',
    'pw-passage-plan-v1','pw-passage-log-v1','pw-diesel-reviewed-v1'
  )),
  value text check (octet_length(value) <= 3000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, state_key)
);
alter table public.pw_account_state enable row level security;
revoke all on public.pw_account_state from public, anon, authenticated;
grant select, insert, update on public.pw_account_state to authenticated;
drop policy if exists pw_own_state_select on public.pw_account_state;
create policy pw_own_state_select on public.pw_account_state for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists pw_own_state_insert on public.pw_account_state;
create policy pw_own_state_insert on public.pw_account_state for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists pw_own_state_update on public.pw_account_state;
create policy pw_own_state_update on public.pw_account_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.pw_save_state(changes jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if jsonb_typeof(changes) <> 'array' or jsonb_array_length(changes) > 20 then raise exception 'Invalid state changes'; end if;
  if exists (select 1 from jsonb_array_elements(changes) c where jsonb_typeof(c) <> 'object'
    or not (c ? 'state_key' and c ? 'value') or jsonb_typeof(c->'state_key') <> 'string'
    or jsonb_typeof(c->'value') not in ('string','null')) then raise exception 'Invalid state value'; end if;
  insert into public.pw_account_state(user_id, state_key, value, updated_at)
  select auth.uid(), c->>'state_key', c->>'value', now() from jsonb_array_elements(changes) c
  on conflict (user_id, state_key) do update set value = excluded.value, updated_at = excluded.updated_at;
end $$;
revoke all on function public.pw_save_state(jsonb) from public, anon;
grant execute on function public.pw_save_state(jsonb) to authenticated;

create or replace function public.pw_touch_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  insert into public.pw_account_activity(user_id, last_seen_at) values (auth.uid(), now())
  on conflict (user_id) do update set last_seen_at = excluded.last_seen_at;
end $$;
revoke all on function public.pw_touch_account() from public, anon;
grant execute on function public.pw_touch_account() to authenticated;

create or replace function public.pw_is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from pw_private.owners where user_id = auth.uid());
$$;
revoke all on function public.pw_is_owner() from public, anon;
grant execute on function public.pw_is_owner() to authenticated;

-- Learner progress is self-reported, not a certificate or verified exam result.
create or replace function pw_private.module_count(value text) returns integer
language plpgsql immutable set search_path = '' as $$
declare parsed jsonb;
begin
  parsed := value::jsonb;
  if jsonb_typeof(parsed) <> 'array' then return 0; end if;
  return (select count(distinct x)::integer from jsonb_array_elements(parsed) x
    where x in ('0'::jsonb,'1'::jsonb,'2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb,'6'::jsonb,'7'::jsonb,'8'::jsonb));
exception when others then return 0;
end $$;
revoke all on function pw_private.module_count(text) from public, anon, authenticated;

create or replace function public.pw_owner_dashboard(page_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.pw_is_owner() then raise exception 'Owner access required' using errcode = '42501'; end if;
  if page_offset < 0 then raise exception 'Invalid offset'; end if;
  select jsonb_build_object(
    'total', (select count(*) from auth.users),
    'confirmed', (select count(*) from auth.users where email_confirmed_at is not null),
    'active30', (select count(*) from public.pw_account_activity where last_seen_at >= now() - interval '30 days'),
    'learners', coalesce((select jsonb_agg(to_jsonb(roster)) from (
      select u.email, left(coalesce(u.raw_user_meta_data->>'display_name',''),100) as display_name,
        u.created_at as registered_at, u.email_confirmed_at is not null as confirmed,
        u.last_sign_in_at, a.last_seen_at,
        pw_private.module_count(s.value) as cevni_modules
      from auth.users u left join public.pw_account_activity a on a.user_id = u.id
      left join public.pw_account_state s on s.user_id = u.id and s.state_key = 'pwCevniDone'
      order by u.created_at desc, u.id limit 50 offset page_offset
    ) roster), '[]'::jsonb)
  ) into result;
  return result;
end $$;
revoke all on function public.pw_owner_dashboard(integer) from public, anon;
grant execute on function public.pw_owner_dashboard(integer) to authenticated;
commit;

-- After Cliff has registered and confirmed his email, use the SQL editor to assign
-- his actual account UUID (not user metadata or a browser-side email check):
-- insert into pw_private.owners(user_id) values ('ACTUAL-ACCOUNT-UUID');
