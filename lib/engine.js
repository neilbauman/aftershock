// Aftershock v1 engine: six acts, each with a family block (odd rounds) and a response block (even rounds).
import {
  ACTS, DIMS, PHASES, INSTITUTIONS, INSTITUTION_ORDER, AGENCIES, PROFILES, SITE_LOCS, MUNIS, PROVINCES, STAFF, provinceOf,
  familySteps, responseSteps, applyFamily, roundInfo, phaseOf, lciOf, initialOrgs, WAIT_OPTION,
} from './scenario.js';

const DIM_KEYS = Object.keys(DIMS);
const NUMERIC = ['coord', 'goodwill', 'pull', 'rentPressure', 'visibility', 'assessBoost', 'neighBoost', 'lissaVisible', 'orchardGrow', 'baseVarenna', 'baseLissa', 'focusVarenna', 'focusLissa', 'engineering', 'committeePressure', 'gymCrowd', 'schoolResist', 'seenLissa'];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r1 = v => Math.round(v * 10) / 10;

export function initialWorld() {
  return {
    coord: 0, goodwill: 2, lissaVisible: 0, pull: 0, rentPressure: 0, priceIndex: 1,
    hillsOpen: false, sitesOnly: false, cashBlocked: false, permitsFast: false,
    reported: {}, eff: {}, partners: { ifrc: 'ns' }, orgs: initialOrgs(), activity: {},
    orchard: { status: 'unknown', families: 12, seenBy: {} }, orchardStatus: 'unknown',
    public: { headline: 'Waiting for the facilitator to open Act 1.', log: [] },
    briefs: {}, stats: [],
  };
}

export function initialHousehold(profile) {
  const s = structuredClone(PROFILES[profile].init);
  s.known = false; s.history = []; s.lci = lciOf(s.dims);
  return s;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function npcPick(options, rand) {
  const w = options.map(o => (o.id === 'wait' || o.id === 'none') ? 0.15 : (o.npc ?? 1));
  let x = rand() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) { x -= w[i]; if (x <= 0) return options[i]; }
  return options[0];
}

function mergeWorld(world, w, inst) {
  for (const [k, v] of Object.entries(w || {})) {
    if (k === 'report') world.reported[inst] = v;
    else if (k === 'efficiency') world.eff[inst] = v;
    else if (k === 'orchardStatus') { world.orchardStatus = v; world.orchard.status = v; }
    else if (k === 'seenOrchardCoord') world.orchard.seenBy.coord = true;
    else if (NUMERIC.includes(k)) world[k] = (world[k] || 0) + v;
    else world[k] = v;
  }
}

function matches(target, h, profile) {
  switch (target) {
    case 'all': return true;
    case 'formal': return SITE_LOCS.includes(h.loc);
    case 'varenna_sites': return ['school', 'stadium'].includes(h.loc);
    case 'varenna_neigh': return h.muni === 'varenna' && !SITE_LOCS.includes(h.loc);
    case 'varenna_all': return h.muni === 'varenna';
    case 'lissa': return h.muni === 'lissa';
    case 'lissa_homes': return h.muni === 'lissa' && ['home', 'host', 'rental'].includes(h.loc);
    case 'morava': return provinceOf(h.muni) === 'morava';
    case 'brena': return h.muni === 'brena';
    case 'tenure_risk': return ['hosted', 'rent', 'informal'].includes(h.group) || h.loc === 'riverside';
    case 'school': case 'stadium': case 'gym': case 'orchard': case 'riverside': case 'planned': return h.loc === target;
    case 'hosted': return h.group === 'hosted';
    case 'hostpair': return h.group === 'host' || h.group === 'hosted';
    case 'renthosted': return h.group === 'hosted' || h.group === 'rent';
    case 'vulnerable': return !!PROFILES[profile].vulnerable;
    case 'owners': return h.group === 'nondisp' && h.res.docs > 0 && ['home', 'village'].includes(h.loc);
    case 'oldtown': return PROFILES[profile].area === 'old' && ['home', 'rental', 'host'].includes(h.loc);
    case 'unsafe': return !!h.unsafe;
    default: return false;
  }
}

