-- Aftershock RPC layer. Anon clients call player_* / submit_* / save_push / fac_save_push.
-- Vercel functions call srv_* with the server secret.

update app_secret set server_secret = '3c114cb10bd6997983dc7a56513b876c803f8f80a4a37287' where id = 1;

create or replace function _check_secret(p_secret text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from app_secret where server_secret = p_secret) then
    raise exception 'forbidden';
  end if;
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
    'world', (select jsonb_build_object('public', state->'public', 'brief', state->'briefs'->p.institution) from world where cohort_id = c.id),
    'my_decisions', coalesce((select jsonb_object_agg(kind, option_id) from decisions where cohort_id = c.id and round = c.current_round and player_id = p.id), '{}'),
    'team', coalesce((select jsonb_agg(jsonb_build_object('name', tp.name, 'vote',
               (select option_id from decisions d where d.cohort_id = c.id and d.round = c.current_round and d.player_id = tp.id and d.kind = 'institution')) order by tp.created_at)
             from players tp where tp.cohort_id = c.id and tp.institution = p.institution), '[]'),
    'feed', coalesce((select jsonb_agg(f order by f.id desc) from (
               select id, round, body, team, created_at from feed
               where cohort_id = c.id and (player_id = p.id or team = p.institution or (player_id is null and team is null))
               order by id desc limit 40) f), '[]')
  );
end $$;

create or replace function submit_decision(p_token uuid, p_round int, p_kind text, p_option text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p players; c cohorts; r rounds;
begin
  select * into p from players where token = p_token;
  if not found then raise exception 'unknown player'; end if;
  select * into c from cohorts where id = p.cohort_id;
  select * into r from rounds where cohort_id = c.id and number = p_round;
  if r.number is null or r.status <> 'open' or c.current_round <> p_round then raise exception 'round not open'; end if;
  if p_kind not in ('household', 'institution') then raise exception 'bad kind'; end if;
  insert into decisions (cohort_id, round, player_id, kind, option_id)
  values (c.id, p_round, p.id, p_kind, left(p_option, 40))
  on conflict (cohort_id, round, player_id, kind) do update set option_id = excluded.option_id, created_at = now(), by_facilitator = false;
  return jsonb_build_object('ok', true);
end $$;

create or replace function save_push(p_token uuid, p_sub jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p players;
begin
  select * into p from players where token = p_token;
  if not found then raise exception 'unknown player'; end if;
  insert into push_subs (endpoint, cohort_id, player_id, subscription)
  values (p_sub->>'endpoint', p.cohort_id, p.id, p_sub)
  on conflict (endpoint) do update set player_id = excluded.player_id, cohort_id = excluded.cohort_id, subscription = excluded.subscription, is_facilitator = false;
  return jsonb_build_object('ok', true);
end $$;

create or replace function fac_save_push(p_code text, p_key text, p_sub jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c cohorts;
begin
  select * into c from cohorts where code = upper(p_code) and facilitator_key = p_key;
  if not found then raise exception 'forbidden'; end if;
  insert into push_subs (endpoint, cohort_id, player_id, is_facilitator, subscription)
  values (p_sub->>'endpoint', c.id, null, true, p_sub)
  on conflict (endpoint) do update set cohort_id = excluded.cohort_id, player_id = null, is_facilitator = true, subscription = excluded.subscription;
  return jsonb_build_object('ok', true);
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
    'players', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'email', email, 'profile', profile, 'institution', institution, 'last_seen', last_seen) order by created_at) from players where cohort_id = c.id), '[]'),
    'households', coalesce((select jsonb_object_agg(player_id, state) from households where cohort_id = c.id), '{}'),
    'world', (select state from world where cohort_id = c.id),
    'rounds', coalesce((select jsonb_agg(to_jsonb(r) - 'cohort_id' order by number) from rounds r where cohort_id = c.id), '[]'),
    'decisions', coalesce((select jsonb_agg(jsonb_build_object('round', round, 'player_id', player_id, 'kind', kind, 'option_id', option_id, 'by_facilitator', by_facilitator, 'at', created_at)) from decisions where cohort_id = c.id), '[]'),
    'subs', coalesce((select jsonb_agg(jsonb_build_object('endpoint', endpoint, 'player_id', player_id, 'is_facilitator', is_facilitator, 'subscription', subscription)) from push_subs where cohort_id = c.id), '[]')
  );
end $$;

