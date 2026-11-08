// Aftershock — Varenna valley earthquake scenario (v1: six acts, family and response blocks)
// Shared by the browser and the server engine.

export const SCENARIO_VERSION = 'varenna-v1';

export const DIMS = {
  dwelling:   { label: 'Dwelling adequacy',      short: 'Dwelling',   text: ['Safe, dry, enough space', 'Some damage or crowding', 'Unsafe or badly crowded', 'Barely protected from the weather', 'No meaningful shelter'] },
  essentials: { label: 'Household essentials',   short: 'Essentials', text: ['Sleeping, cooking, light all covered', 'Getting by, a few gaps', 'Missing key items', 'Cannot cook or keep warm', 'Nothing left'] },
  tenure:     { label: 'Security of tenure',     short: 'Tenure',     text: ['Secure, recognised right to stay', 'Some uncertainty', 'Informal, could be asked to leave', 'Eviction threatened', 'Being evicted / no right to stay'] },
  settlement: { label: 'Settlement environment', short: 'Settlement', text: ['Services close, safe surroundings', 'Some services far or strained', 'Crowded, services overloaded', 'Unsafe, very crowded, few services', 'Life-threatening surroundings'] },
};
export const PHASES = ['Minimal', 'Stressed', 'Severe', 'Extreme', 'Catastrophic'];

export const MUNIS = {
  varenna: { name: 'Varenna', blurb: 'The valley’s main town (120,000). Visible, well connected, where the cameras go.' },
  lissa:   { name: 'Lissa', blurb: 'A small town downstream (25,000). Badly hit, one overwhelmed mayor, hardly on anyone’s radar.' },
  morava:  { name: 'Morava hills', blurb: 'Farming villages up the valley. The road is cut by landslides.' },
};

export const INSTITUTIONS = {
  ns:      { name: 'Varennan Red Cross', kind: 'Local · National Society', type: 'local', agency: true,
             blurb: 'Branches and volunteers in all three municipalities from the first hour. Trusted locally. But many of your volunteers lost homes too, your cash systems are basic, and the authorities lean on you as their auxiliary.' },
  dpo:     { name: 'Able Varenna', kind: 'Local · organisation of persons with disabilities', type: 'local', agency: true,
             blurb: 'A small member-led organisation. You know where people with disabilities live and what they need. Tiny budget, no logistics, and nobody invites you to the meetings.' },
  ingo:    { name: 'ShelterWorks International', kind: 'International NGO', type: 'international', agency: true,
             blurb: 'Strong on cash, rental support and repairs. On day one you have one person in the country. Everything else must be deployed, recruited or done through partners.' },
  un:      { name: 'UN agency', kind: 'International · UN', type: 'international', agency: true,
             blurb: 'The biggest pipeline of tents and relief items and a mandate to lead. Two staff in the capital. Procurement is slow and you prefer working through official sites.' },
  varenna: { name: 'Varenna Municipality', kind: 'Local authority · Mayor’s office', type: 'authority', agency: false,
             blurb: 'You control land, schools, permits and engineers in Varenna. The council wants schools reopened and visible progress. Your own staff lost homes.' },
  lissa:   { name: 'Lissa Municipality', kind: 'Local authority · Mayor’s office', type: 'authority', agency: false,
             blurb: 'A small town with four engineers and a phone. You are badly hit and nobody seems to notice. Families are camping in a private orchard by the bypass road.' },
  coord:   { name: 'SLSC Coordination cell', kind: 'Coordination', type: 'coordination', agency: false,
             blurb: 'No budget. You collect 3Ws, publish coverage maps, convene partners and advocate. You decide how the situation is described — including what counts as a site.' },
};
export const INSTITUTION_ORDER = ['ns', 'dpo', 'ingo', 'un', 'varenna', 'lissa', 'coord'];
export const AGENCIES = ['ns', 'dpo', 'ingo', 'un'];

export const STAFF = { assess: 'Assessment teams', site: 'Site managers', cash: 'Cash officers', eng: 'Shelter engineers', hlp: 'HLP advisers', im: 'IM officers' };

export function initialOrgs() {
  return {
    ns:   { staff: { assess: 3, site: 0, cash: 0, eng: 0, hlp: 0, im: 0 }, capacity: 0.6, incoming: [] },
    dpo:  { staff: { assess: 1, site: 0, cash: 0, eng: 0, hlp: 0, im: 0 }, capacity: 0.8, incoming: [] },
    ingo: { staff: { assess: 0, site: 0, cash: 1, eng: 0, hlp: 0, im: 0 }, capacity: 1, incoming: [] },
    un:   { staff: { assess: 0, site: 1, cash: 0, eng: 0, hlp: 0, im: 1 }, capacity: 1, incoming: [] },
  };
}

const S = (dwelling, essentials, tenure, settlement) => ({ dwelling, essentials, tenure, settlement });

export const PROFILES = {
  H1: { name: 'The Haddad family', who: 'Six people renting a flat in Varenna’s Old Town on a verbal lease.', muni: 'varenna', area: 'old',
        story: 'Your building cracked down the middle. You are squeezed into your cousins’ flat in the New Quarter (the Novak family). You have no papers for the flat you rented.',
        init: { loc: 'host', muni: 'varenna', group: 'hosted', dims: S(3, 3, 4, 2), res: { cash: 150, assets: 1, debt: 0, goodwill: 3, docs: 0 } } },
  H2: { name: 'Mrs Petrov', who: 'A widow in her seventies who owns her Old Town house and walks with a frame.', muni: 'varenna', area: 'old', vulnerable: true,
        story: 'Your house is damaged but standing. The stairs are impossible now. Neighbours say looters are about. You will not leave the home you have lived in for fifty years.',
        init: { loc: 'home', muni: 'varenna', group: 'nondisp', dims: S(4, 3, 2, 3), res: { cash: 80, assets: 1, debt: 0, goodwill: 2, docs: 1 } } },
  H3: { name: 'The Okafor family', who: 'Five people from Varenna’s Riverside informal settlement; both parents are day labourers.', muni: 'varenna', area: 'riverside',
        story: 'Your shack on government land collapsed. You carried what you could to the stadium. Nobody has ever recognised your right to the Riverside plot.',
        init: { loc: 'stadium', muni: 'varenna', group: 'site', dims: S(4, 3, 5, 4), res: { cash: 30, assets: 0, debt: 0, goodwill: 2, docs: 0 } } },
  H4: { name: 'The Lindqvist family', who: 'Four people who own a flat in a Varenna New Quarter block.', muni: 'varenna', area: 'newq',
        story: 'Your block has cracks in the stairwell. Until an engineer checks it you are sleeping in a classroom at School No. 3 with forty others.',
        init: { loc: 'school', muni: 'varenna', group: 'site', dims: S(3, 3, 2, 3), res: { cash: 300, assets: 2, debt: 0, goodwill: 2, docs: 1 } } },
  H5: { name: 'The Mendes family', who: 'Seven people farming in the Morava hills, with goats and a cow.', muni: 'morava', area: 'hills',
        story: 'Your stone house partly collapsed. You are under a tarpaulin beside it. The road is cut. The animals are your savings and winter is coming.',
        init: { loc: 'village', muni: 'morava', group: 'nondisp', dims: S(4, 4, 2, 4), res: { cash: 60, assets: 3, debt: 0, goodwill: 3, docs: 1 } } },
  H6: { name: 'The Novak family', who: 'Four people in a Varenna New Quarter flat with minor damage.', muni: 'varenna', area: 'newq', host: true,
        story: 'You took in your cousins, the Haddads: six more people in a two-bedroom flat. Water, money and patience are already stretched.',
        init: { loc: 'home', muni: 'varenna', group: 'host', dims: S(2, 3, 1, 2), res: { cash: 250, assets: 2, debt: 0, goodwill: 4, docs: 1 } } },
  H7: { name: 'Amira and her children', who: 'A mother in Lissa with three children; her son uses a wheelchair.', muni: 'lissa', area: 'lissa', vulnerable: true,
        story: 'Your flat in Lissa is unsafe. You are in the Lissa gymnasium. The latrines are not accessible and you cannot leave your son to queue for distributions.',
        init: { loc: 'gym', muni: 'lissa', group: 'site', dims: S(3, 4, 3, 4), res: { cash: 40, assets: 0, debt: 0, goodwill: 2, docs: 1 } } },
  H8: { name: 'The Rossi family', who: 'Five people from a Morava hill village who fled down the valley.', muni: 'morava', area: 'hills',
        story: 'You came down the night of the quake with other families from your village. You are sleeping under plastic in an orchard by the Lissa bypass road. Nobody has asked who you are.',
        init: { loc: 'orchard', muni: 'lissa', group: 'informal', dims: S(4, 4, 4, 4), res: { cash: 70, assets: 2, debt: 0, goodwill: 2, docs: 1 } } },
};
export const PROFILE_ORDER = Object.keys(PROFILES);

export const LOCATIONS = {
  home: 'In or beside your own home', host: 'Staying with a host family', rental: 'In a rented room',
  school: 'School No. 3, Varenna (collective centre)', stadium: 'Varenna stadium (spontaneous site)', gym: 'Lissa gymnasium (collective centre)',
  village: 'Under a tarpaulin in your village', riverside: 'A rebuilt shack at Riverside, Varenna', orchard: 'The orchard by the Lissa bypass road',
  planned: 'The planned site outside Lissa',
};
export const SITE_LOCS = ['school', 'stadium', 'gym', 'planned'];
export const POCKETS = { stadium: 'Varenna stadium', school: 'School No. 3', gym: 'Lissa gymnasium', planned: 'Lissa planned site', orchard: 'Bypass orchard (emerging)', riverside: 'Riverside', old: 'Old Town damaged blocks' };
export const GROUPS = { site: 'IDPs in collective sites', informal: 'IDPs in informal settlements', hosted: 'Hosted IDPs', rent: 'IDPs renting', host: 'Host families', nondisp: 'Non-displaced' };