function pairing(players) {
  const h1 = players.filter(p => p.profile === 'H1'), h6 = players.filter(p => p.profile === 'H6');
  return id => { const i = h1.findIndex(p => p.id === id); if (i >= 0) return h6[i]?.id; const j = h6.findIndex(p => p.id === id); return j >= 0 ? h1[j]?.id : null; };
}

const fmtPhase = p => `Phase ${p} (${PHASES[p - 1]})`;

export function resolveRound(data) {
  const n = data.cohort.current_round;
  const { act, block } = roundInfo(n);
  const ctx = {
    n, act, block,
    players: data.players.filter(p => data.households[p.id]),
    world: structuredClone(data.world || initialWorld()),
    hh: structuredClone(data.households),
    decisions: data.decisions.filter(d => d.round === n),
    rand: rng(data.cohort.seed * 31 + n),
    feed: [], notes: {}, stat: { round: n, act: act.n, block, choices: {}, teams: {}, reached: {}, gaps: {}, duplicates: 0, defaults: 0 },
  };
  ctx.players.forEach(p => { ctx.notes[p.id] = []; });
  const before = Object.fromEntries(ctx.players.map(p => [p.id, lciOf(ctx.hh[p.id].dims)]));
  if (block === 'family') resolveFamily(ctx); else resolveResponse(ctx, data.players);
  return finish(ctx, before);
}

// ------------------------------------------------------------------ family block
function resolveFamily(ctx) {
  const { act, players, hh, world, decisions, rand, notes, stat } = ctx;
  const pairOf = pairing(players);
  for (const p of players) {
    const picks = {};
    for (const d of decisions.filter(d => d.player_id === p.id)) picks[d.kind] = d.option_id;
    let s = hh[p.id];
    for (const step of act.family.steps) {
      const st = familySteps({ family: { steps: [step] } }, p.profile, s, picks)[0];
      let opt = st.options.find(o => o.id === picks[step.id]);
      if (!opt) {
        if (p.npc) { opt = npcPick(st.options, rand); picks[step.id] = opt.id; }
        else { opt = WAIT_OPTION; stat.defaults++; }
      }
      s = applyFamily(s, opt);
      if (opt.knownP && rand() < opt.knownP) s.known = true;
      if (opt.world) mergeWorld(world, opt.world, p.institution);
      const key = `${step.id}:${opt.id}`; stat.choices[key] = (stat.choices[key] || 0) + 1;
      const pid = pairOf(p.id);
      if (pid && hh[pid] && opt.res?.goodwill && ['host', 'hosted'].includes(hh[pid].group)) hh[pid].res.goodwill = Math.max(0, hh[pid].res.goodwill + opt.res.goodwill);
      if (pid && hh[pid] && opt.id === 'contribute') hh[pid].res.cash += 60;
      notes[p.id].push(picks[step.id] || p.npc ? opt.feed : 'You did not decide in time, so your family waited.');
    }
    hh[p.id] = s;
  }
  // the orchard keeps filling with families nobody is playing
  world.orchard.families = Math.round(world.orchard.families + 4 + 3 * (world.orchardGrow || 0) - (world.orchardEvict ? 6 : 0));
  world.orchardGrow = 0;
  familyEvent(act.family.event.id, ctx);
  drift(ctx, pairOf);
  for (const p of players) notes[p.id].push(act.family.event.text);
}

