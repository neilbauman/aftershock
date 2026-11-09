// Aftershock v2 story engine. One chapter per round. Every player is a family.
import { CHAPTERS, FAMILIES, DIMS, MUNIS, SITE_LOCS, chapterOf, chapterSteps, applyOption, check, texts, lciOf, phaseOf, provinceOf, stypeOf } from './chapters.js';
import { AFTERSHOCK, INJURY, STYPE_EVENTS, placeRisk, areaBase, areaSummary, AREA_N, PLAYER_WEIGHT } from './realism.js';

const DIM_KEYS = Object.keys(DIMS);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r1 = v => Math.round(v * 10) / 10;

export function initialWorld() {
  return { public: { headline: 'Waiting for the facilitator to open Chapter 1.', log: [], community: community(0, []) }, orchard: { families: 12 }, stats: [] };
}

/** Each municipality's households by phase: a simulated background population plus the cohort's own families. */
export function community(n, hhList) {
  const out = {};
  for (const m of Object.keys(MUNIS)) {
    const dist = areaBase(m, n).map(p => p * AREA_N / 100);
    for (const h of hhList) if (h.muni === m || (h.loc === 'away' && h.homeMuni === m)) dist[(h.lci || lciOf(h.dims)).worst - 1] += PLAYER_WEIGHT;
    out[m] = { ...areaSummary(dist), dist: dist.map(x => Math.round(x)) };
  }
  return out;
}

