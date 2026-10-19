
create table pw_private.handbook_clicks(day date primary key, clicks bigint not null check(clicks>=0));
alter table pw_private.handbook_clicks enable row level security;
revoke all on pw_private.handbook_clicks from public,anon,authenticated;
create function pw_private.record_handbook_click() returns void language plpgsql security definer set search_path='' as $$
declare headers jsonb:=coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
begin
if coalesce(headers->>'origin','') not in ('https://helmlore.com','https://www.helmlore.com','https://helmlore.co.uk','https://www.helmlore.co.uk','https://taylorsonthetide.github.io') then return; end if;
if coalesce(headers->>'user-agent','') ~* '(bot|crawler|spider|headless)' then return; end if;
insert into pw_private.handbook_clicks(day,clicks) values((now() at time zone 'UTC')::date,1)
on conflict(day) do update set clicks=least(pw_private.handbook_clicks.clicks+1,100000);
end $$;
create function pw_private.handbook_summary(range_days integer default 30) returns jsonb language plpgsql security definer set search_path='' as $$
declare today date := (now() at time zone 'UTC')::date;
begin
if not pw_private.pw_is_owner() then raise insufficient_privilege using message='Owner access required'; end if;
if range_days is null or range_days not in (7,30,90) then raise invalid_parameter_value using message='Choose 7, 30 or 90 days'; end if;
return (select jsonb_build_object('today',coalesce(sum(clicks) filter(where day=today),0),'total',coalesce(sum(clicks) filter(where day>=today-range_days+1),0),'all_time',coalesce(sum(clicks),0)) from pw_private.handbook_clicks);
end $$;
create function public.helmlore_record_handbook_click() returns void language sql set search_path='' as $$ select pw_private.record_handbook_click(); $$;
create function public.helmlore_handbook_summary(range_days integer default 30) returns jsonb language sql set search_path='' as $$ select pw_private.handbook_summary(range_days); $$;
revoke all on function pw_private.record_handbook_click(),pw_private.handbook_summary(integer),public.helmlore_record_handbook_click(),public.helmlore_handbook_summary(integer) from public,anon,authenticated;
grant execute on function pw_private.record_handbook_click(),public.helmlore_record_handbook_click() to anon,authenticated;
grant execute on function pw_private.handbook_summary(integer),public.helmlore_handbook_summary(integer) to authenticated;
