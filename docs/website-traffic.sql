-- Private schema remains unexposed; only the recorder grants anonymous function execution.
grant usage on schema pw_private to anon;
-- Anonymous aggregate counts only. No visitor identifiers, IPs or account IDs stored.
create table pw_private.website_views (
 day date not null default (now() at time zone 'UTC')::date,
 page text not null,
 views bigint not null default 0,
 primary key(day,page)
);
alter table pw_private.website_views enable row level security;
revoke all on pw_private.website_views from public,anon,authenticated;
create function pw_private.record_website_view(page_path text) returns void
language plpgsql security definer set search_path = '' as $$
declare headers jsonb := coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
begin
 if coalesce(headers->>'origin','') not in ('https://helmlore.com','https://www.helmlore.com','https://helmlore.co.uk','https://www.helmlore.co.uk','https://taylorsonthetide.github.io') then return; end if;
 if coalesce(headers->>'user-agent','') ~* '(bot|crawler|spider|headless)' then return; end if;
 if page_path is null or page_path !~ '^/(index|about|accounts|training|navigation|planning|cevni-mock-exam|lessons/buoyage-region-a|courses/(colregs-watchkeeping|cevni-inland-waterways|safety-at-sea|tides-heights-streams|boat-systems-stability|compass-work|chart-work-position|passage-planning-logbook|diesel-engine-basics))\.html$' then return; end if;
 insert into pw_private.website_views(day,page,views) values ((now() at time zone 'UTC')::date,page_path,1)
 on conflict(day,page) do update set views = least(pw_private.website_views.views+1,100000);
end $$;
revoke all on function pw_private.record_website_view(text) from public;
grant execute on function pw_private.record_website_view(text) to anon,authenticated;
create function public.helmlore_record_view(page_path text) returns void
language sql security invoker set search_path = '' as $$ select pw_private.record_website_view(page_path); $$;
revoke all on function public.helmlore_record_view(text) from public;
grant execute on function public.helmlore_record_view(text) to anon,authenticated;
create function pw_private.website_traffic(range_days integer default 30) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare today date := (now() at time zone 'UTC')::date; first_day date; result jsonb;
begin
 if not pw_private.pw_is_owner() then raise insufficient_privilege using message='Owner access required'; end if;
 if range_days is null or range_days not in (7,30,90) then raise invalid_parameter_value using message='Choose 7, 30 or 90 days'; end if;
 first_day := today-range_days+1;
 select jsonb_build_object(
 'total',coalesce(sum(views) filter(where day>=first_day),0),
 'today',coalesce(sum(views) filter(where day=today),0),
 'all_time',coalesce(sum(views),0),
 'started',min(day),
 'daily',(select coalesce(jsonb_agg(jsonb_build_object('day',d.day,'views',d.views) order by d.day),'[]') from (select s::date as "day",coalesce(sum(v.views),0) views from generate_series(first_day::timestamp,today::timestamp,interval '1 day') s left join pw_private.website_views v on v.day=s::date group by s) d),
 'pages',(select coalesce(jsonb_agg(jsonb_build_object('page',p.page,'views',p.views) order by p.views desc,p.page),'[]') from (select page,sum(views) views from pw_private.website_views where day>=first_day group by page) p)
 ) into result from pw_private.website_views;
 return result;
end $$;
revoke all on function pw_private.website_traffic(integer) from public;
grant execute on function pw_private.website_traffic(integer) to authenticated;
create function public.helmlore_website_traffic(range_days integer default 30) returns jsonb
language sql security invoker set search_path = '' as $$ select pw_private.website_traffic(range_days); $$;
revoke all on function public.helmlore_website_traffic(integer) from public,anon;
grant execute on function public.helmlore_website_traffic(integer) to authenticated;
