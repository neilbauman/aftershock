// Game operations shared by the facilitator API and the scheduler tick.
import { ACTS, TOTAL_ROUNDS, roundInfo, familySteps, responseSteps, INSTITUTIONS, INSTITUTION_ORDER, PROFILES, PROFILE_ORDER } from './scenario.js';
import { resolveRound, summariseLci, initialHousehold } from './engine.js';
import { load, save, push, rpc, SECRET } from './server.js';

const playerSubs = (data, ids) => data.subs.filter(s => !s.is_facilitator && (!ids || ids.includes(s.player_id)));
const facSubs = data => data.subs.filter(s => s.is_facilitator);
const currentRound = data => data.rounds.find(r => r.number === data.cohort.current_round);

export function responders(data) {
  const n = data.cohort.current_round;
  const ds = data.decisions.filter(d => d.round === n);
  const info = n ? roundInfo(n) : null;
  return data.players.filter(p => !p.npc).map(p => {
    const mine = ds.filter(d => d.player_id === p.id);
    let needed = 0;
    if (info?.block === 'family') needed = info.act.family.steps.length;
    if (info?.block === 'response') needed = responseSteps(info.act, p.institution, data.world || {}).length;
    const done = mine.filter(d => info?.block === 'family' ? d.kind.startsWith('f') : d.kind.startsWith('r')).length;
    return { id: p.id, name: p.name, profile: p.profile, institution: p.institution, done, needed, complete: needed > 0 && done >= needed, picks: Object.fromEntries(mine.map(d => [d.kind, d.option_id])) };
  });
}

export function alerts(data) {
  const out = [];
  const r = currentRound(data);
  const resp = responders(data);
  if (r?.status === 'open') {
    const missing = resp.filter(p => !p.complete);
    if (missing.length) out.push({ level: 'warn', text: `${missing.length} of ${resp.length} players have not finished: ${missing.map(p => `${p.name} (${p.done}/${p.needed})`).join(', ')}.` });
    if (roundInfo(r.number).block === 'response') for (const inst of INSTITUTION_ORDER) {
      const team = resp.filter(p => p.institution === inst);
      if (team.length && !team.some(p => p.done)) out.push({ level: 'warn', text: `${INSTITUTIONS[inst].name} has not voted yet.` });
    }
  }
  const withPush = new Set(data.subs.filter(s => !s.is_facilitator).map(s => s.player_id));
  const noPush = data.players.filter(p => !p.npc && !withPush.has(p.id));
  if (noPush.length) out.push({ level: 'info', text: `No notifications set up for: ${noPush.map(p => p.name).join(', ')}.` });
  const stale = data.players.filter(p => !p.npc && Date.now() - new Date(p.last_seen) > 90 * 60 * 1000);
  if (stale.length && data.cohort.status === 'playing') out.push({ level: 'info', text: `Not seen in the last 90 minutes: ${stale.map(p => p.name).join(', ')}.` });
  if (!facSubs(data).length) out.push({ level: 'info', text: 'Facilitator notifications are not enabled on any device.' });
  return out;
}

export function facilitatorView(data) {
  const { facilitator_key, ...cohort } = data.cohort;
  return {
    cohort, players: data.players, rounds: data.rounds, world: data.world,
    households: data.households, responders: responders(data), alerts: alerts(data),
    lci: summariseLci(data.households, data.players.filter(p => data.households[p.id])),
    pushCount: data.subs.filter(s => !s.is_facilitator).length,
    npcs: data.players.filter(p => p.npc).length,
    totalRounds: TOTAL_ROUNDS,
  };
}

export async function fillNpcs(data) {
  const humans = data.players.filter(p => !p.npc);
  const missing = PROFILE_ORDER.filter(pr => !data.players.some(p => p.profile === pr));
  for (const pr of missing) await rpc('srv_add_npc', { p_secret: SECRET, p_code: data.cohort.code, p_name: `Computer · ${PROFILES[pr].name}`, p_profile: pr, p_institution: 'npc', p_state: initialHousehold(pr) });
  return { added: missing.length, humans: humans.length };
}

