import { ACTS, roundInfo, familySteps, responseSteps, DIMS, PHASES, INSTITUTIONS, PROFILES, LOCATIONS, MUNIS, STAFF, phaseOf } from '/lib/scenario.js';
import { STORY, DIM_PLAIN, effectChips, institutionHints, previewPhases, mapSvg, md } from '/lib/story.js';
import * as members from '/members.js';

const cfg = window.AFTERSHOCK;
const qs = new URLSearchParams(location.search);
const viaCode = qs.get('c') && members.byCode(qs.get('c'));
const token = qs.get('t') || viaCode?.t || localStorage.getItem('aftershock_token');
if (!token) location.replace('/');
if (token) localStorage.setItem('aftershock_token', token);
if (!qs.get('t') && token) history.replaceState(null, '', '/play.html?t=' + token);

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let S = null, saving = false, editing = null;

async function rpc(fn, args) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: cfg.supabaseKey, Authorization: `Bearer ${cfg.supabaseKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.message || 'Request failed');
  return j;
}

async function refresh() {
  try {
    S = await rpc('player_state', { p_token: token });
    members.upsert({ t: token, code: S.cohort.code, cohort: S.cohort.name, name: S.player.name, family: PROFILES[S.player.profile].name });
    render(); syncPush();
  } catch (e) { if (/unknown player/.test(e.message)) { members.remove(token); location.replace('/'); } }
}

const isOpen = () => S.round?.status === 'open';
const info = () => (S.round ? roundInfo(S.round.number) : null);
const family = () => PROFILES[S.player.profile];
const org = () => INSTITUTIONS[S.player.institution];

// ---------------------------------------------------------------- rendering
function render() {
  if (!INSTITUTIONS[S.player.institution] || !S.household?.muni) {
    $('tab-decide').innerHTML = `<div class="card alert"><h2>This cohort uses an older version of Aftershock</h2><p>Ask your facilitator for the new cohort code, then join it from <a href="/?join=1">the start page</a>.</p></div>`;
    return;
  }
  const open = isOpen(), inf = info();
  const block = open ? inf.block : null;
  document.body.classList.toggle('mode-family', block === 'family');
  document.body.classList.toggle('mode-response', block === 'response');
  $('cohortName').textContent = block === 'response' ? `${S.cohort.name} · You are: ${org().name}` : `${S.cohort.name} · You are: ${family().name}`;
  $('switchBtn').firstChild.textContent = members.list().length > 1 ? 'AFTERSHOCK ▾' : 'AFTERSHOCK';
  if (open) {
    const mins = Math.max(0, Math.round((new Date(S.round.closes_at) - Date.now()) / 60000));
    $('roundChip').textContent = `Act ${inf.act.n} · ${mins} min`; $('roundChip').className = 'chip live';
  } else { $('roundChip').textContent = S.cohort.current_round ? `Act ${Math.ceil(S.cohort.current_round / 2)} done` : 'Not started'; $('roundChip').className = 'chip'; }
  const pending = open && pendingCount() > 0;
  $('decideDot').classList.toggle('hidden', !pending);
  renderSetup();
  renderDecide();
  renderFamily();
  renderTeam();
  renderNews();
  maybeRoleCard();
}

function pendingCount() {
  const inf = info();
  if (inf.block === 'family') return familySteps(inf.act, S.player.profile, S.household, S.my_decisions).filter(s => !s.chosen).length;
  return responseSteps(inf.act, S.player.institution).filter(s => !S.my_decisions[s.id]).length;
}

function roleBanner(block) {
  if (block === 'family') {
    const P = family();
    return `<div class="role role-family"><div class="kicker">You are now</div><h2>${esc(P.name)}</h2><div class="small">${esc(P.who)}</div><div class="small" style="margin-top:4px">Now: ${esc(LOCATIONS[S.household.loc] || S.household.loc)}</div></div>`;
  }
  const O = org();
  return `<div class="role role-response"><div class="kicker">You are now</div><h2>${esc(O.name)}</h2><div class="small">${esc(O.kind)} · with ${S.team.map(m => esc(m.name)).join(', ') || 'your team'}</div></div>`;
}

function renderDecide() {
  const open = isOpen(), inf = info();
  if (!open) {
    const nextN = (S.cohort.current_round || 0) + 1;
    const nx = nextN <= ACTS.length * 2 ? roundInfo(nextN) : null;
    $('tab-decide').innerHTML = `<div class="card"><h2>No decisions right now</h2><p class="muted">${esc(S.world?.public?.headline || '')}</p>
      ${nx ? `<p class="small">Next: <b>Act ${nx.act.n} · ${nx.act.time}</b> — ${nx.block === 'family' ? `you play <b>${esc(family().name)}</b>` : `you play <b>${esc(org().name)}</b>`}. You will get a notification.</p>` : '<p class="small">All six acts are complete. See you at the debrief.</p>'}
      <p class="small muted">See what happened in <b>News</b>.</p></div>`;
    return;
  }
  const { act, block } = inf;
  let html = roleBanner(block);
  html += `<div class="kicker" style="margin-top:14px">Act ${act.n} · ${esc(act.time)} · ${block === 'family' ? 'Family block' : 'Response block'}</div><h1>${esc(act.title)}</h1><p class="muted">${esc(block === 'family' ? act.family.intro : act.response.intro)}</p>`;
  html += block === 'family' ? familyHtml(act) : responseHtml(act);
  $('tab-decide').innerHTML = html;
  $('tab-decide').querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => decide(b.dataset.kind, b.dataset.opt)));
  $('tab-decide').querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => { editing = b.dataset.edit; renderDecide(); }));
}

function familyHtml(act) {
  const steps = familySteps(act, S.player.profile, S.household, S.my_decisions);
  let html = '', shownCurrent = false;
  steps.forEach((st, i) => {
    const label = `Step ${i + 1} of ${steps.length}`;
    if (st.chosen && editing !== st.id) {
      const ch = previewPhases(st.before, st.chosen).map(c => `${DIMS[c.k].short} <span class="ph ph${c.before}">${c.before}</span>→<span class="ph ph${c.after}">${c.after}</span>`).join(' · ');
      html += `<div class="card done"><div class="kicker">${label} ✓</div><div class="small muted">${esc(st.prompt)}</div><p style="margin:6px 0"><b>${esc(st.chosen.label)}</b></p>
        <div class="conseq"><div class="kicker">What happens</div>${esc(st.chosen.feed)}${ch ? `<div class="small" style="margin-top:6px">${ch}</div>` : ''}</div>
        <button class="secondary small" data-edit="${st.id}" style="margin-top:8px;padding:6px 10px">Change</button></div>`;
      return;
    }
    if (shownCurrent) { html += `<div class="card muted small">${label}: unlocks after the step above.</div>`; return; }
    shownCurrent = true;
    html += `<div class="card current"><div class="kicker">${label}</div><h2>${esc(st.prompt)}</h2><div class="opts">` +
      st.options.map(o => `<button class="opt ${S.my_decisions[st.id] === o.id ? 'sel' : ''}" data-kind="${st.id}" data-opt="${o.id}"><b>${esc(o.label)}</b><span>${esc(o.detail || '')}</span>${chipsHtml(effectChips(o))}</button>`).join('') + `</div></div>`;
  });
  if (!shownCurrent) html += `<div class="card ok"><b>Your family’s decisions for this act are in.</b><p class="small" style="margin:6px 0 0">When the block closes, everyone’s choices and what happens in the valley are combined. Then the role turns to your organisation.</p></div>`;
  return html;
}

function responseHtml(act) {
  const steps = responseSteps(act, S.player.institution);
  let html = '';
  const o = S.world?.org;
  if (o) html += `<div class="card small"><b>Your people on the ground:</b> ${Object.entries(o.staff).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${STAFF[k].toLowerCase()}`).join(', ') || 'no specialist staff'} · capacity ${Math.round(o.capacity * 100)}%${o.incoming?.length ? ` · incoming: ${o.incoming.map(x => Object.entries(x.staff).map(([k, v]) => `${v} ${STAFF[k].toLowerCase()}`).join(', ')).join('; ')}` : ''}</div>`;
  steps.forEach((st, i) => {
    const votes = {}; for (const m of S.team) if (m.votes?.[st.id]) (votes[m.votes[st.id]] = votes[m.votes[st.id]] || []).push(m.name);
    const mine = S.my_decisions[st.id];
    html += `<div class="card ${mine ? 'done' : 'current'}"><div class="kicker">Decision ${i + 1} of ${steps.length}${mine ? ' ✓' : ''}</div><h2>${esc(st.prompt)}</h2>
      <p class="small muted">Your organisation acts on the majority vote.</p><div class="opts">` +
      st.options.map(op => `<button class="opt ${mine === op.id ? 'sel' : ''}" data-kind="${st.id}" data-opt="${op.id}"><b>${esc(op.label)}</b><span>${esc(op.detail || '')}</span>${op.id === 'none' ? '' : `<ul class="hints">${institutionHints(op).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`}${votes[op.id] ? `<div class="votes">Voted: ${votes[op.id].map(esc).join(', ')}</div>` : ''}</button>`).join('') + `</div></div>`;
  });
  if (steps.every(st => S.my_decisions[st.id])) html += `<div class="card ok"><b>Your votes are in.</b><p class="small" style="margin:6px 0 0">When the block closes, your organisation’s decisions land on families across the valley — including colleagues’ families. You’ll also hear what reached your own family.</p></div>`;
  return html;
}

const chipsHtml = chips => chips.length ? `<div class="chips">${chips.map(c => `<em class="${c.neutral ? '' : c.good ? 'good' : 'bad'}">${esc(c.text)}</em>`).join('')}</div>` : '';

function renderFamily() {
  const h = S.household, P = family();
  const dims = Object.entries(DIMS).map(([k, d]) => {
    const p = phaseOf(h.dims[k]);
    return `<div class="dim"><div class="head"><span><b>${d.label}</b></span><span class="ph ph${p}">${p}</span></div>
      <div class="bar">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= p ? 'on' + p : ''}"></i>`).join('')}</div>
      <div class="small muted">${PHASES[p - 1]} — ${esc(d.text[p - 1])}</div><div class="small" style="color:#8a949a">${DIM_PLAIN[k]}</div></div>`;
  }).join('');
  const hist = (h.history || []).filter(x => x.block !== 'response' || true).map(x => `<span class="ph ph${x.lci.worst}" title="Act ${x.act}">${x.lci.worst}</span>`).join(' ');
  $('tab-family').innerHTML = `
    <div class="role role-family"><div class="kicker">Your family</div><h2>${esc(P.name)}</h2><div class="small">${esc(P.who)}</div></div>
    <div class="card"><p class="muted">${esc(P.story)}</p><p><b>Now:</b> ${esc(LOCATIONS[h.loc] || h.loc)} · ${esc(MUNIS[h.muni]?.name || '')}</p>${mapSvg(h, S.player.profile)}
      <p class="small">${h.known ? '✓ Responders have your family on a list.' : '✗ No organisation has your family on a list yet.'}</p></div>
    <div class="card"><h2>Living conditions</h2><p class="small muted">Phases 1–5, as in the Living Conditions Index.</p>${dims}
      ${hist ? `<p class="small muted" style="margin-top:12px">Most severe phase over time: ${hist}</p>` : ''}</div>
    <div class="card"><h2>What you have</h2><div class="res">
      <div>Cash<b>${Math.round(h.res.cash)}</b></div><div>Debt<b>${Math.round(h.res.debt || 0)}</b></div>
      <div>${S.player.profile === 'H5' ? 'Livestock' : 'Productive assets'}<b>${Math.round(h.res.assets)}</b></div>
      <div>${['hosted', 'host'].includes(h.group) ? 'Hosting relationship' : 'Goodwill'}<b>${'●'.repeat(Math.max(0, Math.min(5, Math.round(h.res.goodwill))))}${'○'.repeat(Math.max(0, 5 - Math.min(5, Math.round(h.res.goodwill))))}</b></div>
      <div>Documents<b>${h.res.docs ? 'Yes' : 'None'}</b></div></div></div>`;
}

function renderTeam() {
  const O = org(), o = S.world?.org;
  const brief = S.world?.brief || [];
  $('tab-team').innerHTML = `<div class="role role-response"><div class="kicker">Your organisation</div><h2>${esc(O.name)}</h2><div class="small">${esc(O.kind)}</div></div>
    <div class="card"><p class="muted">${esc(O.blurb)}</p><p class="small"><b>Your team:</b> ${S.team.map(m => esc(m.name)).join(', ')}</p></div>
    ${o ? `<div class="card"><h2>People on the ground</h2><div class="res">${Object.entries(STAFF).map(([k, l]) => `<div>${l}<b>${o.staff[k] || 0}</b></div>`).join('')}<div>Capacity<b>${Math.round(o.capacity * 100)}%</b></div></div></div>` : ''}
    <div class="card"><h2>What your organisation can see</h2>${brief.length ? brief.map(l => `<p>${esc(l)}</p>`).join('') : '<p class="muted">Nothing yet. Your picture builds up as you assess and report.</p>'}</div>`;
}

function renderNews() {
  const items = S.feed.map(f => `<div class="item ${f.team ? 'team' : ''}">
    <div class="meta">${f.round ? `Act ${Math.ceil(f.round / 2)}` : ''}${f.team ? ' · your organisation' : ''} · ${new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>${esc(f.body)}</div>`).join('');
  $('tab-news').innerHTML = `<div class="card feed"><h2>News</h2>${items || '<p class="muted">Nothing yet.</p>'}</div>`;
}

async function decide(kind, opt) {
  if (saving) return; saving = true;
  try { await rpc('submit_decision', { p_token: token, p_round: S.round.number, p_kind: kind, p_option: opt }); S.my_decisions[kind] = opt; editing = null; render(); refresh(); }
  catch (e) { alert(e.message === 'round not open' ? 'This block has closed.' : e.message); refresh(); }
  finally { saving = false; }
}

// ---------------------------------------------------------------- role change card
function maybeRoleCard() {
  if (!isOpen() || !$('intro').classList.contains('hidden')) return;
  const key = `aftershock_seen_${token}_${S.round.number}`;
  if (localStorage.getItem(key) || !localStorage.getItem('aftershock_intro_' + token)) return;
  const { act, block } = info();
  const fam = block === 'family';
  $('rolecard').innerHTML = `<div class="rc ${fam ? 'role-family' : 'role-response'}"><div class="kicker">Act ${act.n} · ${esc(act.time)}</div>
    <p style="margin:16px 0 4px">For this block you are</p><h1 style="font-size:30px;margin:0 0 12px">${esc(fam ? family().name : org().name)}</h1>
    <p>${esc(fam ? family().who : org().kind)}</p><p class="small" style="opacity:.85">${fam ? `${act.family.steps.length} decisions for your family, one after another.` : `Vote with your team on ${responseSteps(act, S.player.institution).length} decisions.`}</p>
    <button id="rcGo" class="full" style="margin-top:20px;background:#fff;color:var(--ink)">Start</button></div>`;
  $('rolecard').classList.remove('hidden');
  $('rcGo').onclick = () => { localStorage.setItem(key, '1'); $('rolecard').classList.add('hidden'); };
}

// ---------------------------------------------------------------- story intro
let introStep = 0;
function introSteps() {
  const P = family(), O = org(), h = S.household;
  const paras = a => a.map(x => `<p>${md(x)}</p>`).join('');
  return [
    { k: 'Aftershock', t: 'Welcome to the Vara valley', b: `${STORY.video ? `<video src="${STORY.video}" controls playsinline style="width:100%;border-radius:12px"></video>` : mapSvg(null, null)}${paras(STORY.place)}` },
    { k: 'The earthquake', t: 'The night everything changed', b: `${paras(STORY.night)}<p class="small muted">${esc(STORY.fictional)}</p>` },
    { k: 'How to play', t: 'How Aftershock works', b: `<div class="howlist">${STORY.how.map(x => `<div><b>${esc(x.t)}</b>${esc(x.d)}</div>`).join('')}</div>` },
    { k: 'Your first role', t: P.name, b: `<div class="role role-family"><div class="kicker">Family · warm screens</div><h2>${esc(P.name)}</h2><div class="small">${esc(P.who)}</div></div><p>${esc(P.story)}</p>${mapSvg(h, S.player.profile)}<p class="small muted">In each act’s family block you make 2–3 decisions for this family. Their situation is always on the <b>Family</b> tab.</p>` },
    { k: 'Your second role', t: O.name, b: `<div class="role role-response"><div class="kicker">Organisation · blue screens</div><h2>${esc(O.name)}</h2><div class="small">${esc(O.kind)}</div></div><p>${esc(O.blurb)}</p><p><b>Your team:</b> ${S.team.map(m => esc(m.name)).join(', ') || 'joining soon'}</p><p class="small muted">In each act’s response block you vote with your team. Your organisation never serves your own family directly. Its people, partners and picture of the crisis are on the <b>Team</b> tab.</p>` },
    { k: 'Reading the situation', t: 'Living conditions, phase 1 to 5', b: `<p>Each family’s situation is measured on four dimensions, using the same 1–5 phases as the Living Conditions Index.</p>
      <div class="legend">${PHASES.map((x, i) => `<span class="ph${i + 1}">${i + 1}<br>${x}</span>`).join('')}</div>
      ${Object.entries(DIMS).map(([k, d]) => `<div class="dim"><div class="head"><b>${d.label}</b><span class="ph ph${phaseOf(h.dims[k])}">${phaseOf(h.dims[k])}</span></div><div class="small muted">${DIM_PLAIN[k]}</div></div>`).join('')}
      <p class="small muted">Family choices show their immediate effect as tags, like <span class="chips" style="display:inline-flex"><em class="good">Shelter better</em><em class="bad">−100 cash</em></span>. Organisation choices show who they reach and what they need.</p>` },
    { k: 'Ready', t: 'You’re ready', b: `<p>Leave this app and get on with your day. When a block opens, your phone will buzz, and the screen will tell you who you are for that block.</p><p>Tap <b>?</b> at the top any time to see this again.</p><div id="introSetup"></div>` },
  ];
}
function showIntro(step = 0) {
  introStep = step;
  const steps = introSteps(), st = steps[introStep], last = introStep === steps.length - 1;
  $('intro').innerHTML = `<div class="wrap"><div class="dots">${steps.map((_, i) => `<i class="${i === introStep ? 'on' : ''}"></i>`).join('')}</div>
    <div class="kicker">${esc(st.k)}</div><h1>${esc(st.t)}</h1>${st.b}</div>
    <div class="bar2"><div class="row">${introStep ? '<button class="secondary" id="iBack">Back</button>' : ''}<button id="iNext">${last ? 'Start playing' : 'Next'}</button></div></div>`;
  $('intro').classList.remove('hidden'); $('intro').scrollTop = 0;
  if (last) { const el = $('setup'); if (!el.classList.contains('hidden')) $('introSetup').appendChild(el.cloneNode(true)).querySelector('#pushBtn')?.addEventListener('click', enablePush); }
  $('iNext').onclick = () => last ? closeIntro() : showIntro(introStep + 1);
  if ($('iBack')) $('iBack').onclick = () => showIntro(introStep - 1);
}
function closeIntro() { localStorage.setItem('aftershock_intro_' + token, '1'); $('intro').classList.add('hidden'); render(); }
$('helpBtn').onclick = () => S && showIntro(0);
$('switchBtn').onclick = () => {
  const ms = members.list();
  $('switcher').innerHTML = `<div class="wrap"><div class="kicker">Aftershock</div><h1>Your cohorts</h1>` +
    ms.map(m => `<a class="card" style="display:block;text-decoration:none;color:inherit;${m.t === token ? 'border-color:var(--accent)' : ''}" href="/play.html?t=${m.t}"><b>${esc(m.cohort || 'Cohort')}</b> <span class="small muted">· ${esc(m.code || '')}${m.t === token ? ' · open now' : ''}</span><br><span class="small muted">${esc(m.family || '')}${m.name ? ' · playing as ' + esc(m.name) : ''}</span></a>`).join('') +
    `<p><a class="btn secondary full" style="text-align:center" href="/?join=1">Join another cohort</a></p></div><div class="bar2"><div class="row"><button id="swClose">Close</button></div></div>`;
  $('switcher').classList.remove('hidden');
  $('swClose').onclick = () => $('switcher').classList.add('hidden');
};

// ---------------------------------------------------------------- notifications
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
let swReg = null;

async function renderSetup() {
  const el = $('setup');
  const pushOK = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (isIOS && !standalone) {
    el.innerHTML = `<h3>One step to get notifications on iPhone</h3><ol class="steps"><li>Tap the <b>Share</b> button in Safari.</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open <b>Aftershock</b> from your home screen and tap “Turn on notifications”.</li></ol><p class="small muted">You can keep playing here in the meantime, but you won’t be alerted.</p>`;
    el.classList.remove('hidden'); return;
  }
  if (!pushOK) { el.innerHTML = '<p class="small">This browser can’t receive notifications. Keep this page open, or try Chrome or Safari.</p>'; el.classList.remove('hidden'); return; }
  const sub = swReg && await swReg.pushManager.getSubscription();
  if (Notification.permission === 'granted' && sub) { el.classList.add('hidden'); return; }
  if (Notification.permission === 'denied') { el.innerHTML = '<p class="small">Notifications are blocked for this site. Turn them on in your browser or phone settings.</p>'; el.classList.remove('hidden'); return; }
  el.innerHTML = `<h3>Turn on notifications</h3><p class="small">You’ll be alerted when a block opens, when time is running out, and when results are in.</p><button id="pushBtn" class="full">Turn on notifications</button>`;
  el.classList.remove('hidden');
  $('pushBtn').onclick = enablePush;
}

async function syncPush() {
  try {
    if (!swReg || Notification.permission !== 'granted') return;
    const sub = await swReg.pushManager.getSubscription();
    if (!sub || localStorage.getItem('aftershock_push_' + token) === sub.endpoint) return;
    await rpc('save_push', { p_token: token, p_sub: sub.toJSON() });
    localStorage.setItem('aftershock_push_' + token, sub.endpoint);
  } catch {}
}

async function enablePush() {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return renderSetup();
    const sub = await swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(cfg.vapidPublic) });
    for (const m of members.list()) { await rpc('save_push', { p_token: m.t, p_sub: sub.toJSON() }).catch(() => {}); localStorage.setItem('aftershock_push_' + m.t, sub.endpoint); }
    const r = await fetch('/api/me', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).then(r => r.json());
    $('setup').innerHTML = r.sent ? '<p class="small">✓ Notifications are on. You should have received a test notification.</p>' : '<p class="small">Notifications are on, but the test did not arrive. Tell your facilitator.</p>';
    $('setup').className = 'card ok';
    setTimeout(() => $('setup').classList.add('hidden'), 6000);
  } catch (e) { alert('Could not turn on notifications: ' + e.message); }
}
function urlB64(b64) {
  const raw = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// ---------------------------------------------------------------- wiring
document.querySelectorAll('nav.tabs button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('nav.tabs button').forEach(x => x.classList.toggle('on', x === b));
  ['decide', 'family', 'team', 'news'].forEach(t => $('tab-' + t).classList.toggle('hidden', t !== b.dataset.tab));
  window.scrollTo(0, 0);
}));
if ('serviceWorker' in navigator) {
  swReg = await navigator.serviceWorker.register('/sw.js');
  navigator.serviceWorker.addEventListener('message', e => e.data?.type === 'refresh' && refresh());
}
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && refresh());
await refresh();
if (S && !localStorage.getItem('aftershock_intro_' + token)) showIntro(0);
setInterval(refresh, 20000);
