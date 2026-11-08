// Game operations shared by the facilitator API and the scheduler tick.
import { ROUNDS, INSTITUTIONS, INSTITUTION_ORDER } from './scenario.js';
import { resolveRound, summariseLci } from './engine.js';
import { load, save, push } from './server.js';

const playerSubs = (data, ids) => data.subs.filter(s => !s.is_facilitator && (!ids || ids.includes(s.player_id)));
const facSubs = data => data.subs.filter(s => s.is_facilitator);
const currentRound = data => data.rounds.find(r => r.number === data.cohort.current_round);

export function responders(data) {
  const n = data.cohort.current_round;
  const ds = data.decisions.filter(d => d.round === n);
  return data.players.map(p => ({
    id: p.id, name: p.name, profile: p.profile, institution: p.institution,
    household: !!ds.find(d => d.player_id === p.id && d.kind === 'household'),
    institutionVote: ds.find(d => d.player_id === p.id && d.kind === 'institution')?.option_id || null,
  }));
}

export function alerts(data) {
  const out = [];
  const r = currentRound(data);
  const resp = responders(data);
  if (r?.status === 'open') {
    const missing = resp.filter(p => !p.household || !p.institutionVote);
    if (missing.length) out.push({ level: 'warn', text: `${missing.length} of ${resp.length} players still have a decision to make: ${missing.map(p => p.name).join(', ')}.` });
    for (const inst of INSTITUTION_ORDER) {
      const team = resp.filter(p => p.institution === inst);
      if (team.length && !team.some(p => p.institutionVote)) out.push({ level: 'warn', text: `${INSTITUTIONS[inst].short} team has not voted yet.` });
    }
  }
  const withPush = new Set(data.subs.filter(s => !s.is_facilitator).map(s => s.player_id));
  const noPush = data.players.filter(p => !withPush.has(p.id));
  if (noPush.length) out.push({ level: 'info', text: `No notifications set up for: ${noPush.map(p => p.name).join(', ')}.` });
  const stale = data.players.filter(p => Date.now() - new Date(p.last_seen) > 90 * 60 * 1000);
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
    totalRounds: ROUNDS.length,
  };
}

export async function openRound(code, minutes = 45) {
  const data = await load(code);
  const r = currentRound(data);
  if (r?.status === 'open') throw new Error('The current round is still open.');
  const next = data.cohort.current_round + 1;
  const round = ROUNDS.find(x => x.n === next);
  if (!round) throw new Error(`This prototype has ${ROUNDS.length} rounds.`);
  const closes = new Date(Date.now() + minutes * 60000).toISOString();
  const world = { ...data.world, public: { ...data.world.public, headline: `Round ${next} · ${round.time}: ${round.title}. ${round.intro}` } };
  await save(data.cohort.id, {
    cohort: { status: 'playing', current_round: next },
    round: { number: next, status: 'open', closes_at: closes, reminded: false },
    world,
    feed: [{ round: next, body: `Round ${next} is open (${round.time}): ${round.title}. ${round.intro}` }],
  });
  const sent = await push(playerSubs(data), { title: `${data.cohort.name} · Round ${next}`, body: `${round.time} in Varenna. Your family and your team each have a decision. ${minutes} min.`, url: `/play.html?c=${code}`, tag: `${code}-round-${next}` });
  return { opened: next, closes_at: closes, pushed: sent };
}

export async function closeRound(code) {
  const data = await load(code);
  const r = currentRound(data);
  if (!r || r.status !== 'open') throw new Error('No open round to close.');
  const patch = resolveRound(data);
  await save(data.cohort.id, patch);
  const sent = await push(playerSubs(data), { title: `Aftershock · Round ${r.number} results`, body: 'See what happened to your family and what your team achieved.', url: `/play.html?c=${code}`, tag: `${code}-results-${r.number}` });
  await push(facSubs(data), { title: `Round ${r.number} resolved`, body: `${patch.round.results.defaults} household decisions defaulted to “wait”. ${patch.round.results.duplicates} duplicated deliveries.`, url: `/facilitator.html?c=${code}` });
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
  const missing = responders(data).filter(p => !p.household || !p.institutionVote);
  const mins = Math.max(1, Math.round((new Date(r.closes_at) - Date.now()) / 60000));
  const sent = await push(playerSubs(data, missing.map(p => p.id)), { title: `Aftershock · ${mins} min left`, body: 'If you don’t choose, your family waits and your vote is lost.', url: `/play.html?c=${code}`, tag: `${code}-remind-${r.number}` });
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