create or replace function srv_check_fac(p_secret text, p_code text, p_key text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform _check_secret(p_secret);
  return exists (select 1 from cohorts where code = upper(p_code) and facilitator_key = p_key);
end $$;

create or replace function srv_create_cohort(p_secret text, p_name text, p_world jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c cohorts; v_code text;
begin
  perform _check_secret(p_secret);
  loop
    v_code := upper(substr(translate(encode(gen_random_bytes(8), 'base64'), '+/=0O1Il', ''), 1, 5));
    exit when length(v_code) = 5 and not exists (select 1 from cohorts where code = v_code);
  end loop;
  insert into cohorts (code, name) values (v_code, p_name) returning * into c;
  insert into world (cohort_id, state) values (c.id, p_world);
  return jsonb_build_object('code', c.code, 'facilitator_key', c.facilitator_key);
end $$;

create or replace function srv_join(p_secret text, p_code text, p_name text, p_email text, p_profiles jsonb, p_institutions jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c cohorts; v_profile text; v_inst text; p players;
begin
  perform _check_secret(p_secret);
  select * into c from cohorts where code = upper(p_code) for update;
  if not found then raise exception 'unknown cohort'; end if;
  select k.key into v_profile from jsonb_each(p_profiles) with ordinality k(key, value, ord)
    order by (select count(*) from players where cohort_id = c.id and profile = k.key), k.ord limit 1;
  select i.value #>> '{}' into v_inst from jsonb_array_elements(p_institutions) with ordinality i(value, ord)
    order by (select count(*) from players where cohort_id = c.id and institution = i.value #>> '{}'), i.ord limit 1;
  insert into players (cohort_id, name, email, profile, institution)
    values (c.id, p_name, nullif(p_email, ''), v_profile, v_inst) returning * into p;
  insert into households (player_id, cohort_id, profile, state) values (p.id, c.id, v_profile, p_profiles->v_profile);
  return jsonb_build_object('token', p.token, 'profile', v_profile, 'institution', v_inst);
end $$;

create or replace function srv_save(p_secret text, p_cohort uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h jsonb; f jsonb; d jsonb;
begin
  perform _check_secret(p_secret);
  if p_patch ? 'cohort' then
    update cohorts set status = coalesce(p_patch->'cohort'->>'status', status),
      current_round = coalesce((p_patch->'cohort'->>'current_round')::int, current_round)
    where id = p_cohort;
  end if;
  if p_patch ? 'round' then
    insert into rounds (cohort_id, number, status, closes_at, reminded, results)
    values (p_cohort, (p_patch->'round'->>'number')::int, coalesce(p_patch->'round'->>'status', 'open'),
            (p_patch->'round'->>'closes_at')::timestamptz, coalesce((p_patch->'round'->>'reminded')::boolean, false), p_patch->'round'->'results')
    on conflict (cohort_id, number) do update set
      status = coalesce(p_patch->'round'->>'status', rounds.status),
      closes_at = coalesce((p_patch->'round'->>'closes_at')::timestamptz, rounds.closes_at),
      reminded = coalesce((p_patch->'round'->>'reminded')::boolean, rounds.reminded),
      results = coalesce(p_patch->'round'->'results', rounds.results);
  end if;
  if p_patch ? 'households' then
    for h in select * from jsonb_array_elements(p_patch->'households') loop
      update households set state = h->'state' where player_id = (h->>'player_id')::uuid and cohort_id = p_cohort;
    end loop;
  end if;
  if p_patch ? 'world' then update world set state = p_patch->'world' where cohort_id = p_cohort; end if;
  if p_patch ? 'feed' then
    for f in select * from jsonb_array_elements(p_patch->'feed') loop
      insert into feed (cohort_id, player_id, team, round, body)
      values (p_cohort, (f->>'player_id')::uuid, f->>'team', (f->>'round')::int, f->>'body');
    end loop;
  end if;
  if p_patch ? 'decisions' then
    for d in select * from jsonb_array_elements(p_patch->'decisions') loop
      insert into decisions (cohort_id, round, player_id, kind, option_id, by_facilitator)
      values (p_cohort, (d->>'round')::int, (d->>'player_id')::uuid, d->>'kind', d->>'option_id', true)
      on conflict (cohort_id, round, player_id, kind) do update set option_id = excluded.option_id, by_facilitator = true;
    end loop;
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function srv_due(p_secret text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform _check_secret(p_secret);
  return coalesce((select jsonb_agg(c.code) from cohorts c join rounds r on r.cohort_id = c.id and r.number = c.current_round
    where r.status = 'open' and r.closes_at is not null and (r.closes_at <= now() or (not r.reminded and r.closes_at <= now() + interval '15 minutes'))), '[]');
end $$;

create or replace function srv_drop_sub(p_secret text, p_endpoint text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _check_secret(p_secret);
  delete from push_subs where endpoint = p_endpoint;
end $$;

revoke execute on function _check_secret(text) from public, anon, authenticated;
