// Aftershock v2 story engine. One chapter per round. Every player is a family.
import { CHAPTERS, FAMILIES, DIMS, MUNIS, SITE_LOCS, chapterOf, chapterSteps, applyOption, check, texts, lciOf, phaseOf, provinceOf } from './chapters.js';

const DIM_KEYS = Object.keys(DIMS);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r1 = v => Math.round(v * 10) / 10;

export function initialWorld() {
  return { public: { headline: 'Waiting for the facilitator to open Chapter 1.', log: [] }, orchard: { families: 12 }, stats: [] };
}

export function initialHousehold(family) {
  const s = structuredClone(FAMILIES[family].init);
  Object.assign(s, { known: false, flags: {}, choices: {}, story: [], pending: [] });
  s.lci = lciOf(s.dims);
  s.history = [{ ch: 0, dims: { ...s.dims }, lci: s.lci, loc: s.loc, group: s.group, known: false }];
  return s;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function resolveRound(data) {
  const n = data.cohort.current_round;
  const ch = chapterOf(n);
  const rand = rng(data.cohort.seed * 31 + n);
  const world = structuredClone(data.world || initialWorld());
  const players = data.players.filter(p => data.households[p.id]);
  const decisions = data.decisions.filter(d => d.round === n);
  const stat = { round: n, chapter: n, choices: {}, actors: {}, defaults: 0, known: 0 };
  const feed = [], households = [];

  for (const p of players) {
    const fam = p.profile;
    const start = data.households[p.id];
    const picks = {};
    for (const d of decisions.filter(d => d.player_id === p.id)) picks[d.kind] = d.option_id;
    // computer-run families pick a plausible option; absent humans wait
    let steps = chapterSteps(ch, fam, start, picks);
    if (p.npc) for (const st of steps) if (!picks[st.id]) { const opts = st.options.filter(o => o.id !== 'wait'); picks[st.id] = opts[Math.floor(rand() * opts.length)]?.id || 'wait'; steps = chapterSteps(ch, fam, start, picks); }
    let s = steps.length ? steps[steps.length - 1].after : start;
    // the earthquake itself: damage lands when the first chapter closes
    if (n === 1 && FAMILIES[fam].quake) s = applyOption(s, { dims: FAMILIES[fam].quake });
    const record = { ch: n, title: ch.title, time: ch.time, decisions: [] };
    for (const st of steps) {
      const o = st.chosen;
      if (!o) { stat.defaults++; record.decisions.push({ prompt: st.prompt, label: 'You did not decide in time.', after: 'Your family waited.' }); continue; }
      if (o.knownP && rand() < o.knownP) s.known = true;
      const key = `${fam}:${st.id}:${o.id}`; stat.choices[key] = (stat.choices[key] || 0) + 1;
      record.decisions.push({ prompt: st.prompt, label: o.label, after: o.after });
    }
    // the response, as the family experiences it
    const happened = [];
    for (const rule of ch.response || []) {
      if (!check(rule.when, s, fam) || rand() >= rule.prob) continue;
      s = applyOption(s, rule);
      if (rule.known) s.known = true;
      happened.push(rule.text);
      stat.actors[rule.actor] = (stat.actors[rule.actor] || 0) + 1;
    }
    // life goes on
    const drift = [];
    if (s.group === 'hosted') { s.res.goodwill = Math.max(0, s.res.goodwill - 0.4); if (s.res.goodwill <= 0.2) { const to = s.muni === 'lissa' ? 'gym' : 'school'; Object.assign(s, { loc: to, group: 'site', muni: s.muni === 'brena' ? 'varenna' : s.muni }); s.dims.tenure = 3.5; s.dims.settlement = Math.max(s.dims.settlement, 3.5); s.res.goodwill = 2; drift.push(`Your hosts could not go on. You moved to the ${to === 'gym' ? 'Lissa gymnasium' : 'collective centre at School No. 3'}.`); } }
    if (s.loc === 'orchard') s.dims.settlement = clamp(s.dims.settlement + 0.3, 1, 5);
    if (s.loc === 'stadium') s.dims.settlement = clamp(s.dims.settlement + 0.2, 1, 5);
    if (s.res.debt > 0) s.res.debt = Math.round(s.res.debt * 1.05);
    if (s.res.cash < 20) { s.dims.essentials = clamp(s.dims.essentials + 0.25, 1, 5); drift.push('Money has run out; the family is eating less.'); }
    record.happened = happened; record.drift = drift;
    s.story = [...(s.story || []), record];
    s.pending = [...happened, ...drift, ...texts(ch.bridge?.[fam], s, fam)];
    s.lci = lciOf(s.dims);
    s.history = [...(s.history || []), { ch: n, dims: Object.fromEntries(DIM_KEYS.map(k => [k, r1(s.dims[k])])), lci: s.lci, loc: s.loc, group: s.group, known: s.known }];
    if (s.known) stat.known++;
    households.push({ player_id: p.id, state: s });
    if (!p.npc) feed.push({ player_id: p.id, round: n, body: `Chapter ${n} closed. ${happened.join(' ') || 'No organisation reached your family this time.'}` });
  }
  const hh = Object.fromEntries(households.map(h => [h.player_id, h.state]));
  world.orchard.families = Math.round(world.orchard.families + 6 + 4 * households.filter(h => h.state.loc === 'orchard').length);
  stat.lci = summariseLci(hh, players);
  stat.orchardFamilies = world.orchard.families;
  world.stats = [...(world.stats || []).filter(x => x.round !== n), stat];
  world.public.headline = `Chapter ${n} (${ch.time}) has closed.`;
  feed.push({ round: n, body: `Chapter ${n}, “${ch.title}”, has closed.` });
  return { world, households, feed, round: { number: n, status: 'resolved', results: stat } };
}

export function summariseLci(hh, players) {
  const by = { group: {}, loc: {}, muni: {}, province: {}, family: {} }, dist = [0, 0, 0, 0, 0];
  for (const p of players) {
    const h = hh[p.id]; if (!h) continue;
    const l = h.lci || lciOf(h.dims);
    dist[l.worst - 1]++;
    for (const [k, v] of [['group', h.group], ['loc', h.loc], ['muni', h.muni], ['province', provinceOf(h.muni)], ['family', p.profile]]) (by[k][v] = by[k][v] || []).push(l);
  }
  const agg = arr => {
    const share = ph => arr.filter(l => l.worst >= ph).length / arr.length;
    return { n: arr.length, phase20: [5, 4, 3, 2, 1].find(ph => share(ph) >= 0.2) || 1, meanWorst: r1(arr.reduce((a, l) => a + l.worst, 0) / arr.length) };
  };
  const o = x => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, agg(v)]));
  return { dist: { worst: dist }, byGroup: o(by.group), byLoc: o(by.loc), byMuni: o(by.muni), byProvince: o(by.province), byFamily: o(by.family) };
}
