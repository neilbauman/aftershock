// Story, onboarding text, map and plain-language effect hints.
import { DIMS, PHASES, LOCATIONS, PROFILES, INSTITUTIONS } from './scenario.js';

export const STORY = {
  video: null, // set to an mp4 URL when the intro video exists
  place: [
    'Varenna is a valley town of about 120,000 people, and the capital of a district of 200,000.',
    'The **Old Town** is dense stone buildings around the market, mostly rented, often on a handshake. **Riverside** is an informal settlement on government land along the river. The **New Quarter** is 1980s concrete apartment blocks. Up the valley, the **hill villages** farm and keep animals.',
    'The town has seen hard winters before. It has never seen anything like what is about to happen.',
  ],
  night: [
    'At **21:40** on a cold evening in late autumn, a **magnitude 6.8 earthquake** strikes 15 km from Varenna.',
    'In the Old Town, walls fall into the narrow streets. Riverside shacks fold. Landslides cut the road to the hill villages. In the New Quarter, the blocks stand, but stairwells crack.',
    'By morning, about **40,000 people** cannot go home. More than half crowd in with relatives. Others gather at the **stadium**, at **School No. 3** and at the **sports hall**. Many refuse to leave their damaged houses at all.',
    'The Municipality, a National Society branch, an international NGO, a UN agency and a coordination cell begin to respond. Winter is three months away.',
  ],
  fictional: 'Varenna is fictional. It draws on patterns common to many earthquake responses, so no real community or organisation is being judged.',
  how: [
    { t: 'Four days, about 20 rounds', d: 'Each round is a slice of the first year: from the first nights to the anniversary.' },
    { t: 'Your phone tells you when to play', d: 'When a round opens you get a notification. You usually have 30–45 minutes, and each round takes 2–3 minutes.' },
    { t: 'Two choices each round', d: 'One for your family, and one vote for your team. Your team acts on the majority vote.' },
    { t: 'Everything resolves together', d: 'When the round closes, your family’s choice, every organisation’s decision and what happened in Varenna are combined. Results arrive as a notification.' },
    { t: 'You will feel each other’s decisions', d: 'Your team never helps your own family directly. What your colleagues decide lands on you, and what you decide lands on them.' },
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
  old: [150, 170, 'Old Town'], newq: [300, 120, 'New Quarter'], riverside: [140, 260, 'Riverside'],
  stadium: [330, 230, 'Stadium'], school: [255, 175, 'School No. 3'], hall: [365, 160, 'Sports hall'], hills: [470, 70, 'Hill villages'],
};
export function locPoint(state, profile) {
  if (state.loc === 'village') return PLACES.hills;
  if (['stadium', 'school', 'hall', 'riverside'].includes(state.loc)) return PLACES[state.loc];
  if (state.loc === 'host') return PLACES.newq;
  if (state.loc === 'rental') return PLACES.old;
  return PLACES[PROFILES[profile].area] || PLACES.old;
}
export function mapSvg(state, profile) {
  const you = state ? locPoint(state, profile) : null;
  const pin = (x, y, label, kind) => kind === 'site'
    ? `<g><rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="3" fill="#fff" stroke="#1d2327" stroke-width="2"/><text x="${x}" y="${y + 22}" text-anchor="middle" font-size="11" fill="#1d2327">${label}</text></g>`
    : `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="700" fill="#1d2327">${label}</text>`;
  return `<svg viewBox="0 0 560 320" role="img" aria-label="Map of Varenna" style="width:100%;height:auto;display:block;border-radius:12px;background:#ece9e1">
    <path d="M380 0 Q430 40 470 30 T560 40 L560 0 Z" fill="#d9d3c4"/><path d="M400 0 Q450 60 520 70 T560 120 L560 0" fill="#cfc8b6" opacity=".7"/>
    <path d="M0 230 C90 215 140 300 230 285 S380 300 560 260" stroke="#9cc0d8" stroke-width="22" fill="none"/>
    <path d="M520 110 L470 70 L420 95" stroke="#8a6d3b" stroke-width="3" stroke-dasharray="6 5" fill="none"/>
    <circle cx="150" cy="165" r="55" fill="#e4c9b6" opacity=".8"/><circle cx="300" cy="125" r="60" fill="#d6dbe0" opacity=".9"/>
    <ellipse cx="140" cy="262" rx="60" ry="18" fill="#d8b9a6" opacity=".9"/>
    ${pin(...PLACES.old)}${pin(...PLACES.newq)}${pin(...PLACES.hills)}
    <text x="140" y="300" text-anchor="middle" font-size="12" font-weight="700" fill="#1d2327">Riverside</text>
    ${pin(PLACES.stadium[0], PLACES.stadium[1], 'Stadium', 'site')}${pin(PLACES.school[0], PLACES.school[1], 'School No. 3', 'site')}${pin(PLACES.hall[0], PLACES.hall[1], 'Sports hall', 'site')}
    <text x="40" y="214" font-size="11" fill="#5a7f99" font-style="italic">River Vara</text>
    <circle cx="470" cy="300" r="5" fill="#b4232a"/><text x="480" y="304" font-size="11" fill="#1d2327">Epicentre 15 km →</text>
    ${you ? `<g><circle cx="${you[0]}" cy="${you[1] - 28}" r="13" fill="#b4232a"/><text x="${you[0]}" y="${you[1] - 24}" text-anchor="middle" font-size="12" fill="#fff" font-weight="700">You</text><path d="M${you[0] - 6} ${you[1] - 18} L${you[0]} ${you[1] - 8} L${you[0] + 6} ${you[1] - 18}Z" fill="#b4232a"/></g>` : ''}
  </svg>`;
}

export const md = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
