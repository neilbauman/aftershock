// Game operations shared by the facilitator API and the scheduler tick (story mode).
import { CHAPTERS, FAMILIES, chapterOf, chapterSteps } from './chapters.js';
import { resolveRound, summariseLci } from './engine.js';
import { load, save, push } from './server.js';

export const TOTAL_ROUNDS = CHAPTERS.length;
const playerSubs = (data, ids) => data.subs.filter(s => !s.is_facilitator && (!ids || ids.includes(s.player_id)));
const facSubs = data => data.subs.filter(s => s.is_facilitator);
const currentRound = data => data.rounds.find(r => r.number === data.cohort.current_round);

export function responders(data) {
  const n = data.cohort.current_round;
  const ch = chapterOf(n);
  const ds = data.decisions.filter(d => d.round === n);
  return data.players.filter(p => !p.npc).map(p => {
    const picks = Object.fromEntries(ds.filter(d => d.player_id === p.id).map(d => [d.kind, d.option_id]));
    const steps = ch && data.households[p.id] ? chapterSteps(ch, p.profile, data.households[p.id], picks) : [];
    const done = steps.filter(s => s.chosen).length;
    return { id: p.id, name: p.name, profile: p.profile, done, needed: steps.length, complete: steps.length > 0 && done >= steps.length, picks };
  });
}

export function alerts(data) {
  const out = [];
  const r = currentRound(data);
  if (r?.status === 'open') {
    const missing = responders(data).filter(p => !p.complete);
    if (missing.length) out.push({ level: 'warn', text: `${missing.length} player${missing.length === 1 ? ' has' : 's have'} not finished: ${missing.map(p => `${p.name} (${p.done}/${p.needed})`).join(', ')}.` });
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
    pushCount: data.subs.filter(s => !s.is_facilitator).length, totalRounds: TOTAL_ROUNDS,
  };
}

export async function openRound(code, minutes = 30) {
  const data = await load(code);
  const r = currentRound(data);
  if (r?.status === 'open') throw new Error('The current chapter is still open.');
  const next = data.cohort.current_round + 1;
  const ch = chapterOf(next);
  if (!ch) throw new Error(`Chapters 1–${TOTAL_ROUNDS} have all been played.`);
  const closes = new Date(Date.now() + minutes * 60000).toISOString();
  await save(data.cohort.id, {
    cohort: { status: 'playing', current_round: next },
    round: { number: next, status: 'open', closes_at: closes, reminded: false },
    world: { ...data.world, public: { ...data.world.public, headline: `Chapter ${next} · ${ch.time}: ${ch.title}` } },
    feed: [{ round: next, body: `Chapter ${next} — “${ch.title}” (${ch.time}) — is open.` }],
  });
  const sent = await push(playerSubs(data), { title: `${data.cohort.name} · Chapter ${next}`, body: `“${ch.title}” (${ch.time}). Your family’s story continues. ${minutes} min.`, url: `/play.html?c=${code}`, tag: `${code}-ch-${next}` });
  return { opened: next, title: ch.title, closes_at: closes, pushed: sent };
}

export async function closeRound(code) {
  const data = await load(code);
  const r = currentRound(data);
  if (!r || r.status !== 'open') throw new Error('No open chapter to close.');
  const patch = resolveRound(data);
  await save(data.cohort.id, patch);
  const ch = chapterOf(r.number);
  const sent = await push(playerSubs(data), { title: `${data.cohort.name} · Chapter ${r.number} closed`, body: 'See what happened to your family.', url: `/play.html?c=${code}`, tag: `${code}-closed-${r.number}` });
  await push(facSubs(data), { title: `Chapter ${r.number} resolved`, body: `“${ch.title}”: ${patch.round.results.defaults} decisions defaulted to wait.`, url: `/facilitator.html?c=${code}` });
  return { resolved: r.number, pushed: sent };
}

export async function extendRound(code, minutes = 10) {
  const data = await load(code);
  const r = currentRound(data);
  if (!r || r.status !== 'open') throw new Error('No open chapter.');
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
  const sent = await push(playerSubs(data, missing.map(p => p.id)), { title: `${data.cohort.name} · ${mins} min left`, body: 'Your family is waiting for you to decide.', url: `/play.html?c=${code}`, tag: `${code}-remind-${r.number}` });
  if (missing.length) await push(facSubs(data), { title: `Chapter ${r.number}: ${missing.length} yet to finish`, body: missing.map(p => p.name).join(', '), url: `/facilitator.html?c=${code}` });
  if (!force) await save(data.cohort.id, { round: { number: r.number, reminded: true } });
  return { reminded: sent, missing: missing.length };
}

export async function broadcast(code, text) {
  const data = await load(code);
  await save(data.cohort.id, { feed: [{ round: data.cohort.current_round, body: `Facilitator: ${text}` }] });
  const sent = await push(playerSubs(data), { title: `${data.cohort.name} · Facilitator`, body: text, url: `/play.html?c=${code}` });
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
