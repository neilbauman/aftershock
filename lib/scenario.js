// Aftershock — Varenna earthquake scenario (v0: rounds 1–6)
// Shared by the browser (play/facilitator) and the server (engine).

export const SCENARIO_VERSION = 'varenna-v0';

export const DIMS = {
  dwelling:   { label: 'Dwelling adequacy',     short: 'Dwelling',   scale: 'household',
                text: ['Safe, dry, enough space', 'Some damage or crowding', 'Unsafe or badly crowded', 'Barely protected from the weather', 'No meaningful shelter'] },
  essentials: { label: 'Household essentials',  short: 'Essentials', scale: 'household',
                text: ['Sleeping, cooking, light all covered', 'Getting by, a few gaps', 'Missing key items', 'Cannot cook or keep warm', 'Nothing left'] },
  tenure:     { label: 'Security of tenure',    short: 'Tenure',     scale: 'household',
                text: ['Secure, recognised right to stay', 'Some uncertainty', 'Informal, could be asked to leave', 'Eviction threatened', 'Being evicted / no right to stay'] },
  settlement: { label: 'Settlement environment', short: 'Settlement', scale: 'site/area',
                text: ['Services close, safe surroundings', 'Some services far or strained', 'Crowded, services overloaded', 'Unsafe, very crowded, few services', 'Life-threatening surroundings'] },
};

export const PHASES = ['Minimal', 'Stressed', 'Severe', 'Extreme', 'Catastrophic'];

export const INSTITUTIONS = {
  ns:    { name: 'National Society (Varenna branch)', short: 'National Society', agency: true,
           blurb: 'Volunteers already on the ground and trusted locally. Small budget, limited cash capacity, under pressure to support the official sites.' },
  ingo:  { name: 'ShelterWorks International (INGO)', short: 'INGO', agency: true,
           blurb: 'Strong on cash and rental support. Your donor grant is earmarked for “shelter kits” and must show delivery by Month 3.' },
  un:    { name: 'UN agency', short: 'UN agency', agency: true,
           blurb: 'The largest budget and a pipeline of tents and NFIs. Procurement is slow and you prefer delivering through sites.' },
  auth:  { name: 'Varenna Municipality', short: 'Municipality', agency: false,
           blurb: 'You control land, schools, permits and engineering assessments. Your own staff lost homes too. The council wants schools reopened and visible results.' },
  coord: { name: 'SLSC Coordination cell', short: 'Coordination', agency: false,
           blurb: 'No budget. You collect 3Ws, publish coverage maps, convene partners and advocate. Your influence depends on whether agencies report.' },
};
export const INSTITUTION_ORDER = ['ns', 'ingo', 'un', 'auth', 'coord'];

const S = (dwelling, essentials, tenure, settlement) => ({ dwelling, essentials, tenure, settlement });

export const PROFILES = {
  H1: { name: 'The Haddad family', who: 'Six people renting a flat in the Old Town on a verbal lease.',
        story: 'Your building cracked down the middle. You are squeezed into your cousins’ flat in the New Quarter (the H6 household). You have no papers for the flat you rented.',
        area: 'old', init: { loc: 'host', group: 'hosted', dims: S(3, 3, 4, 2), res: { cash: 150, assets: 1, debt: 0, goodwill: 3, docs: 0 } } },
  H2: { name: 'Mrs Petrov', who: 'A widow in her seventies who owns her Old Town house and lives alone.',
        story: 'Your house is damaged but standing. Neighbours say looters are about. You have no intention of leaving the home you have lived in for fifty years.',
        area: 'old', vulnerable: true, init: { loc: 'home', group: 'nondisp', dims: S(4, 3, 2, 3), res: { cash: 80, assets: 1, debt: 0, goodwill: 2, docs: 1 } } },
  H3: { name: 'The Okafor family', who: 'Five people from the Riverside informal settlement; both parents are day labourers.',
        story: 'Your shack on government land collapsed. You carried what you could to the stadium. Nobody has ever recognised your right to the Riverside plot.',
        area: 'riverside', init: { loc: 'stadium', group: 'site', dims: S(4, 3, 5, 4), res: { cash: 30, assets: 0, debt: 0, goodwill: 2, docs: 0 } } },
  H4: { name: 'The Lindqvist family', who: 'Four people who own a flat in a New Quarter apartment block.',
        story: 'Your block has cracks in the stairwell. Until an engineer checks it you are sleeping in a classroom at School No. 3 with forty others.',
        area: 'newq', init: { loc: 'school', group: 'site', dims: S(3, 3, 2, 3), res: { cash: 300, assets: 2, debt: 0, goodwill: 2, docs: 1 } } },
  H5: { name: 'The Mendes family', who: 'Seven people farming in the hill villages, with goats and a cow.',
        story: 'Your stone house partly collapsed. You are under a tarpaulin beside it. The road is cut. The animals are your savings and winter is coming.',
        area: 'hills', init: { loc: 'village', group: 'nondisp', dims: S(4, 4, 2, 4), res: { cash: 60, assets: 3, debt: 0, goodwill: 3, docs: 1 } } },
  H6: { name: 'The Novak family', who: 'Four people in a New Quarter flat that came through with minor damage.',
        story: 'You took in your cousins, the Haddads (H1): six more people in a two-bedroom flat. Water, money and patience are already stretched.',
        area: 'newq', host: true, init: { loc: 'home', group: 'host', dims: S(2, 3, 1, 2), res: { cash: 250, assets: 2, debt: 0, goodwill: 4, docs: 1 } } },
  H7: { name: 'Amira and her children', who: 'A mother with three children; her son uses a wheelchair.',
        story: 'You are in the sports hall. The latrines are not accessible and you cannot leave your son to queue for distributions.',
        area: 'newq', vulnerable: true, init: { loc: 'hall', group: 'site', dims: S(3, 4, 3, 4), res: { cash: 40, assets: 0, debt: 0, goodwill: 2, docs: 1 } } },
  H8: { name: 'The Rossi family', who: 'Five people who fled a hill village to town.',
        story: 'You came down to the stadium the night of the quake. Your house in the village might be repairable. Your relatives in town have offered a floor to sleep on.',
        area: 'hills', init: { loc: 'stadium', group: 'site', dims: S(4, 3, 3, 4), res: { cash: 70, assets: 2, debt: 0, goodwill: 2, docs: 1 } } },
};
export const PROFILE_ORDER = Object.keys(PROFILES);

