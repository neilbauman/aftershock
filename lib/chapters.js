// Aftershock v2 — story mode. Five families, eight chapters across the first year.
// Every player plays one family. Several players can play the same family independently.

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
  barn: 'In the barn, with the animals', yard: 'A shelter in the yard', orchard: 'The orchard by the Lissa bypass road', riverside: 'Rebuilding at Riverside',
};
export const SITE_LOCS = ['school', 'stadium', 'gym'];
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

export const CHAPTERS = [
  // ======================================================================= 1
  { n: 1, title: 'The shaking', time: 'Night 0 · 21:40',
    scene: {
      haddad: ['It is 21:40 on a cold Tuesday in late autumn. Leila is washing up; Karim is counting the day’s takings at the table. The floor lifts. Plates leap from the rack. A roar like a train fills the stairwell and the lights go out.',
        'The children are screaming from the back bedroom. It lasts forty seconds. When it stops there is dust in your mouth and a new sound: the building creaking, and people shouting in the street below. By the light of a phone you can see a crack running across the ceiling.'],
      petrov: ['21:40. You are in your armchair with the radio on when the house begins to groan. The china cabinet falls. The radio dies. Your frame is by the door, three steps away, and you cannot stand while the floor moves.',
        'When it stops, the room is black and full of dust. Your heart is pounding. From the street you hear Toma, the neighbours’ boy, shouting your name.'],
      okafor: ['21:40. The children are asleep on the mattress; Daniel is mending a shoe by the gas lamp. The house shakes like a box in the back of a truck. The back wall — breeze blocks Daniel laid himself — folds inward towards the mattress. Grace pulls the youngest out by her arm.',
        'When the shaking stops, half your home is rubble. The lamp is rolling on the floor, its flame flickering. Next door, someone is screaming.'],
      mendes: ['21:40. Supper is over and Luis’s mother is dozing by the stove. The earthquake is right under you — it feels as if the mountain itself has moved. Stones fall from the end wall of the house. In the barn the cow is bellowing.',
        'When it stops, the children are white with dust but whole. Grandmother has a cut on her forehead. Across the valley you hear a long, low rumble: a landslide, somewhere down on the road.'],
      amira: ['21:40. Homework at the kitchen table; Yusuf reading in his wheelchair by the window. The building sways. Cupboards burst open. The lights go out.',
        'When it stops you know the problem at once: you are on the third floor, there is no lift, and Yusuf cannot get down the stairs unless he is carried — and you have two other children. Outside your door, neighbours are running down the stairwell in the dark.'],
    },
    steps: [
      { id: 'f1', prompt: 'The first minutes. What do you do?', options: [
        { id: 'out_now', for: ['haddad'], label: 'Get everyone out to the street, now', detail: 'Leave everything.', set: { loc: 'open' }, dims: { essentials: 0.5 }, flags: { left_everything: true },
          after: 'You carry the youngest down two flights in the dark, the others holding Leila’s coat. Outside, the whole street is in pyjamas and coats. Behind you a piece of cornice crashes onto the pavement where you were standing a minute ago.' },
        { id: 'grab_first', for: ['haddad'], label: 'Grab money, papers and Karim’s tools — then get out', detail: 'Thirty seconds that could matter.', set: { loc: 'open' }, res: { assets: 0.5 }, flags: { saved_tools: true },
          after: 'Leila fills a bag with the cash tin, phones and Karim’s repair kit while Karim herds the children. An aftershock hits on the stairs; you all make it down with plaster in your hair. Whatever happens next, Karim can still fix phones.' },
        { id: 'stay_doorway', for: ['haddad'], label: 'Shelter in the doorways until it is really over', detail: 'Running down stairs in an aftershock kills people.', flags: { stayed_inside: true },
          after: 'You crouch in the doorframes for an hour through two aftershocks. At midnight a neighbour bangs on the door: “Everyone out — the front wall is leaning!” You go down with nothing.' },
        { id: 'call_toma', for: ['petrov'], label: 'Call out to Toma to help you', detail: 'He is sixteen. He will come.', set: { loc: 'open' }, res: { goodwill: 1 }, flags: { toma_helped: true },
          after: 'Toma climbs in through the broken window, finds your frame and your glasses, and walks you out step by step. His mother wraps you in her own coat. “You’re with us tonight, Baba Vera.”' },
        { id: 'stay_chair', for: ['petrov'], label: 'Stay in your chair and wait for daylight', detail: 'This is your house.', dims: { essentials: 0.5 }, flags: { alone_night: true },
          after: 'You sit in the dark with your hands folded. At 3 a.m. an aftershock brings down the kitchen ceiling. Nobody comes in. You are cold, and more frightened than you have been since the war.' },
        { id: 'phone_daughter', for: ['petrov'], label: 'Try to phone your daughter', detail: 'She will know what to do.', flags: { daughter: true },
          after: 'The line is dead. Twenty minutes later a text gets through: “Mama are you ok?? Roads closed. I’ll come as soon as I can.” It is a comfort, but she is six hours away. Toma finds you just before midnight and takes you to his family.', set: { loc: 'open' } },
        { id: 'lamp_first', for: ['okafor'], label: 'Put out the lamp before anything else', detail: 'A fire in Riverside spreads fast.', flags: { fire_avoided: true },
          after: 'Daniel throws a blanket over the flame. Two lanes away, someone’s lamp was not put out: by midnight four homes have burned. Yours, what is left of it, has not.' },
        { id: 'dig_next', for: ['okafor'], label: 'Run to help the screaming neighbours', detail: 'Mama Joy’s house is next door.', flags: { dug_out: true, community_strong: true }, dims: { essentials: 1 }, res: { goodwill: 1 },
          after: 'You and Daniel dig with your hands and pull Mama Joy’s grandson out from under her fallen wall, bleeding but alive. When you turn round, your mattress is smouldering — the lamp. You lose the bedding and the children’s clothes. Riverside will not forget what you did tonight.' },
        { id: 'run_open', for: ['okafor'], label: 'Grab the children and run to the open ground by the river', detail: 'Away from walls.', set: { loc: 'open' }, dims: { essentials: 0.5 },
          after: 'You run with the children to the riverbank. Behind you, someone shouts about fire. By the time you look back, two lanes of Riverside are burning — but not yours.' },
        { id: 'animals', for: ['mendes'], label: 'Check the animals and the barn', detail: 'The animals are everything you have.', res: { assets: -0.5 }, flags: { saw_barn: true },
          after: 'The barn roof has held. The cow is wild-eyed but standing. One goat lies dead under fallen stones and two have bolted into the dark. Behind you, Ana is bandaging Grandmother’s head with a dishcloth.' },
        { id: 'family_yard', for: ['mendes'], label: 'Tend Grandmother and get everyone into the yard', detail: 'People first.', dims: { essentials: -0.3 }, flags: { grandmother_ok: true },
          after: 'You clean Grandmother’s cut with water from the bucket and bring blankets into the yard. In the barn the animals are crying; you will see to them at first light.' },
        { id: 'church_bell', for: ['mendes'], label: 'Run to the church and ring the bell for the village', detail: 'Get everyone together.', flags: { village_organised: true, community_strong: true }, res: { goodwill: 1 },
          after: 'Within half an hour forty families are in the square by lamplight. Old Petru says two houses are down on the upper lane with people inside. The men go up with spades. It is nobody’s job to organise this. You just did.' },
        { id: 'carry_yusuf', for: ['amira'], label: 'Carry Yusuf down yourself', detail: 'Nour and Sami hold on to your coat.', set: { loc: 'open' }, dims: { essentials: 0.5 }, flags: { chair_left: true },
          after: 'Eleven years old and heavy. You carry him down three flights in the dark, Nour and Sami clinging to your coat. You reach the street shaking. Yusuf’s wheelchair is still upstairs.' },
        { id: 'ask_neighbours', for: ['amira'], label: 'Shout for neighbours to help carry Yusuf in his chair', detail: 'Mr Haxhi is on the floor below.', set: { loc: 'open' }, res: { goodwill: 1 }, flags: { haxhi_helped: true, community_strong: true },
          after: 'Mr Haxhi and his son carry Yusuf down in his wheelchair between them, step by careful step. You will remember who helped tonight.' },
        { id: 'wait_inside', for: ['amira'], label: 'Stay inside with the children until it is light', detail: 'The stairs are packed and dark.', flags: { stayed_inside: true },
          after: 'You hold the children on the bed through four aftershocks. By midnight yours is the only family left in the building. Nobody knocks.' },
      ] },
      { id: 'f2', prompt: 'Where do you spend the rest of the night?', options: [
        { id: 'street_night', for: ['haddad', 'amira'], label: 'In the street with the neighbours', detail: 'Cold, but nobody is alone.', set: { loc: 'open' }, dims: { essentials: 0.5 }, flags: { street_night: true },
          after: 'The neighbours light a fire in an oil drum. Someone shares bread. Nobody sleeps. Every aftershock brings a wave of screams, then nervous laughter.' },
        { id: 'to_novaks', for: ['haddad'], label: 'Walk to Leila’s cousins, the Novaks, in Brena', detail: 'An hour on foot with four children.', set: { loc: 'host', muni: 'brena', group: 'hosted' }, dims: { essentials: -0.5, settlement: -1 }, flags: { with_novaks: true },
          after: 'You arrive at 2 a.m. Ivana Novak opens the door in her dressing gown and pulls you all inside without a word. Their flat has only cracked plaster. Twelve people in two bedrooms, but warm.' },
        { id: 'back_in', for: ['haddad', 'amira'], label: 'Go back inside — it’s freezing', detail: 'The building is still standing.', set: { loc: 'home' }, dims: { essentials: -0.5 }, flags: { risk_inside: true },
          after: 'You creep back up the stairs and sleep in your coats. At 4 a.m. an aftershock shakes the building again and nobody moves; you just hold on.' },
        { id: 'toma_house', for: ['petrov'], when: { notFlag: 'alone_night' }, label: 'Stay with Toma’s family in their yard', detail: 'They have put up a tarpaulin.', set: { loc: 'host', group: 'hosted' }, flags: { with_toma: true }, dims: { essentials: -0.5 },
          after: 'Toma’s mother makes you a bed of cushions under the tarpaulin. You doze between aftershocks, listening to the family breathe around you.' },
        { id: 'own_chair', for: ['petrov'], label: 'Insist on going back to your own house', detail: 'You won’t be a burden.', set: { loc: 'home' }, dims: { essentials: 0.5 }, flags: { stubborn: true },
          after: 'You make it to your armchair. The kitchen is rubble. You sit with your coat on, and when the dawn comes you are still awake.' },
        { id: 'riverbank', for: ['okafor'], label: 'On the riverbank with the other Riverside families', detail: 'Everyone together.', set: { loc: 'open' }, dims: { essentials: 0.3 }, flags: { riverbank: true },
          after: 'Three hundred families on the riverbank under plastic sheets and blankets. Mama Joy goes from group to group. Someone has a radio: the earthquake was 6.8, and the epicentre was up in Morava.' },
        { id: 'stadium_night', for: ['okafor'], label: 'Walk to the stadium where people are gathering', detail: 'There are lights there — a generator.', set: { loc: 'stadium', group: 'site' }, dims: { essentials: -0.3, settlement: 0.5 }, flags: { stadium_early: true },
          after: 'The stadium car park is full of families. Municipal workers have run a generator for floodlights. Nobody is in charge, but there is light, and somehow that helps.' },
        { id: 'in_barn', for: ['mendes'], label: 'Sleep in the barn with the animals', detail: 'The roof held.', set: { loc: 'barn' }, dims: { essentials: -0.3 }, flags: { in_barn: true },
          after: 'You bed down in the straw, eight people and a cow. It smells, and it is the warmest place in Kamen tonight.' },
        { id: 'church_square', for: ['mendes'], label: 'In the church square with the whole village', detail: 'Nobody should be alone.', set: { loc: 'open' }, dims: { essentials: 0.3 }, flags: { village_square: true, community_strong: true },
          after: 'The village shares out blankets and makes a fire. The priest says a prayer for the people from the upper lane. At dawn the men come down: one person is dead, three are hurt.' },
        { id: 'neighbour_car', for: ['amira'], label: 'Sleep in a neighbour’s car with the children', detail: 'Mr Haxhi offers his.', set: { loc: 'open' }, flags: { car_night: true },
          after: 'Four of you in the back of Mr Haxhi’s car, the engine running for heat every hour. Yusuf sleeps with his head on your shoulder.' },
      ] },
    ],
    response: [],
    bridge: {
      haddad: [{ if: { loc: ['host'] }, text: 'You woke on the Novaks’ living-room floor with your children around you. Ivana was already making tea.' },
        { if: { loc: ['open'] }, text: 'Dawn came grey over the Old Town. You had not slept.' },
        { if: { loc: ['home'] }, text: 'You woke in your coats on the floor of the flat, stiff with cold and fear.' }],
      petrov: [{ if: { loc: ['host'] }, text: 'You woke under the tarpaulin in Toma’s yard, his mother pressing a cup of tea into your hands.' },
        { if: { loc: ['home', 'open'] }, text: 'Morning came slowly through the broken window.' }],
      okafor: [{ if: { loc: ['stadium'] }, text: 'Morning at the stadium: hundreds of families now, and more arriving.' },
        { if: { loc: ['open', 'home'] }, text: 'Morning on the riverbank. Smoke still rising from the burned lanes.' }],
      mendes: ['Morning came cold and clear over Kamen.'],
      amira: [{ if: { loc: ['open'] }, text: 'Morning came after a night that would not end.' }, { if: { loc: ['home'] }, text: 'Morning came. You had not slept, and the children had, eventually.' }],
    } },

  // ======================================================================= 2
  { n: 2, title: 'The morning after', time: 'Day 1',
    scene: {
      haddad: ['In daylight you see your building properly. The front wall has pulled away from the rest by the width of a hand. Someone has sprayed a red question mark on the door. No engineer has come.',
        'The covered market roof has fallen in — on top of Karim’s stall. The bakery where Leila works is closed. One corner shop is open, selling bread at three times the price; the queue goes round the block. There is no water from the taps.',
        'At the end of the street, neighbours are digging through the rubble of the Kovač house with their hands. Then Mr Dragan, your landlord, arrives in his car. Nobody is to go into the building, he says — and the rent is still due on the 1st.'],
      petrov: ['In daylight the damage is clear. The back wall of your house has cracked from top to bottom and the kitchen ceiling is on the floor. The front room is standing. The stairs to the bedroom are impossible now, frame or no frame.',
        'Your heart pills were in the kitchen. The pharmacy on the corner has its shutters down. The post office, where your pension comes on the 10th, has lost its windows.',
        'Toma’s mother brings soup. In the street, young people from the Varennan Red Cross are going door to door with clipboards — in some streets, not in others.'],
      okafor: ['In daylight Riverside looks like it has been bombed. Half the houses are down; two lanes are burned. Your back wall is rubble and the tin roof hangs off one corner. You can save the blocks, the roof sheets and the door.',
        'Municipal workers in yellow vests walk through at nine. A man with a megaphone says Riverside is government land and nobody may rebuild here. Then they leave.',
        'Daniel’s building site is closed. The market is shut, so Grace can’t sell. Everyone is talking about the stadium: the Red Cross is giving out water there.'],
      mendes: ['Daylight shows the end wall of the house bulging and two cracks running down from the roof. The kitchen is usable. The road down the mountain is gone under a landslide below the bridge; nobody can get out, and nobody can get in. The phones are dead.',
        'Two houses on the upper lane collapsed. Old Marta did not survive; three others are hurt. The well is running muddy.',
        'The village is already organising itself. The women have set up a kitchen in the church. The men are clearing the upper lane. Your animals are scattered across the hillside.'],
      amira: ['In daylight the building looks almost normal from outside, but the stairwell walls are cracked through and a slab hangs from the third-floor landing. Nobody from the municipality has come to check it.',
        'The school is closed — your job with it. The transfer office where your husband’s money arrives is shut. Phones work for a minute at a time.',
        'Someone says the gymnasium has been opened for families, but it has steps at every door and a single toilet block across the yard. Your sister calls: she has a room, up two flights of stairs. Nobody from outside Lissa has come.'],
    },
    steps: [
      { id: 'f1', prompt: 'Your home. What do you do about it today?', options: [
        { id: 'salvage', for: ['haddad'], label: 'Go in quickly and bring out what you can', detail: 'Clothes, bedding, the children’s school things.', dims: { essentials: -1 }, res: { assets: 0.5 }, flags: { salvaged: true },
          after: 'Karim goes up alone while Leila watches the wall. Four trips: blankets, clothes, the rice and oil, the children’s school bags. On the fourth trip a chunk of plaster falls behind him. He doesn’t go back again.' },
        { id: 'wait_engineer', for: ['haddad'], label: 'Stay out until an engineer has checked it', detail: 'You have four children.', flags: { waiting_engineer: true },
          after: 'You stay out. The engineer does not come today, or tomorrow. Your blankets and clothes stay upstairs behind the red question mark.' },
        { id: 'ask_dragan', for: ['haddad'], label: 'Ask Mr Dragan what he will do about the building', detail: 'And about you.', flags: { asked_dragan: true }, dims: { tenure: 0.5 },
          after: '“The building is my problem,” he says. “If it can be saved I will repair it. If not…” He shrugs. “I have a buyer who wants the land.” You realise your handshake is worth nothing.' },
        { id: 'front_room', for: ['petrov'], label: 'Live in the front room — it is still standing', detail: 'Your home, your things.', set: { loc: 'home', group: 'nondisp' }, dims: { dwelling: 0.5 }, flags: { front_room: true },
          after: 'Toma helps you drag the bed into the front room. It is cold, the window is boarded with cardboard, and the crack in the back wall grows a little each aftershock. But you are home.' },
        { id: 'with_toma', for: ['petrov'], label: 'Accept Toma’s mother’s offer to stay with them', detail: 'Their house is only cracked plaster.', set: { loc: 'host', group: 'hosted' }, dims: { dwelling: -1, essentials: -0.5 }, flags: { with_toma: true },
          after: 'They give you the small room off the kitchen. You feel useless and grateful in equal measure.' },
        { id: 'to_school', for: ['petrov', 'haddad'], label: 'Go to School No. 3 — someone says it is open for families', detail: 'There will be help there.', set: { loc: 'school', group: 'site' }, dims: { dwelling: -0.5, settlement: 0.5, tenure: -1 }, flags: { at_school: true },
          after: 'The classrooms are filling up with mattresses. A municipal clerk is writing names in an exercise book. There are two toilets for three hundred people, and they are up a flight of steps.' },
        { id: 'rebuild_shack', for: ['okafor'], label: 'Rebuild with what you can salvage', detail: 'Blocks, roof sheets, the door — and your own hands.', set: { loc: 'riverside' }, dims: { dwelling: -1 }, res: { cash: -15 }, flags: { self_rebuilt: true }, ctx: { home: 'A smaller home rebuilt from salvaged blocks and sheets, on the same plot.' },
          after: 'By evening you and Daniel have one room back up: salvaged blocks, the old roof sheets, a tarpaulin bought for 15. The neighbours help; you help them. The man with the megaphone does not come back — today.' },
        { id: 'go_stadium', for: ['okafor'], when: { notLoc: ['stadium'] }, label: 'Take the children to the stadium', detail: 'Water, light, and maybe help.', set: { loc: 'stadium', group: 'site' }, dims: { settlement: 0.5, essentials: -0.5 }, flags: { stadium_early: true },
          after: 'The stadium car park is a sea of plastic sheeting. You claim a patch of tarmac near the fence. The water truck comes twice a day.' },
        { id: 'stay_stadium', for: ['okafor'], when: { loc: ['stadium'] }, label: 'Stay at the stadium', detail: 'At least there is water.', flags: { stadium_early: true },
          after: 'You stay. By afternoon there are two thousand people in the car park and the latrines are overflowing.' },
        { id: 'mama_joy', for: ['okafor'], label: 'Move in with Mama Joy’s family — her front room survived', detail: 'Riverside looks after its own.', set: { loc: 'host', group: 'hosted' }, dims: { dwelling: -0.5 }, flags: { with_mama_joy: true },
          after: 'Mama Joy clears a corner for you. “After last night,” she says, “you are my family.”', when: { flag: 'dug_out' } },
        { id: 'shore_wall', for: ['mendes'], label: 'Shore up the end wall with timber from the barn', detail: 'Make the house safe enough to sleep in.', set: { loc: 'home' }, dims: { dwelling: -1 }, res: { assets: -0.3 }, flags: { shored: true },
          after: 'You and Luis cut props from the barn rafters and wedge them against the bulging wall. It is not pretty. Petru, who built half the houses in Kamen, nods: “It will hold until spring.”' },
        { id: 'yard_shelter', for: ['mendes'], label: 'Build a shelter in the yard from doors and tarpaulins', detail: 'Don’t trust the house.', set: { loc: 'yard' }, dims: { dwelling: -0.5, essentials: 0.3 }, flags: { yard_shelter: true },
          after: 'Two old doors, the hay tarpaulin and a lot of rope. Eight people under it, cooking on a fire outside. It keeps the rain off, mostly.' },
        { id: 'barn_stay', for: ['mendes'], label: 'Stay in the barn', detail: 'The roof held.', set: { loc: 'barn' }, flags: { in_barn: true },
          after: 'You make the barn a home of sorts: straw beds, the stove from the kitchen, a curtain across one corner for Grandmother.' },
        { id: 'to_sister', for: ['amira'], label: 'Go to your sister’s flat across town', detail: 'A room — up two flights of stairs.', set: { loc: 'host', group: 'hosted' }, dims: { dwelling: -1, settlement: 0.5 }, flags: { at_sister: true },
          after: 'Your sister hugs you all at the door. The room is small and Yusuf cannot leave it without being carried. But it is safe, and it is family.' },
        { id: 'to_gym', for: ['amira'], label: 'Go to the gymnasium', detail: 'Steps at every door; one toilet block across the yard.', set: { loc: 'gym', group: 'site' }, dims: { dwelling: -0.5, settlement: 1 }, flags: { at_gym: true },
          after: 'Two neighbours carry Yusuf’s chair up the steps. Inside: rows of gym mats, a municipal clerk with a list, and the toilet block across a gravel yard his wheels sink into.' },
        { id: 'stay_flat', for: ['amira'], label: 'Stay in your flat', detail: 'Nobody has said it is unsafe.', set: { loc: 'home' }, dims: { settlement: 0.5 }, flags: { stayed_flat: true },
          after: 'You stay. Each time the building creaks you look at the slab hanging over the landing. Yusuf hasn’t been outside since last night.' },
      ] },
      { id: 'f2', prompt: 'The day itself. Where do you put your energy?', options: [
        { id: 'dig_kovac', for: ['haddad'], label: 'Join the neighbours digging at the Kovač house', detail: 'Mrs Kovač’s husband is still inside.', flags: { community_strong: true, helped_dig: true }, res: { goodwill: 1 },
          after: 'You dig all morning in a line of neighbours passing stones hand to hand. At noon a Red Cross volunteer team arrives with a stretcher. They bring out Mr Kovač alive. A volunteer writes your names on her clipboard.', knownP: 0.8 },
        { id: 'bread_queue', for: ['haddad', 'okafor', 'amira'], label: 'Queue for bread and water', detail: 'Prices have tripled.', res: { cash: -30 }, dims: { essentials: -0.5 },
          after: 'Three hours in a queue. Thirty for what used to cost ten. The children eat.' },
        { id: 'check_stall', for: ['haddad'], label: 'Go to the market and see what is left of the stall', detail: 'Karim’s livelihood.', flags: { checked_stall: true }, res: { assets: 0.5 },
          after: 'Karim climbs into the wreckage of the market with other stallholders. He comes back with a box of phone parts and a car battery. “People need their phones charged,” he says. “I can do that from the street.”' },
        { id: 'find_pills', for: ['petrov'], label: 'Send Toma to find your heart pills', detail: 'Anywhere that is open.', res: { cash: -20 }, dims: { essentials: -0.5 }, flags: { pills: true },
          after: 'Toma cycles across town and comes back with a week’s supply from a pharmacy in Brena. He refuses to take your money for the bicycle part.' },
        { id: 'call_able', for: ['petrov', 'amira'], label: 'Call Able Varenna', detail: 'They know you. They know what you need.', knownP: 0.85, flags: { able_contact: true },
          after: 'The line is busy for an hour. Then Dragana from Able Varenna answers: “We’re making a list of every member and what they need. You’re on it.” She asks about medicines, toilets, stairs.' },
        { id: 'help_street', for: ['petrov'], label: 'Sit at your door and keep a list of who on the street needs what', detail: 'You can’t dig, but you can organise.', flags: { community_strong: true, petrov_list: true }, res: { goodwill: 1 },
          after: 'You know everyone on this street. By evening your list covers twenty-two households — who is hurt, who is old, whose house is down. When the Red Cross volunteers come by, they copy it.', knownP: 0.9 },
        { id: 'daniel_rubble', for: ['okafor'], label: 'Daniel offers his labour clearing rubble for cash', detail: 'Contractors need hands.', res: { cash: 50 }, dims: { essentials: 0.3 },
          after: 'Daniel finds a contractor clearing a collapsed shop. Fifty for a day of carrying rubble. He comes home grey with dust and coughing.' },
        { id: 'grace_cart', for: ['okafor'], label: 'Grace sells vegetables from her cart at the new prices', detail: 'People need food. You need money.', res: { cash: 40 }, flags: { grace_trading: true },
          after: 'Grace sells everything she has by noon at double the price. She feels ashamed and relieved at the same time.' },
        { id: 'riverside_kitchen', for: ['okafor'], label: 'Help Mama Joy set up a shared kitchen for Riverside', detail: 'Pool what everyone has.', flags: { community_strong: true }, dims: { essentials: -0.5 }, res: { goodwill: 1 },
          after: 'Twenty families pool rice, oil and firewood. You cook in a burned-out house with no roof. Nobody in Riverside goes hungry tonight.' },
        { id: 'communal_kitchen', for: ['mendes'], label: 'Join the communal kitchen and the clearing', detail: 'The village works as one.', flags: { community_strong: true }, dims: { essentials: -0.5 }, res: { goodwill: 1 },
          after: 'Ana cooks for sixty in the church; Luis spends the day with the men clearing the upper lane. Everyone eats. Everyone is exhausted.' },
        { id: 'round_up', for: ['mendes'], label: 'Round up the scattered animals', detail: 'Before they are lost or stolen.', res: { assets: 0.5 }, flags: { animals_gathered: true },
          after: 'It takes all day on the hillside, but you bring back the cow and fifteen goats. Three are gone.' },
        { id: 'walk_road', for: ['mendes'], label: 'Walk down to the landslide to see if anyone can get through', detail: 'Two hours each way.', flags: { saw_landslide: true },
          after: 'Below the bridge, half the mountain has slid across the road. On the other side you see a Red Cross jeep and people waving. Someone shouts across: “Days! Maybe a week!”' },
        { id: 'call_husband', for: ['amira'], label: 'Get through to your husband abroad', detail: 'You need money and a plan.', res: { cash: 50 }, flags: { husband_call: true },
          after: 'Forty attempts. Then his voice, cracking. He can send money through a cousin with a car, but the transfer office is closed and it will take days. A neighbour lends you 50 against it.' },
        { id: 'ask_mayor', for: ['amira'], label: 'Go to the town hall and ask for help', detail: 'Someone must be in charge.', knownP: 0.6, flags: { asked_mayor: true },
          after: 'The town hall is chaos. A tired clerk writes your name in a ledger. The mayor walks past, grey-faced, on the phone. “Help is coming,” the clerk says. Nobody believes her.' },
      ] },
      { id: 'f3', prompt: 'Tonight you hear that the Varennan Red Cross is registering families. Do you give your name?', options: [
        { id: 'register', when: { muni: ['varenna', 'brena', 'lissa'] }, label: 'Yes — find the volunteers and register', detail: 'Names, needs, where you are.', knownP: 0.85, flags: { registered: true },
          after: 'A volunteer with a Red Cross vest writes your family into a notebook by torchlight. “We’ll come back,” she says. She looks as tired as you are. Later you learn she lost her own home last night.' },
        { id: 'dont_register', label: 'No — not yet', detail: 'You don’t know who will see your details, or what it will mean.', flags: { avoided_lists: true },
          after: 'You keep your name to yourself for now.' },
        { id: 'village_list', for: ['mendes'], label: 'Give your name to the village list instead', detail: 'The priest is writing down every family and their losses.', knownP: 0.3, flags: { village_list: true },
          after: 'The priest writes it all in the parish book: eight people, house damaged, three goats lost. “When they come,” he says, “we will be ready.”' },
      ] },
    ],
    response: [
      { actor: 'Varennan Red Cross volunteers', when: { known: true, muni: ['varenna', 'brena'] }, prob: 0.8, dims: { essentials: -0.5 }, text: 'Two Red Cross volunteers came back as promised, with a tarpaulin, a hygiene kit and water purification tablets.' },
      { actor: 'Varennan Red Cross volunteers', when: { known: false, muni: ['varenna'], loc: ['home', 'open', 'riverside'] }, prob: 0.3, known: true, dims: { essentials: -0.3 }, text: 'A Red Cross volunteer team, going street by street, found you and took your details.' },
      { actor: 'Able Varenna', when: { flag: 'able_contact' }, prob: 0.9, dims: { essentials: -0.5 }, text: 'Dragana from Able Varenna came in person with a commode chair, a torch and a list of the pharmacies that are open.' },
      { actor: 'Municipality', when: { family: ['okafor'], loc: ['riverside'] }, prob: 0.7, dims: { tenure: 0.5 }, text: 'The men in yellow vests came back to Riverside and painted numbers on the rebuilt shacks. Nobody would say what the numbers meant.' },
      { actor: 'Nobody', when: { muni: ['kamen'] }, prob: 1, text: 'No help could reach Kamen: the road stayed closed. The village fed itself.' },
      { actor: 'Nobody', when: { muni: ['lissa'], known: false }, prob: 1, text: 'No organisation came to your part of Lissa.' },
    ],
    bridge: {
      haddad: [{ if: { loc: ['host'] }, text: 'Your second night at the Novaks’. Ivana’s husband Marko is kind, but you see him counting the bread.' },
        { if: { loc: ['school'] }, text: 'Your first nights at School No. 3: forty people in your classroom, a baby crying somewhere all night.' },
        { if: { loc: ['open', 'home'] }, text: 'The nights near the building are bitter. Leila says what you are all thinking: you cannot go on like this.' }],
      petrov: [{ if: { loc: ['home'] }, text: 'Nights in the front room are cold and long. Toma comes twice a day.' }, { if: { loc: ['host'] }, text: 'Toma’s family are kind. You try to take up as little space as possible.' }, { if: { loc: ['school'] }, text: 'At the school, the toilet is up a flight of steps. You stop drinking water in the evenings so you won’t need it at night.' }],
      okafor: [{ if: { loc: ['riverside'] }, text: 'Your rebuilt room holds through the first rain. Around you, Riverside rebuilds itself — and waits to see what the numbers on the walls mean.' },
        { if: { loc: ['stadium'] }, text: 'The stadium never sleeps: generators, crying children, arguments over water.' }, { if: { loc: ['host'] }, text: 'Mama Joy’s front room: eleven people, one candle, a great deal of laughter at night.' }],
      mendes: ['The road is still closed. Kamen lives on what it has.'],
      amira: [{ if: { loc: ['host'] }, text: 'At your sister’s, Yusuf has not been outside for three days.' }, { if: { loc: ['gym'] }, text: 'In the gymnasium, getting Yusuf to the toilet means asking strangers to lift his chair down the steps — every time.' }, { if: { loc: ['home'] }, text: 'In the flat, you jump at every creak.' }],
    } },

  // ======================================================================= 3
  { n: 3, title: 'The first week', time: 'Days 2–7',
    scene: {
      haddad: ['By the end of the week the international organisations have arrived — you see white Land Cruisers outside the town hall. An IFRC delegate is working with the Red Cross branch. IOM people with tablets are counting families at the stadium and the schools.',
        'Prices are still double. Karim has set up on a pavement, charging phones from a car battery and fixing cracked screens: 20 a day. Leila’s bakery will not reopen this month.',
        { if: { loc: ['host'] }, text: 'At the Novaks’, Ivana is warm, but the flat is crowded and the water bill will be enormous. Marko has started sleeping on the balcony.' },
        { if: { loc: ['school'] }, text: 'At the school, blankets and kitchen sets were handed out on day four — to everyone registered there. A teacher tells you the school board wants the classrooms back “soon”.' },
        { if: { loc: ['open', 'home'] }, text: 'Your building still has its red question mark. Mr Dragan has put a padlock on the street door.' }],
      petrov: ['International organisations have arrived — you see them on Toma’s phone. In your street, nothing has changed except that the shops have begun to open again, at new prices.',
        'Your pension: the post office has opened a counter in a tent, but the queue is two hours long and there is nowhere to sit.',
        { if: { flag: 'able_contact' }, text: 'Able Varenna has been back twice. Dragana says Able Varenna was not invited to the coordination meeting, so she went anyway and stood at the back.' },
        { if: { notFlag: 'able_contact' }, text: 'Nobody from any organisation has been inside your house.' }],
      okafor: ['On day four the Red Cross and IOM set up at the stadium: a water bladder, latrines, a registration desk, a distribution of blankets and kitchen sets. The queue went round the car park.',
        { if: { loc: ['riverside', 'host'] }, text: 'In Riverside, nobody has come except the men in yellow vests with their spray paint. People say the land will be cleared and given to a developer.' },
        { if: { loc: ['stadium'] }, text: 'At the stadium people now have numbered wristbands. Those without wristbands — people who arrived late or didn’t want to give their names — get nothing.' },
        'Daniel has found three days of rubble work. The market has reopened in a car park.'],
      mendes: ['On day six a bulldozer cuts a single lane through the landslide. The first vehicle up the mountain is a Varennan Red Cross jeep with two volunteers, a box of medicine and a satellite phone.',
        'The next day a truck from Lissa offers to buy livestock — at a third of last month’s price. Half the village sells something. Prices for animal feed have doubled.',
        'Some families from Dolna, below you, have walked down the valley. People say they are camped in an orchard near Lissa.'],
      amira: ['By the end of the week, white cars have appeared in Lissa: an IOM team with tablets went through the gymnasium, and a UNHCR protection officer asked people questions in the yard.',
        'The transfer office is open again, with a queue around the block. Your husband’s money arrives. The school is still closed.',
        'Families from the Morava hills are camping in an orchard by the bypass road. The orchard owner shouted at them from his car this morning.'],
    },
    steps: [
      { id: 'f1', prompt: 'Where does your family live this week?', options: [
        { id: 'stay_novaks', for: ['haddad'], when: { loc: ['host'] }, label: 'Stay with the Novaks', detail: 'Cramped, but safe and with family.', res: { goodwill: -0.5 },
          after: 'You stay. You buy food for both families with what is left of your cash, which eases things — for now.', },
        { id: 'move_school', for: ['haddad'], when: { notLoc: ['school'] }, label: 'Move to School No. 3', detail: 'Aid is going to the schools.', set: { loc: 'school', group: 'site', muni: 'varenna' }, dims: { settlement: 0.5, tenure: -0.5 }, res: { goodwill: 1 }, flags: { at_school: true },
          after: 'You move into a classroom with five other families. You get your names on the school list. Ivana cries when you leave, from relief and guilt both.' },
        { id: 'rent_room', for: ['haddad', 'amira'], label: 'Rent a room', detail: 'Rents have doubled. It would take most of your money.', set: { loc: 'rental', group: 'rent' }, res: { cash: -140 }, needCash: 140, dims: { tenure: -0.5, dwelling: -0.5, settlement: -0.5 }, flags: { renting: true },
          after: 'You find a damp room in a basement for 140 a month, cash, no contract. The landlord says it might be more next month. But the door locks and it is yours.' },
        { id: 'stay_school', for: ['haddad', 'petrov'], when: { loc: ['school'] }, label: 'Stay at the school', detail: 'You are on the list here.', dims: { essentials: -0.3 },
          after: 'You stay. A second distribution comes: hygiene kits and a blanket each.' },
        { id: 'front_room_stay', for: ['petrov'], when: { loc: ['home'] }, label: 'Stay in your front room', detail: 'It is your home.', dims: { settlement: 0.3 },
          after: 'You stay. Each night is colder.' },
        { id: 'toma_stay', for: ['petrov'], when: { loc: ['host'] }, label: 'Stay with Toma’s family', detail: 'They insist.', res: { goodwill: -0.3 },
          after: 'You stay, and give Toma’s mother half your pension for food. She tries to refuse.' },
        { id: 'riverside_stay', for: ['okafor'], when: { loc: ['riverside', 'host'] }, label: 'Stay in Riverside', detail: 'Your plot. Your community.', flags: { held_ground: true },
          after: 'You stay. Riverside agrees: nobody leaves, so nobody can say the land was abandoned.' },
        { id: 'to_stadium_wk', for: ['okafor'], when: { notLoc: ['stadium'] }, label: 'Move to the stadium for the aid', detail: 'Water, latrines, distributions — if you register.', set: { loc: 'stadium', group: 'site' }, dims: { settlement: 0.5, essentials: -0.5 }, flags: { stadium_early: true },
          after: 'You take a patch of tarmac by the fence and register at the desk. You get a wristband. Riverside, behind you, is emptier.' },
        { id: 'stadium_stay', for: ['okafor'], when: { loc: ['stadium'] }, label: 'Stay at the stadium', detail: 'You have a wristband now.', dims: { essentials: -0.3 },
          after: 'You stay. The site is getting more crowded every day.' },
        { id: 'kamen_stay', for: ['mendes'], label: 'Stay in Kamen with the animals', detail: 'This is your land.', flags: { stayed_kamen: true },
          after: 'You stay. The land, the animals and the village are all you know.' },
        { id: 'go_orchard', for: ['mendes'], label: 'Take the children down the valley to the orchard near Lissa', detail: 'Luis stays with the animals.', set: { loc: 'orchard', group: 'informal', muni: 'lissa' }, dims: { tenure: 2.5, settlement: 0.5, essentials: -0.5, dwelling: 0.5 }, flags: { orchard: true, split_family: true },
          after: 'A neighbour’s truck takes Ana, the children and Grandmother down to the orchard. Sixty families under plastic between the trees. No toilets, no water point — and no one with a clipboard. Luis stays up the mountain with the animals.' },
        { id: 'gym_stay', for: ['amira'], when: { loc: ['gym'] }, label: 'Stay at the gymnasium', detail: 'You are on the list.', dims: { essentials: -0.3 },
          after: 'You stay. The steps are the same every day.' },
        { id: 'sister_stay', for: ['amira'], when: { loc: ['host'] }, label: 'Stay at your sister’s', detail: 'Two flights of stairs.', res: { goodwill: -0.3 },
          after: 'You stay. Yusuf asks every morning when he can go outside.' },
        { id: 'flat_stay', for: ['amira'], when: { loc: ['home'] }, label: 'Stay in your flat', detail: 'Nobody has said it is unsafe.', dims: { settlement: 0.2 },
          after: 'You stay, and listen to the building.' },
      ] },
      { id: 'f2', prompt: 'How do you get through the week?', options: [
        { id: 'karim_street', for: ['haddad'], when: { flag: 'saved_tools', any: [{ flag: 'checked_stall' }] }, label: 'Karim works from the pavement: charging phones and fixing screens', detail: 'Everyone needs their phone.', res: { cash: 80 }, flags: { livelihood_restarted: true },
          after: 'Karim’s pavement stall makes 80 this week. It is not much, but it is work, and it is his.' },
        { id: 'karim_work', for: ['haddad'], label: 'Look for any work going', detail: 'Rubble, deliveries, anything.', res: { cash: 50 }, dims: { essentials: 0.2 },
          after: 'Karim carries rubble for a contractor. 50 for the week and a bad back.' },
        { id: 'queue_aid', for: ['haddad', 'okafor', 'amira', 'petrov'], label: 'Spend the days queueing for distributions', detail: 'Where you are registered.', dims: { essentials: -0.5 }, flags: { queued: true },
          after: 'Hours in queues. Sometimes there is something at the end, sometimes not. You learn which days are which.' },
        { id: 'repair_help', for: ['okafor'], label: 'Help neighbours rebuild, and they help you', detail: 'Labour exchange in Riverside.', flags: { community_strong: true }, dims: { dwelling: -0.5 }, res: { goodwill: 1 },
          after: 'Ten families, one wall a day each. By Sunday six homes have a second room. Nobody paid anybody.' },
        { id: 'daniel_more', for: ['okafor'], label: 'Daniel takes all the rubble work he can find', detail: 'Cash now.', res: { cash: 90 }, dims: { essentials: 0.3 },
          after: 'Daniel works every day. 90 for the week. He comes home too tired to talk.' },
        { id: 'sell_goats', for: ['mendes'], label: 'Sell five goats to the trader from Lissa', detail: 'A third of the price. But cash.', res: { cash: 120, assets: -1 }, flags: { sold_stock: true },
          after: 'The trader pays 120 for five goats that were worth 350 before the earthquake. Luis can’t look at Ana.' },
        { id: 'keep_herd', for: ['mendes'], label: 'Keep the herd — sell nothing at these prices', detail: 'The animals are your future.', dims: { essentials: 0.3 },
          after: 'You keep every animal. Feed is expensive and cash is gone, but next spring you will still have a herd.' },
        { id: 'jeep_ask', for: ['mendes'], label: 'Talk to the Red Cross volunteers in the jeep', detail: 'Tell them what Kamen needs.', knownP: 0.9, flags: { registered: true },
          after: 'The volunteers write down every family in Kamen from the priest’s book. They promise tarpaulins and blankets “in the next convoy”. They cannot say when.' },
        { id: 'pension_queue', for: ['petrov'], label: 'Get to the post office tent for your pension', detail: 'Two hours standing.', res: { cash: 160 }, dims: { essentials: 0.3 },
          after: 'Toma brings a folding chair and stands in the queue for you, then helps you to the counter. 160. You are exhausted for two days.' },
        { id: 'amira_volunteer', for: ['amira'], label: 'Volunteer at the gymnasium: you know half the children', detail: 'You are a teaching assistant.', flags: { community_strong: true, volunteered: true }, res: { goodwill: 1 }, knownP: 0.7,
          after: 'You set up a corner for the children with chalk and old books. A UNHCR protection officer asks what you need for Yusuf. You tell her: a ramp and a toilet he can use. She writes it down.' },
        { id: 'amira_money', for: ['amira'], label: 'Queue at the transfer office for your husband’s money', detail: 'Half a day.', res: { cash: 200 }, when: { flag: 'husband_call' },
          after: 'Five hours in the queue, Nour looking after the boys. 200 from your husband. You pay back the neighbour first.' },
      ] },
    ],
    response: [
      { actor: 'IOM and the Red Cross at the sites', when: { loc: ['stadium', 'school', 'gym'], known: true }, prob: 0.95, dims: { essentials: -1, settlement: -0.3 }, text: 'At the site you received blankets, a kitchen set and hygiene items. Latrines were installed.' },
      { actor: 'IOM DTM', when: { loc: ['stadium', 'school', 'gym'] }, prob: 1, known: true, text: 'An IOM team counted everyone at the site and put your family on their list.' },
      { actor: 'Nobody', when: { loc: ['stadium', 'school', 'gym'], flag: 'avoided_lists' }, prob: 0.6, text: 'Without a registration number you missed the distributions at the site.' },
      { actor: 'Varennan Red Cross', when: { known: true, notLoc: ['stadium', 'school', 'gym', 'orchard'], muni: ['varenna', 'brena'] }, prob: 0.5, dims: { essentials: -0.5 }, text: 'Red Cross volunteers brought a tarpaulin and a food parcel to where you are staying.' },
      { actor: 'Nobody', when: { loc: ['host'], known: false }, prob: 1, text: 'Nobody has asked whether families staying with relatives need anything.' },
      { actor: 'Varennan Red Cross', when: { muni: ['kamen'], known: true }, prob: 0.6, dims: { essentials: -0.5, dwelling: -0.3 }, text: 'The first convoy reached Kamen: tarpaulins, blankets and a sack of flour for each family on the priest’s list.' },
      { actor: 'Nobody', when: { loc: ['orchard'] }, prob: 1, text: 'Nobody official came to the orchard. A local church brought bread once.' },
      { actor: 'Able Varenna', when: { flag: 'able_contact', family: ['amira'] }, prob: 0.8, dims: { settlement: -0.5 }, text: 'Able Varenna and the gym’s volunteers built a plywood ramp to the toilet block. Yusuf can get there on his own.' },
      { actor: 'UNHCR', when: { flag: 'volunteered' }, prob: 0.6, dims: { settlement: -0.3 }, text: 'The UNHCR protection officer came back with a portable accessible toilet for the gymnasium.' },
    ],
    bridge: {
      haddad: [{ if: { loc: ['host'] }, text: 'Two weeks at the Novaks’. The atmosphere has changed. Marko said something about “a few more days”.' }, { if: { loc: ['school'] }, text: 'A notice went up on the school door: classes will resume “as soon as possible”.' }, { if: { loc: ['rental'] }, text: 'The basement room is damp and the children cough, but it is yours — for as long as you can pay.' }],
      petrov: ['The nights are getting colder.'],
      okafor: [{ if: { loc: ['riverside', 'host'] }, text: 'Riverside holds on. The painted numbers are still on the walls.' }, { if: { loc: ['stadium'] }, text: 'The stadium is now home to three thousand people.' }],
      mendes: [{ if: { loc: ['orchard'] }, text: 'In the orchard, the families from the hills have made a committee. Ana is on it.' }, { if: { notLoc: ['orchard'] }, text: 'Up in Kamen, the first snow is a few weeks away.' }],
      amira: ['The school is still closed. You have started to wonder whether it will reopen this year.'],
    } },

  // ======================================================================= 4
  { n: 4, title: 'Weeks of waiting', time: 'Weeks 2–4',
    scene: {
      haddad: [{ if: { loc: ['host'] }, text: 'Week three at the Novaks’. This morning Marko said it plainly: their own savings are nearly gone. Ivana could not look at you.' },
        { if: { loc: ['school'] }, text: 'At the school, an NRC team has started telling people about their rights as tenants. Most families here were renters. The school board wants the classrooms back next month.' },
        { if: { loc: ['rental'] }, text: 'The basement landlord has raised the rent to 170. Rents across Varenna have gone up by a third.' },
        { if: { loc: ['open', 'home'] }, text: 'The building is still padlocked. You have heard Mr Dragan is talking to a developer.' },
        'Engineers have finally tagged your old building: red. Unsafe. Mr Dragan says the lease is over. You have no paper to say there ever was one.'],
      petrov: ['An engineer has finally come: your house is yellow — repairable, but not to live in until the back wall is fixed. A proper repair will cost more than you have ever had.',
        { if: { flag: 'able_contact' }, text: 'Dragana says agencies are planning shelter kits and cash for repairs — but repair cash will be for owners with documents. You have your deed. Somewhere.' },
        'Winter is coming. Your daughter has offered to take you to the capital.'],
      okafor: [{ if: { loc: ['riverside', 'host'] }, text: 'A letter from the Municipality, delivered by hand: Riverside residents must leave within thirty days. There will be “relocation options”. Nobody knows what they are.' },
        { if: { loc: ['stadium'] }, text: 'The Municipality says the stadium may be cleared by Month 3. NRC lawyers have started advising families there.' },
        'Daniel’s rubble work is drying up as the big contractors arrive with machines. Grace is selling again in the car-park market.'],
      mendes: [{ if: { loc: ['orchard'] }, text: 'In the orchard there are now over a hundred families. The owner has brought the police twice. An IOM team came yesterday and counted everyone.' },
        { if: { notLoc: ['orchard'] }, text: 'The road is open. Trucks bring supplies — and traders offering bad prices for animals. Several families have left for the orchard near Lissa.' },
        'The end wall is holding, for now. The first frost came last night.'],
      amira: ['The school will not reopen until after the New Year. Your sister’s husband has been laid off.',
        'Agencies are talking about “cash for host families” and “winterisation”. Lists are being drawn up. Nobody can tell you which list you are on.'],
    },
    steps: [
      { id: 'f1', prompt: 'The big decision of the month:', options: [
        { id: 'contribute_novaks', for: ['haddad'], when: { loc: ['host'] }, label: 'Give the Novaks most of your savings for the household', detail: 'Keep the peace; keep a roof.', res: { cash: -100, goodwill: 1.5 }, needCash: 100,
          after: 'You give Marko 100. He takes it without a word, and that night he shares his cigarettes with Karim on the balcony.' },
        { id: 'leave_novaks', for: ['haddad'], when: { loc: ['host'] }, label: 'Leave the Novaks before you are asked', detail: 'For the school, or a room.', set: { loc: 'school', group: 'site', muni: 'varenna' }, dims: { settlement: 1, tenure: 0.5 }, flags: { at_school: true },
          after: 'You pack up and move to School No. 3. Ivana cries. So do you.' },
        { id: 'nrc_lawyer', for: ['haddad', 'okafor'], label: 'Find the NRC lawyers', detail: 'Your rights as a tenant or occupant.', knownP: 0.8, dims: { tenure: -0.5 }, flags: { nrc: true },
          after: 'An NRC lawyer listens, takes notes, and explains: a verbal agreement can still count, and witnesses help. She can’t promise anything, but for the first time someone has told you that you have rights.' },
        { id: 'riverside_organise', for: ['okafor'], label: 'Organise Riverside to negotiate with the Municipality', detail: 'With Mama Joy. Together.', flags: { community_strong: true, negotiating: true }, dims: { tenure: -0.5 },
          after: 'Two hundred families sign a letter asking for land, not eviction. Mama Joy and Daniel take it to the town hall. The deputy mayor agrees to meet “after the emergency”.' },
        { id: 'pay_engineer', for: ['petrov'], label: 'Pay a builder to brace the back wall properly', detail: 'Most of your money.', res: { cash: -150 }, needCash: 150, dims: { dwelling: -1 }, flags: { braced: true },
          after: 'The builder braces the wall and patches the kitchen roof. You can live in two rooms safely. The money is gone.' },
        { id: 'go_daughter', for: ['petrov'], label: 'Go to your daughter in the capital for the winter', detail: 'Leave the house empty.', set: { loc: 'host', group: 'hosted' }, dims: { dwelling: -1.5, essentials: -1, settlement: -1, tenure: 0.5 }, flags: { left_town: true },
          after: 'Your daughter comes in her car. You lock the door of the house you have lived in for fifty years and do not look back until the corner.' },
        { id: 'stay_through', for: ['petrov'], label: 'Stay where you are and wait for the repair programme', detail: 'Dragana says it is coming.', flags: { waiting_repair: true },
          after: 'You stay. Waiting is something you know how to do.' },
        { id: 'sell_cow', for: ['mendes'], label: 'Sell the cow to buy timber and roofing before winter', detail: 'Next year’s milk and calf.', res: { cash: 200, assets: -1.5 }, dims: { dwelling: -1 }, flags: { sold_cow: true },
          after: 'The cow goes to the trader for 200. With timber and sheeting you rebuild the end wall properly with Petru’s help. The house will be warm. The barn is very quiet.' },
        { id: 'orchard_committee', for: ['mendes'], when: { loc: ['orchard'] }, label: 'Push the orchard committee to talk to the Lissa mayor', detail: 'You need water, toilets and to not be thrown out.', flags: { community_strong: true, orchard_voice: true }, dims: { tenure: -0.5 },
          after: 'Ana and two others wait four hours outside the mayor’s office. He sees them for ten minutes and says he will “ask the agencies”. It is something.' },
        { id: 'family_reunite', for: ['mendes'], when: { flag: 'split_family' }, label: 'Bring the family back up to Kamen', detail: 'Together, whatever happens.', set: { loc: 'home', group: 'nondisp', muni: 'kamen' }, dims: { tenure: -2.5, settlement: 0.5 }, flags: { reunited: true },
          after: 'You come back up the mountain. Luis has kept the animals alive. The house is cold, but it is yours.' },
        { id: 'amira_rent', for: ['amira'], when: { notLoc: ['rental'] }, label: 'Rent an accessible ground-floor flat with your husband’s money', detail: 'Expensive. But Yusuf could go outside.', res: { cash: -180 }, needCash: 180, set: { loc: 'rental', group: 'rent' }, dims: { dwelling: -1, settlement: -1, tenure: -0.5 }, flags: { renting: true },
          after: 'A ground-floor flat with one step at the door. 180 a month. The first morning, Yusuf wheels himself out into the street and just sits in the sun.' },
        { id: 'amira_stay', for: ['amira'], label: 'Stay put and save every coin for winter', detail: 'Winter is coming.', flags: { saving: true },
          after: 'You stay where you are and put money aside in a tin.' },
      ] },
      { id: 'f2', prompt: 'And your shelter for the winter?', options: [
        { id: 'insulate', label: 'Insulate and repair what you can yourselves', detail: 'Plastic, cardboard, old carpets, salvaged timber: 40.', res: { cash: -40 }, needCash: 40, dims: { dwelling: -0.5, essentials: -0.3 }, flags: { self_winterised: true },
          after: 'You spend a weekend sealing gaps, hanging carpets and fixing plastic over windows. It won’t be warm, but it will be less cold.' },
        { id: 'borrow_heat', label: 'Borrow to buy a stove and fuel', detail: 'The moneylender wants 30% back.', res: { cash: 100, debt: 130 }, dims: { essentials: -1 },
          after: 'The moneylender lends you 100 at 30%. You buy a stove and a month of fuel. The debt sits in your stomach.' },
        { id: 'wait_winter_aid', label: 'Wait for the winter support everyone is talking about', detail: 'Lists are being made.', flags: { waiting_aid: true },
          after: 'You wait. Sometimes waiting is the only thing you can afford.' },
      ] },
    ],
    response: [
      { actor: 'IFRC and the Varennan Red Cross', when: { known: true, loc: ['home', 'yard', 'barn'], res: { docs: 1 } }, prob: 0.7, dims: { dwelling: -1 }, text: 'Red Cross volunteers, supported by IFRC, delivered a shelter kit — timber, sheeting, fixings and tools — and showed you how to brace walls and roofs more safely.' },
      { actor: 'NRC', when: { flag: 'nrc' }, prob: 0.8, dims: { tenure: -1 }, text: 'NRC wrote to your landlord or the Municipality on your behalf, citing your rights. It bought you time.' },
      { actor: 'NRC', when: { known: true, group: ['rent'] }, prob: 0.5, dims: { tenure: -0.5 }, res: { cash: 120 }, text: 'NRC enrolled you in its rental support programme: three months’ rent with a written lease.' },
      { actor: 'Varennan Red Cross (cash for host families)', when: { known: true, group: ['hosted'] }, prob: 0.5, res: { cash: 100, goodwill: 1 }, text: 'The Red Cross started paying cash to host families and their guests. 100 came to the household where you are staying. The atmosphere lifted.' },
      { actor: 'Nobody', when: { group: ['hosted'], known: false }, prob: 1, text: 'You heard the Red Cross was giving cash to host families — but nobody had you on a list.' },
      { actor: 'IOM', when: { loc: ['orchard'] }, prob: 0.7, known: true, dims: { settlement: -0.5 }, text: 'IOM’s displacement tracking team counted everyone in the orchard. A week later a water tank and three latrines appeared.' },
      { actor: 'Municipality', when: { loc: ['orchard'] }, prob: 0.5, dims: { tenure: 0.5 }, text: 'The orchard owner came with the police and a court letter. The families were told to leave within a month.' },
      { actor: 'Municipality', when: { family: ['okafor'], loc: ['riverside', 'host'], notFlag: 'negotiating' }, prob: 0.8, dims: { tenure: 0.5 }, text: 'Bulldozers cleared the burned lanes of Riverside. Nobody was compensated.' },
      { actor: 'UNHCR and Able Varenna', when: { flag: 'able_contact' }, prob: 0.6, dims: { essentials: -0.5 }, text: 'UNHCR and Able Varenna delivered winter clothing and a heater to members with disabilities.' },
    ],
    bridge: {
      haddad: ['Winter is a month away.'], petrov: ['Winter is a month away.'], okafor: ['Winter is a month away.'], mendes: ['Snow is coming to the mountain.'], amira: ['Winter is a month away.'],
    } },
];

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
    const options = [...step.options.filter(o => (!o.for || o.for.includes(family)) && check(o.when, s, family) && !(o.needCash && (s.res?.cash ?? 0) < o.needCash)), WAIT_OPTION];
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