export async function openRound(code, minutes = 30) {
  let data = await load(code);
  const r = currentRound(data);
  if (r?.status === 'open') throw new Error('The current block is still open.');
  const next = data.cohort.current_round + 1;
  if (next > TOTAL_ROUNDS) throw new Error('All six acts have been played.');
  if (next === 1) { await fillNpcs(data); data = await load(code); }
  const { act, block } = roundInfo(next);
  const closes = new Date(Date.now() + minutes * 60000).toISOString();
  const intro = block === 'family' ? act.family.intro : act.response.intro;
  const world = { ...data.world, public: { ...data.world.public, headline: `Act ${act.n} · ${act.time}: ${act.title}. ${intro}` } };
  await save(data.cohort.id, {
    cohort: { status: 'playing', current_round: next },
    round: { number: next, status: 'open', closes_at: closes, reminded: false },
    world,
    feed: [{ round: next, body: `Act ${act.n} (${act.time}) · ${block === 'family' ? 'Family block' : 'Response block'} is open. ${intro}` }],
  });
  const body = block === 'family'
    ? `${act.time}: your family has ${act.family.steps.length} decisions to make. ${minutes} min.`
    : `${act.time}: your organisation needs your vote. ${minutes} min.`;
  const sent = await push(playerSubs(data), { title: `${data.cohort.name} · Act ${act.n} · ${block === 'family' ? 'Your family' : 'Your organisation'}`, body, url: `/play.html?c=${code}`, tag: `${code}-round-${next}` });
  return { opened: next, act: act.n, block, closes_at: closes, pushed: sent };
}

export async function closeRound(code) {
  const data = await load(code);
  const r = currentRound(data);
  if (!r || r.status !== 'open') throw new Error('No open round to close.');
  const patch = resolveRound(data);
  await save(data.cohort.id, patch);
  const sent = await push(playerSubs(data), { title: `${data.cohort.name} · Act ${roundInfo(r.number).act.n} results`, body: roundInfo(r.number).block === 'family' ? 'See what happened to your family.' : 'See what your organisation achieved — and what reached your family.', url: `/play.html?c=${code}`, tag: `${code}-results-${r.number}` });
  await push(facSubs(data), { title: `Round ${r.number} resolved`, body: `${patch.round.results.defaults} family steps defaulted to “wait”. ${patch.round.results.duplicates} duplicated deliveries.`, url: `/facilitator.html?c=${code}` });
  return { resolved: r.number, pushed: sent };
}

export async function extendRound(code, minutes = 10) {
  const data = await load(code);
  const r = currentRound(data);
  if (!r || r.status !== 'open') throw new Error('No open round.');
  const closes = new Date(Math.max(Date.now(), new Date(r.closes_at)) + minutes * 60000).toISOString();
  await save(data.cohort.id, { round: { number: r.number, closes_at: closes, reminded: false } });
  return { closes_at: closes };
}

export async function remind(code, { force = false } = {}) {
  const data = await load(code);
  const r = currentRound(data);
  if (!r || r.status !== 'open') return { reminded: 0 };
  const missing = responders(data).filter(p => !p.complete);
  const mins = Math.max(1, Math.round((new Date(r.closes_at) - Date.now()) / 60000));
  const sent = await push(playerSubs(data, missing.map(p => p.id)), { title: `Aftershock · ${mins} min left`, body: 'You still have decisions to make. If you don’t choose, your family waits and your vote is lost.', url: `/play.html?c=${code}`, tag: `${code}-remind-${r.number}` });
  if (missing.length) await push(facSubs(data), { title: `Round ${r.number}: ${missing.length} yet to respond`, body: missing.map(p => p.name).join(', '), url: `/facilitator.html?c=${code}` });
  if (!force) await save(data.cohort.id, { round: { number: r.number, reminded: true } });
  return { reminded: sent, missing: missing.length };
}

export async function broadcast(code, text, team) {
  const data = await load(code);
  await save(data.cohort.id, { feed: [{ round: data.cohort.current_round, body: `Facilitator: ${text}`, team: team || null }] });
  const ids = team ? data.players.filter(p => p.institution === team).map(p => p.id) : null;
  const sent = await push(playerSubs(data, ids), { title: 'Aftershock · Facilitator', body: text, url: `/play.html?c=${code}` });
  return { pushed: sent };
}

export async function takeover(code, playerId, kind, optionId) {
  const data = await load(code);
  await save(data.cohort.id, { decisions: [{ round: data.cohort.current_round, player_id: playerId, kind, option_id: optionId }] });
  return { ok: true };
}

export async function tickCohort(code) {
  const data = await load(code);
  const r = currentRound(data);
  if (!r || r.status !== 'open' || !r.closes_at) return { code, action: 'none' };
  const left = new Date(r.closes_at) - Date.now();
  if (left <= 0) return { code, action: 'closed', ...(await closeRound(code)) };
  if (!r.reminded && left <= 15 * 60000) return { code, action: 'reminded', ...(await remind(code)) };
  return { code, action: 'none' };
}