function familyEvent(id, { players, hh, world, notes }) {
  for (const p of players) {
    const h = hh[p.id];
    if (id === 'aftershocks' && h.loc === 'village' && !world.hillsOpen) h.dims.essentials = clamp(h.dims.essentials + 0.3, 1, 5);
    if (id === 'host_strain') { if (h.group === 'hosted') h.res.goodwill = Math.max(0, h.res.goodwill - 0.7); if (h.group === 'host') h.dims.essentials = clamp(h.dims.essentials + 0.5, 1, 5); if (h.loc === 'orchard') h.dims.settlement = clamp(h.dims.settlement + 0.5, 1, 5); }
    if (id === 'school_closure' && h.loc === 'school' && !world.schoolPhased) h.dims.tenure = clamp(h.dims.tenure + 1, 1, 5);
    if (id === 'winter') { const exposed = phaseOf(h.dims.dwelling) >= 3; if (exposed) { h.dims.essentials = clamp(h.dims.essentials + 1, 1, 5); h.dims.dwelling = clamp(h.dims.dwelling + 0.5, 1, 5); } }
    if (id === 'aftershock' && h.unsafe) { h.dims.dwelling = clamp(h.dims.dwelling + 1.5, 1, 5); notes[p.id].push('The aftershock cracked the walls you had patched.'); }
  }
  if (id === 'school_closure') world.orchard.families += 10;
}

function drift({ players, hh, world, notes }, pairOf) {
  for (const p of players) {
    const h = hh[p.id];
    if (h.loc === 'stadium' && !world.stadiumFormal) h.dims.settlement = clamp(h.dims.settlement + 0.25, 1, 5);
    if (h.loc === 'orchard') {
      h.dims.settlement = clamp(h.dims.settlement + (world.orchardStatus === 'site' ? -0.1 : 0.3), 1, 5);
      if (world.orchardEvict) { h.dims.tenure = 5; notes[p.id].push('Police came to the orchard with the owner and an eviction order.'); }
    }
    if (['school', 'gym'].includes(h.loc)) h.dims.settlement = clamp(h.dims.settlement + 0.1 + 0.2 * (world.gymCrowd && h.loc === 'gym' ? 1 : 0), 1, 5);
    if (h.group === 'hosted') h.res.goodwill = Math.max(0, h.res.goodwill - 0.3);
    if (h.res.debt > 0) h.res.debt = Math.round(h.res.debt * 1.05);
    if (h.res.cash < 20) h.dims.essentials = clamp(h.dims.essentials + 0.25, 1, 5);
    if (h.group === 'rent' && world.rentPressure > 0 && !world.hlp) h.dims.tenure = clamp(h.dims.tenure + 0.15 * world.rentPressure, 1, 5);
    if (h.group === 'hosted' && h.res.goodwill <= 0.2) {
      const toLoc = h.muni === 'lissa' ? 'gym' : 'stadium';
      Object.assign(h, { loc: toLoc, group: 'site' }); h.dims.tenure = 4; h.dims.settlement = Math.max(h.dims.settlement, 4); h.res.goodwill = 1;
      notes[p.id].push(`Your hosts could not go on. You moved to the ${toLoc === 'gym' ? 'Lissa gymnasium' : 'stadium'}.`);
      const pid = pairOf(p.id); if (pid && hh[pid]) { hh[pid].dims.essentials = clamp(hh[pid].dims.essentials - 0.5, 1, 5); notes[pid]?.push('Your guests have left. The flat is quiet again.'); }
    }
    if (h.group === 'host' && !players.some(q => pairOf(p.id) === q.id && hh[q.id].group === 'hosted')) h.group = 'nondisp';
  }
}

// Who knows the orchard exists: their own assessment, DTM shared through the 3W, or a public classification.
export function orchardSeen(world, inst) {
  if (world.orchard.seenBy[inst] || ['site', 'pocket'].includes(world.orchardStatus)) return true;
  if (world.dtm && world.reported.iom > 0 && (inst === 'coord' || world.reported[inst] > 0)) return true;
  return false;
}

