import { CHAPTERS, FAMILIES, DIMS, PHASES, LOCATIONS, MUNIS, chapterOf, chapterSteps, texts, phaseOf, lifeNow, STYPES, stypeOf } from '/lib/chapters.js';
import { STORY, DIM_PLAIN, effectChips, previewPhases, mapSvg, md } from '/lib/story.js';
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
const paras = arr => (arr || []).map(t => `<p>${md(t)}</p>`).join('');
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
    if (FAMILIES[S.player.profile]) members.upsert({ t: token, code: S.cohort.code, cohort: S.cohort.name, name: S.player.name, family: FAMILIES[S.player.profile].name });
    render(); syncPush();
  } catch (e) { if (/unknown player/.test(e.message)) { members.remove(token); location.replace('/'); } }
}

const fam = () => FAMILIES[S.player.profile];
const isOpen = () => S.round?.status === 'open';

// ---------------------------------------------------------------- rendering
function render() {
  if (!fam() || !S.household?.flags) {
    $('tab-decide').innerHTML = `<div class="card alert"><h2>This cohort uses an older version of Aftershock</h2><p>Ask your facilitator for the new cohort code, then join it from <a href="/?join=1">the start page</a>.</p></div>`;
    return;
  }
  document.body.classList.add('mode-family');
  $('cohortName').textContent = `${S.cohort.name} · ${fam().name}`;
  $('switchBtn').firstChild.textContent = members.list().length > 1 ? 'AFTERSHOCK ▾' : 'AFTERSHOCK';
  const open = isOpen();
  if (open) {
    const mins = Math.max(0, Math.round((new Date(S.round.closes_at) - Date.now()) / 60000));
    $('roundChip').textContent = `Chapter ${S.round.number} · ${mins} min`; $('roundChip').className = 'chip live';
  } else { $('roundChip').textContent = S.cohort.current_round ? `Chapter ${S.cohort.current_round} closed` : 'Not started'; $('roundChip').className = 'chip'; }
  const ch = open ? chapterOf(S.round.number) : null;
  $('decideDot').classList.toggle('hidden', !(open && chapterSteps(ch, S.player.profile, S.household, S.my_decisions).some(s => !s.chosen)));
  renderSetup();
  renderStory();
  renderFamily();
  renderYear();
  maybeChapterCard();
}

function situation(h, prevHist, title = 'Your situation') {
  const prev = prevHist?.dims;
  const rows = Object.entries(DIMS).map(([k, d]) => {
    const p = phaseOf(h.dims[k]), was = prev ? phaseOf(prev[k]) : p;
    const arrow = p > was ? ' <span style="color:var(--p5)">▲ worse</span>' : p < was ? ' <span style="color:var(--p1)">▼ better</span>' : '';
    return `<div class="dim"><div class="head"><span><b>${d.short}</b> <span class="small muted">${esc(d.text[p - 1])}</span>${arrow}</span><span class="ph ph${p}">${p}</span></div></div>`;
  }).join('');
  return `<div class="card"><div class="kicker">${title}</div>
    <p style="margin:6px 0"><b>Where you are:</b> ${esc(LOCATIONS[h.loc] || h.loc)}, ${esc(MUNIS[h.muni]?.name || '')} <span class="small muted">· ${esc(STYPES[stypeOf(h)]?.label || '')}</span></p>
    <div class="res" style="margin-bottom:8px"><div>Cash<b>${Math.round(h.res.cash)}</b></div><div>Debt<b>${Math.round(h.res.debt || 0)}</b></div>
    <div>${S.player.profile === 'mendes' ? 'Animals' : 'Tools &amp; stock'}<b>${Math.round(h.res.assets)}</b></div><div>On an aid list<b>${h.known ? 'Yes' : 'No'}</b></div></div>${rows}</div>`;
}