export function initialHousehold(family) {
  const s = structuredClone(FAMILIES[family].init);
  Object.assign(s, { known: false, flags: {}, choices: {}, story: [], pending: [], homeMuni: s.muni });
  s.res.items = 3;
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
    s.res.items = s.res.items ?? 3;
    const hurt = [];
    const injure = (p, k = 0.35) => {
      if (rand() >= p) return false;
      const serious = rand() < k, txt = INJURY[fam]?.[serious ? 'serious' : 'minor'];
      if (serious) {
        const bill = 40, paid = Math.min(bill, s.res.cash);
        s.res.cash -= paid; s.res.debt = (s.res.debt || 0) + (bill - paid);
        s.dims.essentials = clamp(s.dims.essentials + 0.8, 1, 5);
        s.flags = { ...s.flags, injured_serious: true, earner_down: n };
      } else { s.res.cash = Math.max(0, s.res.cash - 10); s.dims.essentials = clamp(s.dims.essentials + 0.3, 1, 5); }
      hurt.push(txt + (serious && s.res.debt > 0 ? ' You borrowed to pay the hospital.' : ''));
      stat.injuries = (stat.injuries || 0) + 1;
      return true;
    };
    // risky choices
    for (const st of steps) if (st.chosen?.risk && !hurt.length) injure(st.chosen.risk);
    // the earthquake itself: damage lands when the first chapter closes
    if (n === 1 && FAMILIES[fam].quake) {
      const q = FAMILIES[fam].quake;
      const atHome = ['home', 'makeshift'].includes(stypeOf(s));
      // the house takes the damage wherever the family is sleeping tonight
      const house = atHome ? s.dims : (s.homeDims = s.homeDims || { dwelling: start.dims.dwelling, tenure: start.dims.tenure, settlement: start.dims.settlement });
      for (const k of ['dwelling', 'tenure', 'settlement']) house[k] = clamp(house[k] + q[k], 1, 5);
      s.dims.essentials = clamp(s.dims.essentials + q.essentials, 1, 5);
      if (atHome) s.res.items = Math.max(0, s.res.items - 0.5); else s.homeItems = Math.max(0, (s.homeItems || 0) - 0.5);
      if (!atHome && stypeOf(s) === 'open') s.dims.settlement = clamp(Math.max(s.dims.settlement, house.settlement), 1, 5);
    }
    // aftershocks: dangerous for anyone living in or beside a damaged building; they also damage empty houses further
    const shock = AFTERSHOCK[n] || { k: 0 };
    s._stype = stypeOf(s);
    const risk = placeRisk(s, phaseOf) * shock.k;
    if (risk > 0 && !hurt.length && !injure(risk, n === 7 ? 0.6 : 0.35) && risk >= 0.08) hurt.push('The aftershocks opened new cracks in the walls around you. Nobody was hurt — this time.');
    delete s._stype;
    if (shock.k >= 0.5) {
      const house = ['home', 'makeshift'].includes(stypeOf(s)) ? s.dims : s.homeDims;
      if (house && phaseOf(house.dwelling) >= 3 && !s.flags.repaired) house.dwelling = clamp(house.dwelling + 0.3 * shock.k * (s.flags.shored ? 0.5 : 1), 1, 5);
    }
    if (s.flags.earner_down && n - s.flags.earner_down >= 3) { const f = { ...s.flags }; delete f.earner_down; s.flags = f; }
    const notes = [];
    const record = { ch: n, title: ch.title, time: ch.time, decisions: [] };
    for (const st of steps) {
      const o = st.chosen;
      if (!o) { stat.defaults++; record.decisions.push({ prompt: st.prompt, label: 'You did not decide in time.', after: 'Your family waited.' }); continue; }
      if (o.knownP && rand() < o.knownP) s.known = true;
      const key = `${fam}:${st.id}:${o.id}`; stat.choices[key] = (stat.choices[key] || 0) + 1;
      record.decisions.push({ prompt: st.prompt, label: o.label, after: [o.after, ...(st.notes || [])].filter(Boolean).join(' ') });
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
    // where you live: the good and the hard
    const lived = [];
    const evs = STYPE_EVENTS[stypeOf(s)];
    if (evs && n >= 2) {
      const ok = e => (!e.from || n >= e.from) && (!e.to || n <= e.to) && (!e.notFlag || !s.flags[e.notFlag]) && Object.entries(e.maxDim || {}).every(([k, v]) => s.dims[k] < v);
      const roll = e => rand() < e.p * (e.mit?.some(f => s.flags[f]) ? 0.5 : 1);
      const apply = e => { s = applyOption(s, e); if (e.known === true) s.known = true; if (e.known === false) s.known = false; lived.push(e.text); };
      const good = evs.good.filter(ok).find(roll); if (good) apply(good);
      const bad = [...evs.bad.filter(ok)].sort(() => rand() - 0.5).find(roll); if (bad) apply(bad);
    }
    // life goes on
    const drift = [];
    if (s.group === 'hosted') { s.res.goodwill = Math.max(0, s.res.goodwill - 0.25); if (s.res.goodwill <= 0.2) { const to = s.muni === 'lissa' ? 'gym' : 'school'; Object.assign(s, { loc: to, group: 'site', muni: s.muni === 'brena' ? 'varenna' : s.muni }); s.dims.tenure = 3.5; s.dims.settlement = Math.max(s.dims.settlement, 3.5); s.res.goodwill = 2; drift.push(`Your hosts could not go on. You moved to the ${to === 'gym' ? 'Lissa gymnasium' : 'collective centre at School No. 3'}.`); } }
    if (s.loc === 'orchard') s.dims.settlement = clamp(s.dims.settlement + 0.3, 1, 5);
    if (s.loc === 'stadium') s.dims.settlement = clamp(s.dims.settlement + 0.2, 1, 5);
    if (s.res.debt > 0) s.res.debt = Math.round(s.res.debt * 1.05);
    if (s.res.cash < 20) { s.dims.essentials = clamp(s.dims.essentials + 0.25, 1, 5); drift.push('Money has run out; the family is eating less.'); }
    delete s.notes;
    record.happened = [...hurt, ...happened, ...lived]; record.drift = drift;
    s.story = [...(s.story || []), record];
    s.pending = [...(shock.text ? [shock.text] : []), ...hurt, ...happened, ...lived, ...drift, ...texts(ch.bridge?.[fam], s, fam)];
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
  world.public.community = community(n, households.map(h => h.state));
  stat.community = world.public.community;
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