// ------------------------------------------------------------------ response block
function teamPick(ctx, allPlayers, inst, step) {
  const humans = allPlayers.filter(p => p.institution === inst && !p.npc);
  if (!humans.length) return { opt: npcPick(step.options, ctx.rand), npc: true };
  const votes = {}, order = [];
  for (const p of humans) {
    const d = ctx.decisions.find(d => d.player_id === p.id && d.kind === step.id);
    if (d) { votes[d.option_id] = (votes[d.option_id] || 0) + 1; order.push(d); }
  }
  if (!order.length) return { opt: null };
  order.sort((a, b) => new Date(a.at) - new Date(b.at));
  const max = Math.max(...Object.values(votes));
  return { opt: step.options.find(o => o.id === order.find(d => votes[d.option_id] === max).option_id) || null };
}

function resolveResponse(ctx, allPlayers) {
  const { n, act, players, hh, world, notes, stat, feed } = ctx;
  // surge staff arriving
  for (const inst of AGENCIES) {
    const org = world.orgs[inst];
    const arrived = org.incoming.filter(x => x.round <= n);
    for (const a of arrived) for (const [k, v] of Object.entries(a.staff)) org.staff[k] = (org.staff[k] || 0) + v;
    if (arrived.length) feed.push({ team: inst, round: n, body: `Surge staff arrived: ${arrived.map(a => Object.entries(a.staff).map(([k, v]) => `${v} ${STAFF[k].toLowerCase()}`).join(', ')).join('; ')}.` });
    org.incoming = org.incoming.filter(x => x.round > n);
  }
  const received = {};
  const order = ['varenna', 'lissa', 'coord', ...AGENCIES];
  const picks = {};
  for (const inst of order) {
    const steps = responseSteps(act, inst, world);
    picks[inst] = [];
    for (const step of steps) {
      const { opt, npc } = teamPick(ctx, allPlayers, inst, step);
      stat.teams[`${inst}:${step.id}`] = opt ? opt.id + (npc ? '*' : '') : null;
      if (!opt || opt.id === 'none') { picks[inst].push({ step, opt: null }); continue; }
      picks[inst].push({ step, opt, npc });
      applyInstitution(ctx, inst, opt, received);
    }
    const did = picks[inst].filter(x => x.opt);
    const name = INSTITUTIONS[inst].name;
    if (!did.length) feed.push({ team: inst, round: n, body: `Act ${act.n}: your organisation made no decisions in time.` });
    else feed.push({ team: inst, round: n, body: `Act ${act.n} results: ${did.map(x => INSTITUTIONS[inst].agency ? `You ${x.opt.feed}` : x.opt.feed).join(' ')}` + (stat.reached[inst] != null ? ` You reached ${stat.reached[inst]} household${stat.reached[inst] === 1 ? '' : 's'}${stat.gaps[inst] ? `; ${stat.gaps[inst]} in your target were not on any list` : ''}${stat.blind?.[inst] ? '; you had no information about the orchard' : ''}.` : '') });
    if (did.length) world.public.log.push({ round: n, text: `${name}: ${did.map(x => x.opt.label.toLowerCase()).join('; ')}.` });
  }
  // partners: local partners carry load unless funded
  for (const [inst, partner] of Object.entries(world.partners)) if (world.orgs[partner]) world.orgs[partner].capacity = clamp(world.orgs[partner].capacity - 0.1, 0.3, 1.3);
  responseEvent(act.response.event.id, ctx);
  for (const p of players) if (notes[p.id].length) notes[p.id].unshift(`While you were working, in Act ${act.n}:`);
}

