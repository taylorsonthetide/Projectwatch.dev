create table if not exists pw_private.sample_activity(day date not null default (now() at time zone 'UTC')::date, event text not null check(event in ('started','completed')), total bigint not null default 0, primary key(day,event));
alter table pw_private.sample_activity enable row level security;
revoke all on pw_private.sample_activity from public,anon,authenticated;
create or replace function pw_private.record_sample_activity(event_name text) returns void language plpgsql security definer set search_path='' as $$
declare headers jsonb := coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
begin
if coalesce(headers->>'origin','') not in ('https://helmlore.com','https://www.helmlore.com','https://helmlore.co.uk','https://www.helmlore.co.uk','https://taylorsonthetide.github.io') then return; end if;
if coalesce(headers->>'user-agent','') ~* '(bot|crawler|spider|headless)' then return; end if;
if event_name is null or event_name not in ('started','completed') then return; end if;
insert into pw_private.sample_activity(day,event,total) values ((now() at time zone 'UTC')::date,event_name,1) on conflict(day,event) do update set total=least(pw_private.sample_activity.total+1,100000);
end $$;
revoke all on function pw_private.record_sample_activity(text) from public;
grant execute on function pw_private.record_sample_activity(text) to anon,authenticated;
create or replace function public.helmlore_record_sample(event_name text) returns void language sql security invoker set search_path='' as $$ select pw_private.record_sample_activity(event_name); $$;
revoke all on function public.helmlore_record_sample(text) from public;
grant execute on function public.helmlore_record_sample(text) to anon,authenticated;
create or replace function pw_private.sample_summary(range_days integer default 30) returns jsonb language plpgsql security definer set search_path='' as $$
begin
if not pw_private.pw_is_owner() then raise insufficient_privilege using message='Owner access required'; end if;
if range_days is null or range_days not in (7,30,90) then raise invalid_parameter_value using message='Choose 7, 30 or 90 days'; end if;
return (select jsonb_build_object('started',coalesce(sum(total) filter(where event='started'),0),'completed',coalesce(sum(total) filter(where event='completed'),0)) from pw_private.sample_activity where day >= (now() at time zone 'UTC')::date-range_days+1);
end $$;
revoke all on function pw_private.sample_summary(integer) from public;
grant execute on function pw_private.sample_summary(integer) to authenticated;
create or replace function public.helmlore_sample_summary(range_days integer default 30) returns jsonb language sql security invoker set search_path='' as $$ select pw_private.sample_summary(range_days); $$;
revoke all on function public.helmlore_sample_summary(integer) from public,anon;
grant execute on function public.helmlore_sample_summary(integer) to authenticated;