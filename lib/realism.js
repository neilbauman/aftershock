// Realism layer: physical risk, belongings, the good and bad of each living situation,
// trade-offs on existing options, and the community's severity alongside the family's.

// ------------------------------------------------------------- belongings
// How many "loads" of household goods (bedding, cooking, clothes, lamps) a family can keep and use where it lives.
export const ITEM_CAP = { home: 3, makeshift: 2.5, selfbuilt: 2.5, rented: 2, hosted: 1.5, informal: 1.5, camp: 1.5, away: 1.5, open: 1, collective: 0.75 };
export const ITEM_VALUE = 0.3; // essentials phase per load of usable goods
export const CAP_NOTE = {
  open: 'Out in the open there is nowhere to keep much: you hold on to bedding and a pot, and the rest stays behind.',
  collective: 'In the collective centre each family has a strip of floor. There is no room for a cooker or mattresses for everyone; what doesn’t fit goes to a neighbour’s shed, or goes missing.',
  hosted: 'Your hosts’ flat is already full. Most of your things stay in bags in a corner — or go into storage you can’t reach.',
  camp: 'A tent holds bedding, a stove and a few bags. Everything else has to stay behind.',
  informal: 'You build a lean-to for some things; the rest has nowhere to go.',
  rented: 'The room is small; some of your things will not fit.',
  away: 'You take a suitcase each. Everything else stays in the valley.',
};

// ------------------------------------------------------------- physical risk
// Aftershock strength per chapter (risk multiplier) and the street news that goes with it.
export const AFTERSHOCK = {
  1: { k: 1, text: 'Aftershocks rolled through the valley all night. In the Old Town, a façade that survived the first shock came down at 3 a.m.; two people sleeping behind it were killed.' },
  2: { k: 0.8, text: 'A strong aftershock on the second day brought down more damaged buildings. Rescue teams pulled a man alive from a house he had gone back into for his papers. His neighbour was not so lucky.' },
  3: { k: 0.5, text: 'The aftershocks are smaller now but they keep coming — every night, two or three. Each one cracks a little more in the damaged buildings.' },
  4: { k: 0.2 }, 5: { k: 0.15 }, 6: { k: 0.15 },
  7: { k: 1.6, text: 'The second shock — magnitude 5.8 — brought down buildings that had been weakened in the first. Most of the dead were people living in damaged homes that had never been assessed or repaired.' },
  8: { k: 0.1 },
};
// Risk of injury from living in or near the damaged house, by the house's phase.
const HOUSE_RISK = { 1: 0, 2: 0.02, 3: 0.08, 4: 0.22, 5: 0.4 };
export function placeRisk(s, phaseOf) {
  const ty = s._stype;
  if (ty === 'home') return HOUSE_RISK[phaseOf(s.dims.dwelling)] * (s.flags?.repaired ? 0.2 : s.flags?.shored || s.flags?.patched ? 0.6 : 1);
  if (ty === 'makeshift') return 0.04;
  if (ty === 'collective') return s.loc === 'gym' ? 0.03 : 0.02; // unassessed public buildings
  return 0;
}
export const INJURY = {
  haddad: { minor: 'Karim cut his arm badly on falling glass. Leila stitched it with thread from the sewing kit; it will heal, slowly.', serious: 'A section of ceiling came down. Karim’s leg is broken in two places. He will not stand at the stall for months — and the hospital wants paying.', ongoing: 'Karim’s leg is still in plaster. He cannot work the stall, and Leila carries everything.' },
  petrov: { minor: 'You fell in the dark and badly bruised your hip. Every step with the frame hurts.', serious: 'Plaster and a beam fell across your chair. Your wrist and two ribs are broken. You cannot use the frame; you cannot get to the toilet on your own.', ongoing: 'Your wrist and ribs are still healing. You need help for everything, and help is not always there.' },
  okafor: { minor: 'Daniel’s hand was crushed lifting blocks. He can still work, badly.', serious: 'A wall fell on the children’s corner. Ifeoma, six, has a fractured skull. She is in the hospital in Lissa, and Grace has to be with her.', ongoing: 'Ifeoma is home from hospital but needs care; Grace cannot work the cart while she watches her.' },
  mendes: { minor: 'Luis was hit by falling stones from the end wall. His shoulder is torn; the heavy work is now Ana’s.', serious: 'The end wall came down on Grandmother’s bed. Her hip is broken. She needs care day and night, and she cannot be moved far.', ongoing: 'Grandmother is bedridden with her broken hip. Someone has to stay with her all the time.' },
  amira: { minor: 'You twisted your back carrying Yusuf down the stairs in the shaking. Lifting him now takes everything you have.', serious: 'A stair landing collapsed under Nour. Her leg is broken. Now two of your children cannot manage the stairs.', ongoing: 'Nour’s leg is in plaster. Getting two children who cannot walk anywhere takes all day.' },
};