function renderStory() {
  const h = S.household, open = isOpen();
  const banner = `<div class="role role-family"><div class="kicker">Your family</div><h2>${esc(fam().name)}</h2><div class="small">${esc(fam().who)}</div></div>`;
  if (!open) {
    const last = (h.story || []).at(-1);
    const nextCh = chapterOf((S.cohort.current_round || 0) + 1);
    $('tab-decide').innerHTML = banner + (last ? `<div class="card"><div class="kicker">After chapter ${last.ch} · ${esc(last.title)}</div>${paras(h.pending)}</div>` : '') +
      situation(h, (h.history || []).at(-2)) +
      `<div class="card"><p class="small">${nextCh ? `Next: <b>Chapter ${nextCh.n} · ${esc(nextCh.title)}</b> (${esc(nextCh.time)}). Your phone will buzz when it opens.` : 'There are no more chapters yet.'}</p><p class="small muted">Your family’s story so far is under <b>Your year</b>.</p></div>`;
    return;
  }
  const ch = chapterOf(S.round.number);
  const steps = chapterSteps(ch, S.player.profile, h, S.my_decisions);
  let html = banner + `<div class="kicker" style="margin-top:14px">Chapter ${ch.n} · ${esc(ch.time)}</div><h1>${esc(ch.title)}</h1>`;
  if (ch.n > 1 && h.pending?.length) html += `<div class="card"><div class="kicker">Since last time</div>${paras(h.pending)}</div>`;
  if (ch.valley?.length) html += `<div class="card valley"><div class="kicker">Meanwhile in the valley</div>${paras(ch.valley)}</div>`;
  html += `<div class="card story">${paras(texts(ch.scene[S.player.profile], h, S.player.profile))}</div>`;
  if (ch.n > 1) html += `<div class="card life"><div class="kicker">Your life now</div>${paras(lifeNow(h, S.player.profile))}</div>`;
  html += ch.n === 1 ? situation(h, null, 'Before the earthquake') : situation(h, (h.history || []).at(-2));
  let shown = false;
  steps.forEach((st, i) => {
    const label = `Decision ${i + 1} of ${steps.length}`;
    if (st.chosen && editing !== st.id) {
      const ch2 = previewPhases(st.before, st.chosen).map(c => `${DIMS[c.k].short} <span class="ph ph${c.before}">${c.before}</span>→<span class="ph ph${c.after}">${c.after}</span>`).join(' · ');
      html += `<div class="card done"><div class="kicker">${label} ✓</div><div class="small muted">${esc(st.prompt)}</div><p style="margin:6px 0"><b>${esc(st.chosen.label)}</b></p>
        <div class="conseq story">${md(st.chosen.after || '')}${ch2 ? `<div class="small" style="margin-top:8px">${ch2}</div>` : ''}</div>
        <button class="secondary small" data-edit="${st.id}" style="margin-top:8px;padding:6px 10px">Change</button></div>`;
      return;
    }
    if (shown) { html += `<div class="card muted small">${label} comes next.</div>`; return; }
    shown = true;
    html += `<div class="card current"><div class="kicker">${label}</div><h2>${esc(st.prompt)}</h2><div class="opts">` +
      (st.options.length ? '' : '<p class="small muted">Nothing you can do here right now — this decision will pass.</p>') + st.options.map(o => `<button class="opt ${S.my_decisions[st.id] === o.id ? 'sel' : ''}" data-kind="${st.id}" data-opt="${o.id}"><b>${esc(o.label)}</b><span>${esc(o.detail || '')}</span>${chipsHtml(effectChips(o))}</button>`).join('') + `</div></div>`;
  });
  if (!shown) html += `<div class="card ok"><b>That’s this chapter.</b><p class="small" style="margin:6px 0 0">When it closes, you’ll find out what happened next — to your family, and to the valley.</p></div>`;
  $('tab-decide').innerHTML = html;
  $('tab-decide').querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => decide(b.dataset.kind, b.dataset.opt)));
  $('tab-decide').querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => { editing = b.dataset.edit; renderStory(); }));
}

const chipsHtml = chips => chips.length ? `<div class="chips">${chips.map(c => `<em class="${c.neutral ? '' : c.good ? 'good' : 'bad'}">${esc(c.text)}</em>`).join('')}</div>` : '';

