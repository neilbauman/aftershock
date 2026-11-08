import { ROUNDS, DIMS, PHASES, INSTITUTIONS, PROFILES, LOCATIONS, householdOptions, institutionBlock, phaseOf } from '/lib/scenario.js';
import { STORY, DIM_PLAIN, effectChips, institutionHints, previewPhases, mapSvg, md } from '/lib/story.js';

import * as members from '/members.js';
const cfg = window.AFTERSHOCK;
const qs = new URLSearchParams(location.search);
const viaCode = qs.get('c') && members.byCode(qs.get('c'));
const token = qs.get('t') || viaCode?.t || localStorage.getItem('aftershock_token');
if (!token) location.replace('/');
if (token) localStorage.setItem('aftershock_token', token);
// keep the token in the URL so "Add to Home Screen" on iOS carries it into the app
if (!qs.get('t')) history.replaceState(null, '', '/play.html?t=' + token);

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let S = null, tab = 'decide', saving = {};

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

// ---------------------------------------------------------------- rendering
function render() {
  const { cohort, round, household: h, player } = S;
  $('cohortName').textContent = `${cohort.name} · ${PROFILES[player.profile].name}`;
  $('switchBtn').firstChild.textContent = members.list().length > 1 ? 'AFTERSHOCK ▾' : 'AFTERSHOCK';
  const open = round?.status === 'open';
  const R = ROUNDS.find(r => r.n === round?.number);
  if (open) {
    const mins = Math.max(0, Math.round((new Date(round.closes_at) - Date.now()) / 60000));
    $('roundChip').textContent = `Round ${round.number} · ${mins} min left`; $('roundChip').className = 'chip live';
  } else {
    $('roundChip').textContent = cohort.current_round ? `Round ${cohort.current_round} done` : 'Not started'; $('roundChip').className = 'chip';
  }
  const pending = open && (!S.my_decisions.household || !S.my_decisions.institution);
  $('decideDot').classList.toggle('hidden', !pending);
  renderSetup();
  renderDecide(open, R, h, player);
  renderFamily(h, player);
  renderTeam(player);
  renderNews();
}

function renderDecide(open, R, h, player) {
  let html = '';
  if (!open) {
    const next = (S.cohort.current_round || 0) + 1;
    html += `<div class="card"><h2>No decision right now</h2><p class="muted">${esc(S.world?.public?.headline || '')}</p>
      <p class="small muted">You will get a notification when Round ${next} opens. Meanwhile, check the News tab for what happened.</p></div>`;
    $('tab-decide').innerHTML = html; return;
  }
  html += `<div class="kicker">Round ${R.n} · ${esc(R.time)}</div><h1>${esc(R.title)}</h1><p class="muted">${esc(R.intro)}</p>`;
  // household
  const hopts = householdOptions(R, player.profile, h);
  html += `<div class="card"><div class="kicker">Your family · ${esc(PROFILES[player.profile].name)}</div><h2>${esc(R.household.prompt)}</h2><div class="opts">` +
    hopts.map(o => `<button class="opt ${S.my_decisions.household === o.id ? 'sel' : ''}" data-kind="household" data-opt="${o.id}"><b>${esc(o.label)}</b><span>${esc(o.detail || '')}</span>${chipsHtml(effectChips(o))}</button>`).join('') +
    `</div>${consequence(hopts.find(o => o.id === S.my_decisions.household), h)}</div>`;
  // institution
  const block = institutionBlock(R, player.institution);
  const inst = INSTITUTIONS[player.institution];
  if (block) {
    const votes = {}; for (const m of S.team) if (m.vote) (votes[m.vote] = votes[m.vote] || []).push(m.name);
    html += `<div class="card"><div class="kicker">Your team · ${esc(inst.name)}</div><h2>${esc(block.prompt)}</h2>
      <p class="small muted">Your team’s choice is decided by majority vote (earliest vote breaks a tie).</p><div class="opts">` +
      block.options.map(o => `<button class="opt ${S.my_decisions.institution === o.id ? 'sel' : ''}" data-kind="institution" data-opt="${o.id}"><b>${esc(o.label)}</b><span>${esc(o.detail || '')}</span><ul class="hints">${institutionHints(o).map(t => `<li>${esc(t)}</li>`).join('')}</ul>${votes[o.id] ? `<div class="votes">Voted: ${votes[o.id].map(esc).join(', ')}</div>` : ''}</button>`).join('') +
      `</div>${teamConsequence(block.options.find(o => o.id === S.my_decisions.institution), votes)}</div>`;
  }
  $('tab-decide').innerHTML = html;
  $('tab-decide').querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => decide(b.dataset.kind, b.dataset.opt)));
}

