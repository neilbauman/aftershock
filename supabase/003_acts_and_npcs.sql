alter table decisions drop constraint if exists decisions_kind_check;
alter table players add column if not exists is_npc boolean not null default false;

create or replace function submit_decision(p_token uuid, p_round int, p_kind text, p_option text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p players; c cohorts; r rounds;
begin
  select * into p from players where token = p_token;
  if not found then raise exception 'unknown player'; end if;
  select * into c from cohorts where id = p.cohort_id;
  select * into r from rounds where cohort_id = c.id and number = p_round;
  if r.number is null or r.status <> 'open' or c.current_round <> p_round then raise exception 'round not open'; end if;
  if p_kind !~ '^[fr][1-4]$' then raise exception 'bad kind'; end if;
  insert into decisions (cohort_id, round, player_id, kind, option_id)
  values (c.id, p_round, p.id, p_kind, left(p_option, 40))
  on conflict (cohort_id, round, player_id, kind) do update set option_id = excluded.option_id, created_at = now(), by_facilitator = false;
  return jsonb_build_object('ok', true);
end $$;

create or replace function player_state(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p players; c cohorts; r rounds;
begin
  select * into p from players where token = p_token;
  if not found then raise exception 'unknown player'; end if;
  update players set last_seen = now() where id = p.id;
  select * into c from cohorts where id = p.cohort_id;
  select * into r from rounds where cohort_id = c.id and number = c.current_round;
  return jsonb_build_object(
    'player', jsonb_build_object('id', p.id, 'name', p.name, 'profile', p.profile, 'institution', p.institution),
    'cohort', jsonb_build_object('name', c.name, 'code', c.code, 'status', c.status, 'current_round', c.current_round),
    'round', case when r.number is null then null else jsonb_build_object('number', r.number, 'status', r.status, 'closes_at', r.closes_at) end,
    'household', (select state from households where player_id = p.id),
    'world', (select jsonb_build_object('public', state->'public', 'brief', state->'briefs'->p.institution, 'org', state->'orgs'->p.institution, 'orchard', state->'orchard'->'status') from world where cohort_id = c.id),
    'my_decisions', coalesce((select jsonb_object_agg(kind, option_id) from decisions where cohort_id = c.id and round = c.current_round and player_id = p.id), '{}'),
    'team', coalesce((select jsonb_agg(jsonb_build_object('name', tp.name, 'votes',
               coalesce((select jsonb_object_agg(d.kind, d.option_id) from decisions d where d.cohort_id = c.id and d.round = c.current_round and d.player_id = tp.id and d.kind like 'r%'), '{}')) order by tp.created_at)
             from players tp where tp.cohort_id = c.id and tp.institution = p.institution and not tp.is_npc), '[]'),
    'feed', coalesce((select jsonb_agg(f order by f.id desc) from (
               select id, round, body, team, created_at from feed
               where cohort_id = c.id and (player_id = p.id or team = p.institution or (player_id is null and team is null))
               order by id desc limit 40) f), '[]')
  );
end $$;

create or replace function srv_add_npc(p_secret text, p_code text, p_name text, p_profile text, p_institution text, p_state jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare c cohorts; p players;
begin
  perform _check_secret(p_secret);
  select * into c from cohorts where code = upper(p_code);
  insert into players (cohort_id, name, profile, institution, is_npc) values (c.id, p_name, p_profile, p_institution, true) returning * into p;
  insert into households (player_id, cohort_id, profile, state) values (p.id, c.id, p_profile, p_state);
  return p.id;
end $$;

create or replace function srv_load(p_secret text, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c cohorts;
begin
  perform _check_secret(p_secret);
  select * into c from cohorts where code = upper(p_code);
  if not found then raise exception 'unknown cohort'; end if;
  return jsonb_build_object(
    'cohort', to_jsonb(c),
    'players', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'email', email, 'profile', profile, 'institution', institution, 'last_seen', last_seen, 'npc', is_npc) order by created_at) from players where cohort_id = c.id), '[]'),
    'households', coalesce((select jsonb_object_agg(player_id, state) from households where cohort_id = c.id), '{}'),
    'world', (select state from world where cohort_id = c.id),
    'rounds', coalesce((select jsonb_agg(to_jsonb(r) - 'cohort_id' order by number) from rounds r where cohort_id = c.id), '[]'),
    'decisions', coalesce((select jsonb_agg(jsonb_build_object('round', round, 'player_id', player_id, 'kind', kind, 'option_id', option_id, 'by_facilitator', by_facilitator, 'at', created_at)) from decisions where cohort_id = c.id), '[]'),
    'subs', coalesce((select jsonb_agg(jsonb_build_object('endpoint', endpoint, 'player_id', player_id, 'is_facilitator', is_facilitator, 'subscription', subscription)) from push_subs where cohort_id = c.id), '[]')
  );
end $$;

create or replace function srv_reset(p_secret text, p_code text, p_profiles jsonb, p_world jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c cohorts;
begin
  perform _check_secret(p_secret);
  select * into c from cohorts where code = upper(p_code) for update;
  if not found then raise exception 'unknown cohort'; end if;
  delete from decisions where cohort_id = c.id;
  delete from rounds where cohort_id = c.id;
  delete from feed where cohort_id = c.id;
  delete from players where cohort_id = c.id and is_npc;
  update households set state = p_profiles->profile where cohort_id = c.id;
  update world set state = p_world where cohort_id = c.id;
  update cohorts set current_round = 0, status = 'lobby' where id = c.id;
  return jsonb_build_object('ok', true, 'players', (select count(*) from players where cohort_id = c.id));
end $$;
