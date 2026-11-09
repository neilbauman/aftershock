// Aftershock v2 — story mode. Five families, eight chapters across the first year.
// Every player plays one family. Several players can play the same family independently.

import { EARLY } from './ch_early.js';
import { LATE } from './ch_late.js';

export const SCENARIO_VERSION = 'varenna-v2';

export const DIMS = {
  dwelling:   { label: 'Dwelling adequacy',      short: 'Shelter',      text: ['Safe, dry, enough space', 'Some damage or crowding', 'Unsafe or badly crowded', 'Barely protected from the weather', 'No meaningful shelter'] },
  essentials: { label: 'Household essentials',   short: 'Essentials',   text: ['Sleeping, cooking, light all covered', 'Getting by, a few gaps', 'Missing key items', 'Cannot cook or keep warm', 'Nothing left'] },
  tenure:     { label: 'Security of tenure',     short: 'Tenure',       text: ['Secure, recognised right to stay', 'Some uncertainty', 'Informal, could be asked to leave', 'Eviction threatened', 'No right to stay'] },
  settlement: { label: 'Settlement environment', short: 'Surroundings', text: ['Services close, safe surroundings', 'Some services far or strained', 'Crowded, services overloaded', 'Unsafe, very crowded, few services', 'Life-threatening surroundings'] },
};
export const PHASES = ['Minimal', 'Stressed', 'Severe', 'Extreme', 'Catastrophic'];

export const PROVINCES = {
  vara:   { name: 'Vara Province' },
  morava: { name: 'Morava Province' },
};
export const MUNIS = {
  varenna: { name: 'Varenna', province: 'vara' }, brena: { name: 'Brena', province: 'vara' }, lissa: { name: 'Lissa', province: 'vara' },
  dolna: { name: 'Dolna', province: 'morava' }, kamen: { name: 'Kamen', province: 'morava' },
};
export const provinceOf = m => MUNIS[m]?.province;

export const LOCATIONS = {
  home: 'At home', open: 'In the open near home, under blankets and plastic', host: 'Staying with relatives or neighbours', rental: 'In a rented room',
  school: 'School No. 3, Varenna (collective centre)', stadium: 'Varenna stadium (spontaneous site)', gym: 'Lissa gymnasium (collective centre)',
  barn: 'In the barn, with the animals', away: 'With family outside the valley', planned: 'The relocation site on the edge of Varenna', yard: 'A shelter in the yard', orchard: 'The orchard by the Lissa bypass road', riverside: 'Rebuilding at Riverside',
};
export const SITE_LOCS = ['school', 'stadium', 'gym', 'planned'];
export const POCKETS = { stadium: 'Varenna stadium', school: 'School No. 3', gym: 'Lissa gymnasium', orchard: 'Bypass orchard (emerging)', riverside: 'Riverside' };
export const GROUPS = { site: 'Displaced, in collective sites', informal: 'Displaced, informal settlement', hosted: 'Displaced, hosted', rent: 'Displaced, renting', nondisp: 'Not displaced' };

const S = (dwelling, essentials, tenure, settlement) => ({ dwelling, essentials, tenure, settlement });

