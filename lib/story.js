// Story, onboarding text, map and plain-language effect hints.
import { DIMS, PHASES, LOCATIONS, PROFILES, INSTITUTIONS, MUNIS } from './scenario.js';

export const STORY = {
  video: null, // set to an mp4 URL when the intro video exists
  place: [
    'Two provinces share the Vara valley. In **Vara Province**, the lowlands, **Varenna** (120,000) is the main town: a dense Old Town of stone houses, mostly rented on a handshake; **Riverside**, an informal settlement on government land; and the 1980s blocks of the **New Quarter**. Next door, **Brena** is a quieter municipality of family homes. Downstream, **Lissa** (25,000) is a small market town with one overstretched mayor.',
    'Up the valley, **Morava Province** is farming country: the villages of **Dolna** and, higher up, **Kamen**, reached by a single mountain road.',
    'The valley has seen hard winters before. It has never seen anything like what is about to happen.',
  ],
  night: [
    'At **21:40** on a cold evening in late autumn, a **magnitude 6.8 earthquake** strikes 15 km from Varenna.',
    'In the Old Town, walls fall into the narrow streets. Riverside shacks fold. Landslides cut the road to the hill villages. In the New Quarter, the blocks stand, but stairwells crack.',
    'By morning, about **40,000 people** cannot go home. More than half crowd in with relatives. Others gather at Varenna’s **stadium** and **School No. 3**, and at the **Lissa gymnasium**. Families from Morava drift down the valley — some to an **orchard by the Lissa bypass road** that nobody is watching.',
    'The municipalities, the **Varennan Red Cross**, **Able Varenna** (an organisation of persons with disabilities) and a coordination cell begin to respond. **IFRC, IOM, NRC and UNHCR** are on their way, with a handful of staff in country. The local organisations are already there. Winter is three months away.',
  ],
  fictional: 'Varenna is fictional. It draws on patterns common to many earthquake responses, so no real community or organisation is being judged.',
  how: [
    { t: 'Six acts across the first year', d: 'From the first nights to the anniversary, two acts a day.' },
    { t: 'Each act: first your family, then your organisation', d: 'In the family block you make two or three decisions in a row for your family. Then the role turns: in the response block you vote with your organisation on how to respond to what families just did.' },
    { t: 'Your phone tells you when to play', d: 'Each block opens with a notification. You have 30–45 minutes, and a block takes 3–5 minutes. The screen colour tells you which role you are in.' },
    { t: 'Everything resolves together', d: 'When a block closes, every family’s choices, every organisation’s decisions and what happened in the valley are combined. Results arrive as a notification.' },
    { t: 'You will feel each other’s decisions', d: 'Your organisation never serves your own family directly. What colleagues decide lands on your family, and what you decide lands on theirs. Families nobody is playing are run by the computer.' },
    { t: 'There are no right answers', d: 'Every choice is a trade-off. The final-day debrief looks at what happened to every family and why.' },
    { t: 'Missing a round is OK', d: 'Your family waits and your team decides without you. That has consequences too, as it does in real life.' },
  ],
};

export const DIM_PLAIN = {
  dwelling: 'Is your shelter safe, dry and big enough?',
  essentials: 'Can you sleep, cook, keep warm and see at night?',
  tenure: 'How secure is your right to stay where you are?',
  settlement: 'What are your surroundings like: services, crowding, hazards?',
};

const DIM_WORD = { dwelling: 'Shelter', essentials: 'Essentials', tenure: 'Tenure', settlement: 'Surroundings' };