function applyInstitution(ctx, inst, opt, received) {
  const { n, players, hh, world, rand, notes, stat } = ctx;
  mergeWorld(world, opt.world, inst);
  const org = world.orgs[inst];
  if (org) {
    for (const [k, v] of Object.entries(opt.staff || {})) org.staff[k] = (org.staff[k] || 0) + v;
    if (opt.incoming) org.incoming.push({ staff: opt.incoming, round: n + (world.permitsFast ? 2 : 4) });
    if (opt.capacity) org.capacity = clamp(org.capacity + opt.capacity, 0.3, 1.3);
    if (opt.partner) world.partners[inst] = opt.partner;
    if (opt.partnerBoost && world.partners[inst]) world.orgs[world.partners[inst]].capacity = clamp(world.orgs[world.partners[inst]].capacity + opt.partnerBoost, 0.3, 1.3);
    if (opt.poach) world.orgs[opt.poach].capacity = clamp(world.orgs[opt.poach].capacity - 0.2, 0.3, 1.3);
  }
  if (inst === 'coord' && world.orchardStatus !== 'unknown') world.orchard.seenBy.coord = true;
  if (opt.reveal) world.orchard.seenBy[inst] = true;
  if (!opt.target) return;
  // which households does it reach?
  let targets = players.filter(p => matches(opt.target === 'worst' ? 'all' : opt.target, hh[p.id], p.profile));
  if (opt.target === 'worst') {
    const key = world.rule === 'mean' ? 'mean' : world.rule === 'count4' ? 'count4' : 'worst';
    const known = targets.filter(p => hh[p.id].known).sort((a, b) => lciOf(hh[b.id].dims)[key] - lciOf(hh[a.id].dims)[key]);
    targets = known.slice(0, Math.max(1, Math.ceil(known.length / 2)));
  }
  const name = INSTITUTIONS[inst].name;
  const partnerOrg = world.partners[inst] && world.orgs[world.partners[inst]];
  const hasStaff = t => !t || (org?.staff[t] || 0) + (t === 'assess' && partnerOrg ? partnerOrg.staff.assess : 0) >= 1;
  const seen = !opt.needsSeen || orchardSeen(world, inst);
  if (!seen) { stat.blind = stat.blind || {}; stat.blind[inst] = true; stat.reached[inst] = 0; return; }
  let reached = 0, missed = 0;
  for (const p of targets) {
    const h = hh[p.id];
    if (opt.knownP) {
      let prob = opt.knownP + (world.assessBoost || 0) + (opt.target === 'varenna_neigh' ? world.neighBoost || 0 : 0);
      if (opt.access && !world.hillsOpen) prob *= 0.5;
      if (!hasStaff(opt.needs)) prob *= 0.4;
      if (org) prob *= Math.min(1, org.capacity + 0.2);
      if (rand() < prob) {
        h.known = true; reached++;
        if (opt.set) Object.assign(h, opt.set);
        if (h.loc === 'orchard') world.orchard.seenBy[inst] = true;
        notes[p.id].push(`${name} came by and took your family’s details.`);
      }
      continue;
    }
    if (opt.needsKnown && !h.known) { missed++; continue; }
    let m = INSTITUTIONS[inst].agency ? (org.capacity) * (1 + (world.eff[inst] || 0)) : 1;
    if (opt.needs && !hasStaff(opt.needs)) m *= 0.35;
    if (opt.cash && world.cashBlocked) m *= 0.3;
    if (world.sitesOnly && h.muni === 'varenna' && !SITE_LOCS.includes(h.loc) && INSTITUTIONS[inst].agency) m *= 0.5;
    if (world.hostFocus && ['host', 'hosted'].includes(h.group)) m *= 1.2;
    if (INSTITUTIONS[inst].type === 'international' && h.muni === 'lissa' && !world.baseLissa) m *= 0.7;
    if (INSTITUTIONS[inst].agency && world.goodwill < 1) m *= 0.8;
    const cat = opt.category || opt.id;
    received[p.id] = received[p.id] || {};
    if (INSTITUTIONS[inst].agency && received[p.id][cat]) { m *= world.coord >= 3 ? 0.7 : 0.3; stat.duplicates++; }
    received[p.id][cat] = true;
    for (const [k, v] of Object.entries(opt.dims || {})) h.dims[k] = clamp(h.dims[k] + v * m, 1, 5);
    for (const [k, v] of Object.entries(opt.res || {})) h.res[k] = Math.max(0, r1((h.res[k] || 0) + v * m));
    if (opt.extraVulnerable && PROFILES[p.profile].vulnerable) for (const [k, v] of Object.entries(opt.extraVulnerable)) h.dims[k] = clamp(h.dims[k] + v * m, 1, 5);
    if (opt.set) Object.assign(h, opt.set);
    reached++;
    const how = m < 0.5 ? ' Only a little of it reached you.' : '';
    notes[p.id].push(INSTITUTIONS[inst].agency ? `${name} ${opt.feed}.${how}` : opt.feed);
  }
  if (INSTITUTIONS[inst].agency) {
    world.eff[inst] = 0;
    if (!opt.knownP) world.activity[inst] = opt.label;
    stat.reached[inst] = (stat.reached[inst] || 0) + reached;
    stat.gaps[inst] = (stat.gaps[inst] || 0) + missed;
  }
}

