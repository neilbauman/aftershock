import { ROUNDS, DIMS, PHASES, INSTITUTIONS, PROFILES, LOCATIONS, householdOptions, institutionBlock, phaseOf } from '/lib/scenario.js';

const cfg = window.AFTERSHOCK;
const qs = new URLSearchParams(location.search);
if (qs.get('t')) localStorage.setItem('aftershock_token', qs.get('t'));
const token = qs.get('t') || localStorage.getItem('aftershock_token');
if (!token) location.replace('/');
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
  try { S = await rpc('player_state', { p_token: token }); render(); }
  catch (e) { if (/unknown player/.test(e.message)) { localStorage.removeItem('aftershock_token'); location.replace('/'); } }
}

// ---------------------------------------------------------------- rendering
function render() {
  const { cohort, round, household: h, player } = S;
  $('cohortName').textContent = `${cohort.name} · ${PROFILES[player.profile].name}`;
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
  if (qs.get('welcome')) {
    const inst = INSTITUTIONS[player.institution];
    html += `<div class="card ok"><div class="kicker">Welcome, ${esc(player.name)}</div>
      <p>You will play <b>${esc(PROFILES[player.profile].name)}</b> — ${esc(PROFILES[player.profile].who)}</p>
      <p>You also sit in the <b>${esc(inst.name)}</b> team.</p>
      <p class="small muted">Each round asks for one family decision and one team vote. See the Family and Team tabs to get to know both roles.</p></div>`;
  }
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
    hopts.map(o => `<button class="opt ${S.my_decisions.household === o.id ? 'sel' : ''}" data-kind="household" data-opt="${o.id}"><b>${esc(o.label)}</b><span>${esc(o.detail || '')}</span></button>`).join('') +
    `</div>${S.my_decisions.household ? '<div class="saved">✓ Saved. You can change it until the round closes.</div>' : ''}</div>`;
  // institution
  const block = institutionBlock(R, player.institution);
  const inst = INSTITUTIONS[player.institution];
  if (block) {
    const votes = {}; for (const m of S.team) if (m.vote) (votes[m.vote] = votes[m.vote] || []).push(m.name);
    html += `<div class="card"><div class="kicker">Your team · ${esc(inst.name)}</div><h2>${esc(block.prompt)}</h2>
      <p class="small muted">Your team’s choice is decided by majority vote (earliest vote breaks a tie).</p><div class="opts">` +
      block.options.map(o => `<button class="opt ${S.my_decisions.institution === o.id ? 'sel' : ''}" data-kind="institution" data-opt="${o.id}"><b>${esc(o.label)}</b><span>${esc(o.detail || '')}</span>${votes[o.id] ? `<div class="votes">${votes[o.id].map(esc).join(', ')}</div>` : ''}</button>`).join('') +
      `</div>${S.my_decisions.institution ? '<div class="saved">✓ Vote saved.</div>' : ''}</div>`;
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
      <div class="small muted">${PHASES[p - 1]} — ${esc(d.text[p - 1])}</div></div>`;
  }).join('');
  const hist = (h.history || []).map(x => `<span class="ph ph${x.lci.worst}" title="Round ${x.round}">${x.lci.worst}</span>`).join(' ');
  $('tab-family').innerHTML = `
    <div class="card"><div class="kicker">${esc(P.name)}</div><p>${esc(P.who)}</p><p class="muted">${esc(P.story)}</p>
      <p><b>Now:</b> ${esc(LOCATIONS[h.loc] || h.loc)}</p>
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

async function enablePush() {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return renderSetup();
    const sub = await swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(cfg.vapidPublic) });
    await rpc('save_push', { p_token: token, p_sub: sub.toJSON() });
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
setInterval(refresh, 20000);