// Plain-language chips describing an option's immediate, certain effects.
export function effectChips(o) {
  const chips = [];
  for (const [k, v] of Object.entries(o.dims || {})) if (v) chips.push({ good: v < 0, text: `${DIM_WORD[k]} ${v < 0 ? 'better' : 'worse'}` });
  const r = o.res || {};
  if (r.cash) chips.push({ good: r.cash > 0, text: `${r.cash > 0 ? '+' : '−'}${Math.abs(r.cash)} cash` });
  if (r.debt) chips.push({ good: false, text: `+${r.debt} debt` });
  if (r.assets) chips.push({ good: r.assets > 0, text: `${r.assets > 0 ? '+' : '−'}${Math.abs(r.assets)} ${o.for?.includes('H5') ? 'livestock' : 'assets'}` });
  if (r.goodwill) chips.push({ good: r.goodwill > 0, text: `Relationship ${r.goodwill > 0 ? 'better' : 'strained'}` });
  if (o.set?.loc) chips.push({ neutral: true, text: `Moves you: ${LOCATIONS[o.set.loc].replace(/ \(.*\)/, '')}` });
  if (o.set?.known || o.knownP) chips.push({ good: true, text: o.knownP ? 'May get you on aid lists' : 'Gets you on aid lists' });
  if (o.id === 'stay_quiet') chips.push({ good: false, text: 'Stays off aid lists' });
  if (o.id === 'wait') chips.push({ neutral: true, text: 'No change now' });
  return chips;
}

const TARGET_TEXT = {
  formal: 'families at the official sites (Varenna stadium, School No. 3, Lissa gymnasium)', varenna_sites: 'families at Varenna’s stadium and School No. 3', varenna_neigh: 'families in Varenna’s neighbourhoods, including hosts', varenna_all: 'everyone in Varenna', lissa: 'families in and around Lissa', lissa_homes: 'families in Lissa’s neighbourhoods', morava: 'families in the Morava hills', orchard: 'families at the orchard near Lissa', gym: 'families in the Lissa gymnasium', owners: 'homeowners with documents', oldtown: 'Old Town households', unsafe: 'families in unchecked buildings', planned: 'families at the planned site',
  all: 'everyone in the district', site: 'families at the stadium, School No. 3 and the sports hall', school: 'families sheltering at School No. 3',
  stadium: 'families at the stadium', hall: 'families in the sports hall', hosted: 'displaced families staying with hosts', host: 'host families',
  hostpair: 'host families and the families they host', renthosted: 'displaced families who are hosted or renting', rent: 'displaced families renting rooms',
  nondisp: 'families still at home', urban: 'the Old Town, New Quarter and Riverside', rural: 'the hill villages', old: 'Old Town households not on sites',
  vulnerable: 'older people and people with disabilities', worst: 'the worst-off families on your lists',
};
const WORLD_TEXT = {
  sitesOfficial: 'Makes the sites official', hillsOpen: 'Reopens the hill road', neighBoost: 'Pushes agencies into neighbourhoods',
  coord: 'Better coordination, less duplication', commonForm: 'Comparable data', hillsOpenChance: 'May get the hill road reopened',
  sitesOnly: v => v ? 'Limits every agency to the sites' : 'Lets agencies work in neighbourhoods', goodwill: v => v > 0 ? 'Builds trust between authority and agencies' : 'Strains relations with agencies',
  visibility: 'Political visibility', hostFocus: 'Puts host families on everyone’s agenda', ruralFlag: 'Flags the hill villages as a gap',
  engineering: 'Families learn whether homes are safe', authLists: 'Agencies must share lists', mapPublished: 'Reporters see who does what',
  chase: 'Presses non-reporters', cashBlocked: v => v ? 'Stops all cash programmes' : 'Allows cash programmes', pull: 'May draw more people to sites',
  rentPressure: 'May push rents up', hlp: 'Protects renters and hosted families', schoolsStay: 'Schools stay as shelters', schoolClose: 'Families must leave the schools',
  landIdentified: 'Land for a planned site', snapshot: 'Everyone sees severity by area', nondispFocus: 'Brings non-displaced families into view',
  rule: 'Sets how agencies prioritise', stadiumFormal: 'Secures the stadium site', stadiumClear: 'Families at the stadium face eviction',
  permits: 'Unlocks repairs in the Old Town', siteStrategy: 'Joint planning on sites', report: v => v ? 'You appear on the coverage map' : 'You won’t see the coverage map',
  efficiency: 'More delivery capacity next round', holdBonus: 'Better targeting later', assessBoost: 'Better assessments', assessBoostRural: 'Better rural assessment',
};