function renderFamily(h, player) {
  const P = PROFILES[player.profile];
  const dims = Object.entries(DIMS).map(([k, d]) => {
    const p = phaseOf(h.dims[k]);
    return `<div class="dim"><div class="head"><span><b>${d.label}</b></span><span class="ph ph${p}">${p}</span></div>
      <div class="bar">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= p ? 'on' + p : ''}"></i>`).join('')}</div>
      <div class="small muted">${PHASES[p - 1]} — ${esc(d.text[p - 1])}</div><div class="small" style="color:#8a949a">${DIM_PLAIN[k]}</div></div>`;
  }).join('');
  const hist = (h.history || []).map(x => `<span class="ph ph${x.lci.worst}" title="Round ${x.round}">${x.lci.worst}</span>`).join(' ');
  $('tab-family').innerHTML = `
    <div class="card"><div class="kicker">${esc(P.name)}</div><p>${esc(P.who)}</p><p class="muted">${esc(P.story)}</p>
      <p><b>Now:</b> ${esc(LOCATIONS[h.loc] || h.loc)}</p>${mapSvg(h, player.profile)}
      <p class="small">${h.known ? '✓ Responders know about your family.' : '✗ No agency has your family on a list yet.'}</p></div>
    <div class="card"><h2>Living conditions</h2><p class="small muted">Phases 1–5, as in the Living Conditions Index.</p>${dims}
      ${hist ? `<p class="small muted" style="margin-top:12px">Most severe phase by round: ${hist}</p>` : ''}</div>
    <div class="card"><h2>What you have</h2><div class="res">
      <div>Cash<b>${Math.round(h.res.cash)}</b></div><div>Debt<b>${Math.round(h.res.debt || 0)}</b></div>
      <div>${player.profile === 'H5' ? 'Livestock' : 'Productive assets'}<b>${Math.round(h.res.assets)}</b></div>
      <div>${h.group === 'hosted' || h.group === 'host' ? 'Hosting relationship' : 'Goodwill'}<b>${'●'.repeat(Math.max(0, Math.round(h.res.goodwill)))}${'○'.repeat(Math.max(0, 5 - Math.round(h.res.goodwill)))}</b></div>
      <div>Documents<b>${h.res.docs ? 'Yes' : 'None'}</b></div></div></div>`;
}

function renderTeam(player) {
  const inst = INSTITUTIONS[player.institution];
  const brief = S.world?.brief || [];
  $('tab-team').innerHTML = `<div class="card"><div class="kicker">Your team</div><h2>${esc(inst.name)}</h2><p class="muted">${esc(inst.blurb)}</p>
    <p class="small"><b>Members:</b> ${S.team.map(m => esc(m.name)).join(', ')}</p></div>
    <div class="card"><h2>What your team can see</h2>${brief.length ? brief.map(l => `<p>${esc(l)}</p>`).join('') : '<p class="muted">Nothing yet. Your picture builds up as you assess and report.</p>'}</div>`;
}

function renderNews() {
  const items = S.feed.map(f => `<div class="item ${f.team ? 'team' : ''} ${!f.team && f.body && !f.body.startsWith('Round') ? 'mine' : ''}">
    <div class="meta">${f.round ? 'Round ' + f.round : ''}${f.team ? ' · your team' : ''} · ${new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>${esc(f.body)}</div>`).join('');
  $('tab-news').innerHTML = `<div class="card feed"><h2>News</h2>${items || '<p class="muted">Nothing yet.</p>'}</div>`;
}

async function decide(kind, opt) {
  if (saving[kind]) return; saving[kind] = true;
  try { await rpc('submit_decision', { p_token: token, p_round: S.round.number, p_kind: kind, p_option: opt }); S.my_decisions[kind] = opt; await refresh(); }
  catch (e) { alert(e.message === 'round not open' ? 'This round has closed.' : e.message); refresh(); }
  finally { saving[kind] = false; }
}


const chipsHtml = chips => chips.length ? `<div class="chips">${chips.map(c => `<em class="${c.neutral ? '' : c.good ? 'good' : 'bad'}">${esc(c.text)}</em>`).join('')}</div>` : '';

function consequence(o, h) {
  if (!o) return '<p class="small muted" style="margin-top:10px">The tags show the immediate effect of each choice. What else happens depends on what organisations decide and on events in Varenna.</p>';
  const ch = previewPhases(h, o).map(c => `${DIMS[c.k].label}: <span class="ph ph${c.before}">${c.before}</span> → <span class="ph ph${c.after}">${c.after}</span>`).join('<br>');
  return `<div class="conseq"><div class="kicker">What happens</div><p style="margin:4px 0">${esc(o.feed || '')}</p>${ch ? `<p class="small" style="margin:6px 0">${ch}</p>` : ''}
    <p class="small muted" style="margin:6px 0 0">✓ Saved. When the round closes, this combines with what organisations do and what happens in Varenna. You can change your mind until then.</p></div>`;
}

function teamConsequence(o, votes) {
  if (!o) return '';
  const n = S.team.length, mine = (votes[o.id] || []).length, voted = S.team.filter(m => m.vote).length;
  const lead = Object.entries(votes).sort((a, b) => b[1].length - a[1].length)[0];
  const leading = lead && lead[0] === o.id;
  return `<div class="conseq"><div class="kicker">Your vote</div><p style="margin:4px 0">${voted} of ${n} team members have voted. ${leading ? 'Your choice is currently leading.' : 'Another option is currently leading.'}</p>
    <p class="small muted" style="margin:6px 0 0">If it wins, your team will act on: ${esc(institutionHints(o).join('; ').toLowerCase())}. Results come when the round closes.</p></div>`;
}

// ---------------------------------------------------------------- story intro
let introStep = 0;
function introSteps() {
  const p = S.player, P = PROFILES[p.profile], inst = INSTITUTIONS[p.institution], h = S.household;
  const paras = a => a.map(x => `<p>${md(x)}</p>`).join('');
  return [
    { k: 'Aftershock', t: 'Welcome to Varenna', b: `${STORY.video ? `<video src="${STORY.video}" controls playsinline style="width:100%;border-radius:12px"></video>` : mapSvg(null)}${paras(STORY.place)}` },
    { k: 'The earthquake', t: 'The night everything changed', b: `${paras(STORY.night)}<p class="small muted">${esc(STORY.fictional)}</p>` },
    { k: 'How to play', t: 'How Aftershock works', b: `<div class="howlist">${STORY.how.map(x => `<div><b>${esc(x.t)}</b>${esc(x.d)}</div>`).join('')}</div>` },
    { k: 'Your first role', t: P.name, b: `<p><b>${esc(P.who)}</b></p><p>${esc(P.story)}</p>${mapSvg(h, p.profile)}<p class="small muted">Each round you decide what your family does next. You can see your family’s situation any time on the <b>Family</b> tab.</p>` },
    { k: 'Your second role', t: inst.name, b: `<p>${esc(inst.blurb)}</p><p><b>Your teammates:</b> ${S.team.map(m => esc(m.name)).join(', ') || 'joining soon'}</p><p class="small muted">Each round your team votes on one decision. The majority wins. Your team never serves your own family directly: what you decide lands on your colleagues’ families. Your team’s picture of the response is on the <b>Team</b> tab.</p>` },
    { k: 'Reading the situation', t: 'Living conditions, phase 1 to 5', b: `<p>Your family’s situation is measured on four dimensions, using the same 1–5 phases as the Living Conditions Index.</p>
      <div class="legend">${PHASES.map((x, i) => `<span class="ph${i + 1}">${i + 1}<br>${x}</span>`).join('')}</div>
      ${Object.entries(DIMS).map(([k, d]) => `<div class="dim"><div class="head"><b>${d.label}</b><span class="ph ph${phaseOf(h.dims[k])}">${phaseOf(h.dims[k])}</span></div><div class="small muted">${DIM_PLAIN[k]}</div></div>`).join('')}
      <p class="small muted">Each choice shows its immediate effect as tags, like <span class="chips" style="display:inline-flex"><em class="good">Shelter better</em><em class="bad">−100 cash</em></span>. The full outcome comes when the round closes.</p>` },
    { k: 'Ready', t: 'You’re ready', b: `<p>Leave this app and get on with your day. When a round opens, your phone will buzz.</p><p>Tap <b>?</b> at the top any time to see this story again.</p><div id="introSetup"></div>` },
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

// ---------------------------------------------------------------- notifications setup
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
  el.innerHTML = `<h3>Turn on notifications</h3><p class="small">You’ll be alerted when a round opens, when time is running out, and when results are in.</p><button id="pushBtn" class="full">Turn on notifications</button>`;
  el.classList.remove('hidden');
  $('pushBtn').onclick = enablePush;
}

// Register this device's existing push subscription for the cohort being viewed.
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
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// ---------------------------------------------------------------- wiring
document.querySelectorAll('nav.tabs button').forEach(b => b.addEventListener('click', () => {
  tab = b.dataset.tab;
  document.querySelectorAll('nav.tabs button').forEach(x => x.classList.toggle('on', x === b));
  ['decide', 'family', 'team', 'news'].forEach(t => $('tab-' + t).classList.toggle('hidden', t !== tab));
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
