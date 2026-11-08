// Aftershock round engine. Deterministic for a given seed + decisions.
import {
  ROUNDS, DIMS, PHASES, INSTITUTIONS, INSTITUTION_ORDER, PROFILES, SITE_LOCS,
  householdOptions, institutionBlock, phaseOf, lciOf, WAIT_OPTION,
} from './scenario.js';

const DIM_KEYS = Object.keys(DIMS);
const NUMERIC_WORLD = ['coord', 'goodwill', 'pull', 'rentPressure', 'visibility', 'assessBoost', 'neighBoost', 'assessBoostRural'];

export function initialWorld() {
  return {
    coord: 0, goodwill: 2, pull: 0, rentPressure: 0, visibility: 0, priceIndex: 1,
    hillsOpen: false, sitesOnly: false, cashBlocked: false, reported: {}, eff: {},
    public: { headline: 'Waiting for the facilitator to open Round 1.', log: [] },
    briefs: {}, stats: [],
  };
}

export function initialHousehold(profile) {
  const p = PROFILES[profile];
  const s = structuredClone(p.init);
  s.known = false; s.registered = false; s.history = [];
  s.lci = lciOf(s.dims);
  return s;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function applyEffects(h, eff, m = 1) {
  for (const [k, v] of Object.entries(eff.dims || {})) h.dims[k] = clamp(h.dims[k] + v * m, 1, 5);
  for (const [k, v] of Object.entries(eff.res || {})) h.res[k] = Math.max(0, Math.round(((h.res[k] || 0) + v * m) * 10) / 10);
  for (const [k, v] of Object.entries(eff.set || {})) h[k] = v;
}

function matches(target, h, profile, world) {
  switch (target) {
    case 'all': return true;
    case 'site': return SITE_LOCS.includes(h.loc);
    case 'school': case 'stadium': case 'hall': return h.loc === target;
    case 'hosted': return h.group === 'hosted';
    case 'host': return h.group === 'host';
    case 'hostpair': return h.group === 'host' || h.group === 'hosted';
    case 'renthosted': return h.group === 'hosted' || h.group === 'rent';
    case 'rent': return h.group === 'rent';
    case 'nondisp': return h.group === 'nondisp';
    case 'urban': return h.loc !== 'village';
    case 'rural': return h.loc === 'village';
    case 'old': return PROFILES[profile].area === 'old' && !SITE_LOCS.includes(h.loc);
    case 'vulnerable': return !!PROFILES[profile].vulnerable;
    default: return false;
  }
}

function mergeWorld(world, w, team) {
  for (const [k, v] of Object.entries(w || {})) {
    if (k === 'report') world.reported[team] = v;
    else if (k === 'efficiency') world.eff[team] = v;
    else if (k === 'hillsOpenChance') world._hillsChance = v;
    else if (NUMERIC_WORLD.includes(k)) world[k] = (world[k] || 0) + v;
    else world[k] = v;
  }
}

function teamChoice(players, decisions, inst) {
  const votes = {};
  const order = [];
  for (const p of players.filter(p => p.institution === inst)) {
    const d = decisions.find(d => d.player_id === p.id && d.kind === 'institution');
    if (d) { votes[d.option_id] = (votes[d.option_id] || 0) + 1; order.push(d); }
  }
  if (!order.length) return null;
  order.sort((a, b) => new Date(a.at) - new Date(b.at));
  const max = Math.max(...Object.values(votes));
  return order.find(d => votes[d.option_id] === max).option_id;
}

const fmtPhase = p => `Phase ${p} (${PHASES[p - 1]})`;

/**
 * Resolve a round.
 * @param data  srv_load payload
 * @returns patch for srv_save
 */
export function resolveRound(data) {
  const { cohort, players } = data;
  const n = cohort.current_round;
  const round = ROUNDS.find(r => r.n === n);
  const world = structuredClone(data.world || initialWorld());
  const hh = structuredClone(data.households);
  const decisions = data.decisions.filter(d => d.round === n);
  const rand = rng(cohort.seed * 31 + n);
  const feed = [];
  const notes = Object.fromEntries(players.map(p => [p.id, []]));
  const stat = { round: n, household: {}, teams: {}, reached: {}, gaps: {}, duplicates: 0, defaults: 0 };
  const before = Object.fromEntries(players.map(p => [p.id, lciOf(hh[p.id].dims)]));

  // pair H1 <-> H6 households in join order
  const h1 = players.filter(p => p.profile === 'H1'), h6 = players.filter(p => p.profile === 'H6');
  const pairOf = id => { const i = h1.findIndex(p => p.id === id); if (i >= 0) return h6[i]?.id; const j = h6.findIndex(p => p.id === id); return j >= 0 ? h1[j]?.id : null; };

  // 1. household decisions
  for (const p of players) {
    const h = hh[p.id];
    const opts = householdOptions(round, p.profile, h);
    const d = decisions.find(d => d.player_id === p.id && d.kind === 'household');
    let opt = d && opts.find(o => o.id === d.option_id);
    if (!opt) { opt = WAIT_OPTION; if (!d) stat.defaults++; }
    stat.household[opt.id] = (stat.household[opt.id] || 0) + 1;
    applyEffects(h, opt);
    if (opt.knownP && rand() < opt.knownP) h.known = true;
    if (opt.world) mergeWorld(world, opt.world, p.institution);
    // hosting relationship is shared between the paired households
    const pid = pairOf(p.id);
    if (pid && opt.res?.goodwill && (p.profile === 'H6' || p.profile === 'H1')) {
      const other = hh[pid];
      if (other && (other.group === 'hosted' || other.group === 'host')) other.res.goodwill = Math.max(0, other.res.goodwill + opt.res.goodwill);
    }
    if (pid && opt.id === 'contribute') hh[pid].res.cash += 60;
    notes[p.id].push(d ? opt.feed : 'You did not decide in time, so your family waited.');
  }

  // 2. institutions: authority and coordination first (they set policy), then agencies
  const choices = {};
  for (const inst of ['auth', 'coord', 'ns', 'ingo', 'un']) {
    const block = institutionBlock(round, inst);
    const id = teamChoice(players, decisions, inst);
    const opt = id && block?.options.find(o => o.id === id);
    choices[inst] = opt || null;
    stat.teams[inst] = opt ? opt.id : null;
    if (!opt) continue;
    mergeWorld(world, opt.world, inst);
    if (inst === 'auth' || inst === 'coord') {
      world.public.log.push({ round: n, text: opt.feed });
      if (opt.target && opt.dims) for (const p of players) if (matches(opt.target, hh[p.id], p.profile, world)) { applyEffects(hh[p.id], opt); notes[p.id].push(opt.feed); }
    }
  }
  if (world._hillsChance && !world.hillsOpen && rand() < world._hillsChance) world.hillsOpen = true;
  delete world._hillsChance;

  const received = {}; // player -> category -> count
  for (const inst of ['ns', 'ingo', 'un']) {
    const opt = choices[inst];
    if (!opt) continue;
    const name = INSTITUTIONS[inst].short;
    let reached = 0, missed = 0;
    let targets = players.filter(p => matches(opt.target === 'worst' ? 'all' : opt.target, hh[p.id], p.profile, world));
    if (opt.target === 'worst') {
      const known = targets.filter(p => hh[p.id].known);
      const key = world.rule === 'mean' ? 'mean' : world.rule === 'count4' ? 'count4' : 'worst';
      known.sort((a, b) => lciOf(hh[b.id].dims)[key] - lciOf(hh[a.id].dims)[key]);
      targets = known.slice(0, Math.max(1, Math.ceil(known.length / 2)));
    }
    for (const p of targets) {
      const h = hh[p.id];
      // assessment options: make people known
      if (opt.knownP) {
        let prob = opt.knownP + (world.assessBoost || 0);
        if (opt.target === 'urban') prob += world.neighBoost || 0;
        if (opt.target === 'rural') prob += world.assessBoostRural || 0;
        if (opt.accessDependent && !world.hillsOpen) prob *= 0.5;
        if (rand() < prob) { h.known = true; reached++; notes[p.id].push(`A team from the ${name} came by and took your details.`); }
        continue;
      }
      if (opt.needsKnown && !h.known) { missed++; continue; }
      let m = 1 + (world.eff[inst] || 0);
      if (opt.cash && world.cashBlocked) m *= 0.3;
      if (world.sitesOnly && !SITE_LOCS.includes(h.loc) && opt.target !== 'site') m *= 0.5;
      if (world.hostFocus && (h.group === 'host' || h.group === 'hosted')) m *= 1.25;
      if (world.goodwill < 1) m *= 0.8;
      const cat = opt.category || opt.id;
      received[p.id] = received[p.id] || {};
      if (received[p.id][cat]) { m *= world.coord >= 3 ? 0.7 : 0.3; stat.duplicates++; }
      received[p.id][cat] = (received[p.id][cat] || 0) + 1;
      applyEffects(h, opt, m);
      reached++;
      notes[p.id].push(`The ${name} ${opt.feed}${m < 0.5 ? ' — but you got only a little of it.' : ' — and your family received support.'}`);
    }
    world.eff[inst] = 0;
    if (opt.target && !opt.knownP) { world.activity = world.activity || {}; world.activity[inst] = opt.label.toLowerCase(); }
    stat.reached[inst] = reached; stat.gaps[inst] = missed;
    world.public.log.push({ round: n, text: `${INSTITUTIONS[inst].name} ${opt.feed}.` });
    feed.push({ team: inst, round: n, body: `Round ${n}: your team ${opt.feed}. Reached ${reached} household${reached === 1 ? '' : 's'}` + (opt.needsKnown ? `; ${missed} in your target group were not on any list.` : '.') });
  }
  for (const inst of INSTITUTION_ORDER) if (!choices[inst]) feed.push({ team: inst, round: n, body: `Round ${n}: your team did not decide in time, so nothing happened.` });

  // 3. scenario event
  applyEvent(round.event.id, hh, players, world, notes);

  // 4. drift
  for (const p of players) {
    const h = hh[p.id];
    if (h.loc === 'stadium' && !world.stadiumFormal) h.dims.settlement = clamp(h.dims.settlement + 0.25, 1, 5);
    if (h.loc === 'school' || h.loc === 'hall') h.dims.settlement = clamp(h.dims.settlement + 0.1, 1, 5);
    if (h.group === 'hosted') h.res.goodwill = Math.max(0, h.res.goodwill - 0.3);
    if (h.res.debt > 0) h.res.debt = Math.round(h.res.debt * 1.05);
    if (h.res.cash < 20) h.dims.essentials = clamp(h.dims.essentials + 0.25, 1, 5);
    if (h.group === 'rent' && world.rentPressure > 0 && !world.hlp) h.dims.tenure = clamp(h.dims.tenure + 0.15 * world.rentPressure, 1, 5);
    if (h.group === 'hosted' && h.res.goodwill <= 0.2) {
      h.loc = 'stadium'; h.group = 'site'; h.dims.tenure = 4; h.dims.settlement = Math.max(h.dims.settlement, 4); h.res.goodwill = 1;
      notes[p.id].push('Your hosts could not go on. You packed up and moved to the stadium.');
      const pid = pairOf(p.id); if (pid) { hh[pid].dims.essentials = clamp(hh[pid].dims.essentials - 0.5, 1, 5); notes[pid].push('Your guests have left. The flat is quiet again — and so is the family WhatsApp group.'); }
    }
    if (h.group === 'host' && !players.some(q => pairOf(p.id) === q.id && hh[q.id].group === 'hosted')) h.group = 'nondisp';
  }

  // 5. LCI and history
  for (const p of players) {
    const h = hh[p.id];
    h.lci = lciOf(h.dims);
    h.history.push({ round: n, dims: Object.fromEntries(DIM_KEYS.map(k => [k, Math.round(h.dims[k] * 100) / 100])), lci: h.lci, loc: h.loc, group: h.group, known: h.known });
    const worstDim = DIM_KEYS.reduce((a, k) => (phaseOf(h.dims[k]) > phaseOf(h.dims[a]) ? k : a), DIM_KEYS[0]);
    const delta = h.lci.worst - before[p.id].worst;
    const trend = delta > 0 ? 'Things got worse.' : delta < 0 ? 'Things improved.' : '';
    feed.push({ player_id: p.id, round: n, body: [...notes[p.id], `${round.event.text}`, `${trend} Your most severe dimension is ${DIMS[worstDim].label}: ${fmtPhase(h.lci.worst)}.`].filter(Boolean).join(' ') });
  }

  // 6. briefs and public state
  world.briefs = makeBriefs(world, hh, players, choices, stat);
  world.public.headline = `Round ${n} (${round.time}) is resolved. ${round.event.text}`;
  world.public.log = world.public.log.slice(-40);
  stat.lci = summariseLci(hh, players);
  world.stats = [...(world.stats || []).filter(s => s.round !== n), stat];
  feed.push({ round: n, body: `Round ${n} resolved. ${round.event.text}` });

  return {
    world,
    households: players.map(p => ({ player_id: p.id, state: hh[p.id] })),
    feed,
    round: { number: n, status: 'resolved', results: stat },
  };
}

function applyEvent(id, hh, players, world, notes) {
  for (const p of players) {
    const h = hh[p.id];
    switch (id) {
      case 'aftershocks': if (h.loc === 'village' && !world.hillsOpen) h.dims.essentials = clamp(h.dims.essentials + 0.3, 1, 5); break;
      case 'stadium_doubles': if (h.loc === 'stadium') h.dims.settlement = clamp(h.dims.settlement + 0.5 + 0.25 * (world.pull || 0), 1, 5); break;
      case 'road_opens': if (h.loc === 'village') h.dims.essentials = clamp(h.dims.essentials - 0.5, 1, 5); break;
      case 'host_strain':
        if (h.group === 'hosted') h.res.goodwill = Math.max(0, h.res.goodwill - 0.7);
        if (h.group === 'host') h.dims.essentials = clamp(h.dims.essentials + 0.5, 1, 5);
        break;
      case 'prices': break;
    }
  }
  if (id === 'road_opens') world.hillsOpen = true;
  if (id === 'prices') world.priceIndex = 1.25;
}

export function summariseLci(hh, players) {
  const byGroup = {}, byLoc = {}, dist = { worst: [0, 0, 0, 0, 0] };
  for (const p of players) {
    const h = hh[p.id];
    const l = h.lci || lciOf(h.dims);
    dist.worst[l.worst - 1]++;
    (byGroup[h.group] = byGroup[h.group] || []).push(l);
    (byLoc[h.loc] = byLoc[h.loc] || []).push(l);
  }
  const agg = arr => {
    // 20% rule: most severe phase reached by at least 20% of households
    const counts = [1, 2, 3, 4, 5].map(ph => arr.filter(l => l.worst >= ph).length / arr.length);
    const area = [5, 4, 3, 2, 1].find(ph => counts[ph - 1] >= 0.2) || 1;
    return { n: arr.length, phase20: area, meanWorst: Math.round(arr.reduce((a, l) => a + l.worst, 0) / arr.length * 10) / 10 };
  };
  return {
    dist,
    byGroup: Object.fromEntries(Object.entries(byGroup).map(([k, v]) => [k, agg(v)])),
    byLoc: Object.fromEntries(Object.entries(byLoc).map(([k, v]) => [k, agg(v)])),
  };
}

function makeBriefs(world, hh, players, choices, stat) {
  const known = players.filter(p => hh[p.id].known);
  const byGroup = {};
  for (const p of known) byGroup[hh[p.id].group] = (byGroup[hh[p.id].group] || 0) + 1;
  const groupTxt = Object.entries(byGroup).map(([g, c]) => `${c} ${g === 'site' ? 'on sites' : g === 'hosted' ? 'hosted' : g === 'host' ? 'host families' : g === 'rent' ? 'renting' : 'non-displaced'}`).join(', ') || 'none';
  const avg = known.length ? Math.round(known.reduce((a, p) => a + hh[p.id].lci.worst, 0) / known.length * 10) / 10 : null;
  const reporters = INSTITUTION_ORDER.filter(i => INSTITUTIONS[i].agency && world.reported[i] > 0);
  const map = reporters.map(i => `${INSTITUTIONS[i].short}: ${world.activity?.[i] || 'no deliveries yet'}`).join(' · ');
  const briefs = {};
  for (const inst of INSTITUTION_ORDER) {
    const lines = [`Households on responders’ lists: ${known.length} (${groupTxt}).` + (avg ? ` Their average worst phase is ${avg}.` : '')];
    if (INSTITUTIONS[inst].agency) {
      if (world.mapPublished && world.reported[inst] > 0) lines.push(`Coverage map (reporting agencies only): ${map || 'nothing reported yet'}.`);
      else if (world.mapPublished) lines.push('A coverage map exists, but you have not reported, so you cannot see it.');
      if (world.cashBlocked) lines.push('The Municipality allows in-kind assistance only.');
      if (world.sitesOnly) lines.push('Distributions are restricted to official sites.');
    }
    if (inst === 'coord') {
      lines.push(`3W reporting: ${INSTITUTION_ORDER.filter(i => INSTITUTIONS[i].agency).map(i => `${INSTITUTIONS[i].short} ${world.reported[i] === 1 ? 'full' : world.reported[i] === 0.5 ? 'partial' : 'none'}`).join(', ')}.`);
      if (stat.duplicates) lines.push(`${stat.duplicates} duplicated deliveries this round.`);
      if (world.snapshot) lines.push('Severity snapshot published (see the facilitator screen for the full picture).');
    }
    if (inst === 'auth') lines.push(`Relationship with agencies: ${world.goodwill >= 3 ? 'strong' : world.goodwill >= 1.5 ? 'workable' : 'strained'}.`);
    briefs[inst] = lines;
  }
  return briefs;
}