export function institutionHints(o) {
  const out = [];
  if (o.needs) out.push(`Needs: ${({ assess: 'assessment teams', site: 'site managers', cash: 'cash officers', eng: 'shelter engineers', hlp: 'HLP / legal staff', prot: 'protection officers', im: 'IM / DTM officers' })[o.needs]}`);
  if (o.needsSeen) out.push('Only works if you know where the orchard is');
  if (o.incoming) out.push('Staff arrive next act if permits are fast; later if not');
  if (o.partner) out.push('Uses a local partner’s people');
  if (o.poach) out.push('Takes staff from the Red Cross');
  if (o.reveal) out.push('Reveals informal sites to you, and to everyone who reports, if you report');
  if (o.staff) out.push('More people on the ground now');
  if (o.partnerBoost) out.push('Strengthens your local partner');
  if (o.target) out.push(`Reaches: ${TARGET_TEXT[o.target] || o.target}`);
  if (o.knownP) out.push('Puts families on your lists');
  if (o.needsKnown) out.push('Only reaches families already on someone’s list');
  if (o.cash) out.push('Cash: cut back if the Municipality insists on in-kind aid');
  for (const [k, v] of Object.entries(o.dims || {})) if (v) out.push(`${DIM_WORD[k]} ${v < 0 ? 'better' : 'worse'} for them`);
  for (const [k, v] of Object.entries(o.world || {})) { const t = WORLD_TEXT[k]; if (t) out.push(typeof t === 'function' ? t(v) : t); }
  return [...new Set(out)];
}

// Preview the certain effects of a household choice on the dimension phases.
export function previewPhases(state, o) {
  const changes = [];
  for (const k of Object.keys(DIMS)) {
    const before = Math.max(1, Math.min(5, Math.round(state.dims[k])));
    const after = Math.max(1, Math.min(5, Math.round(state.dims[k] + (o.dims?.[k] || 0))));
    if (before !== after) changes.push({ k, before, after });
  }
  return changes;
}