// ------------------------------------------------------------- living situations: the good and the bad
// Rolled when each chapter closes (from chapter 2). One good thing and at most one hard thing per chapter.
// mit: flags that halve the chance of a hard event.
export const STYPE_EVENTS = {
  collective: {
    good: [
      { p: 0.6, from: 2, to: 4, known: true, dims: { essentials: -0.4 }, text: 'Being in the collective centre means you are counted: hygiene kits, blankets and hot meals arrive here first.' },
      { p: 0.5, from: 5, known: true, dims: { essentials: -0.2 }, text: 'Agencies still come to the centre first. Whatever the programme, you hear about it.' },
    ],
    bad: [
      { p: 0.4, mit: ['partition', 'committee'], flags: { protection: true }, dims: { settlement: 0.4 }, text: 'There is no lock on the toilets and the lights in the corridor are broken. A girl from another family was followed at night. Now no woman or child goes to the toilet block alone.' },
      { p: 0.3, mit: ['partition'], res: { assets: -0.3, items: -0.3 }, text: 'Things go missing in the hall: a phone charger, a bag of clothes, the children’s boots. You start sleeping with your documents under your pillow.' },
      { p: 0.3, mit: ['committee'], dims: { essentials: 0.4 }, text: 'Diarrhoea goes through the hall. One toilet for every sixty people, and a queue for the tap. Two of you are sick for a week.' },
      { p: 0.35, mit: ['partition'], dims: { essentials: 0.2 }, text: 'Nobody sleeps properly: a baby crying, someone snoring, an argument at 2 a.m. The children are exhausted and the adults are short-tempered.' },
    ],
  },
  camp: {
    good: [
      { p: 0.55, known: true, dims: { essentials: -0.3 }, text: 'The site has water points, latrines and a registration desk. You are on every list.' },
    ],
    bad: [
      { p: 0.35, mit: ['community_strong', 'committee'], dims: { dwelling: 0.4 }, text: 'A storm tore through the rows. Your tent flooded and half your bedding was soaked.' },
      { p: 0.2, mit: ['safe_stove'], res: { items: -0.5 }, text: 'A cooking fire caught a tent three rows over. Five tents burned in minutes. You lost the things you had stacked outside.' },
      { p: 0.3, mit: ['community_strong'], flags: { protection: true }, dims: { settlement: 0.3 }, text: 'There is no lighting between the rows. Women walk to the latrines in pairs after dark.' },
      { p: 0.3, res: { cash: -15 }, text: 'Work and the market are a bus ride away now. Fares eat what little you earn.' },
    ],
  },
  hosted: {
    good: [
      { p: 0.6, dims: { essentials: -0.2 }, text: 'You are in a real home: a door, a kitchen, a bathroom. The children have their cousins and something like a normal routine.' },
    ],
    bad: [
      { p: 0.4, res: { goodwill: -0.4 }, text: 'Two families in one flat. The queue for the bathroom, the electricity bill, the noise — small things are becoming big things.' },
      { p: 0.35, known: false, text: 'Agency staff go to the sites, not to private flats. Volunteers keep missing you; families in the centres seem to get everything first.' },
    ],
  },
  rented: {
    good: [
      { p: 0.6, dims: { settlement: -0.2 }, text: 'A door that locks and a room that is yours. The children sleep through the night again.' },
    ],
    bad: [
      { p: 0.7, from: 3, mit: ['applied_rent', 'nrc', 'social_applied'], res: { cash: -45 }, text: 'The rent is due again. Every month it takes more of what you have.' },
      { p: 0.3, from: 4, maxDim: { tenure: 3.2 }, mit: ['nrc', 'applied_rent'], dims: { tenure: 0.4 }, text: 'Rents are rising all over town. The landlord mentions that others would pay more for this room.' },
      { p: 0.3, known: false, text: 'Renting on your own, you have dropped off the agencies’ radar. Nobody comes to check on you.' },
    ],
  },
  open: {
    good: [
      { p: 0.5, text: 'You are next to your house and your street. Nobody can strip it while you watch, and the neighbours are all around you.' },
    ],
    bad: [
      { p: 0.6, dims: { essentials: 0.4 }, text: 'Nights in the open are freezing. The little one has a chest infection; everyone is coughing.' },
      { p: 0.3, res: { items: -0.4 }, text: 'Someone took your blankets and the cooking pot while you queued for water.' },
    ],
  },
  makeshift: {
    good: [
      { p: 0.6, res: { goodwill: 0.3 }, text: 'Living beside your own house, you can guard it, keep working and start repairs yourselves.' },
    ],
    bad: [
      { p: 0.4, from: 3, dims: { essentials: 0.3 }, text: 'The shelter leaks and the cold gets in everywhere. Everyone is tired and ill by turns.' },
      { p: 0.3, known: false, text: 'Because you are “at home”, some agencies treat you as not displaced. You are not on their lists.' },
    ],
  },
  informal: {
    good: [
      { p: 0.5, dims: { essentials: -0.2 }, text: 'You built this place yourselves, close to the road and to work. Nobody tells you when to go to bed.' },
    ],
    bad: [
      { p: 0.45, maxDim: { tenure: 4.5 }, mit: ['committee', 'community_strong'], dims: { tenure: 0.4 }, text: 'Municipal officials came with a clipboard and photographed every shelter. Rumours of an eviction run through the settlement.' },
      { p: 0.4, dims: { settlement: 0.3 }, text: 'No latrines, no water point, no lights. The ditch by the road is now the toilet.' },
    ],
  },
  selfbuilt: {
    good: [
      { p: 0.6, dims: { essentials: -0.2 }, text: 'Your own walls, your own door. You rebuilt this — nobody gave it to you.' },
    ],
    bad: [
      { p: 0.35, notFlag: 'certificate', dims: { tenure: 0.3 }, text: 'Without papers, the land under your house still isn’t yours. A new notice on the Riverside lamp-post talks about “clearing the riverbank”.' },
    ],
  },
  away: {
    good: [
      { p: 0.6, dims: { essentials: -0.2 }, text: 'You are safe and warm. The aftershocks are something you see on the news.' },
    ],
    bad: [
      { p: 0.5, notFlag: 'house_watched', res: { assets: -0.3 }, text: 'News from home: empty houses on your street are being stripped for firewood and metal.' },
      { p: 0.4, known: false, text: 'Because you are not in the valley, you have dropped off the lists for repairs and cash.' },
    ],
  },
  home: {
    good: [
      { p: 0.6, text: 'You are in your own home, with your own things, among your own neighbours.' },
    ],
    bad: [],
  },
};