// ---------------------------------------------------------------------------
// Option vocabulary
// Family options: for (profiles), when {loc, group, muni}, after {step: [ids]}, dims, res, set, knownP, world, feed
// Response options: only [institutions], target, needs (staff type), needsKnown, cash, dims, res, set, knownP, world, staff, feed
// ---------------------------------------------------------------------------

export const WAIT_OPTION = { id: 'wait', label: 'Wait and see', detail: 'Hold on and see what happens.', feed: 'Your family waited to see what would happen.' };
const NOACT = { id: 'none', label: 'Hold for now', detail: 'Make no commitment this time.', feed: 'held back' };

const MONEY = (prices = 1) => ({ id: 'f2', prompt: 'And money: what do you do with what you have?', options: [
  { id: 'spend', label: 'Spend savings on materials', detail: `Timber, sheeting and fixings — ${Math.round(100 * prices)}.`, res: { cash: -Math.round(100 * prices) }, needCash: Math.round(100 * prices), dims: { dwelling: -1 }, feed: 'You spent savings on materials and improved your shelter.' },
  { id: 'save', label: 'Save what you have', detail: 'Keep cash for what is coming.', feed: 'You held on to your savings.' },
  { id: 'borrow', label: 'Borrow from a moneylender', detail: '150 now, 180 to repay.', res: { cash: 150, debt: 180 }, dims: { essentials: -0.5 }, feed: 'You borrowed 150. The moneylender expects 180 back.' },
  { id: 'work', label: 'Find paid work', detail: 'Day labour clearing rubble. Less time for everything else.', res: { cash: 70 }, dims: { essentials: 0.3 }, feed: 'You found a few days of paid work.' },
] });

const REPORT = { id: 'r3', prompt: 'The coordination cell asks every organisation for its 3W (who, what, where). Do you report?', options: [
  { id: 'report_full', label: 'Report fully', detail: 'Locations, numbers, plans.', world: { report: 1 }, feed: 'submitted a full 3W', npc: 2 },
  { id: 'report_partial', label: 'Headline numbers only', detail: 'No locations; your donor is sensitive.', world: { report: 0.5 }, feed: 'submitted partial 3W figures' },
  { id: 'no_report', label: 'Don’t report: no time', detail: 'Everyone on delivery instead.', world: { report: 0, efficiency: 0.15 }, feed: 'did not submit a 3W' },
] };