export const LOCATIONS = {
  home: 'In or beside your own home', host: 'Staying with a host family', rental: 'In a rented room',
  school: 'School No. 3 (collective centre)', stadium: 'The stadium (spontaneous site)', hall: 'The sports hall (collective centre)',
  village: 'Under a tarpaulin in the village', riverside: 'A rebuilt shack at Riverside',
};
export const SITE_LOCS = ['school', 'stadium', 'hall'];
export const POCKETS = { stadium: 'Stadium site', school: 'School No. 3', hall: 'Sports hall', riverside: 'Riverside', old: 'Old Town damaged blocks' };
export const GROUPS = { site: 'IDPs on sites', hosted: 'Hosted IDPs', rent: 'IDPs renting', host: 'Host families', nondisp: 'Non-displaced' };

// ---------------------------------------------------------------------------
// Effect vocabulary
//   dims: deltas (negative = better)      res: resource deltas
//   set: state fields to set (loc, group, known, registered…)
//   knownP: probability the household becomes known to responders
// Institution options add:
//   target: site | hosted | host | nondisp | rent | urban | rural | old | all | vulnerable | worst
//   needsKnown: only reaches households responders know about
//   cash: true if it is a cash modality (blocked by in-kind-only policy)
//   world: world state changes          category: used to detect duplication
// ---------------------------------------------------------------------------

const WAIT = { id: 'wait', label: 'Wait and see', detail: 'Hold on and see what happens.', feed: 'Your family waited to see what would happen.' };

const SPEND = [
  { id: 'spend', label: 'Spend savings on materials', detail: 'Buy timber, sheeting and fixings to improve where you are.', res: { cash: -100 }, dims: { dwelling: -1 }, needCash: 100,
    feed: 'You spent savings on materials and improved your shelter.' },
  { id: 'save', label: 'Save what you have for winter', detail: 'Keep your cash; winter is coming.', feed: 'You held on to your savings.' },
  { id: 'borrow', label: 'Borrow from a moneylender', detail: '150 now, to be repaid with interest.', res: { cash: 150, debt: 180 }, dims: { essentials: -0.5 },
    feed: 'You borrowed 150. The moneylender expects 180 back.' },
];

