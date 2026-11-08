// Story, onboarding text, map and plain-language effect hints.
import { DIMS, PHASES, LOCATIONS, PROFILES, INSTITUTIONS } from './scenario.js';

export const STORY = {
  video: null, // set to an mp4 URL when the intro video exists
  place: [
    'The Vara valley has three very different places. **Varenna** (120,000) is the main town: a dense Old Town of stone houses, mostly rented on a handshake; **Riverside**, an informal settlement on government land; and the 1980s blocks of the **New Quarter**.',
    'Downstream, **Lissa** (25,000) is a small market town with one overstretched mayor. Up the valley, the **Morava hills** are farming villages reached by a single mountain road.',
    'The valley has seen hard winters before. It has never seen anything like what is about to happen.',
  ],
  night: [
    'At **21:40** on a cold evening in late autumn, a **magnitude 6.8 earthquake** strikes 15 km from Varenna.',
    'In the Old Town, walls fall into the narrow streets. Riverside shacks fold. Landslides cut the road to the hill villages. In the New Quarter, the blocks stand, but stairwells crack.',
    'By morning, about **40,000 people** cannot go home. More than half crowd in with relatives. Others gather at Varenna’s **stadium** and **School No. 3**, and at the **Lissa gymnasium**. Families from the hills drift down the valley — some to an **orchard by the Lissa bypass road** that nobody is watching.',
    'Two municipalities, the **Varennan Red Cross**, **Able Varenna** (an organisation of persons with disabilities), an international NGO, a UN agency and a coordination cell begin to respond. The local organisations are already there. The international ones are not — yet. Winter is three months away.',
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
  if (o.needs) out.push(`Needs: ${({ assess: 'assessment teams', site: 'site managers', cash: 'cash officers', eng: 'shelter engineers', hlp: 'HLP advisers', im: 'IM officers' })[o.needs]}`);
  if (o.needsSeen) out.push('Only works if you know where the orchard is');
  if (o.incoming) out.push('Staff arrive next act if permits are fast; later if not');
  if (o.partner) out.push('Uses a local partner’s people');
  if (o.poach) out.push('Takes staff from the Red Cross');
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
const PLACES = {
  old: [120, 150, 'Old Town'], newq: [235, 105, 'New Quarter'], riverside: [110, 228, 'Riverside'],
  stadium: [250, 205, 'Stadium'], school: [185, 160, 'School No. 3'], hills: [480, 60, 'Morava hills'],
  lissa: [455, 245, 'Lissa'], gym: [480, 210, 'Gymnasium'], orchard: [395, 285, 'Orchard'], planned: [520, 290, 'Planned site'],
};
export function locPoint(state, profile) {
  if (state.loc === 'village') return PLACES.hills;
  if (['stadium', 'school', 'riverside', 'gym', 'orchard', 'planned'].includes(state.loc)) return PLACES[state.loc];
  if (state.muni === 'lissa') return PLACES.lissa;
  if (state.loc === 'host') return PLACES.newq;
  if (state.loc === 'rental') return PLACES.old;
  return PLACES[PROFILES[profile].area] || PLACES.old;
}
export function mapSvg(state, profile, opts = {}) {
  const you = state ? locPoint(state, profile) : null;
  const site = (k, show = true) => { const [x, y, l] = PLACES[k]; return show ? `<g><rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="3" fill="#fff" stroke="#1d2327" stroke-width="2"/><text x="${x}" y="${y + 20}" text-anchor="middle" font-size="10" fill="#1d2327">${l}</text></g>` : ''; };
  const town = k => { const [x, y, l] = PLACES[k]; return `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="700" fill="#1d2327">${l}</text>`; };
  const showOrchard = opts.orchard || (state && state.loc === 'orchard');
  return `<svg viewBox="0 0 560 320" role="img" aria-label="Map of the Vara valley" style="width:100%;height:auto;display:block;border-radius:12px;background:#ece9e1;margin:8px 0">
    <path d="M370 0 Q430 50 470 30 T560 40 L560 0 Z" fill="#d9d3c4"/><path d="M400 0 Q450 70 520 80 T560 130 L560 0" fill="#cfc8b6" opacity=".7"/>
    <path d="M0 210 C80 200 140 270 230 255 S360 250 430 265 S520 300 560 300" stroke="#9cc0d8" stroke-width="18" fill="none"/>
    <path d="M300 130 C360 120 420 110 470 80" stroke="#8a6d3b" stroke-width="3" stroke-dasharray="6 5" fill="none"/>
    <path d="M300 180 C360 230 400 250 455 240" stroke="#b9b2a2" stroke-width="5" fill="none"/>
    <circle cx="140" cy="150" r="58" fill="#e4c9b6" opacity=".8"/><circle cx="235" cy="115" r="48" fill="#d6dbe0" opacity=".9"/>
    <ellipse cx="110" cy="232" rx="50" ry="14" fill="#d8b9a6" opacity=".9"/><circle cx="460" cy="235" r="34" fill="#dcd2c0" opacity=".9"/>
    ${showOrchard ? `<g>${[0, 1, 2, 3, 4].map(i => `<circle cx="${385 + i * 6}" cy="${280 - (i % 2) * 5}" r="4" fill="#7a9a5a"/>`).join('')}<text x="395" y="304" text-anchor="middle" font-size="10" fill="#1d2327">Orchard</text></g>` : ''}
    ${town('old')}${town('newq')}${town('hills')}${town('lissa')}
    <text x="110" y="262" text-anchor="middle" font-size="11" font-weight="700" fill="#1d2327">Riverside</text>
    ${site('stadium')}${site('school')}${site('gym')}
    <text x="20" y="196" font-size="10" fill="#5a7f99" font-style="italic">River Vara</text>
    <text x="96" y="20" font-size="13" font-weight="700" fill="#1d2327">VARENNA</text>
    ${you ? `<g><circle cx="${you[0]}" cy="${you[1] - 26}" r="13" fill="#b4232a"/><text x="${you[0]}" y="${you[1] - 22}" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">You</text><path d="M${you[0] - 6} ${you[1] - 16} L${you[0]} ${you[1] - 6} L${you[0] + 6} ${you[1] - 16}Z" fill="#b4232a"/></g>` : ''}
  </svg>`;
}

export const md = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