export const ACTS = [
  // =================================================================== ACT 1
  { n: 1, time: '72 hours – Week 1', title: 'The first nights',
    family: {
      intro: 'Three days since the earthquake. Aftershocks keep coming. Phone networks are patchy and rumours travel faster than aid.',
      event: { id: 'aftershocks', text: 'Aftershocks continue. The road to the Morava hills is still blocked.' },
      steps: [
        { id: 'f1', prompt: 'Where will your family shelter for now?', options: [
          { id: 'stay_host', for: ['H1'], label: 'Stay with your cousins', detail: 'Crowded, but you are with family.', res: { goodwill: -0.5 }, feed: 'You stayed with the Novaks. Twelve people, two bedrooms.', npc: 3 },
          { id: 'to_school', for: ['H1', 'H2'], label: 'Move to School No. 3', detail: 'Join the collective centre in Varenna.', set: { loc: 'school', group: 'site', muni: 'varenna' }, dims: { settlement: 1, tenure: -1, dwelling: -0.5 }, feed: 'You moved into a classroom at School No. 3.' },
          { id: 'find_room', for: ['H1'], label: 'Look for a room to rent', detail: 'Uses most of your savings; rents are already rising.', set: { loc: 'rental', group: 'rent' }, res: { cash: -120 }, dims: { tenure: -1, dwelling: -0.5 }, feed: 'You found a damp room for 120 a month, cash, no contract.' },
          { id: 'stay_home', for: ['H2'], label: 'Stay in your damaged house', detail: 'Guard your home and belongings.', dims: { settlement: 0.5 }, feed: 'You stayed home. A crack opened above the kitchen door.', npc: 4 },
          { id: 'stay_stadium', for: ['H3'], label: 'Stay at the stadium', detail: 'There are people, water trucks and some help.', feed: 'You stayed at the stadium under a sheet of plastic.', npc: 3 },
          { id: 'back_riverside', for: ['H3'], label: 'Rebuild a shack at Riverside', detail: 'Salvaged materials on your old plot.', set: { loc: 'riverside', group: 'nondisp' }, res: { cash: -10 }, dims: { settlement: -0.5 }, feed: 'You put up a shack from salvaged sheeting back at Riverside.' },
          { id: 'stay_school', for: ['H4'], label: 'Stay at the school', detail: 'Wait for the engineer.', feed: 'You stayed in the classroom with forty others.', npc: 3 },
          { id: 'back_flat', for: ['H4'], label: 'Move back into your flat', detail: 'Nobody has checked the building yet.', set: { loc: 'home', group: 'nondisp', unsafe: true }, dims: { settlement: -1, essentials: -1 }, feed: 'You moved back into your flat. The stairwell creaks during every aftershock.' },
          { id: 'stay_tarp', for: ['H5'], label: 'Stay by the house with the animals', detail: 'Protect your livestock and land.', feed: 'You stayed under the tarpaulin beside the ruins of the house.', npc: 4 },
          { id: 'walk_down', for: ['H5'], label: 'Walk down the valley with the children', detail: 'Neighbours say families are gathering near Lissa.', set: { loc: 'orchard', group: 'informal', muni: 'lissa' }, res: { assets: -1 }, dims: { essentials: -0.5, tenure: 2 }, world: { orchardGrow: 1 }, feed: 'You walked eight hours to an orchard by the Lissa bypass. Your eldest stayed with the animals.' },
          { id: 'welcome', for: ['H6'], label: 'Welcome them, no conditions', detail: 'Family is family.', res: { goodwill: 1, cash: -30 }, dims: { essentials: 0.5 }, feed: 'You told the Haddads to stay as long as they need.', npc: 3 },
          { id: 'limits', for: ['H6'], label: 'Agree a one-month limit', detail: 'Be clear from the start.', res: { goodwill: -0.5 }, feed: 'You agreed the Haddads would stay for one month.' },
          { id: 'stay_gym', for: ['H7'], label: 'Stay in the gymnasium', detail: 'At least there is a roof.', feed: 'You stayed in the Lissa gymnasium.', npc: 3 },
          { id: 'to_sister', for: ['H7'], label: 'Move in with your sister', detail: 'She has one spare room on the other side of Lissa — up two flights of stairs.', set: { loc: 'host', group: 'hosted' }, dims: { settlement: -1, essentials: 0.5 }, res: { goodwill: 3 }, feed: 'You moved in with your sister. Your son can no longer get downstairs on his own.' },
          { id: 'stay_orchard', for: ['H8'], label: 'Stay in the orchard with your neighbours', detail: 'Familiar faces. No services. The owner is not happy.', feed: 'You stayed in the orchard. More families from the hills arrived in the night.', world: { orchardGrow: 1 }, npc: 3 },
          { id: 'to_gym', for: ['H8'], label: 'Move into the Lissa gymnasium', detail: 'A roof, but you will be strangers there.', set: { loc: 'gym', group: 'site' }, dims: { dwelling: -1, tenure: -1 }, feed: 'You moved into the Lissa gymnasium.' },
          { id: 'go_back_up', for: ['H8'], label: 'Walk back up to the village', detail: 'Check the house and the fields.', set: { loc: 'village', group: 'nondisp', muni: 'morava' }, dims: { tenure: -2, settlement: 0.5 }, feed: 'You walked back up to the village. The house is half standing.' },
        ] },
        { id: 'f2', prompt: 'Who do you tell that your family needs help?', options: [
          { id: 'register', when: { loc: ['school', 'stadium', 'gym'] }, label: 'Register with whoever is taking names', detail: 'Names, ID, needs.', set: { known: true }, feed: 'You registered. Your name is on a list now.', npc: 3 },
          { id: 'tell_volunteers', when: { loc: ['home', 'host', 'rental', 'riverside', 'village'] }, label: 'Tell the Red Cross volunteers going street to street', detail: 'If they come by.', knownP: 0.5, knownBy: 'ns', feed: 'You told a Red Cross volunteer what you need.', npc: 2 },
          { id: 'ask_orchard', when: { loc: ['orchard'] }, label: 'Ask passing drivers to tell someone you are here', detail: 'Nobody official has come.', knownP: 0.2, feed: 'You flagged down a truck driver, who promised to tell the town hall.', npc: 2 },
          { id: 'tell_able', for: ['H2', 'H7'], label: 'Call Able Varenna', detail: 'They know you; they may be able to help.', knownP: 0.85, knownBy: 'dpo', set: { dpoKnown: true }, feed: 'Able Varenna took your details and asked about your access needs.', npc: 3 },
          { id: 'stay_quiet', label: 'Keep your head down', detail: 'You are not sure who will see your details.', feed: 'You did not give your details to anyone.' },
        ] },
      ] },
    response: {
      intro: 'First reports: about 40,000 people displaced across Varenna, Lissa and the Morava hills. Every organisation is deciding where to put its few people.',
      event: { id: 'first_reports', text: 'International media focus on Varenna stadium.' },
      steps: {
        agency: [
          { id: 'r1', prompt: 'Your people: what do you do about staff right now?', options: [
            { id: 'mobilise_all', only: ['ns'], label: 'Mobilise volunteers in all three municipalities', detail: 'Spread thin, but everywhere.', staff: { assess: 2 }, world: { nsSpread: true }, feed: 'mobilised volunteers in Varenna, Lissa and the hills', npc: 2 },
            { id: 'mobilise_varenna', only: ['ns'], label: 'Concentrate volunteers in Varenna', detail: 'Where the need is most visible and the authorities are asking.', staff: { assess: 2 }, world: { nsSpread: false }, feed: 'concentrated volunteers in Varenna' },
            { id: 'call_members', only: ['dpo'], label: 'Phone your members: who is missing, who is stuck?', detail: 'Your list is your strength.', target: 'vulnerable', knownP: 0.85, set: { dpoKnown: true }, feed: 'phoned members and found people stuck at home and in sites', npc: 2 },
            { id: 'join_ns', only: ['dpo'], label: 'Offer your volunteers to the Red Cross teams', detail: 'More reach, less of your own voice.', world: { dpoWithNs: true }, feed: 'joined Red Cross assessment teams' },
            { id: 'surge_cash', only: ['ingo', 'un'], label: 'Request surge: cash and markets officers', detail: 'Arrive next act — if the permits come through.', incoming: { cash: 2 }, feed: 'requested cash surge staff', npc: 1 },
            { id: 'surge_site', only: ['ingo', 'un'], label: 'Request surge: site managers and shelter engineers', detail: 'Arrive next act — if the permits come through.', incoming: { site: 1, eng: 1 }, feed: 'requested site and engineering surge staff', npc: 2 },
            { id: 'partner_ns', only: ['ingo', 'un'], label: 'Fund the Red Cross volunteers', detail: 'Immediate reach through local staff; they carry the load.', partner: 'ns', feed: 'partnered with the Varennan Red Cross' },
            { id: 'partner_dpo', only: ['ingo', 'un'], label: 'Partner with Able Varenna', detail: 'Their member lists, your money.', partner: 'dpo', feed: 'partnered with Able Varenna' },
          ] },
          { id: 'r2', prompt: 'Rapid assessment: where do you look first?', options: [
            { id: 'assess_sites', label: 'Register people at the official sites', detail: 'Varenna stadium, School No. 3, Lissa gymnasium.', target: 'formal', knownP: 0.9, needs: 'assess', feed: 'registered families at the official sites', npc: 3 },
            { id: 'assess_varenna', label: 'Door-to-door in Varenna’s neighbourhoods', detail: 'Including host families. Slower.', target: 'varenna_neigh', knownP: 0.6, needs: 'assess', feed: 'went door-to-door in Varenna' },
            { id: 'assess_lissa', label: 'Go to Lissa and look around', detail: 'Nobody has been there yet.', target: 'lissa', knownP: 0.6, needs: 'assess', world: { seenLissa: 1 }, feed: 'assessed Lissa and its surroundings' },
            { id: 'assess_morava', label: 'Try to reach the Morava hills', detail: 'The road is cut; you may not get through.', target: 'morava', knownP: 0.4, needs: 'assess', access: true, feed: 'tried to reach the Morava hills' },
            { id: 'remote_ki', label: 'Key-informant phone calls everywhere', detail: 'Fast, wide, low confidence. No team needed.', target: 'all', knownP: 0.2, feed: 'phoned key informants across the valley' },
          ] },
          REPORT,
        ],
        varenna: [
          { id: 'r1', prompt: 'International agencies ask for fast-track work permits for surge staff.', options: [
            { id: 'fast_permits', label: 'Fast-track permits', detail: 'Help arrives sooner. Some councillors grumble about foreigners.', world: { permitsFast: true, goodwill: 0.5 }, feed: 'Varenna fast-tracked permits for international staff.', npc: 2 },
            { id: 'normal_permits', label: 'Normal procedures', detail: 'Rules are rules; it takes an extra few weeks.', world: { permitsFast: false }, feed: 'Varenna kept normal permit procedures.' },
          ] },
          { id: 'r2', prompt: 'What is Varenna’s first priority?', options: [
            { id: 'declare_centres', label: 'Declare the stadium and schools official sites', detail: 'Services can be organised there.', world: { sitesOfficial: true }, target: 'varenna_sites', dims: { settlement: -0.5 }, feed: 'Varenna declared the stadium and School No. 3 official evacuation sites.', npc: 2 },
            { id: 'clear_road', label: 'Send machinery to reopen the Morava road', detail: 'Your engineers are needed everywhere.', world: { hillsOpen: true }, feed: 'Varenna sent machinery to reopen the Morava road.' },
            { id: 'ask_neigh', label: 'Ask agencies to cover neighbourhoods, not just sites', detail: 'Most displaced people are with relatives.', world: { neighBoost: 0.2 }, feed: 'The mayor of Varenna asked agencies to look beyond the sites.' },
          ] },
        ],
        lissa: [
          { id: 'r1', prompt: 'Lissa has four engineers and a phone. What first?', options: [
            { id: 'ask_help', label: 'Go to Varenna and ask for help in the coordination meeting', detail: 'Two hours each way. Nobody knows you there.', world: { lissaVisible: 1 }, feed: 'The mayor of Lissa came to the coordination meeting in Varenna.', npc: 2 },
            { id: 'open_gym', label: 'Formally open the gymnasium and staff it', detail: 'Your own people, your own way.', target: 'gym', dims: { settlement: -0.5, essentials: -0.5 }, feed: 'Lissa formally opened and staffed the gymnasium.' },
            { id: 'manage_alone', label: 'Manage alone', detail: 'Lissa looks after its own.', feed: 'Lissa decided to manage on its own.' },
          ] },
          { id: 'r2', prompt: 'Families from the hills are camping in a private orchard by the bypass road. The owner is furious.', options: [
            { id: 'tolerate', label: 'Tolerate it for now', detail: 'Tell the owner it is temporary.', world: { orchardTolerated: true }, target: 'orchard', dims: { tenure: -0.5 }, feed: 'Lissa asked the orchard owner to tolerate the families for now.', npc: 2 },
            { id: 'move_to_gym', label: 'Tell them to move into the gymnasium', detail: 'It is already full.', target: 'orchard', dims: { tenure: 1 }, world: { gymCrowd: 1 }, feed: 'Lissa told the orchard families to move to the full gymnasium.' },
            { id: 'not_my_problem', label: 'They are from Morava — not Lissa’s responsibility', detail: 'Let Morava deal with it.', target: 'orchard', dims: { tenure: 0.5 }, feed: 'Lissa said the orchard families were Morava’s responsibility.' },
          ] },
        ],
        coord: [
          { id: 'r1', prompt: 'Your first coordination meeting. Where do you hold it, and what do you agree?', options: [
            { id: 'split_areas', label: 'Varenna: agree who assesses which area', detail: 'Reduces duplication.', world: { coord: 1, assessBoost: 0.1 }, feed: 'Partners agreed an assessment split in Varenna.', npc: 2 },
            { id: 'common_form', label: 'Varenna: agree a common assessment form', detail: 'Comparable data, later.', world: { coord: 1, commonForm: true }, feed: 'Partners agreed a common assessment form.' },
            { id: 'meet_lissa', label: 'Hold the next meeting in Lissa', detail: 'Two hours away. Partners won’t like it.', world: { lissaVisible: 1, coord: 0.5 }, feed: 'The coordination meeting moved to Lissa.' },
          ] },
          { id: 'r2', prompt: 'Your first situation report. How do you describe where displaced people are?', options: [
            { id: 'sitrep_sites', label: 'Numbers for the official sites', detail: 'The data you have.', world: { sitrep: 'sites' }, feed: 'The first situation report counted people at the official sites.' },
            { id: 'sitrep_muni', label: 'Estimates by municipality, including hosted families', detail: 'Less precise, more complete.', world: { sitrep: 'muni', hostFocus: true }, feed: 'The first situation report estimated displacement by municipality, including host families.', npc: 2 },
            { id: 'sitrep_wait', label: 'Wait for better data', detail: 'No report this week.', world: { sitrep: 'none' }, feed: 'The coordination cell held its situation report.' },
          ] },
        ],
      } } },

  // =================================================================== ACT 2
  { n: 2, time: 'Weeks 2–4', title: 'Lists and queues',
    family: {
      intro: 'Aid is arriving — mostly at the stadium. Host families are stretched. Prices are climbing. In the orchard, more families appear every night.',
      event: { id: 'host_strain', text: 'Host families are running short of money, water and patience. More hill families arrive at the orchard.' },
      steps: [
        { id: 'f1', prompt: 'This week’s pressing question for your family:', options: [
          { id: 'contribute', when: { group: ['hosted'] }, label: 'Contribute cash to your hosts', detail: 'For food and utilities.', res: { cash: -60, goodwill: 1 }, feed: 'You gave your hosts 60 towards food and bills.', npc: 2 },
          { id: 'chores', when: { group: ['hosted'] }, label: 'Take on chores and childcare', detail: 'Pay your way in time, not money.', res: { goodwill: 0.5 }, feed: 'You took over the cooking and the school runs.', npc: 2 },
          { id: 'look_rent', when: { group: ['hosted'] }, label: 'Start looking for a room', detail: 'Rents are rising fast.', set: { loc: 'rental', group: 'rent' }, res: { cash: -130 }, needCash: 130, dims: { tenure: -0.5 }, feed: 'You found a room for 130 a month, no contract.' },
          { id: 'share', for: ['H6'], label: 'Keep sharing everything with the Haddads', detail: 'They are family.', res: { cash: -40, goodwill: 0.5 }, dims: { essentials: 0.5 }, feed: 'You kept sharing everything. The money is running low.', npc: 2 },
          { id: 'ask_contrib', for: ['H6'], label: 'Ask the Haddads to contribute to costs', detail: 'An awkward conversation.', res: { cash: 40, goodwill: -0.5 }, feed: 'You asked the Haddads to chip in. The atmosphere cooled.', npc: 2 },
          { id: 'deadline', for: ['H6'], label: 'Tell them to leave by Month 2', detail: 'You can’t go on like this.', res: { goodwill: -1.5 }, feed: 'You told the Haddads they must leave by Month 2.' },
          { id: 'queue', when: { loc: ['school', 'stadium', 'gym'] }, label: 'Queue for the next distribution', detail: 'Lose a day’s wages; maybe get items.', res: { cash: -15 }, dims: { essentials: -0.5 }, knownP: 0.4, feed: 'You queued again. Some days there was something, some days not.', npc: 2 },
          { id: 'site_committee', when: { loc: ['school', 'stadium', 'gym'] }, label: 'Join the site committee', detail: 'A voice in how the site is run; it takes time.', set: { committee: true, known: true }, dims: { settlement: -0.5 }, feed: 'You joined the site committee.' },
          { id: 'orchard_stay', when: { loc: ['orchard'] }, label: 'Stay in the orchard', detail: 'Your village is here. The owner is threatening to call the police.', world: { orchardGrow: 1 }, feed: 'You stayed. Twenty more families arrived this week.', npc: 2 },
          { id: 'orchard_organise', when: { loc: ['orchard'] }, label: 'Help organise an orchard committee', detail: 'Make a list of families; find someone to talk to.', set: { committee: true }, knownP: 0.4, world: { orchardCommittee: true, orchardGrow: 1 }, feed: 'You helped set up a committee and wrote down every family’s name.', npc: 2 },
          { id: 'orchard_leave', when: { loc: ['orchard'] }, label: 'Move into the Lissa gymnasium', detail: 'A roof, among strangers.', set: { loc: 'gym', group: 'site' }, dims: { dwelling: -1, tenure: -1.5, settlement: -0.5 }, feed: 'You moved into the Lissa gymnasium.' },
          { id: 'patch', when: { loc: ['home', 'riverside', 'village'] }, label: 'Patch the roof and walls yourself', detail: 'Is it safe? Nobody knows.', res: { cash: -80 }, needCash: 80, dims: { dwelling: -1 }, set: { unsafe: true }, feed: 'You patched the roof and walls. Drier, if not safer.', npc: 2 },
          { id: 'sell_goats', for: ['H5'], label: 'Sell two goats to buy food', detail: 'Prices are bad, but the children need to eat.', res: { cash: 80, assets: -1 }, dims: { essentials: -1 }, feed: 'You sold two goats for 80. Before the quake they would have fetched 150.' },
        ] },
        MONEY(1),
      ] },
    response: {
      intro: 'Surge staff are landing — where permits allowed. Lists are growing at the official sites. Outside them, the picture is thin.',
      event: { id: 'surge_arrives', text: 'Surge staff arrived where permits were granted.' },
      steps: {
        agency: [
          { id: 'r1', prompt: 'Where do you put your people this act?', options: [
            { id: 'rotate', only: ['ns'], label: 'Rotate exhausted volunteers and bring in branches from other regions', detail: 'Restores your capacity.', capacity: 0.3, feed: 'rotated volunteers and brought in other branches', npc: 2 },
            { id: 'keep_going', only: ['ns'], label: 'Keep everyone going', detail: 'The need is now.', capacity: -0.1, staff: { assess: 1 }, feed: 'kept every volunteer working' },
            { id: 'accessibility_advice', only: ['dpo'], label: 'Offer accessibility advice to every site', detail: 'Ramps, latrines, distribution for people who can’t queue.', world: { accessAdvice: true }, feed: 'advised sites on accessibility', npc: 2 },
            { id: 'home_visits', only: ['dpo'], label: 'Visit members stuck at home', detail: 'Find the people nobody else has.', target: 'vulnerable', knownP: 0.9, set: { dpoKnown: true }, feed: 'visited members stuck at home' },
            { id: 'deploy_varenna', only: ['ingo', 'un'], label: 'Base your team in Varenna', detail: 'Where the meetings and the media are.', world: { baseVarenna: 1 }, feed: 'based its team in Varenna', npc: 2 },
            { id: 'deploy_lissa', only: ['ingo', 'un'], label: 'Open a field office in Lissa', detail: 'Two hours from the meetings.', world: { baseLissa: 1, lissaVisible: 1 }, feed: 'opened a field office in Lissa' },
            { id: 'hire_local', only: ['ingo', 'un'], label: 'Hire local staff fast', detail: 'Good salaries. The best candidates are Red Cross volunteers.', staff: { assess: 2, cash: 1 }, poach: 'ns', feed: 'hired local staff, several from the Red Cross' },
          ] },
          { id: 'r2', prompt: 'Your main activity this act:', options: [
            { id: 'nfi_sites', label: 'Blanket relief items at the official sites', detail: 'Fast, visible, no lists needed.', target: 'formal', dims: { essentials: -1 }, category: 'nfi', world: { pull: 1 }, feed: 'distributed relief items at the official sites', npc: 3 },
            { id: 'nfi_known', label: 'Relief items to households on your lists', detail: 'Wherever they are.', target: 'all', needsKnown: true, dims: { essentials: -1 }, category: 'nfi', feed: 'delivered relief items to listed households' },
            { id: 'host_cash', label: 'Cash for host families and their guests', detail: 'Needs cash officers.', target: 'hostpair', needsKnown: true, cash: true, needs: 'cash', res: { cash: 100, goodwill: 1 }, dims: { essentials: -1 }, category: 'cash', feed: 'paid cash to host families and their guests' },
            { id: 'access_kits', only: ['dpo'], label: 'Accessible items and referrals for people with disabilities', detail: 'Commodes, ramps, referrals — to people on your list.', target: 'vulnerable', needsKnown: true, dims: { dwelling: -1, essentials: -1, settlement: -0.5 }, category: 'access', feed: 'provided accessible items and referrals', npc: 3 },
            { id: 'orchard_aid', label: 'Water and tarpaulins at the orchard', detail: 'Only if you know it exists. Legitimises a site on private land.', target: 'orchard', needsSeen: 'orchard', dims: { essentials: -1, dwelling: -0.5 }, world: { orchardGrow: 1 }, category: 'nfi', feed: 'delivered water and tarpaulins at the orchard' },
          ] },
        ],
        varenna: [
          { id: 'r1', prompt: 'Agencies want to scale up cash. The council is nervous about prices and fraud.', options: [
            { id: 'approve_cash', label: 'Approve cash programmes', detail: 'Markets are working.', world: { cashBlocked: false, goodwill: 0.5 }, feed: 'Varenna approved cash programmes.', npc: 2 },
            { id: 'inkind_only', label: 'In-kind assistance only', detail: 'Cash could fuel prices.', world: { cashBlocked: true }, feed: 'Varenna insisted on in-kind assistance only.' },
          ] },
          { id: 'r2', prompt: 'How should distributions be organised in Varenna?', options: [
            { id: 'sites_only', label: 'At official sites only', detail: 'Easier to control and to show.', world: { sitesOnly: true }, feed: 'Varenna restricted distributions to official sites.' },
            { id: 'allow_neigh', label: 'Through neighbourhood ward officials too', detail: 'Reach people where they are.', world: { sitesOnly: false, goodwill: 0.5 }, feed: 'Varenna allowed neighbourhood distributions.', npc: 2 },
          ] },
        ],
        lissa: [
          { id: 'r1', prompt: 'The orchard owner has called the police. Two hundred people are there now.', options: [
            { id: 'negotiate_owner', label: 'Negotiate three months’ temporary use', detail: 'Lissa pays a small rent it doesn’t have.', world: { orchardTolerated: true }, target: 'orchard', dims: { tenure: -1 }, feed: 'Lissa negotiated three months’ temporary use of the orchard.', npc: 2 },
            { id: 'evict_orchard', label: 'Support the owner: clear the orchard', detail: 'Private property is private property.', world: { orchardEvict: true }, target: 'orchard', dims: { tenure: 1.5 }, feed: 'Lissa backed the owner’s demand to clear the orchard.' },
            { id: 'ask_agencies', label: 'Ask the coordination cell what to do', detail: 'Is this a site? Whose job is it?', world: { lissaVisible: 1, seenOrchardCoord: true }, feed: 'Lissa asked the coordination cell for help with the orchard.' },
          ] },
          { id: 'r2', prompt: 'Lissa’s gymnasium is overcrowded.', options: [
            { id: 'second_centre', label: 'Open the community hall as a second centre', detail: 'Your last public building.', target: 'gym', dims: { settlement: -1 }, feed: 'Lissa opened the community hall as a second collective centre.', npc: 2 },
            { id: 'ask_ramps', label: 'Ask Able Varenna to make the gym accessible', detail: 'Cheap, if they come.', target: 'gym', dims: { settlement: -0.5 }, world: { accessAdvice: true }, feed: 'Lissa asked Able Varenna for accessibility help.' },
          ] },
        ],
        coord: [
          { id: 'r1', prompt: 'Reports mention “families near an orchard outside Lissa”. Nobody has numbers.', options: [
            { id: 'visit_orchard', label: 'Go and see for yourself', detail: 'A day out of the office.', world: { seenOrchardCoord: true, lissaVisible: 1 }, feed: 'The coordination cell visited the orchard near Lissa.', npc: 2 },
            { id: 'ask_partners', label: 'Ask partners in the meeting', detail: 'Someone must know.', world: { askOrchard: true }, feed: 'The coordination cell asked partners about the orchard.' },
            { id: 'park_it', label: 'Park it until there is data', detail: 'Focus on the official sites.', feed: 'The coordination cell focused on the official sites.' },
          ] },
          { id: 'r2', prompt: 'Is the orchard a site, a pocket of concern, or nothing yet?', options: [
            { id: 'classify_site', label: 'Classify it as an informal site', detail: 'Unlocks site services. Legitimises occupation of private land.', world: { orchardStatus: 'site' }, feed: 'The coordination cell classified the orchard as an informal site.' },
            { id: 'classify_pocket', label: 'Flag it as a pocket of concern', detail: 'Monitor and report it separately; no site services yet.', world: { orchardStatus: 'pocket' }, feed: 'The coordination cell flagged the orchard as a pocket of concern.', npc: 2 },
            { id: 'classify_none', label: 'Not yet: not enough evidence', detail: 'You can’t define what you haven’t seen.', world: { orchardStatus: 'unknown' }, feed: 'The coordination cell did not classify the orchard yet.' },
          ] },
        ],
      } } },

  // =================================================================== ACT 3
  { n: 3, time: 'Month 2', title: 'Out of the schools',
    family: {
      intro: 'Varenna wants its children back in school. Collective-centre families are told to move. In Lissa, the orchard has become a small town of plastic.',
      event: { id: 'school_closure', text: 'School No. 3 is being cleared for classes. The orchard now holds around 300 people.' },
      steps: [
        { id: 'f1', prompt: 'Where does your family go from here?', options: [
          { id: 'school_to_stadium', when: { loc: ['school'] }, label: 'Move to the stadium', detail: 'Crowded, but nobody is closing it — yet.', set: { loc: 'stadium' }, dims: { settlement: 1, dwelling: 0.5 }, feed: 'You carried your things across town to the stadium.', npc: 2 },
          { id: 'school_to_rent', when: { loc: ['school'] }, label: 'Rent a room with your savings', detail: 'Rents are up 30%.', set: { loc: 'rental', group: 'rent' }, res: { cash: -160 }, needCash: 160, dims: { tenure: -1, settlement: -1 }, feed: 'You rented a room for 160 a month.' },
          { id: 'school_home', when: { loc: ['school'] }, label: 'Go back to your damaged flat', detail: 'No engineer has checked it.', set: { loc: 'home', group: 'nondisp', unsafe: true }, dims: { settlement: -1, tenure: -1, dwelling: 0.5 }, feed: 'You moved back into your flat, unchecked.' },
          { id: 'school_resist', when: { loc: ['school'] }, label: 'Refuse to leave until there is a plan', detail: 'With the site committee.', dims: { tenure: 1 }, world: { schoolResist: 1 }, feed: 'You and other families refused to leave without a plan.' },
          { id: 'hosted_stay', when: { group: ['hosted'] }, label: 'Stay with your hosts and keep the peace', detail: 'Cook, clean, contribute.', res: { cash: -40, goodwill: 0.5 }, feed: 'You kept the peace with your hosts.', npc: 2 },
          { id: 'hosted_orchard', when: { group: ['hosted', 'rent'] }, label: 'Join relatives at the orchard near Lissa', detail: 'Free, if not secure.', set: { loc: 'orchard', group: 'informal', muni: 'lissa' }, dims: { tenure: 2, settlement: 1.5 }, world: { orchardGrow: 1 }, feed: 'You moved to the orchard near Lissa.' },
          { id: 'host_ultimatum', for: ['H6'], label: 'Give your guests a final date', detail: 'End of the month.', res: { goodwill: -1.5 }, feed: 'You gave the Haddads a final date.' },
          { id: 'host_endure', for: ['H6'], label: 'Endure — and ask for help', detail: 'Ask the Red Cross whether hosts get support.', set: { known: true }, res: { goodwill: 0.3 }, feed: 'You endured, and asked the Red Cross about support for hosts.', npc: 2 },
          { id: 'orchard_build', when: { loc: ['orchard'] }, label: 'Build something sturdier in the orchard', detail: 'Timber and sheeting, 60.', res: { cash: -60 }, needCash: 60, dims: { dwelling: -1 }, world: { orchardGrow: 1 }, feed: 'You built a timber frame shelter in the orchard.', npc: 2 },
          { id: 'orchard_return', when: { loc: ['orchard'] }, label: 'Go back up to the village', detail: 'The road is open now.', set: { loc: 'village', group: 'nondisp', muni: 'morava' }, dims: { tenure: -2, settlement: -0.5 }, feed: 'You went home to the hills.' },
          { id: 'site_ask', when: { loc: ['stadium', 'gym', 'planned'] }, label: 'Stay and press the site committee for help', detail: 'Free, slow.', set: { known: true }, feed: 'You stayed and pressed the site committee for help.', npc: 2 },
          { id: 'site_stay', when: { loc: ['stadium', 'gym'] }, label: 'Stay and improve your corner', detail: 'Partitions, a heater: 40.', res: { cash: -40 }, needCash: 40, dims: { dwelling: -0.5, settlement: -0.5 }, feed: 'You built a partition and bought a heater.', npc: 2 },
          { id: 'home_engineer', when: { loc: ['home', 'riverside', 'village'] }, label: 'Pay a private engineer to check the house', detail: '60 for peace of mind.', res: { cash: -60 }, needCash: 60, set: { unsafe: false, checked: true }, feed: 'An engineer checked the house: repairable, with proper work.', npc: 2 },
          { id: 'sell_livestock', for: ['H5'], label: 'Sell the cow to rebuild one dry room', detail: 'Next year’s income gone.', res: { cash: 200, assets: -2 }, dims: { dwelling: -1 }, feed: 'You sold the cow. One room is dry.' },
        ] },
        MONEY(1.15),
      ] },
    response: {
      intro: 'School closures are forcing moves across Varenna. The orchard near Lissa is growing whether or not anyone calls it a site.',
      event: { id: 'rents_rise', text: 'Rents across the valley have risen 30%.' },
      steps: {
        agency: [
          { id: 'r1', prompt: 'Where is your focus this act?', options: [
            { id: 'focus_varenna', label: 'Varenna: support families leaving the schools', detail: 'Visible, urgent, the mayor is asking.', world: { focusVarenna: 1 }, feed: 'focused on families leaving Varenna’s schools', npc: 2 },
            { id: 'focus_lissa', label: 'Lissa and the orchard', detail: 'Where nobody else is.', world: { lissaVisible: 1, focusLissa: 1 }, feed: 'focused on Lissa and the orchard' },
            { id: 'surge_hlp', only: ['ingo', 'un'], label: 'Request HLP advisers', detail: 'Evictions, leases, land — arrive next act.', incoming: { hlp: 1 }, feed: 'requested HLP advisers' },
            { id: 'fund_partner', only: ['ingo', 'un'], label: 'Fund your local partner’s staff costs', detail: 'Restores their capacity.', partnerBoost: 0.3, feed: 'funded its local partner’s staff' },
          ] },
          { id: 'r2', prompt: 'Your main activity this act:', options: [
            { id: 'rental_support', label: 'Rental support with written agreements', detail: 'Needs cash officers; better with HLP advisers.', target: 'renthosted', needsKnown: true, cash: true, needs: 'cash', dims: { tenure: -1, dwelling: -0.5 }, set: { loc: 'rental', group: 'rent' }, world: { rentPressure: 1 }, category: 'cash', feed: 'started rental support with written agreements', npc: 2 },
            { id: 'site_upgrade', label: 'Upgrade water, lighting and management at official sites', detail: 'Needs site managers.', target: 'formal', needs: 'site', dims: { settlement: -1 }, category: 'site', feed: 'upgraded services at the official sites', npc: 2 },
            { id: 'orchard_services', label: 'Latrines, water and site management at the orchard', detail: 'Needs site managers. The landowner will object.', target: 'orchard', needsSeen: 'orchard', needs: 'site', dims: { settlement: -1, essentials: -0.5 }, world: { orchardGrow: 1 }, category: 'site', feed: 'set up latrines, water and site management at the orchard' },
            { id: 'access_retrofit', only: ['dpo', 'ns'], label: 'Accessible latrines and ramps in sites', detail: 'Small works, big difference.', target: 'formal', dims: { settlement: -0.5 }, extraVulnerable: { dwelling: -1, settlement: -1 }, category: 'access', feed: 'made site facilities accessible' },
          ] },
        ],
        varenna: [
          { id: 'r1', prompt: 'When do Varenna’s schools reopen?', options: [
            { id: 'reopen_now', label: 'Now. Families must leave this week', detail: 'Children have lost two months.', world: { schoolClosed: true }, target: 'school', dims: { tenure: 2 }, feed: 'Varenna ordered School No. 3 cleared this week.', npc: 1 },
            { id: 'reopen_phased', label: 'In a month, with agencies offering rental support', detail: 'Needs agencies to commit.', world: { schoolPhased: true, goodwill: 0.5 }, target: 'school', dims: { tenure: 1 }, feed: 'Varenna announced a phased school reopening linked to rental support.', npc: 2 },
            { id: 'winter_centres', label: 'Keep the schools as heated winter centres', detail: 'Children lose a term.', target: 'school', dims: { essentials: -0.5, tenure: -0.5 }, feed: 'Varenna kept the schools as winter centres.' },
          ] },
          { id: 'r2', prompt: 'The stadium is overflowing.', options: [
            { id: 'formalise_stadium', label: 'Formalise it as a managed site', detail: 'Services and some security of stay.', world: { stadiumFormal: true }, target: 'stadium', dims: { tenure: -1, settlement: -0.5 }, feed: 'Varenna formalised the stadium as a managed site.', npc: 2 },
            { id: 'clear_stadium', label: 'Clear it by Month 3', detail: 'The football season matters to the council.', world: { stadiumClear: true }, target: 'stadium', dims: { tenure: 1.5 }, feed: 'Varenna ordered the stadium cleared by Month 3.' },
          ] },
        ],
        lissa: [
          { id: 'r1', prompt: 'What is Lissa’s position on the orchard now?', options: [
            { id: 'orchard_formal', label: 'Ask agencies to manage it as a temporary site', detail: 'Lissa negotiates with the owner.', world: { orchardStatus: 'site', orchardTolerated: true }, target: 'orchard', dims: { tenure: -1 }, feed: 'Lissa asked agencies to manage the orchard as a temporary site.', npc: 2 },
            { id: 'orchard_relocate', label: 'Offer municipal land for a planned site', detail: 'Two kilometres out, no services yet.', world: { plannedSite: true }, target: 'orchard', dims: { tenure: -0.5 }, feed: 'Lissa offered municipal land for a planned site.' },
            { id: 'orchard_clear', label: 'Clear the orchard', detail: 'The owner is going to court.', world: { orchardEvict: true }, target: 'orchard', dims: { tenure: 2 }, feed: 'Lissa moved to clear the orchard.' },
          ] },
          { id: 'r2', prompt: 'Nobody has assessed Lissa’s damaged neighbourhoods.', options: [
            { id: 'own_survey', label: 'Send your four engineers house to house', detail: 'Slow, but yours.', target: 'lissa_homes', knownP: 0.5, feed: 'Lissa’s engineers surveyed damaged homes.', npc: 2 },
            { id: 'press_coord', label: 'Press the coordination cell for a Lissa response plan', detail: 'Again.', world: { lissaVisible: 1 }, feed: 'Lissa pressed for a response plan.' },
          ] },
        ],
        coord: [
          { id: 'r1', prompt: 'How do you report severity: are sites and pockets inside area figures, or separate?', options: [
            { id: 'nested', label: 'Nested: sites are part of their area’s figure', detail: 'One number per municipality.', world: { reporting: 'nested' }, feed: 'The coordination cell reported sites nested within area figures.' },
            { id: 'carved', label: 'Carved out: sites and pockets reported separately', detail: 'Areas look better; pockets stand out.', world: { reporting: 'carved' }, feed: 'The coordination cell reported sites and pockets separately from their areas.', npc: 2 },
          ] },
          { id: 'r2', prompt: 'Agencies ask how to prioritise households. What rule do you propose?', options: [
            { id: 'rule_worst', label: 'Worst dimension first', detail: 'Phase 4 on anything comes first.', world: { rule: 'worst' }, feed: 'Partners agreed to prioritise by worst dimension.', npc: 2 },
            { id: 'rule_mean', label: 'Average across dimensions', detail: 'Overall hardship.', world: { rule: 'mean' }, feed: 'Partners agreed to prioritise by average severity.' },
            { id: 'rule_count', label: 'Number of dimensions at Phase 4+', detail: 'Multiple deprivation.', world: { rule: 'count4' }, feed: 'Partners agreed to prioritise by number of severe dimensions.' },
          ] },
        ],
      } } },

  // =================================================================== ACT 4
  { n: 4, time: 'Months 3–4', title: 'Winter',
    family: {
      intro: 'The first hard frost. Plastic sheeting cracks in the cold. Host families who were patient in October are not patient now.',
      event: { id: 'winter', text: 'Winter has arrived. Night temperatures are below freezing.' },
      steps: [
        { id: 'f1', prompt: 'How does your family get through the cold?', options: [
          { id: 'buy_fuel', label: 'Buy fuel and blankets', detail: '50.', res: { cash: -50 }, needCash: 50, dims: { essentials: -1 }, feed: 'You bought fuel and blankets.', npc: 3 },
          { id: 'insulate', label: 'Insulate your shelter', detail: 'Plastic, cardboard, old carpets: 30.', res: { cash: -30 }, needCash: 30, dims: { dwelling: -0.5 }, feed: 'You insulated your shelter as well as you could.', npc: 2 },
          { id: 'winter_centre', when: { loc: ['orchard', 'village', 'riverside', 'stadium'] }, label: 'Sleep in a heated centre at night', detail: 'If there is one. Leave your things behind.', dims: { essentials: -0.5, settlement: 0.5 }, res: { assets: -0.5 }, feed: 'You slept in a heated centre and came back to find things missing.' },
          { id: 'burn', label: 'Burn whatever you can find', detail: 'Smoke, risk of fire.', dims: { essentials: -0.3, settlement: 0.5 }, feed: 'You burned scrap wood. The children are coughing.' },
        ] },
        { id: 'f2', prompt: 'And the bigger question:', options: [
          { id: 'hosted_leave', when: { group: ['hosted'] }, label: 'Leave your hosts before they ask', detail: 'For a site or a room.', set: { loc: 'stadium', group: 'site', muni: 'varenna' }, res: { goodwill: 1 }, dims: { settlement: 1.5, tenure: 1 }, feed: 'You left your hosts for the stadium. They cried; so did you.' },
          { id: 'hosted_hold', when: { group: ['hosted'] }, label: 'Hold on until spring', detail: 'Whatever it takes.', res: { goodwill: -0.5 }, feed: 'You held on with your hosts.', npc: 2 },
          { id: 'rent_late', when: { group: ['rent'] }, label: 'Pay the rent late and hope', detail: 'The landlord is losing patience.', dims: { tenure: 1 }, res: { cash: 80 }, feed: 'You paid the rent late. The landlord left a warning.', npc: 2 },
          { id: 'rent_pay', when: { group: ['rent'] }, label: 'Pay the rent, skip meals', detail: '130.', res: { cash: -130 }, dims: { essentials: 1 }, feed: 'You paid the rent and cut meals.' },
          { id: 'debt_pay', when: { minDebt: 1 }, label: 'Pay down the moneylender', detail: '100.', res: { cash: -100, debt: -100 }, needCash: 100, feed: 'You paid 100 to the moneylender.' },
          { id: 'committee_ask', when: { committee: true }, label: 'Use the committee to demand winter help', detail: 'Make some noise.', knownP: 0.7, world: { committeePressure: 1 }, feed: 'Your committee met the agencies and demanded winter support.' },
          { id: 'keep_going', label: 'Keep going as you are', detail: 'Get through one day at a time.', feed: 'You kept going.', npc: 2 },
        ] },
      ] },
    response: {
      intro: 'Winter. Collective sites and informal shelters are freezing. Host families are evicting guests. What you did in Months 1–3 now shows.',
      event: { id: 'host_evictions', text: 'Host-family evictions are peaking.' },
      steps: {
        agency: [
          { id: 'r1', prompt: 'Winter is your test. Who gets your winterisation support?', options: [
            { id: 'wint_sites', label: 'Stoves and insulation kits at official sites', detail: 'Predictable, visible.', target: 'formal', dims: { dwelling: -0.5, essentials: -1 }, category: 'winter', feed: 'winterised the official sites', npc: 2 },
            { id: 'wint_cash', label: 'Winterisation cash to households on your lists, by priority rule', detail: 'Needs cash officers.', target: 'worst', needsKnown: true, cash: true, needs: 'cash', dims: { dwelling: -0.5, essentials: -1 }, category: 'winter', feed: 'paid winter cash to listed households by priority' },
            { id: 'wint_orchard', label: 'Winterise the orchard', detail: 'Only if you know it exists.', target: 'orchard', needsSeen: 'orchard', dims: { dwelling: -1, essentials: -1 }, world: { orchardGrow: 1 }, category: 'winter', feed: 'winterised shelters at the orchard' },
            { id: 'wint_vuln', label: 'Insulation for older and disabled people, by referral', detail: 'Narrow, deep.', target: 'vulnerable', needsKnown: true, dims: { dwelling: -1, essentials: -1 }, category: 'winter', feed: 'insulated homes of older and disabled people' },
          ] },
          { id: 'r2', prompt: 'Host families are evicting guests. Do you respond?', options: [
            { id: 'host_topup', label: 'Emergency top-ups for host families', detail: 'Needs cash officers.', target: 'hostpair', needsKnown: true, cash: true, needs: 'cash', res: { goodwill: 1.5, cash: 60 }, category: 'cash', feed: 'paid emergency top-ups to host families', npc: 2 },
            { id: 'mediation', only: ['ns', 'dpo'], label: 'Volunteer mediation between hosts and guests', detail: 'Cheap, human, slow.', target: 'hostpair', res: { goodwill: 1 }, feed: 'mediated between hosts and guests' },
            { id: 'stay_course', label: 'Stay on your current plan', detail: 'You can’t do everything.', feed: 'stayed on its current plan' },
          ] },
        ],
        varenna: [
          { id: 'r1', prompt: 'Winter in Varenna. What does the municipality do?', options: [
            { id: 'heated_centres', label: 'Open heated night centres in municipal buildings', detail: 'Costly; staff exhausted.', target: 'varenna_all', dims: { essentials: -0.5 }, feed: 'Varenna opened heated night centres.', npc: 2 },
            { id: 'eviction_freeze', label: 'Declare a winter eviction moratorium', detail: 'Landlords will sue.', world: { hlp: true }, target: 'renthosted', dims: { tenure: -1 }, feed: 'Varenna declared a winter eviction moratorium.' },
          ] },
          { id: 'r2', prompt: 'Engineering assessments are behind.', options: [
            { id: 'eng_priority', label: 'Prioritise tagging homes so families can return', detail: 'Green, yellow or red tags.', world: { engineering: 1 }, target: 'unsafe', set: { checked: true }, feed: 'Varenna prioritised tagging damaged homes.', npc: 2 },
            { id: 'eng_public', label: 'Prioritise public buildings', detail: 'Schools, clinics, the town hall.', feed: 'Varenna prioritised public buildings.' },
          ] },
        ],
        lissa: [
          { id: 'r1', prompt: 'The orchard is freezing. What does Lissa do?', options: [
            { id: 'lissa_heat', label: 'Open the community hall at night for orchard families', detail: 'With what fuel?', target: 'orchard', dims: { essentials: -0.5 }, feed: 'Lissa opened its hall at night for orchard families.', npc: 2 },
            { id: 'lissa_appeal', label: 'Appeal publicly: “Lissa is forgotten”', detail: 'A local journalist is interested.', world: { lissaVisible: 2 }, feed: 'Lissa’s mayor appealed publicly: “Lissa is forgotten.”' },
          ] },
          { id: 'r2', prompt: 'The planned-site land is ready for services, if anyone will provide them.', options: [
            { id: 'move_planned', label: 'Move orchard families to the planned site', detail: 'Secure tenure, few services yet.', requiresWorld: 'plannedSite', target: 'orchard', set: { loc: 'planned', group: 'site' }, dims: { tenure: -2, settlement: 0.5 }, feed: 'Lissa moved orchard families to the planned site.' },
            { id: 'wait_spring', label: 'Wait until spring', detail: 'Don’t move people in winter.', feed: 'Lissa decided not to move anyone until spring.', npc: 2 },
          ] },
        ],
        coord: [
          { id: 'r1', prompt: 'Winter severity snapshot: what do you publish?', options: [
            { id: 'snapshot_all', label: 'Severity by municipality, site and pocket', detail: 'Everything you know, with confidence levels.', world: { snapshot: true }, feed: 'A severity snapshot by municipality, site and pocket was published.', npc: 2 },
            { id: 'snapshot_sites', label: 'Severity at official sites only', detail: 'High confidence data.', world: { snapshot: 'sites' }, feed: 'A severity snapshot for official sites was published.' },
          ] },
          { id: 'r2', prompt: 'Duplication and gaps are obvious. What do you push?', options: [
            { id: 'gap_hosts', label: 'A joint plan for host families and renters', detail: 'Over half of the displaced.', world: { hostFocus: true, coord: 1 }, feed: 'Partners agreed a joint plan for host families and renters.', npc: 2 },
            { id: 'gap_lissa', label: 'A Lissa and orchard response plan', detail: 'At last.', world: { lissaVisible: 1, coord: 1 }, feed: 'Partners agreed a Lissa and orchard response plan.' },
          ] },
        ],
      } } },

  // =================================================================== ACT 5
  { n: 5, time: 'Month 6', title: 'The second shock',
    family: {
      intro: 'Spring. Then, at 04:10 one morning, a magnitude 5.9 aftershock. Repaired walls crack again. Some unchecked buildings come down.',
      event: { id: 'aftershock', text: 'A strong aftershock struck. Unchecked repairs failed in places.' },
      steps: [
        { id: 'f1', prompt: 'After the aftershock, what is your family’s plan for a home?', options: [
          { id: 'repair', when: { loc: ['home', 'village', 'riverside'] }, label: 'Repair properly with an engineer’s advice', detail: '150, or help if you can get it.', res: { cash: -150 }, needCash: 150, dims: { dwelling: -1.5 }, set: { unsafe: false }, feed: 'You repaired the house properly.', npc: 2 },
          { id: 'rebuild_cheap', when: { loc: ['home', 'village', 'riverside'] }, label: 'Rebuild cheaply yourself', detail: '60.', res: { cash: -60 }, needCash: 60, dims: { dwelling: -1 }, set: { unsafe: true }, feed: 'You rebuilt the walls yourself, cheaply.', npc: 2 },
          { id: 'return_home', when: { loc: ['stadium', 'gym', 'rental', 'host', 'orchard', 'school'] }, label: 'Go back to your damaged home or plot', detail: 'Whatever state it is in.', set: { loc: 'home', group: 'nondisp' }, dims: { tenure: -1, dwelling: 0.5, settlement: -0.5 }, feed: 'You went back to your home, damaged as it is.', npc: 2 },
          { id: 'stay_put', label: 'Stay where you are for now', detail: 'You can’t face another move.', feed: 'You stayed where you were.', npc: 2 },
        ] },
        MONEY(1.25),
      ] },
    response: {
      intro: 'The aftershock undid some of the progress. Donors ask what has been achieved. Repairs and returns are now the question.',
      event: { id: 'donor_pressure', text: 'Donors are asking for results and an exit strategy.' },
      steps: {
        agency: [
          { id: 'r1', prompt: 'Recovery: what do you invest in?', options: [
            { id: 'repairs', label: 'Repair cash with engineering support', detail: 'Needs engineers. Owners only, unless you check tenure.', target: 'owners', needsKnown: true, cash: true, needs: 'eng', dims: { dwelling: -1.5 }, set: { unsafe: false }, category: 'repair', feed: 'paid for repairs with engineering support', npc: 2 },
            { id: 'area_based', label: 'Area-based recovery in the Old Town', detail: 'Owners, renters and hosts together, street by street.', target: 'oldtown', needs: 'eng', dims: { dwelling: -1, tenure: -0.5, essentials: -0.5 }, category: 'area', feed: 'ran an area-based recovery programme in the Old Town' },
            { id: 'hlp_support', label: 'Legal and tenure support', detail: 'Needs HLP advisers.', target: 'renthosted', needsKnown: true, needs: 'hlp', dims: { tenure: -1.5 }, category: 'hlp', feed: 'provided legal and tenure support' },
            { id: 'orchard_durable', label: 'Durable solutions for the orchard', detail: 'Return support to Morava or planned relocation.', target: 'orchard', needsSeen: 'orchard', dims: { tenure: -1.5, dwelling: -0.5 }, category: 'durable', feed: 'supported return or relocation for orchard families' },
          ] },
          { id: 'r2', prompt: 'Partnerships and people:', options: [
            { id: 'invest_local', label: 'Invest in local partners’ long-term capacity', detail: 'Pays off after you leave.', partnerBoost: 0.4, feed: 'invested in local partners’ capacity', npc: 2 },
            { id: 'own_staff', label: 'Keep delivery with your own staff', detail: 'Quality and control.', capacity: 0.2, feed: 'kept delivery with its own staff' },
          ] },
        ],
        varenna: [
          { id: 'r1', prompt: 'Rebuilding Varenna:', options: [
            { id: 'build_back_safer', label: 'Enforce safer building rules for all repairs', detail: 'Slower, safer, costlier.', world: { saferRules: true }, feed: 'Varenna required safer building standards for repairs.', npc: 2 },
            { id: 'fast_permits_repair', label: 'Fast-track repair permits', detail: 'Get people home.', world: { permits: true }, target: 'oldtown', dims: { dwelling: -0.3 }, feed: 'Varenna fast-tracked repair permits.' },
          ] },
          { id: 'r2', prompt: 'Riverside: rebuild in place or relocate?', options: [
            { id: 'riverside_upgrade', label: 'Upgrade Riverside in place with tenure', detail: 'A political fight.', target: 'riverside', dims: { tenure: -2 }, feed: 'Varenna agreed to upgrade Riverside in place.' },
            { id: 'riverside_relocate', label: 'Relocate Riverside families to the edge of town', detail: 'Far from work.', target: 'riverside', dims: { tenure: -1, settlement: 1 }, feed: 'Varenna announced Riverside relocation.', npc: 2 },
          ] },
        ],
        lissa: [
          { id: 'r1', prompt: 'The orchard owner has won in court.', options: [
            { id: 'enforce', label: 'Enforce the eviction', detail: 'The law is the law.', target: 'orchard', dims: { tenure: 2 }, world: { orchardEvict: true }, feed: 'Lissa enforced the orchard eviction order.' },
            { id: 'buy_time', label: 'Negotiate time while families find options', detail: 'Lissa pays.', target: 'orchard', dims: { tenure: -0.5 }, feed: 'Lissa negotiated more time for orchard families.', npc: 2 },
          ] },
          { id: 'r2', prompt: 'Lissa’s own recovery:', options: [
            { id: 'lissa_plan', label: 'Present a recovery plan to donors', detail: 'If anyone listens.', world: { lissaVisible: 1 }, feed: 'Lissa presented a recovery plan.', npc: 2 },
            { id: 'lissa_engineers', label: 'Your engineers advise families on safe repairs', detail: 'Four engineers, a lot of houses.', target: 'lissa_homes', dims: { dwelling: -0.5 }, feed: 'Lissa’s engineers advised families on safe repairs.' },
          ] },
        ],
        coord: [
          { id: 'r1', prompt: 'Donors ask for a single severity figure per municipality.', options: [
            { id: 'single_figure', label: 'Give one figure per municipality', detail: 'Simple. Pockets disappear.', world: { reporting: 'nested' }, feed: 'The cell reported one severity figure per municipality.' },
            { id: 'figure_plus', label: 'One figure per municipality plus named pockets', detail: 'More complex; more honest.', world: { reporting: 'carved' }, feed: 'The cell reported municipal figures plus named pockets of concern.', npc: 2 },
          ] },
          { id: 'r2', prompt: 'Transition planning:', options: [
            { id: 'handover_plan', label: 'Plan handover to municipalities and local organisations', detail: 'Start now.', world: { handover: true, coord: 1 }, feed: 'The cell started a handover plan with municipalities and local organisations.', npc: 2 },
            { id: 'extend_cluster', label: 'Argue to extend the humanitarian response', detail: 'Needs are still high.', world: { extend: true }, feed: 'The cell argued for extending the humanitarian response.' },
          ] },
        ],
      } } },

  // =================================================================== ACT 6
  { n: 6, time: 'Months 9–12', title: 'One year on',
    family: {
      intro: 'Nearly a year. Some families are home; some are still in sites, sheds and rooms they cannot afford. The anniversary is coming.',
      event: { id: 'anniversary', text: 'One year since the earthquake.' },
      steps: [
        { id: 'f1', prompt: 'Where does your family see its future?', options: [
          { id: 'settle_here', label: 'Settle where you are now', detail: 'Make it work.', dims: { tenure: -0.5 }, feed: 'You decided to settle where you are.', npc: 3 },
          { id: 'go_home_final', when: { loc: ['stadium', 'gym', 'rental', 'host', 'orchard', 'school'] }, label: 'Go home, whatever it takes', detail: 'Back to your area.', set: { loc: 'home', group: 'nondisp' }, dims: { tenure: -1, dwelling: 0.5 }, feed: 'You went home.', npc: 2 },
          { id: 'leave_valley', label: 'Leave the valley for the capital', detail: 'Start again; lose everything here.', dims: { tenure: 0.5, settlement: -0.5 }, res: { assets: -1 }, feed: 'You decided to leave the valley.' },
        ] },
        { id: 'f2', prompt: 'Looking back: what mattered most to your family this year?', options: [
          { id: 'mattered_cash', label: 'Cash we could decide how to use', detail: '', feed: 'Cash mattered most.' },
          { id: 'mattered_place', label: 'A safe place to stay', detail: '', feed: 'A safe place mattered most.', npc: 2 },
          { id: 'mattered_people', label: 'Family, neighbours and hosts', detail: '', feed: 'People mattered most.', npc: 2 },
          { id: 'mattered_voice', label: 'Being listened to', detail: '', feed: 'Being listened to mattered most.' },
          { id: 'mattered_nothing', label: 'Nothing reached us', detail: '', feed: 'Nothing reached us.' },
        ] },
      ] },
    response: {
      intro: 'A 40% funding cut lands just before the anniversary. Every organisation must decide what to protect, and what to report.',
      event: { id: 'funding_cut', text: 'Funding has been cut by 40% across the response.' },
      steps: {
        agency: [
          { id: 'r1', prompt: 'After the 40% cut, what do you protect?', options: [
            { id: 'protect_worst', label: 'The worst-off households by the agreed rule', detail: 'Narrow and deep.', target: 'worst', needsKnown: true, dims: { essentials: -0.5, dwelling: -0.5 }, feed: 'protected support to the worst-off households', npc: 2 },
            { id: 'protect_sites', label: 'Services at the official sites', detail: 'Visible commitments.', target: 'formal', dims: { settlement: -0.5 }, feed: 'protected services at the official sites' },
            { id: 'handover_local', label: 'Hand over to local organisations and municipalities', detail: 'With the remaining money.', partnerBoost: 0.5, world: { handover: true }, feed: 'handed over to local organisations' },
          ] },
          { id: 'r2', prompt: 'Your final report to donors claims:', options: [
            { id: 'claim_reach', label: 'Households reached', detail: 'The biggest number you have.', world: { claim: 'reach' }, feed: 'reported households reached', npc: 2 },
            { id: 'claim_lci', label: 'Change in living conditions, with gaps acknowledged', detail: 'Less flattering, more honest.', world: { claim: 'lci' }, feed: 'reported change in living conditions, including gaps' },
          ] },
        ],
        varenna: [
          { id: 'r1', prompt: 'One year on, Varenna’s priority:', options: [
            { id: 'close_sites', label: 'Close the remaining sites', detail: 'Normality.', target: 'formal', dims: { tenure: 1 }, feed: 'Varenna announced the closure of remaining sites.', npc: 1 },
            { id: 'social_housing', label: 'Commit land and money to social housing', detail: 'A five-year promise.', target: 'renthosted', dims: { tenure: -1 }, feed: 'Varenna committed to social housing.', npc: 2 },
          ] },
          { id: 'r2', prompt: 'What does the mayor say at the anniversary?', options: [
            { id: 'speech_success', label: '“Varenna has recovered”', detail: '', feed: 'The mayor declared that Varenna has recovered.' },
            { id: 'speech_honest', label: '“Many of us are still not home”', detail: '', feed: 'The mayor said many people are still not home.', npc: 2 },
          ] },
        ],
        lissa: [
          { id: 'r1', prompt: 'One year on, Lissa’s priority:', options: [
            { id: 'lissa_integrate', label: 'Integrate the hill families into Lissa', detail: 'Plots, schools, services.', target: 'orchard', dims: { tenure: -1.5 }, feed: 'Lissa offered hill families a place in the town.', npc: 2 },
            { id: 'lissa_return', label: 'Help the hill families go home to Morava', detail: 'Transport and materials.', target: 'orchard', set: { loc: 'village', group: 'nondisp', muni: 'morava' }, dims: { tenure: -1 }, feed: 'Lissa helped hill families return to Morava.' },
          ] },
          { id: 'r2', prompt: 'What does Lissa’s mayor say at the anniversary?', options: [
            { id: 'lissa_forgotten', label: '“Lissa was forgotten”', detail: '', feed: 'Lissa’s mayor said Lissa was forgotten.', npc: 2 },
            { id: 'lissa_thanks', label: '“Thank you to those who came”', detail: '', feed: 'Lissa’s mayor thanked those who came.' },
          ] },
        ],
        coord: [
          { id: 'r1', prompt: 'Your end-of-year analysis leads with:', options: [
            { id: 'lead_lci', label: 'The living-conditions picture, including pockets', detail: '', world: { claim: 'lci' }, feed: 'The end-of-year analysis led with living conditions, including pockets.', npc: 2 },
            { id: 'lead_outputs', label: 'Outputs delivered by partners', detail: '', world: { claim: 'reach' }, feed: 'The end-of-year analysis led with partner outputs.' },
          ] },
          { id: 'r2', prompt: 'The lesson you put first:', options: [
            { id: 'lesson_hosts', label: 'Host families and renters were under-served', detail: '', feed: 'Lesson one: hosts and renters were under-served.', npc: 1 },
            { id: 'lesson_local', label: 'Local organisations carried the response', detail: '', feed: 'Lesson one: local organisations carried the response.', npc: 1 },
            { id: 'lesson_pockets', label: 'Pockets of concern were seen too late', detail: '', feed: 'Lesson one: pockets of concern were seen too late.', npc: 1 },
          ] },
        ],
      } } },
];