export const FAMILIES = {
  haddad: {
    name: 'The Haddad family', short: 'Haddads', muni: 'varenna', area: 'old',
    who: 'Karim and Leila Haddad and their four children, renting a second-floor flat in Varenna’s Old Town.',
    people: 'Karim (41) runs a phone-repair stall in the covered market. Leila (38) does the accounts for a bakery. Four children, 3 to 14. The flat is rented from Mr Dragan on a handshake — no papers. Leila’s cousins, the Novaks, live in Brena, an hour’s walk away.',
    init: { loc: 'home', muni: 'varenna', group: 'nondisp', dims: S(3.5, 2.5, 3, 3), res: { cash: 180, assets: 2, debt: 0, goodwill: 3, docs: 0 },
      ctx: { home: 'A crack runs across the ceiling. You can’t yet see the outside of the building.', work: 'Karim’s stall is in the covered market; Leila’s bakery is two streets away.', market: 'Unknown — it is night.', community: 'Neighbours you have known for twelve years.', services: 'Power is out. Water unknown.' } },
  },
  petrov: {
    name: 'Mrs Petrov', short: 'Mrs Petrov', muni: 'varenna', area: 'old', vulnerable: true,
    who: 'Vera Petrov, 74, widowed, in the small house she owns in Varenna’s Old Town. She walks with a frame.',
    people: 'Vera has lived in this house for fifty years. Her pension arrives at the post office on the 10th. Her daughter lives in the capital, six hours away. Toma, the neighbours’ 16-year-old, runs errands for her. She is a member of Able Varenna, the local organisation of persons with disabilities.',
    init: { loc: 'home', muni: 'varenna', group: 'nondisp', dims: S(3, 2.5, 1, 3), res: { cash: 90, assets: 1, debt: 0, goodwill: 3, docs: 1 },
      ctx: { home: 'The house is dark and full of dust. You don’t know yet what is broken.', work: 'Your pension: the post office pays it on the 10th.', market: 'Unknown — it is night.', community: 'Toma’s family next door. Old friends further down the street.', services: 'Power is out.' } },
  },
  okafor: {
    name: 'The Okafor family', short: 'Okafors', muni: 'varenna', area: 'riverside',
    who: 'Grace and Daniel Okafor and their three children, in a two-room home they built themselves at Riverside, Varenna’s informal settlement.',
    people: 'Daniel (35) works as a day labourer on building sites. Grace (31) sells vegetables from a cart in the market. Three children, 2 to 9. Riverside is on government land along the river: nobody has papers. Mama Joy, an older neighbour, is the settlement’s unofficial leader.',
    init: { loc: 'home', muni: 'varenna', group: 'nondisp', dims: S(4, 3, 4, 3.5), res: { cash: 40, assets: 1, debt: 0, goodwill: 3, docs: 0 },
      ctx: { home: 'Breeze-block walls Daniel laid himself, a tin roof, two rooms.', work: 'Daniel: day labour. Grace: a vegetable cart.', market: 'Unknown — it is night.', community: 'Riverside: 300 families who look out for each other.', services: 'Power is out. You never had piped water.' } },
  },
  mendes: {
    name: 'The Mendes family', short: 'Mendes family', muni: 'kamen', area: 'hills',
    who: 'Luis and Ana Mendes, their four children and Luis’s mother, farming in Kamen, high in Morava Province.',
    people: 'A stone house Luis’s grandfather built, twenty goats, a cow, potatoes and a walnut orchard. The animals are the family’s savings. Kamen is forty families, a church, a well and one mountain road down to the valley.',
    init: { loc: 'home', muni: 'kamen', group: 'nondisp', dims: S(3.5, 2.5, 1, 3.5), res: { cash: 60, assets: 4, debt: 0, goodwill: 3, docs: 1 },
      ctx: { home: 'The old stone house. Something has fallen; you can’t see what.', work: 'The animals and the land.', market: 'The nearest market is in Lissa, two hours down the road.', community: 'Forty families who have farmed here for generations.', services: 'Power is out. Water from the village well.' } },
  },
  amira: {
    name: 'Amira and her children', short: 'Amira', muni: 'lissa', area: 'lissa', vulnerable: true,
    who: 'Amira Saleh and her three children, in a third-floor flat in Lissa. Her son Yusuf, 11, uses a wheelchair.',
    people: 'Amira (36) is a teaching assistant at Lissa primary school. Her husband works abroad and sends money each month through the transfer office. Yusuf (11), Nour (8) and Sami (4). The building has no lift. Mr Haxhi and his son live on the second floor.',
    init: { loc: 'home', muni: 'lissa', group: 'nondisp', dims: S(3.5, 2.5, 2, 3), res: { cash: 120, assets: 0, debt: 0, goodwill: 3, docs: 1 },
      ctx: { home: 'Third floor, no lift. The building is swaying, then still.', work: 'Your job at the school. Money from your husband abroad.', market: 'Unknown — it is night.', community: 'Neighbours on the stairwell. Your sister on the other side of Lissa.', services: 'Power is out.' } },
  },
};
export const FAMILY_ORDER = ['haddad', 'okafor', 'amira', 'mendes', 'petrov'];