function renderFamily() {
  const h = S.household, F = fam();
  const dims = Object.entries(DIMS).map(([k, d]) => {
    const p = phaseOf(h.dims[k]);
    return `<div class="dim"><div class="head"><span><b>${d.label}</b></span><span class="ph ph${p}">${p}</span></div>
      <div class="bar">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= p ? 'on' + p : ''}"></i>`).join('')}</div>
      <div class="small muted">${PHASES[p - 1]} — ${esc(d.text[p - 1])}</div><div class="small" style="color:#8a949a">${DIM_PLAIN[k]}</div></div>`;
  }).join('');
  const hist = (h.history || []).map(x => `<span class="ph ph${x.lci.worst}" title="${x.ch ? 'Chapter ' + x.ch : 'Before the earthquake'}">${x.lci.worst}</span>`).join(' ');
  $('tab-family').innerHTML = `
    <div class="role role-family"><div class="kicker">Your family</div><h2>${esc(F.name)}</h2><div class="small">${esc(F.who)}</div></div>
    <div class="card"><p>${esc(F.people)}</p><p><b>Now:</b> ${esc(LOCATIONS[h.loc] || h.loc)} · ${esc(MUNIS[h.muni]?.name || '')}</p>${mapSvg(h, S.player.profile)}</div>
    <div class="card"><h2>Living conditions</h2><p class="small muted">Phases 1–5, as in the Living Conditions Index.</p>${dims}
      ${hist ? `<p class="small muted" style="margin-top:12px">Most severe phase, from before the earthquake onwards: ${hist}</p>` : ''}</div>`;
}

function renderYear() {
  const h = S.household;
  const entries = (h.story || []).map(r => `<div class="card"><div class="kicker">Chapter ${r.ch} · ${esc(r.time)}</div><h2>${esc(r.title)}</h2>
    ${r.decisions.map(d => `<p class="small muted" style="margin:8px 0 2px">${esc(d.prompt)}</p><p style="margin:0"><b>${esc(d.label)}</b></p><p class="small">${md(d.after || '')}</p>`).join('')}
    ${(r.happened?.length || r.drift?.length) ? `<div class="conseq"><div class="kicker">What happened next</div>${paras([...(r.happened || []), ...(r.drift || [])])}</div>` : ''}</div>`).reverse().join('');
  const msgs = S.feed.filter(f => f.body.startsWith('Facilitator')).map(f => `<p class="small">${esc(f.body)}</p>`).join('');
  $('tab-news').innerHTML = (msgs ? `<div class="card"><div class="kicker">From your facilitator</div>${msgs}</div>` : '') + (entries || '<div class="card"><p class="muted">Your family’s year will be written here, chapter by chapter.</p></div>');
}

async function decide(kind, opt) {
  if (saving) return; saving = true;
  try { await rpc('submit_decision', { p_token: token, p_round: S.round.number, p_kind: kind, p_option: opt }); S.my_decisions[kind] = opt; editing = null; render(); refresh(); }
  catch (e) { alert(e.message === 'round not open' ? 'This chapter has closed.' : e.message); refresh(); }
  finally { saving = false; }
}

// ---------------------------------------------------------------- chapter card
function maybeChapterCard() {
  if (!isOpen() || !$('intro').classList.contains('hidden')) return;
  const key = `aftershock_seen_${token}_${S.round.number}`;
  if (localStorage.getItem(key) || !localStorage.getItem('aftershock_intro_' + token)) return;
  const ch = chapterOf(S.round.number);
  $('rolecard').innerHTML = `<div class="rc role-family"><div class="kicker">${esc(fam().name)}</div>
    <p style="margin:16px 0 4px">Chapter ${ch.n} · ${esc(ch.time)}</p><h1 style="font-size:30px;margin:0 0 12px">${esc(ch.title)}</h1>
    <p class="small" style="opacity:.85">${ch.steps.length} decisions. A few minutes.</p>
    <button id="rcGo" class="full" style="margin-top:20px;background:#fff;color:var(--ink)">Begin</button></div>`;
  $('rolecard').classList.remove('hidden');
  $('rcGo').onclick = () => { localStorage.setItem(key, '1'); $('rolecard').classList.add('hidden'); window.scrollTo(0, 0); };
}

// ---------------------------------------------------------------- intro
const HOW = [
  { t: 'You are one family, for one year', d: 'From the night of the earthquake to the anniversary, in eight chapters over three days.' },
  { t: 'Each chapter is a scene in your family’s story', d: 'Read what has happened, look at your situation, then make two or three decisions. Each one shows what happens straight away.' },
  { t: 'The first responders are you', d: 'Neighbours, family and local organisations are there from the first hour. International help arrives later — and not to everyone.' },
  { t: 'Your choices shape your story', d: 'Where you sleep, who you tell, what you sell and who you help change what comes next — and who can find you.' },
  { t: 'Your phone tells you when', d: 'Each chapter opens with a notification and stays open for 30–45 minutes. It takes about five minutes.' },
  { t: 'Others are living the same story', d: 'Several colleagues play the same family. At the end you’ll compare how differently the same year turned out.' },
  { t: 'There are no right answers', d: 'Only real trade-offs. On the last day, everyone works together on the response — using what happened to your families.' },
];
let introStep = 0;
function introSteps() {
  const F = fam(), h = S.household;
  return [
    { k: 'Aftershock', t: 'Welcome to the Vara valley', b: `${STORY.video ? `<video src="${STORY.video}" controls playsinline style="width:100%;border-radius:12px"></video>` : mapSvg(null, null)}${paras(STORY.place)}<p class="small muted">${esc(STORY.fictional)}</p>` },
    { k: 'How to play', t: 'How Aftershock works', b: `<div class="howlist">${HOW.map(x => `<div><b>${esc(x.t)}</b>${esc(x.d)}</div>`).join('')}</div>` },
    { k: 'Your family', t: F.name, b: `<div class="role role-family"><h2>${esc(F.name)}</h2><div class="small">${esc(F.who)}</div></div><p>${esc(F.people)}</p>${mapSvg(h, S.player.profile)}` },
    { k: 'Reading the situation', t: 'Living conditions, phase 1 to 5', b: `<p>Your family’s situation is measured on four dimensions, using the same 1–5 phases as the Living Conditions Index — green is fine, red is catastrophic.</p>
      <div class="legend">${PHASES.map((x, i) => `<span class="ph${i + 1}">${i + 1}<br>${x}</span>`).join('')}</div>
      ${Object.entries(DIMS).map(([k, d]) => `<div class="dim"><div class="head"><b>${d.label}</b></div><div class="small muted">${DIM_PLAIN[k]}</div></div>`).join('')}` },
    { k: 'Ready', t: 'It is 21:40 on a cold Tuesday', b: `<p>Your phone will buzz when the first chapter opens. Find a quiet five minutes, and read it as if it were happening to you.</p><p>Tap <b>?</b> at the top any time to see this again.</p><div id="introSetup"></div>` },
  ];
}
function showIntro(step = 0) {
  introStep = step;
  const steps = introSteps(), st = steps[introStep], last = introStep === steps.length - 1;
  $('intro').innerHTML = `<div class="wrap"><div class="dots">${steps.map((_, i) => `<i class="${i === introStep ? 'on' : ''}"></i>`).join('')}</div>
    <div class="kicker">${esc(st.k)}</div><h1>${esc(st.t)}</h1>${st.b}</div>
    <div class="bar2"><div class="row">${introStep ? '<button class="secondary" id="iBack">Back</button>' : ''}<button id="iNext">${last ? 'Start' : 'Next'}</button></div></div>`;
  $('intro').classList.remove('hidden'); $('intro').scrollTop = 0;
  if (last) { const el = $('setup'); if (!el.classList.contains('hidden')) $('introSetup').appendChild(el.cloneNode(true)).querySelector('#pushBtn')?.addEventListener('click', enablePush); }
  $('iNext').onclick = () => last ? closeIntro() : showIntro(introStep + 1);
  if ($('iBack')) $('iBack').onclick = () => showIntro(introStep - 1);
}
function closeIntro() { localStorage.setItem('aftershock_intro_' + token, '1'); $('intro').classList.add('hidden'); render(); }
$('helpBtn').onclick = () => S && fam() && showIntro(0);
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
    el.innerHTML = `<h3>One step to get notifications on iPhone</h3><ol class="steps"><li>Tap the <b>Share</b> button in Safari.</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open <b>Aftershock</b> from your home screen and tap “Turn on notifications”.</li></ol>`;
    el.classList.remove('hidden'); return;
  }
  if (!pushOK) { el.innerHTML = '<p class="small">This browser can’t receive notifications. Keep this page open, or try Chrome or Safari.</p>'; el.classList.remove('hidden'); return; }
  const sub = swReg && await swReg.pushManager.getSubscription();
  if (Notification.permission === 'granted' && sub) { el.classList.add('hidden'); return; }
  if (Notification.permission === 'denied') { el.innerHTML = '<p class="small">Notifications are blocked for this site. Turn them on in your browser or phone settings.</p>'; el.classList.remove('hidden'); return; }
  el.innerHTML = `<h3>Turn on notifications</h3><p class="small">You’ll be told when each chapter opens and when time is running out.</p><button id="pushBtn" class="full">Turn on notifications</button>`;
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
function urlB64(b64) { const raw = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); }

// ---------------------------------------------------------------- wiring
document.querySelectorAll('nav.tabs button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('nav.tabs button').forEach(x => x.classList.toggle('on', x === b));
  ['decide', 'family', 'news'].forEach(t => $('tab-' + t).classList.toggle('hidden', t !== b.dataset.tab));
  window.scrollTo(0, 0);
}));
if ('serviceWorker' in navigator) {
  swReg = await navigator.serviceWorker.register('/sw.js');
  navigator.serviceWorker.addEventListener('message', e => e.data?.type === 'refresh' && refresh());
}
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && refresh());
await refresh();
if (S && fam() && !localStorage.getItem('aftershock_intro_' + token)) showIntro(0);
setInterval(refresh, 20000);