export const TOTAL_ROUNDS = ACTS.length * 2;
export const roundInfo = n => ({ act: ACTS[Math.ceil(n / 2) - 1], block: n % 2 ? 'family' : 'response' });

function okFor(o, profile, state, picks) {
  if (o.for && !o.for.includes(profile)) return false;
  const w = o.when || {};
  if (w.loc && !w.loc.includes(state.loc)) return false;
  if (w.group && !w.group.includes(state.group)) return false;
  if (w.committee && !state.committee) return false;
  if (w.minDebt && !(state.res?.debt >= w.minDebt)) return false;
  if (o.needCash && (state.res?.cash ?? 0) < o.needCash) return false;
  if (o.after) for (const [k, ids] of Object.entries(o.after)) if (!ids.includes(picks[k])) return false;
  return true;
}

export function applyFamily(state, o) {
  const s = structuredClone(state);
  for (const [k, v] of Object.entries(o.dims || {})) s.dims[k] = Math.max(1, Math.min(5, s.dims[k] + v));
  for (const [k, v] of Object.entries(o.res || {})) s.res[k] = Math.max(0, Math.round(((s.res[k] || 0) + v) * 10) / 10);
  for (const [k, v] of Object.entries(o.set || {})) s[k] = v;
  return s;
}

/** Family steps for a household, computed in order. Each step's options depend on the state after earlier picks. */
export function familySteps(act, profile, state, picks = {}) {
  let s = state;
  return act.family.steps.map(step => {
    const options = [...step.options.filter(o => okFor(o, profile, s, picks)), WAIT_OPTION];
    const chosen = options.find(o => o.id === picks[step.id]);
    const before = s;
    if (chosen) s = applyFamily(s, chosen);
    return { ...step, options, chosen, before };
  });
}

/** Response steps for an institution. */
export function responseSteps(act, inst, world = {}) {
  const meta = INSTITUTIONS[inst];
  const list = meta.agency ? act.response.steps.agency : act.response.steps[inst] || [];
  return list.map(step => ({ ...step, options: [...step.options.filter(o => (!o.only || o.only.includes(inst)) && (!o.requiresWorld || world[o.requiresWorld])), NOACT] }));
}

export function phaseOf(v) { return Math.max(1, Math.min(5, Math.round(v))); }
export function lciOf(dims) {
  const ph = Object.keys(DIMS).map(k => phaseOf(dims[k]));
  return { worst: Math.max(...ph), mean: Math.round((ph.reduce((a, b) => a + b, 0) / ph.length) * 10) / 10, count4: ph.filter(p => p >= 4).length };
}