// ------------------------------------------------------------- trade-offs on existing options
// Keyed `${chapter}.${optionId}`. dims/res add to the option; risk = chance of injury; items = loads of goods retrieved;
// override replaces fields; also appends a sentence to the option's consequence.
export const PATCH = {
  '1.stay_doorway': { risk: 0.25, also: 'The doorway is the strongest part of the room — but this is old stone, and the shaking is not over.' },
  '1.wait_inside': { risk: 0.25, also: 'Inside is warm and familiar. It is also a damaged building in an earthquake that has not finished.' },
  '1.back_in': { risk: 0.3, also: 'Every creak of the building wakes you. You are warm, and you are gambling.' },
  '1.own_chair': { risk: 0.3, also: 'Toma begs you not to. The house is cracked from the floor to the ceiling.' },
  '1.stay_chair': { risk: 0.2 },
  '1.grab_first': { risk: 0.15, res: { docs: 1 }, also: 'Thirty seconds in a building that is still moving. You come out with the papers and the tools — and with your heart in your mouth.' },
  '1.dig_next': { risk: 0.15 },
  '1.lamp_first': { risk: 0.1, res: { goodwill: 0.5 }, also: 'Two houses down, an oil lamp started a fire that took three homes. Yours did not burn.' },
  '1.phone_daughter': { dims: { essentials: 0.2 }, also: 'The call takes twenty minutes and most of your battery.' },
  '1.animals': { risk: 0.15 },
  '1.ask_neighbours': { risk: 0.1, also: 'Carrying a wheelchair down three floors while the stairwell is still shaking is dangerous for everyone.' },
  '1.to_novaks': { res: { goodwill: -0.5 }, also: 'You arrive at 2 a.m., six of you, without warning. The Novaks have their own cracks to worry about.' },
  '1.toma_house': { res: { goodwill: -0.5 } },
  '1.in_barn': { dims: { settlement: 0.3 }, also: 'The animals keep you warm, and the smell and the dirt come with them.' },
  '1.neighbour_car': { dims: { essentials: 0.3 }, res: { goodwill: 0.5 }, also: 'Four of you in the back seat, the engine running for twenty minutes every hour.' },
  '2.salvage': { risk: 0.3, items: 2, override: { dims: {} }, also: 'Every step inside, you listen for the building.' },
  '2.front_room': { risk: 0.25 },
  '2.stay_flat': { risk: 0.25 },
  '2.flat_stay': { risk: 0.2 },
  '2.stay_stadium': { res: { goodwill: -0.5 }, also: 'The family you pushed past to get the better spot does not forget.' },
  '2.mama_joy': { res: { goodwill: -0.3 } },
  '2.barn_stay': { dims: { settlement: 0.3 } },
  '2.dig_kovac': { risk: 0.15, dims: { essentials: 0.2 } },
  '2.check_stall': { risk: 0.15, also: 'The covered market roof is hanging by one beam.' },
  '2.call_able': { dims: { essentials: 0.2 } },
  '2.help_street': { dims: { essentials: 0.2 } },
  '2.grace_cart': { res: { goodwill: -0.5 }, also: 'Selling at triple the price to hungry neighbours earns you money — and looks.' },
  '2.riverside_kitchen': { res: { cash: -10 } },
  '2.communal_kitchen': { res: { cash: -10 } },
  '2.round_up': { risk: 0.1, dims: { essentials: 0.2 } },
  '2.walk_road': { risk: 0.2 },
  '2.call_husband': { dims: { essentials: 0.2 } },
  '2.ask_mayor': { dims: { essentials: 0.2 } },
  '3.riverside_stay': { dims: { settlement: 0.3 } },
  '3.stadium_committee': { dims: { essentials: 0.2 } },
  '3.kamen_stay': { dims: { essentials: 0.3 } },
  '3.gym_stay': { dims: { settlement: 0.2 } },
  '3.a_sister_w3': { res: { goodwill: -0.5 } },
  '3.karim_street': { dims: { essentials: 0.2 } },
  '3.queue_aid': { res: { cash: -15 }, also: 'Days in queues are days not earning.' },
  '3.repair_help': { risk: 0.1 },
  '3.jeep_ask': { dims: { essentials: 0.2 } },
  '3.amira_volunteer': { dims: { essentials: 0.2 } },
  '3.amira_cousin': { res: { goodwill: -0.5 } },
  '3.p_home_w3': { risk: 0.2 },
  '3.front_room_stay': { risk: 0.15 },
  '4.nrc_lawyer': { res: { goodwill: -0.5 }, dims: { essentials: 0.2 }, also: 'Word gets back that you have “gone to lawyers”. Some people stop being friendly.' },
  '4.h_volunteer4': { res: { cash: -20 }, also: 'Leila’s days with the Red Cross are days not at the bakery.' },
  '4.riverside_organise': { dims: { essentials: 0.2 } },
  '4.find_deed': { risk: 0.2, also: 'Toma is digging through a kitchen with half a ceiling.' },
  '4.orchard_committee': { dims: { essentials: 0.2 } },
  '4.goats_to_kamen': { res: { assets: -0.2 } },
  '4.a_able4': { dims: { essentials: 0.2 } },
  '4.amira_school': { dims: { essentials: 0.2 } },
  '4.c_partition': { flags: { partition: true } },
  '4.c_committee': { res: { goodwill: -0.5 }, also: 'The centre manager does not like being told what the centre needs.' },
  '4.h_chores': { res: { cash: -10 }, dims: { essentials: 0.2 } },
  '4.away_nothing': { flags: { house_stripped: true }, res: { assets: -0.3 } },
  '5.h_rent_support': { dims: { essentials: 0.2 } },
  '5.p_register_repair': { dims: { essentials: 0.2 } },
  '5.o_stadium_stay': { dims: { settlement: 0.2 } },
  '5.m_work_party': { res: { assets: -0.2 } },
  '5.m_gym_stay': { res: { assets: -0.5 }, also: 'The animals are two hours up the road, in other people’s care.' },
  '5.a_rent_support': { dims: { essentials: 0.2 } },
  '5.a_sister': { res: { goodwill: -0.5 } },
  '5.h_rc_job': { res: { goodwill: -0.5 }, also: 'Some neighbours now think Leila decides who gets cash. She doesn’t; they don’t believe her.' },
  '5.o_builder': { risk: 0.1, dims: { essentials: 0.2 } },
  '5.a_teach': { dims: { essentials: 0.2 } },
  '5.a_outreach': { res: { goodwill: -0.3 } },
  '6.share_heat': { dims: { settlement: 0.3 }, also: 'When one person gets flu, everyone gets flu.' },
  '6.c_ask_rc': { res: { goodwill: -0.2 } },
  '6.away_warm': { dims: { tenure: 0.3 } },
  '6.rc_clinic': { dims: { essentials: 0.3 }, also: 'The clinic comes on Thursday. It is Monday.' },
  '6.savings_pot': { res: { goodwill: -0.5 } },
  '6.burn_scrap': { risk: 0.1 },
  '7.h_area': { dims: { essentials: 0.2 } },
  '7.p_repair_proper': { res: { cash: -30 }, dims: { essentials: 0.3 }, also: 'Six weeks living in a building site.' },
  '7.p_daughter7': { res: { goodwill: -1 } },
  '7.p_able7': { dims: { essentials: 0.2 } },
  '7.o_upgrade': { res: { cash: -30 } },
  '7.o_back': { res: { cash: -40 } },
  '7.a_social': { dims: { essentials: 0.2 } },
  '7.a_sister7': { res: { goodwill: -0.5 } },
  '7.inv_restock': { dims: { essentials: 0.2 } },
  '8.settle_here': { res: { cash: -20 } },
};