// ---------------------------------------------------------------------------
// Text blocks: a string, or { if: condition, text }.
// Conditions: family, loc, group, flag, notFlag, choice: { 'c.step': id | [ids] }, known, any: [conditions]
// Options: for (families), when (condition), label, detail, dims, res, set, flags, ctx, knownP, needCash, after (text)
// Response rules (applied when a chapter closes): when, prob, dims, res, set, flags, known, text, actor
// ---------------------------------------------------------------------------

export const CHAPTERS = [...EARLY, ...LATE];

export const TOTAL_CHAPTERS = 8;
export const WAIT_OPTION = { id: 'wait', label: 'Wait and see', detail: 'Do nothing for now.', after: 'You decided to wait and see.' };

// ---------------------------------------------------------------- helpers
export function check(cond, st, family) {
  if (!cond) return true;
  if (cond.family && !cond.family.includes(family)) return false;
  if (cond.loc && !cond.loc.includes(st.loc)) return false;
  if (cond.notLoc && cond.notLoc.includes(st.loc)) return false;
  if (cond.group && !cond.group.includes(st.group)) return false;
  if (cond.muni && !cond.muni.includes(st.muni)) return false;
  if (cond.flag && !st.flags?.[cond.flag]) return false;
  if (cond.notFlag && st.flags?.[cond.notFlag]) return false;
  if (cond.known !== undefined && !!st.known !== cond.known) return false;
  if (cond.res) for (const [k, v] of Object.entries(cond.res)) if ((st.res?.[k] || 0) < v) return false;
  if (cond.choice) for (const [k, v] of Object.entries(cond.choice)) if (![].concat(v).includes(st.choices?.[k])) return false;
  if (cond.any && !cond.any.some(c => check(c, st, family))) return false;
  return true;
}
export const texts = (blocks, st, family) => (blocks || []).filter(b => typeof b === 'string' || check(b.if, st, family)).map(b => typeof b === 'string' ? b : b.text);

export function applyOption(st, o) {
  const s = structuredClone(st);
  for (const [k, v] of Object.entries(o.dims || {})) s.dims[k] = Math.max(1, Math.min(5, s.dims[k] + v));
  for (const [k, v] of Object.entries(o.res || {})) s.res[k] = Math.max(0, Math.round(((s.res[k] || 0) + v) * 10) / 10);
  for (const [k, v] of Object.entries(o.set || {})) s[k] = v;
  s.flags = { ...(s.flags || {}), ...(o.flags || {}) };
  s.ctx = { ...(s.ctx || {}), ...(o.ctx || {}) };
  return s;
}

/** Steps for a household in a chapter, computed in order from its current state and picks. */
export function chapterSteps(ch, family, st, picks = {}) {
  let s = st;
  return ch.steps.map(step => {
    const options = step.options.filter(o => (!o.for || o.for.includes(family)) && check(o.when, s, family) && !(o.needCash && (s.res?.cash ?? 0) < o.needCash));
    const chosen = options.find(o => o.id === picks[step.id]);
    const before = s;
    if (chosen) { s = applyOption(s, chosen); s.choices = { ...(s.choices || {}), [`${ch.n}.${step.id}`]: chosen.id }; }
    return { ...step, options, chosen, before, after: s };
  });
}

export const phaseOf = v => Math.max(1, Math.min(5, Math.round(v)));
export function lciOf(dims) {
  const ph = Object.keys(DIMS).map(k => phaseOf(dims[k]));
  return { worst: Math.max(...ph), mean: Math.round((ph.reduce((a, b) => a + b, 0) / ph.length) * 10) / 10, count4: ph.filter(p => p >= 4).length };
}
export const chapterOf = n => CHAPTERS.find(c => c.n === n);