function responseEvent(id, { world, players, hh }) {
  if (id === 'rents_rise') world.rentPressure += 1;
  if (id === 'funding_cut') for (const o of Object.values(world.orgs)) o.capacity = clamp(o.capacity - 0.3, 0.3, 1.3);
  if (id === 'first_reports') world.visibility = (world.visibility || 0) + 1;
}

// ------------------------------------------------------------------ wrap-up
function finish(ctx, before) {
  const { n, act, block, players, hh, world, feed, notes, stat } = ctx;
  for (const p of players) {
    const h = hh[p.id];
    h.lci = lciOf(h.dims);
    h.history.push({ round: n, act: act.n, block, dims: Object.fromEntries(DIM_KEYS.map(k => [k, r1(h.dims[k])])), lci: h.lci, loc: h.loc, group: h.group, known: h.known });
    if (p.npc) continue;
    const worstDim = DIM_KEYS.reduce((a, k) => (phaseOf(h.dims[k]) > phaseOf(h.dims[a]) ? k : a), DIM_KEYS[0]);
    const delta = h.lci.worst - before[p.id].worst;
    const trend = delta > 0 ? 'Things got worse for your family.' : delta < 0 ? 'Things improved for your family.' : '';
    if (block === 'response' && !notes[p.id].length) notes[p.id].push(`While you were working, in Act ${act.n}: nothing reached your family.`);
    feed.push({ player_id: p.id, round: n, body: [...notes[p.id], trend, `Your most severe dimension is ${DIMS[worstDim].label}: ${fmtPhase(h.lci.worst)}.`].filter(Boolean).join(' ') });
  }
  if (block === 'response') world.public.log.push({ round: n, text: act.response.event.text });
  world.briefs = makeBriefs(world, hh, players);
  world.public.headline = block === 'family'
    ? `Act ${act.n} (${act.time}): the family block is resolved. ${act.family.event.text}`
    : `Act ${act.n} (${act.time}) is complete. ${act.response.event.text}`;
  world.public.log = world.public.log.slice(-60);
  stat.lci = summariseLci(hh, players);
  world.areas = Object.fromEntries(Object.entries(stat.lci.byMuni).map(([k, v]) => [k, v.phase20]));
  stat.orchardFamilies = world.orchard.families;
  stat.orgs = structuredClone(world.orgs);
  world.stats = [...(world.stats || []).filter(s => s.round !== n), stat];
  feed.push({ round: n, body: block === 'family' ? `Act ${act.n}: families have made their choices. ${act.family.event.text}` : `Act ${act.n} complete. ${act.response.event.text}` });
  return { world, households: players.map(p => ({ player_id: p.id, state: hh[p.id] })), feed, round: { number: n, status: 'resolved', results: stat } };
}

export function summariseLci(hh, players) {
  const by = { group: {}, loc: {}, muni: {}, province: {} }, dist = [0, 0, 0, 0, 0];
  for (const p of players) {
    const h = hh[p.id]; if (!h) continue;
    const l = h.lci || lciOf(h.dims);
    dist[l.worst - 1]++;
    for (const [k, v] of [['group', h.group], ['loc', h.loc], ['muni', h.muni], ['province', provinceOf(h.muni)]]) (by[k][v] = by[k][v] || []).push(l);
  }
  const agg = arr => {
    const share = ph => arr.filter(l => l.worst >= ph).length / arr.length;
    return { n: arr.length, phase20: [5, 4, 3, 2, 1].find(ph => share(ph) >= 0.2) || 1, meanWorst: r1(arr.reduce((a, l) => a + l.worst, 0) / arr.length) };
  };
  const o = x => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, agg(v)]));
  return { dist: { worst: dist }, byGroup: o(by.group), byLoc: o(by.loc), byMuni: o(by.muni), byProvince: o(by.province) };
}