// ---------------------------------------------------------------- map
// Municipal boundaries (admin 2) inside two provinces (admin 1).
export const BOUNDARIES = {
  kamen:   '300,0 560,0 560,110 380,120 300,70',
  dolna:   '0,0 300,0 300,70 380,120 330,150 180,130 0,110',
  brena:   '0,110 180,130 170,340 0,340',
  varenna: '180,130 330,150 340,340 170,340',
  lissa:   '330,150 380,120 560,110 560,340 340,340',
};
const LABEL = { kamen: [455, 40], dolna: [150, 45], brena: [80, 220], varenna: [255, 185], lissa: [470, 170] };
const PLACES = {
  old: [215, 250, 'Old Town'], newq: [290, 215, 'New Quarter'], riverside: [250, 318, 'Riverside'],
  stadium: [300, 280], school: [230, 222], gym: [470, 240], orchard: [400, 300], planned: [520, 300],
  village_dolna: [180, 80], village_kamen: [470, 75], brena: [85, 260],
};
const PHASE_FILL = ['#2e9e4f', '#9acd4c', '#f2c81f', '#f07c1e', '#d0312d'];
export function locPoint(state, profile) {
  if (state.loc === 'village') return state.muni === 'kamen' ? PLACES.village_kamen : PLACES.village_dolna;
  if (['stadium', 'school', 'riverside', 'gym', 'orchard', 'planned'].includes(state.loc)) return PLACES[state.loc];
  if (state.muni === 'brena') return PLACES.brena;
  if (state.muni === 'lissa') return [455, 285];
  if (state.loc === 'rental') return PLACES.old;
  return PLACES[PROFILES[profile].area] || PLACES.old;
}
/** opts.phases: { muni: phase } to shade areas; opts.orchard: show the orchard */
export function mapSvg(state, profile, opts = {}) {
  const you = state ? locPoint(state, profile) : null;
  const sq = (k, label) => { const [x, y] = PLACES[k]; return `<g><rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="3" fill="#fff" stroke="#1d2327" stroke-width="2"/><text x="${x}" y="${y + 19}" text-anchor="middle" font-size="10" fill="#1d2327">${label}</text></g>`; };
  const showOrchard = opts.orchard || (state && state.loc === 'orchard');
  const areas = Object.entries(BOUNDARIES).map(([k, pts]) => {
    const ph = opts.phases?.[k];
    const fill = ph ? PHASE_FILL[ph - 1] : (MUNIS[k].province === 'morava' ? '#e3dccb' : '#efece4');
    return `<polygon points="${pts}" fill="${fill}" fill-opacity="${ph ? 0.75 : 1}" stroke="#7d746a" stroke-width="1.5"/>`;
  }).join('');
  const labels = Object.entries(LABEL).map(([k, [x, y]]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="700" fill="${opts.phases?.[k] >= 4 ? '#fff' : '#1d2327'}">${MUNIS[k].name}${opts.phases?.[k] ? ` · ${opts.phases[k]}` : ''}</text>`).join('');
  return `<svg viewBox="0 0 560 340" role="img" aria-label="Map of Vara and Morava provinces" style="width:100%;height:auto;display:block;border-radius:12px;background:#efece4;margin:8px 0">
    ${areas}
    <polyline points="0,110 180,130 330,150 380,120 560,110" fill="none" stroke="#3b342c" stroke-width="3" stroke-dasharray="8 5"/>
    <text x="8" y="104" font-size="10" fill="#3b342c" font-weight="700">MORAVA PROVINCE</text><text x="8" y="128" font-size="10" fill="#3b342c" font-weight="700">VARA PROVINCE</text>
    <path d="M420 40 C380 120 300 160 270 230 S300 330 380 320 S520 300 560 320" stroke="#9cc0d8" stroke-width="10" fill="none" opacity=".9"/>
    <path d="M300 160 C330 120 380 100 470 75" stroke="#8a6d3b" stroke-width="2.5" stroke-dasharray="5 4" fill="none"/>
    ${labels}
    <text x="215" y="262" text-anchor="middle" font-size="9" fill="#1d2327">Old Town</text><text x="250" y="334" text-anchor="middle" font-size="9" fill="#1d2327">Riverside</text>
    ${sq('stadium', 'Stadium')}${sq('school', 'School No. 3')}${sq('gym', 'Gymnasium')}
    ${showOrchard ? `<g>${[0, 1, 2, 3, 4].map(i => `<circle cx="${390 + i * 6}" cy="${298 - (i % 2) * 5}" r="4" fill="#5f8a3c"/>`).join('')}<text x="402" y="318" text-anchor="middle" font-size="10" fill="#1d2327">Orchard</text></g>` : ''}
    <circle cx="525" cy="80" r="5" fill="#b4232a"/><text x="525" y="97" text-anchor="middle" font-size="10" fill="#1d2327">Epicentre</text>
    ${you ? `<g><circle cx="${you[0]}" cy="${you[1] - 24}" r="12" fill="#b4232a" stroke="#fff" stroke-width="2"/><text x="${you[0]}" y="${you[1] - 20}" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">You</text><path d="M${you[0] - 5} ${you[1] - 14} L${you[0]} ${you[1] - 5} L${you[0] + 5} ${you[1] - 14}Z" fill="#b4232a"/></g>` : ''}
  </svg>`;
}

export const md = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
