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

// What kind of place the family is living in decides its baseline shelter, tenure and surroundings.
export const STYPES = {
  home:       { label: 'your own home',               base: null },
  makeshift:  { label: 'a makeshift shelter by your home', base: { dwelling: 3.5, tenure: null, settlement: 3.5 } },
  open:       { label: 'out in the open',             base: { dwelling: 4.5, tenure: 3, settlement: 3.5 } },
  hosted:     { label: 'a host family’s home',       base: { dwelling: 2.5, tenure: 3, settlement: 2 } },
  rented:     { label: 'a rented room',               base: { dwelling: 2.5, tenure: 3, settlement: 2 } },
  collective: { label: 'a collective centre',         base: { dwelling: 3, tenure: 3, settlement: 3 } },
  camp:       { label: 'a displacement site',         base: { dwelling: 4, tenure: 3.5, settlement: 3.5 } },
  informal:   { label: 'an informal settlement',      base: { dwelling: 4.5, tenure: 4.5, settlement: 4 } },
  selfbuilt:  { label: 'a home you rebuilt yourselves', base: { dwelling: 3.5, tenure: 4, settlement: 3.5 } },
  away:       { label: 'family outside the valley',   base: { dwelling: 2, tenure: 2.5, settlement: 1.5 } },
};
const LOC_STYPE = { home: 'home', yard: 'makeshift', barn: 'makeshift', open: 'open', host: 'hosted', rental: 'rented', school: 'collective', gym: 'collective', stadium: 'camp', planned: 'camp', orchard: 'informal', riverside: 'selfbuilt', away: 'away' };
export const stypeOf = st => LOC_STYPE[st.loc] || 'home';
export const POCKETS = { stadium: 'Varenna stadium', school: 'School No. 3', gym: 'Lissa gymnasium', orchard: 'Bypass orchard (emerging)', riverside: 'Riverside' };
export const GROUPS = { site: 'Displaced, in collective sites', informal: 'Displaced, informal settlement', hosted: 'Displaced, hosted', rent: 'Displaced, renting', nondisp: 'Not displaced' };

const S = (dwelling, essentials, tenure, settlement) => ({ dwelling, essentials, tenure, settlement });