function makeBriefs(world, hh, players) {
  const known = players.filter(p => hh[p.id].known);
  const briefs = {};
  const reporters = AGENCIES.filter(i => world.reported[i] > 0);
  for (const inst of INSTITUTION_ORDER) {
    const lines = [];
    const org = world.orgs[inst];
    if (org) {
      const staff = Object.entries(org.staff).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${STAFF[k].toLowerCase()}`).join(', ') || 'no specialist staff';
      lines.push(`On the ground: ${staff}. Capacity ${Math.round(org.capacity * 100)}%.`);
      if (org.incoming.length) lines.push(`Incoming: ${org.incoming.map(x => Object.entries(x.staff).map(([k, v]) => `${v} ${STAFF[k].toLowerCase()}`).join(', ')).join('; ')}${world.permitsFast ? '' : ' (permits are slow)'}.`);
      if (world.partners[inst]) lines.push(`Partner: ${INSTITUTIONS[world.partners[inst]].name}.`);
      const partnersOf = Object.entries(world.partners).filter(([, v]) => v === inst).map(([k]) => INSTITUTIONS[k].name);
      if (partnersOf.length) lines.push(`Funded by / working with: ${partnersOf.join(', ')}.`);
      lines.push(`Households on lists: ${known.length}.`);
      lines.push(orchardSeen(world, inst) ? `The orchard near Lissa: about ${world.orchard.families} families (status: ${world.orchardStatus}).` : 'You have no information about informal settlements outside the official sites.');
      if (world.reported[inst] > 0 && reporters.length) lines.push(`Coverage map: ${reporters.map(i => `${INSTITUTIONS[i].name}: ${world.activity[i] || 'assessing'}`).join(' · ')}.`);
      else lines.push('You are not reporting, so you do not see the coverage map.');
      if (world.cashBlocked) lines.push('Varenna allows in-kind assistance only.');
    }
    if (inst === 'coord') {
      lines.push(`3W: ${AGENCIES.map(i => `${INSTITUTIONS[i].name} ${world.reported[i] === 1 ? 'full' : world.reported[i] === 0.5 ? 'partial' : 'none'}`).join(', ')}.`);
      lines.push(orchardSeen(world, 'coord') ? `Orchard near Lissa: about ${world.orchard.families} families; you classify it as: ${world.orchardStatus}.` : 'There are rumours of informal settlements near Lissa, but you have not verified them.');
      lines.push(`Lissa’s visibility in the response: ${world.lissaVisible >= 3 ? 'good' : world.lissaVisible >= 1 ? 'some' : 'very low'}.`);
    }
    if (inst === 'coord') {
      const lci = summariseLci(hh, players);
      lines.push(`Area phases (20% rule): ${Object.entries(lci.byMuni).map(([k, v]) => `${MUNIS[k]?.name || k} ${v.phase20}`).join(', ')}.`);
    }
    if (inst === 'varenna' || inst === 'lissa') {
      lines.push(`Relationship with agencies: ${world.goodwill >= 3 ? 'strong' : world.goodwill >= 1.5 ? 'workable' : 'strained'}.`);
      const muni = inst;
      const fam = players.filter(p => hh[p.id].muni === muni);
      if (fam.length) lines.push(`Families in ${MUNIS[muni].name} in this game: ${fam.length}. Average worst phase: ${r1(fam.reduce((a, p) => a + hh[p.id].lci.worst, 0) / fam.length)}.`);
      if (inst === 'lissa') lines.push(`The orchard: about ${world.orchard.families} families.`);
    }
    briefs[inst] = lines;
  }
  return briefs;
}