export function patchChapters(chapters) {
  for (const ch of chapters) for (const st of ch.steps) for (const o of st.options) {
    const p = PATCH[`${ch.n}.${o.id}`]; if (!p || o._patched) continue;
    Object.assign(o, p.override || {});
    for (const k of ['dims', 'res']) if (p[k]) { o[k] = { ...(o[k] || {}) }; for (const [d, v] of Object.entries(p[k])) o[k][d] = Math.round(((o[k][d] || 0) + v) * 10) / 10; }
    if (p.flags) o.flags = { ...(o.flags || {}), ...p.flags };
    if (p.risk) o.risk = p.risk;
    if (p.items) o.items = p.items;
    if (p.also) o.after = `${o.after || ''} ${p.also}`.trim();
    if (p.risk && !/risk|danger|gambl|shaking|ceiling|roof|listen/i.test(o.detail || '')) o.detail = `${o.detail ? o.detail + ' ' : ''}Risky in a damaged building.`;
    o._patched = true;
  }
}

// ------------------------------------------------------------- the community around you
// Background distribution of households by phase (% in phases 1..5), per municipality, by chapter (0 = before).
const P4 = { varenna: [2, 45, 50, 42, 36, 30, 34, 40, 24], brena: [1, 12, 14, 12, 11, 9, 12, 15, 8], lissa: [2, 30, 33, 27, 22, 18, 22, 26, 15], dolna: [2, 20, 22, 18, 15, 12, 16, 18, 10], kamen: [3, 55, 62, 48, 42, 35, 42, 38, 26] };
export function areaBase(muni, ch) {
  const p45 = (P4[muni] || P4.varenna)[Math.max(0, Math.min(8, ch))];
  const p5 = Math.round(p45 * 0.3), p4 = p45 - p5, p3 = ch === 0 ? 8 : Math.round(Math.min(35, 15 + p45 * 0.4)), p2 = Math.round((100 - p45 - p3) * 0.55);
  return [100 - p45 - p3 - p2, p2, p3, p4, p5];
}
export const AREA_N = 60, PLAYER_WEIGHT = 3; // background households per municipality; each player family counts as 3
export function areaSummary(dist) {
  const tot = dist.reduce((a, b) => a + b, 0) || 1, share = ph => dist.slice(ph - 1).reduce((a, b) => a + b, 0) / tot;
  return { phase20: [5, 4, 3, 2, 1].find(ph => share(ph) >= 0.2) || 1, p45: Math.round(share(4) * 100), p3plus: Math.round(share(3) * 100) };
}