export const ROUNDS = [
  // ------------------------------------------------------------------ R1
  {
    n: 1, time: '72 hours', title: 'The first nights',
    intro: 'It is three days since the earthquake. Aftershocks keep coming. The road to the hill villages is blocked by landslides.',
    event: { id: 'aftershocks', text: 'Aftershocks continue. The hill villages remain cut off.' },
    household: {
      prompt: 'Where will your family shelter for now?',
      options: [
        { id: 'stay_host', for: ['H1'], label: 'Stay with your cousins', detail: 'Crowded, but you are with family.', res: { goodwill: -0.5 }, feed: 'You stayed with the Novaks. Twelve people, two bedrooms.' },
        { id: 'to_school', for: ['H1'], label: 'Move to School No. 3', detail: 'Relieve your cousins; join the collective centre.', set: { loc: 'school', group: 'site' }, dims: { settlement: 1, tenure: -1 }, res: { goodwill: 1 }, feed: 'You moved into a classroom at School No. 3.' },
        { id: 'find_room', for: ['H1'], label: 'Look for a room to rent', detail: 'Uses most of your savings; rents are already rising.', set: { loc: 'rental', group: 'rent' }, res: { cash: -120 }, dims: { tenure: -1, dwelling: -0.5 }, feed: 'You found a damp room for 120 a month, cash, no contract.' },
        { id: 'stay_home', for: ['H2'], label: 'Stay in your damaged house', detail: 'Guard your home and belongings.', dims: { settlement: 0.5 }, feed: 'You stayed home. A crack opened above the kitchen door.' },
        { id: 'to_hall', for: ['H2'], label: 'Go to the sports hall', detail: 'Safer, but you leave the house unguarded.', set: { loc: 'hall', group: 'site' }, dims: { dwelling: -1, settlement: 1 }, res: { assets: -1 }, feed: 'You moved to the sports hall. Someone took your radio and blankets from the house.' },
        { id: 'stay_stadium', for: ['H3', 'H8'], label: 'Stay at the stadium', detail: 'There are people, water trucks and some help.', feed: 'You stayed at the stadium under a sheet of plastic.' },
        { id: 'back_riverside', for: ['H3'], label: 'Rebuild a shack at Riverside', detail: 'Use salvaged materials on your old plot.', set: { loc: 'riverside', group: 'nondisp' }, res: { cash: -10 }, dims: { settlement: -0.5 }, feed: 'You put up a shack from salvaged sheeting back at Riverside.' },
        { id: 'stay_school', for: ['H4'], label: 'Stay at the school', detail: 'Wait for the engineer.', feed: 'You stayed in the classroom with forty others.' },
        { id: 'back_flat', for: ['H4'], label: 'Move back into your flat', detail: 'Nobody has checked the building yet.', set: { loc: 'home', group: 'nondisp', unsafe: true }, dims: { settlement: -1, essentials: -1, dwelling: 0 }, feed: 'You moved back into your flat. The stairwell creaks during every aftershock.' },
        { id: 'stay_tarp', for: ['H5'], label: 'Stay by the house with the animals', detail: 'Protect your livestock and land.', feed: 'You stayed under the tarpaulin beside the ruins of the house.' },
        { id: 'walk_town', for: ['H5'], label: 'Walk to town with the children', detail: 'Leave your eldest son with the animals.', set: { loc: 'stadium', group: 'site' }, res: { assets: -1 }, dims: { settlement: 0, essentials: -0.5 }, feed: 'You walked eight hours to the stadium. Your son stayed with the animals; a goat was lost on the way.' },
        { id: 'welcome', for: ['H6'], label: 'Welcome them, no conditions', detail: 'Family is family.', res: { goodwill: 1, cash: -30 }, dims: { essentials: 0.5 }, feed: 'You told the Haddads to stay as long as they need.' },
        { id: 'limits', for: ['H6'], label: 'Agree a one-month limit', detail: 'Be clear with them from the start.', res: { goodwill: -0.5 }, feed: 'You agreed the Haddads would stay for one month.' },
        { id: 'stay_hall', for: ['H7'], label: 'Stay in the sports hall', detail: 'At least there is a roof.', feed: 'You stayed in the sports hall.' },
        { id: 'to_sister', for: ['H7'], label: 'Move in with your sister', detail: 'Across town; she has one spare room.', set: { loc: 'host', group: 'hosted' }, dims: { settlement: -1, essentials: 0.5 }, res: { goodwill: 3 }, feed: 'You moved in with your sister across town.' },
        { id: 'to_relatives', for: ['H8'], label: 'Go to relatives in the New Quarter', detail: 'A floor to sleep on, away from the crowds.', set: { loc: 'host', group: 'hosted' }, dims: { settlement: -1 }, res: { goodwill: 2 }, feed: 'You moved onto your relatives’ floor in the New Quarter.' },
      ],
    },
    institution: {
      agency: {
        prompt: 'Rapid assessment: where does your team look first?',
        options: [
          { id: 'assess_sites', label: 'Register people at the sites', detail: 'Stadium, schools and sports hall. Fast and visible.', target: 'site', knownP: 0.9, feed: 'registered families at the sites' },
          { id: 'assess_neigh', label: 'Door-to-door in damaged neighbourhoods', detail: 'Old Town and New Quarter, including host families. Slower.', target: 'urban', knownP: 0.6, feed: 'went door-to-door in the Old Town and New Quarter' },
          { id: 'assess_rural', label: 'Send a team to the hill villages', detail: 'The road is cut; the team may not get through.', target: 'rural', knownP: 0.4, accessDependent: true, feed: 'tried to reach the hill villages' },
          { id: 'remote_ki', label: 'Key-informant phone calls across the district', detail: 'Fast, wide, low confidence.', target: 'all', knownP: 0.25, feed: 'phoned key informants across the district' },
        ],
      },
      auth: {
        prompt: 'What is the Municipality’s first priority?',
        options: [
          { id: 'declare_centres', label: 'Declare official evacuation centres', detail: 'Stadium, schools and sports hall become official sites.', world: { sitesOfficial: true }, siteBoost: true, feed: 'The Municipality declared the stadium, schools and sports hall official evacuation centres.' },
          { id: 'clear_road', label: 'Send machinery to reopen the hill road', detail: 'Your engineers are needed everywhere.', world: { hillsOpen: true }, feed: 'Municipal machinery is clearing the hill road.' },
          { id: 'ask_neigh', label: 'Ask agencies to cover neighbourhoods too', detail: 'Not just the sites.', world: { neighBoost: 0.2 }, feed: 'The Mayor asked agencies to assess damaged neighbourhoods, not only the sites.' },
        ],
      },
      coord: {
        prompt: 'What does the coordination cell do first?',
        options: [
          { id: 'meeting', label: 'Call an assessment coordination meeting', detail: 'Agree who covers which area.', world: { coord: 1, assessBoost: 0.1 }, feed: 'The coordination cell convened partners to split assessment coverage.' },
          { id: 'common_form', label: 'Publish a common assessment form', detail: 'Comparable data, later.', world: { coord: 1, commonForm: true }, feed: 'A common assessment form was circulated to all partners.' },
          { id: 'advocate_access', label: 'Advocate for hill-village access', detail: 'Press the Municipality on the road.', world: { hillsOpenChance: 0.5 }, feed: 'The coordination cell pressed the Municipality on hill access.' },
        ],
      },
    },
  },
  // ------------------------------------------------------------------ R2
  {
    n: 2, time: 'Day 5', title: 'Lists and queues',
    intro: 'Word spreads that aid is arriving at the stadium. The site’s population doubles overnight.',
    event: { id: 'stadium_doubles', text: 'The stadium population has doubled. Latrines and water points are overwhelmed.' },
    household: {
      prompt: 'How does your family deal with the aid system this week?',
      options: [
        { id: 'register', when: { loc: ['school', 'stadium', 'hall'] }, label: 'Register with the site committee and agencies', detail: 'Give names, ID, needs.', set: { known: true, registered: true }, feed: 'You registered with the site committee. Your name is on a list now.' },
        { id: 'stay_quiet', when: { loc: ['school', 'stadium', 'hall'] }, label: 'Keep your head down', detail: 'You are not sure who will see your details.', feed: 'You did not register. Nobody knows you are here.' },
        { id: 'go_dist', when: { group: ['hosted', 'rent', 'nondisp'] }, label: 'Go to the stadium distribution point', detail: 'Queue all day; lose a day’s wages.', res: { cash: -15 }, knownP: 0.5, dims: { essentials: -0.5 }, feed: 'You queued all day at the stadium and came back with a jerrycan and a blanket.' },
        { id: 'ask_help', when: { group: ['host'] }, label: 'Ask volunteers whether hosts get support', detail: 'You are feeding ten people.', set: { known: true }, feed: 'A volunteer took your details. “Hosts are not on the list yet,” she said.' },
      ],
    },
    institution: {
      agency: {
        prompt: 'First relief items: where do your NFIs go?',
        options: [
          { id: 'nfi_sites', label: 'Blanket distribution at all sites', detail: 'Fast, visible, no lists needed.', target: 'site', dims: { essentials: -1 }, category: 'nfi', world: { pull: 1 }, feed: 'distributed blankets, jerrycans and kitchen sets at the sites' },
          { id: 'nfi_known', label: 'Targeted NFIs to households you have assessed', detail: 'Wherever they are. Only reaches people on your lists.', target: 'all', needsKnown: true, dims: { essentials: -1 }, category: 'nfi', feed: 'delivered NFIs to assessed households across town' },
          { id: 'hold', label: 'Hold stock until assessment is complete', detail: 'Better targeting later.', world: { holdBonus: true }, feed: 'held stock pending fuller assessment' },
        ],
      },
      auth: {
        prompt: 'The Mayor wants order in the distributions.',
        options: [
          { id: 'sites_only', label: 'All distributions at official sites only', detail: 'Easier to control and to show.', world: { sitesOnly: true, goodwill: 0.5 }, feed: 'The Municipality ordered all distributions to take place at official sites.' },
          { id: 'allow_neigh', label: 'Allow neighbourhood distributions with ward officials', detail: 'Reach people where they are.', world: { sitesOnly: false, goodwill: 0.5 }, feed: 'Ward officials will support neighbourhood distributions.' },
          { id: 'media', label: 'A televised visit to the stadium', detail: 'The council needs to be seen.', world: { visibility: 1 }, feed: 'The Mayor visited the stadium with television crews.' },
        ],
      },
      coord: {
        prompt: 'Information is chaotic. What does the cell push?',
        options: [
          { id: 'template', label: 'Circulate the 3W template with a deadline', detail: 'Who does what, where.', world: { coord: 1 }, feed: 'The 3W template went out with a Week 1 deadline.' },
          { id: 'host_advocacy', label: 'Push agencies to include host families', detail: 'Over half of displaced people are hosted.', world: { hostFocus: true }, feed: 'The coordination cell circulated a note: over half of the displaced are with host families.' },
          { id: 'gap_flag', label: 'Flag the hill villages as a gap', detail: 'Nobody has assessed them.', world: { ruralFlag: true, assessBoostRural: 0.2 }, feed: 'The hill villages were flagged as an unassessed gap.' },
        ],
      },
    },
  },
  // ------------------------------------------------------------------ R3
  {
    n: 3, time: 'Week 1', title: 'Who is doing what?',
    intro: 'Agencies are multiplying. The hill road reopens. Some people go back to work; others spend their days in queues.',
    event: { id: 'road_opens', text: 'The hill road reopens. Traders reach the villages again.' },
    household: {
      prompt: 'How does your family spend this week?',
      options: [
        { id: 'queue', label: 'Queue for the next distribution', detail: 'Lose wages; maybe get items.', res: { cash: -15 }, knownP: 0.4, dims: { essentials: -0.5 }, feed: 'You queued again. Some days there was something, some days not.' },
        { id: 'work', label: 'Go back to work or day labour', detail: 'Earn some cash; miss the distributions.', res: { cash: 60 }, feed: 'You earned 60 clearing rubble for a contractor.' },
        { id: 'sell_goats', for: ['H5'], label: 'Sell two goats to buy food', detail: 'Prices are bad, but the children need to eat.', res: { cash: 80, assets: -1 }, dims: { essentials: -1 }, feed: 'You sold two goats for 80. Before the quake they would have fetched 150.' },
      ],
    },
    institution: {
      agency: {
        prompt: 'The coordination cell asks for your 3W. Do you report?',
        options: [
          { id: 'report_full', label: 'Report fully', detail: 'Locations, numbers, items, plans.', world: { report: 1 }, feed: 'submitted a full 3W' },
          { id: 'report_partial', label: 'Report headline numbers only', detail: 'No locations; your donor is sensitive.', world: { report: 0.5 }, feed: 'submitted partial 3W figures' },
          { id: 'no_report', label: 'Don’t report: no staff time', detail: 'Put everyone on delivery instead.', world: { report: 0, efficiency: 0.15 }, feed: 'did not submit a 3W' },
        ],
      },
      auth: {
        prompt: 'Where does the Municipality put its engineers and machinery?',
        options: [
          { id: 'inspect', label: 'Start engineering triage of damaged buildings', detail: 'Families need to know if they can go home.', world: { engineering: 1 }, feed: 'Municipal engineers started tagging damaged buildings.' },
          { id: 'rubble', label: 'Clear rubble from the main roads', detail: 'Visible progress; reopens markets.', target: 'urban', dims: { settlement: -0.5 }, feed: 'Rubble was cleared from the main roads.' },
          { id: 'demand_lists', label: 'Demand beneficiary lists from all agencies', detail: 'The council wants to know who gets what.', world: { authLists: true, goodwill: -0.5 }, feed: 'The Municipality demanded beneficiary lists from all agencies.' },
        ],
      },
      coord: {
        prompt: 'What does the cell do with the first 3W returns?',
        options: [
          { id: 'publish_map', label: 'Publish the first coverage map', detail: 'Only reporting agencies appear on it.', world: { mapPublished: true, coord: 0.5 }, feed: 'The first coverage map was published.' },
          { id: 'chase', label: 'Chase the non-reporting agencies', detail: 'Calls, emails, a word with their country directors.', world: { chase: true }, feed: 'The coordination cell chased agencies that had not reported.' },
          { id: 'host_wg', label: 'Convene a host-family working group', detail: 'Bring the hosting question into focus.', world: { hostFocus: true, coord: 0.5 }, feed: 'A host-family working group met for the first time.' },
        ],
      },
    },
  },
  // ------------------------------------------------------------------ R4
  {
    n: 4, time: 'Week 2', title: 'Strain',
    intro: 'Two weeks in. Host families are feeling the strain. Agencies must choose how to support people beyond the first relief.',
    event: { id: 'host_strain', text: 'Host families are running short of money, water and patience.' },
    household: {
      prompt: 'What does your family do this week?',
      options: [
        { id: 'contribute', for: ['H1'], when: { group: ['hosted'] }, label: 'Contribute cash to your hosts', detail: 'For food and utilities.', res: { cash: -60, goodwill: 1 }, feed: 'You gave the Novaks 60 towards food and bills.' },
        { id: 'chores', for: ['H1'], when: { group: ['hosted'] }, label: 'Take on chores and childcare', detail: 'Pay your way in time, not money.', res: { goodwill: 0.5 }, feed: 'You took over the cooking and the school runs.' },
        { id: 'look_rent', for: ['H1'], label: 'Start looking for a room', detail: 'Rents are rising fast.', set: { loc: 'rental', group: 'rent' }, res: { cash: -130 }, needCash: 130, dims: { tenure: -0.5 }, feed: 'You found a room for 130 a month, no contract.' },
        { id: 'share', for: ['H6'], label: 'Keep sharing everything', detail: 'They are family.', res: { cash: -40, goodwill: 0.5 }, dims: { essentials: 0.5 }, feed: 'You kept sharing everything. The money is running low.' },
        { id: 'ask_contrib', for: ['H6'], label: 'Ask the Haddads to contribute to costs', detail: 'An awkward conversation.', res: { cash: 40, goodwill: -0.5 }, feed: 'You asked the Haddads to chip in. The atmosphere cooled.' },
        { id: 'deadline', for: ['H6'], label: 'Give them a deadline: leave by Month 2', detail: 'You can’t go on like this.', res: { goodwill: -1.5 }, world: { hostDeadline: true }, feed: 'You told the Haddads they must leave by Month 2.' },
        ...SPEND.map(o => ({ ...o, for: ['H2', 'H3', 'H4', 'H5', 'H7', 'H8'] })),
      ],
    },
    institution: {
      agency: {
        prompt: 'Next phase: which modality do you fund?',
        options: [
          { id: 'host_cash', label: 'Cash for host families and their guests', detail: 'Supports the hosting arrangement.', target: 'hostpair', needsKnown: true, cash: true, res: { cash: 100, goodwill: 1 }, dims: { essentials: -1 }, category: 'cash', feed: 'paid cash grants to host families and their guests' },
          { id: 'kits_sites', label: 'Shelter kits and tents for sites', detail: 'Your donor likes kits.', target: 'site', dims: { dwelling: -1 }, category: 'shelter', feed: 'distributed shelter kits and tents at the sites' },
          { id: 'rental', label: 'Rental support for displaced renters', detail: 'Three months’ rent, with a written agreement.', target: 'renthosted', needsKnown: true, cash: true, dims: { tenure: -1, dwelling: -0.5 }, set: { loc: 'rental', group: 'rent' }, world: { rentPressure: 1 }, category: 'cash', feed: 'started rental support with written agreements' },
        ],
      },
      auth: {
        prompt: 'Agencies want to scale up cash. The council is nervous.',
        options: [
          { id: 'approve_cash', label: 'Approve cash programmes', detail: 'Markets are working.', world: { cashBlocked: false, goodwill: 0.5 }, feed: 'The Municipality approved cash programmes.' },
          { id: 'inkind_only', label: 'In-kind assistance only', detail: 'Cash could fuel prices and fraud.', world: { cashBlocked: true }, feed: 'The Municipality insisted on in-kind assistance only.' },
          { id: 'joint_plan', label: 'Hold a joint planning session with agencies', detail: 'Costs a day; builds trust.', world: { goodwill: 1, coord: 1 }, feed: 'The Municipality and agencies held a joint planning day.' },
        ],
      },
      coord: {
        prompt: 'Agencies are paying different amounts for the same thing.',
        options: [
          { id: 'cash_value', label: 'Agree a common cash value and modality mix', detail: 'Harmonise.', world: { coord: 1 }, feed: 'Partners agreed a common transfer value.' },
          { id: 'host_package', label: 'Propose a standard host-family package', detail: 'Make hosting visible and fundable.', world: { hostFocus: true }, feed: 'A standard host-family support package was proposed.' },
          { id: 'renter_alert', label: 'Raise renter evictions with the HLP working group', detail: 'Verbal leases are being torn up.', world: { hlp: true }, feed: 'Renter evictions were raised with the HLP working group.' },
        ],
      },
    },
  },
  // ------------------------------------------------------------------ R5
  {
    n: 5, time: 'Week 3', title: 'Looking ahead to winter',
    intro: 'Night temperatures are dropping. Winter is two months away. The first coverage map is out — for those who reported.',
    event: { id: 'coverage_map', text: 'The first coverage map was shared with agencies that reported.' },
    household: {
      prompt: 'How does your family prepare for the cold?',
      options: [
        { id: 'sell_livestock', for: ['H5'], label: 'Sell livestock to buy materials before winter', detail: 'Rebuild one dry room.', res: { cash: 200, assets: -2 }, dims: { dwelling: -1 }, feed: 'You sold the cow and goats. One room is dry. Next year’s income is gone.' },
        { id: 'keep_livestock', for: ['H5'], label: 'Keep the animals; hope for help', detail: 'They are your future.', feed: 'You kept the animals and waited for help.' },
        { id: 'improve_site', when: { loc: ['school', 'stadium', 'hall'] }, label: 'Improve your corner of the site', detail: 'Tarpaulins, partitions, a heater.', res: { cash: -40 }, needCash: 40, dims: { dwelling: -0.5, settlement: -0.5 }, feed: 'You built a partition and bought a small heater.' },
        { id: 'leave_site', when: { loc: ['school', 'stadium', 'hall'] }, label: 'Leave the site for relatives', detail: 'Escape the crowds; burden someone else.', set: { loc: 'host', group: 'hosted' }, dims: { settlement: -1 }, res: { goodwill: 2 }, feed: 'You left the site and moved in with relatives.' },
        { id: 'patch', when: { loc: ['home', 'riverside', 'village'] }, label: 'Patch the roof and walls yourself', detail: 'Is it safe? Nobody knows.', res: { cash: -80 }, needCash: 80, dims: { dwelling: -1 }, set: { unsafe: true }, feed: 'You patched the roof and walls. It is drier, if not safer.' },
        { id: 'engineer', when: { loc: ['home'] }, label: 'Pay a private engineer to check the house', detail: 'Peace of mind, 60.', res: { cash: -60 }, needCash: 60, set: { unsafe: false, checked: true }, feed: 'An engineer checked the house: repairable, with proper work.' },
        { id: 'help_hosts', when: { group: ['hosted', 'rent', 'host'] }, label: 'Buy fuel and blankets for the household', detail: 'Get ahead of the cold.', res: { cash: -50 }, needCash: 50, dims: { essentials: -0.5 }, feed: 'You bought fuel and blankets.' },
      ],
    },
    institution: {
      agency: {
        prompt: 'Winterisation procurement: what do you order now?',
        options: [
          { id: 'wint_sites', label: 'Stoves and insulation kits for sites', detail: 'Predictable, visible.', target: 'site', dims: { dwelling: -0.5, essentials: -0.5 }, category: 'winter', feed: 'ordered stoves and insulation kits for the sites' },
          { id: 'wint_known', label: 'Winterisation cash to assessed households everywhere', detail: 'Flexible, depends on your lists.', target: 'all', needsKnown: true, cash: true, dims: { dwelling: -0.5, essentials: -0.5 }, category: 'winter', feed: 'paid winterisation cash to assessed households' },
          { id: 'wint_vuln', label: 'Insulation for older and disabled people, by referral', detail: 'Narrow, deep.', target: 'vulnerable', needsKnown: true, dims: { dwelling: -1, essentials: -1 }, category: 'winter', feed: 'insulated homes and shelters of older and disabled people' },
        ],
      },
      auth: {
        prompt: 'The school board wants the classrooms back.',
        options: [
          { id: 'winter_centres', label: 'Keep the schools as heated winter centres', detail: 'Children lose a term.', world: { schoolsStay: true, goodwill: 0.5 }, target: 'school', dims: { essentials: -0.5 }, feed: 'The Municipality will keep the schools as heated winter centres.' },
          { id: 'reopen_plan', label: 'Announce schools reopen at Month 2', detail: 'Collective-centre families must move.', world: { schoolClose: true }, target: 'school', dims: { tenure: 1 }, feed: 'The Municipality announced schools will reopen at Month 2.' },
          { id: 'land', label: 'Identify land for a planned relocation site', detail: 'Slow, contested, but a way out.', world: { landIdentified: true }, feed: 'The Municipality identified land for a planned site.' },
        ],
      },
      coord: {
        prompt: 'Partners ask: how bad is it, and where?',
        options: [
          { id: 'snapshot', label: 'Publish a severity snapshot by area and site', detail: 'Based on what partners have reported.', world: { snapshot: true }, feed: 'A severity snapshot by area and site was published.' },
          { id: 'gap_analysis', label: 'Circulate a gap analysis: hosts and non-displaced', detail: 'Who is invisible?', world: { hostFocus: true, nondispFocus: true }, feed: 'A gap analysis on hosts and the non-displaced was circulated.' },
          { id: 'rule_worst', label: 'Propose prioritising by worst LCI dimension', detail: 'A household in Phase 4 on anything comes first.', world: { rule: 'worst' }, feed: 'The cell proposed prioritising households by their worst LCI dimension.' },
        ],
      },
    },
  },
  // ------------------------------------------------------------------ R6
  {
    n: 6, time: 'Week 4', title: 'Prices climb',
    intro: 'A month in. Building materials cost a quarter more than last week. Agencies plan their next allocation.',
    event: { id: 'prices', text: 'Material prices have risen 25%.' },
    household: {
      prompt: 'Money is the question now. What do you do?',
      options: [
        ...SPEND,
        { id: 'job', label: 'Look for paid work', detail: 'Less time for queues and repairs.', res: { cash: 80 }, dims: { essentials: 0.3 }, feed: 'You found a few days’ paid work.' },
      ],
    },
    institution: {
      agency: {
        prompt: 'Where does your next allocation go?',
        options: [
          { id: 'area_old', label: 'Area-based programme in the Old Town', detail: 'Repairs, hosts and renters together, street by street.', target: 'old', dims: { dwelling: -0.5, tenure: -0.5, essentials: -0.5 }, category: 'area', feed: 'launched an area-based programme in the Old Town' },
          { id: 'sites_upgrade', label: 'Upgrade site WASH, lighting and management', detail: 'The sites are deteriorating.', target: 'site', dims: { settlement: -1 }, category: 'site', feed: 'upgraded water, lighting and management at the sites' },
          { id: 'topups', label: 'Cash top-ups to the worst-off assessed households', detail: 'Uses your lists and your prioritisation rule.', target: 'worst', needsKnown: true, cash: true, dims: { essentials: -0.5, dwelling: -0.5 }, category: 'cash', feed: 'paid top-ups to the worst-off households on its lists' },
        ],
      },
      auth: {
        prompt: 'What is the Municipality’s decision on the stadium?',
        options: [
          { id: 'formalise', label: 'Formalise the stadium as a managed site', detail: 'Services, management, some security of stay.', world: { stadiumFormal: true }, target: 'stadium', dims: { tenure: -1, settlement: -0.5 }, feed: 'The stadium was formalised as a managed site.' },
          { id: 'clear_stadium', label: 'Order the stadium cleared by Month 3', detail: 'The football season matters to the council.', world: { stadiumClear: true }, target: 'stadium', dims: { tenure: 1.5 }, feed: 'The Municipality ordered the stadium cleared by Month 3.' },
          { id: 'permits', label: 'Fast-track repair permits in the Old Town', detail: 'Unlocks repairs.', world: { permits: true }, target: 'old', dims: { dwelling: -0.3 }, feed: 'Repair permits in the Old Town were fast-tracked.' },
        ],
      },
      coord: {
        prompt: 'One month in. What does the cell put on the table?',
        options: [
          { id: 'review', label: 'Review progress with partners using the snapshot', detail: 'What has moved, what hasn’t.', world: { coord: 1 }, feed: 'Partners reviewed progress against the severity snapshot.' },
          { id: 'hlp_eviction', label: 'Escalate evictions to the HLP working group', detail: 'Renters and hosted families are being pushed out.', world: { hlp: true }, feed: 'Evictions were escalated to the HLP working group.' },
          { id: 'site_strategy', label: 'Propose a site strategy with the Municipality', detail: 'Formalise, upgrade or relocate — together.', world: { goodwill: 1, siteStrategy: true }, feed: 'A joint site strategy was proposed to the Municipality.' },
        ],
      },
    },
  },
];

export const WAIT_OPTION = WAIT;

// Options a given household can see this round (always ends with "Wait and see")
export function householdOptions(round, profile, state) {
  if (!round?.household) return [WAIT];
  const opts = round.household.options.filter(o => {
    if (o.for && !o.for.includes(profile)) return false;
    if (o.when?.loc && !o.when.loc.includes(state.loc)) return false;
    if (o.when?.group && !o.when.group.includes(state.group)) return false;
    if (o.needCash && (state.res?.cash ?? 0) < o.needCash) return false;
    return true;
  });
  return [...opts, WAIT];
}

export function institutionBlock(round, inst) {
  if (!round?.institution) return null;
  const meta = INSTITUTIONS[inst];
  return meta.agency ? round.institution.agency : round.institution[inst];
}

export function phaseOf(v) { return Math.max(1, Math.min(5, Math.round(v))); }

export function lciOf(dims) {
  const ph = Object.keys(DIMS).map(k => phaseOf(dims[k]));
  return {
    worst: Math.max(...ph),
    mean: Math.round((ph.reduce((a, b) => a + b, 0) / ph.length) * 10) / 10,
    count4: ph.filter(p => p >= 4).length,
  };
}