export const FAMILIES = {
  haddad: {
    name: 'The Haddad family', short: 'Haddads', muni: 'varenna', area: 'old',
    who: 'Karim and Leila Haddad and their four children, renting a second-floor flat in Varenna’s Old Town.',
    people: 'Karim (41) runs a phone-repair stall in the covered market. Leila (38) does the accounts for a bakery. Four children, 3 to 14. The flat is rented from Mr Dragan on a handshake — no papers. Leila’s cousins, the Novaks, live in Brena, an hour’s walk away.',
    quake: S(2, 1.5, 1, 1.5), init: { loc: 'home', muni: 'varenna', group: 'nondisp', dims: S(1.5, 1, 2, 1.5), res: { cash: 180, assets: 2, debt: 0, goodwill: 3, docs: 0 },
      ctx: { home: 'An old stone building, second floor.', work: 'Karim’s stall is in the covered market; Leila’s bakery is two streets away.', market: 'Unknown — it is night.', community: 'Neighbours you have known for twelve years.', services: 'Power is out. Water unknown.' } },
  },
  petrov: {
    name: 'Mrs Petrov', short: 'Mrs Petrov', muni: 'varenna', area: 'old', vulnerable: true,
    who: 'Vera Petrov, 74, widowed, in the small house she owns in Varenna’s Old Town. She walks with a frame.',
    people: 'Vera has lived in this house for fifty years. Her pension arrives at the post office on the 10th. Her daughter lives in the capital, six hours away. Toma, the neighbours’ 16-year-old, runs errands for her. She is a member of Able Varenna, the local organisation of persons with disabilities.',
    quake: S(1.5, 1.5, 0, 1.5), init: { loc: 'home', muni: 'varenna', group: 'nondisp', dims: S(1.5, 1, 1, 1.5), res: { cash: 90, assets: 1, debt: 0, goodwill: 3, docs: 1 },
      ctx: { home: 'The house is dark and full of dust. You don’t know yet what is broken.', work: 'Your pension: the post office pays it on the 10th.', market: 'Unknown — it is night.', community: 'Toma’s family next door. Old friends further down the street.', services: 'Power is out.' } },
  },
  okafor: {
    name: 'The Okafor family', short: 'Okafors', muni: 'varenna', area: 'riverside',
    who: 'Grace and Daniel Okafor and their three children, in a two-room home they built themselves at Riverside, Varenna’s informal settlement.',
    people: 'Daniel (35) works as a day labourer on building sites. Grace (31) sells vegetables from a cart in the market. Three children, 2 to 9. Riverside is on government land along the river: nobody has papers. Mama Joy, an older neighbour, is the settlement’s unofficial leader.',
    quake: S(2, 1, 1, 1.5), init: { loc: 'home', muni: 'varenna', group: 'nondisp', dims: S(2, 2, 3, 2), res: { cash: 40, assets: 1, debt: 0, goodwill: 3, docs: 0 },
      ctx: { home: 'Breeze-block walls Daniel laid himself, a tin roof, two rooms.', work: 'Daniel: day labour. Grace: a vegetable cart.', market: 'Unknown — it is night.', community: 'Riverside: 300 families who look out for each other.', services: 'Power is out. You never had piped water.' } },
  },
  mendes: {
    name: 'The Mendes family', short: 'Mendes family', muni: 'kamen', area: 'hills',
    who: 'Luis and Ana Mendes, their four children and Luis’s mother, farming in Kamen, high in Morava Province.',
    people: 'A stone house Luis’s grandfather built, twenty goats, a cow, potatoes and a walnut orchard. The animals are the family’s savings. Kamen is forty families, a church, a well and one mountain road down to the valley.',
    quake: S(2, 1.5, 0, 2), init: { loc: 'home', muni: 'kamen', group: 'nondisp', dims: S(1.5, 1, 1, 1.5), res: { cash: 60, assets: 4, debt: 0, goodwill: 3, docs: 1 },
      ctx: { home: 'The old stone house. Something has fallen; you can’t see what.', work: 'The animals and the land.', market: 'The nearest market is in Lissa, two hours down the road.', community: 'Forty families who have farmed here for generations.', services: 'Power is out. Water from the village well.' } },
  },
  amira: {
    name: 'Amira and her children', short: 'Amira', muni: 'lissa', area: 'lissa', vulnerable: true,
    who: 'Amira Saleh and her three children, in a third-floor flat in Lissa. Her son Yusuf, 11, uses a wheelchair.',
    people: 'Amira (36) is a teaching assistant at Lissa primary school. Her husband works abroad and sends money each month through the transfer office. Yusuf (11), Nour (8) and Sami (4). The building has no lift. Mr Haxhi and his son live on the second floor.',
    quake: S(2, 1.5, 0.5, 1), init: { loc: 'home', muni: 'lissa', group: 'nondisp', dims: S(1.5, 1, 1.5, 2), res: { cash: 120, assets: 0, debt: 0, goodwill: 3, docs: 1 },
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
  if (cond.stype && !cond.stype.includes(stypeOf(st))) return false;
  if (cond.notStype && cond.notStype.includes(stypeOf(st))) return false;
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
  const fromType = stypeOf(s);
  for (const [k, v] of Object.entries(o.set || {})) s[k] = v;
  const moved = o.set?.loc && o.set.loc !== st.loc;
  const toType = stypeOf(s);
  if (moved) {
    // leaving home: remember the state of the house; returning: find it as you left it
    if (['home', 'makeshift'].includes(fromType) && (st.muni === s.muni || o.set.muni === undefined)) s.homeDims = { dwelling: st.dims.dwelling, tenure: st.dims.tenure, settlement: st.dims.settlement };
    const base = STYPES[toType].base;
    if (toType === 'home' && s.homeDims) Object.assign(s.dims, s.homeDims);
    else if (base) for (const k of ['dwelling', 'tenure', 'settlement']) if (base[k] != null) s.dims[k] = base[k];
  }
  for (const [k, v] of Object.entries(o.dims || {})) {
    if (moved && toType !== 'home' && ['dwelling', 'tenure', 'settlement'].includes(k)) continue; // the new place sets these
    s.dims[k] = Math.max(1, Math.min(5, s.dims[k] + v));
  }
  for (const [k, v] of Object.entries(o.res || {})) s.res[k] = Math.max(0, Math.round(((s.res[k] || 0) + v) * 10) / 10);
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

// ---- "Your life now": a short narrative composed from the household's current state ----
const WORK = {
  haddad: { far: 'The covered market is a long way from here; Karim spends hours and bus fares getting to the stall.', near: 'Karim can still walk to what is left of the covered market.', lost: 'Karim’s stock and tools are gone. Without them there is no repair stall — only odd jobs.', ok: 'Karim has his tools and some stock; the repair stall earns a little every day.' },
  petrov: { far: '', near: '', lost: '', ok: 'Your pension still arrives on the 10th — small, but it arrives.' },
  okafor: { far: 'Building sites in town are far from here; Daniel loses half a day’s pay on transport.', near: 'Daniel finds day labour on the repair sites; there is plenty of rubble to clear.', lost: 'Grace’s cart is gone. The family lives on whatever Daniel earns that day.', ok: 'Grace has her cart back on the market street, and Daniel finds day labour clearing rubble.' },
  mendes: { far: 'You are far from the animals and the land. Someone else is feeding them — or nobody is.', near: 'You are close enough to tend the animals and the fields every day.', lost: 'Most of the animals are gone — sold, dead or lost. The family’s savings went with them.', ok: 'The herd is mostly intact. As long as there are animals, there is a future here.' },
  amira: { far: 'The school is a long way from here, and getting Yusuf anywhere takes half the morning.', near: '', lost: '', ok: 'Your husband’s transfers keep arriving every month; they are what keeps you afloat.' },
};
const STYPE_LINE = {
  home: 'You are living in your own home again, cracks and all.',
  makeshift: 'You are living in a shelter you put up yourselves next to the house — close to everything you own, and cold.',
  open: 'You are still sleeping out in the open, under whatever cover you can find.',
  hosted: 'You are living in someone else’s home, as guests.',
  rented: 'You are renting a room, on your own money, with no promises beyond the end of the month.',
  collective: 'You are living in a collective centre: a mattress in a shared hall, one toilet block, a queue for everything — but a roof, and a place on the lists.',
  camp: 'You are living in a tent on a managed site: water points, latrines, a registration desk, and canvas between you and the weather.',
  informal: 'You are living on land nobody gave you permission to use. No services come here unless someone fights for them, and anyone could move you on.',
  selfbuilt: 'You are living in a home you built yourselves, on land you do not own.',
  away: 'You are far from the valley, safe and warm, and out of reach of everything happening at home.',
};
const NEAR = { home: 1, makeshift: 1, selfbuilt: 1, hosted: 0.5, rented: 0.5, informal: 0.5 };

export function lifeNow(st, family) {
  const f = st.flags || {}, r = st.res || {}, ty = stypeOf(st), w = WORK[family] || {};
  const out = [STYPE_LINE[ty]];
  if (ty === 'hosted') out.push((r.goodwill ?? 3) >= 3 ? 'Your hosts are still generous — for now, it feels like family.' : (r.goodwill ?? 3) >= 1.5 ? 'Your hosts are tired. Small things — the bathroom queue, the electricity bill — have started to matter.' : 'Your hosts want you gone. Nobody says it, but everybody knows it.');
  if (ty === 'collective' && f.committee) out.push('You sit on the centre’s committee; people bring you their problems.');
  if (st.homeDims && !['home', 'selfbuilt'].includes(ty) && !f.sold_house) {
    const d = phaseOf(st.homeDims.dwelling), late = (st.story || []).length >= 4;
    const what = family === 'haddad' ? 'Mr Dragan’s building, where you rented,' : family === 'okafor' ? 'Your Riverside house' : 'Your house';
    out.push(d >= 4 ? `${what} is still badly damaged${late ? ', months on' : ''}${family === 'haddad' ? '; nobody knows if he will repair it, or for whom.' : '.'}` : d === 3 ? `${what} is damaged but standing. It needs proper repairs before anyone should sleep there.` : `${what} could be lived in again with some work.`);
  }
  // livelihood
  const assetsLost = (r.assets ?? 1) <= 0.5 || f.sold_cow || f.sold_stock;
  if (family === 'amira' && f.teaching) out.push('You are working at the school again; the salary makes everything else possible.');
  else if (family === 'petrov') out.push(w.ok);
  else if (assetsLost && w.lost) out.push(w.lost);
  else if (ty === 'away' || NEAR[ty] === undefined) { if (w.far) out.push(w.far); }
  else if (NEAR[ty] === 1 && w.near) out.push(w.near);
  else if (w.ok) out.push(w.ok);
  // money
  const cash = r.cash ?? 0, debt = r.debt ?? 0;
  out.push(debt > 60 ? `You owe ${Math.round(debt)}, and the interest grows every month. Every decision now starts with the debt.` : cash < 20 ? 'The money has almost run out. Every purchase is a decision between two needs.' : cash < 80 ? 'There is a little money left, enough for one emergency.' : 'You still have some savings — enough to choose, rather than just accept.');
  // networks
  if (st.known) out.push('You are on at least one agency list, so you will hear when help is being handed out.');
  else out.push('You are not on any agency list yet — help that is handed out by list will pass you by.');
  if (f.community_strong) out.push('You are part of something here: neighbours who share, and who would notice if you were in trouble.');
  return out.filter(Boolean);
}
