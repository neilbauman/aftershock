import { SCENARIO_VERSION, CHAPTERS, FAMILIES as PROFILES, DIMS, LOCATIONS, GROUPS, POCKETS, MUNIS, PROVINCES, chapterOf, phaseOf, lciOf } from '/lib/chapters.js';
import { mapSvg } from '/lib/story.js';

const cfg = window.AFTERSHOCK;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const qs = new URLSearchParams(location.search);
let code = (qs.get('c') || localStorage.getItem('aftershock_fac_code') || '').toUpperCase();
let key = qs.get('k') || (code && localStorage.getItem('aftershock_fac_key_' + code)) || '';
let D = null, busy = false;

async function api(action, extra = {}) {
  const r = await fetch('/api/fac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, code, key, ...extra }) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error);
  return j;
}

function showLogin() { $('login').classList.remove('hidden'); $('console').classList.add('hidden'); $('lcode').value = code; }
$('loginForm').onsubmit = e => { e.preventDefault(); code = $('lcode').value.trim().toUpperCase(); key = $('lkey').value.trim(); start(); };
$('createForm').onsubmit = async e => {
  e.preventDefault();
  try {
    const r = await fetch('/api/fac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', name: $('cnameIn').value, adminKey: $('ckey').value }) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error);
    localStorage.setItem('aftershock_admin', $('ckey').value);
    code = j.code; key = j.facilitator_key; start();
  } catch (err) { $('cerr').textContent = err.message; }
};

async function start() {
  try {
    D = await api('state');
    localStorage.setItem('aftershock_fac_code', code); localStorage.setItem('aftershock_fac_key_' + code, key);
    const known = JSON.parse(localStorage.getItem('aftershock_fac_cohorts') || '[]').filter(x => x.code !== code);
    known.unshift({ code, key, name: D.cohort.name }); localStorage.setItem('aftershock_fac_cohorts', JSON.stringify(known.slice(0, 30)));
    history.replaceState(null, '', `/facilitator.html?c=${code}&k=${key}`);
    $('login').classList.add('hidden'); $('console').classList.remove('hidden');
    render();
  } catch (e) { alert(e.message); showLogin(); }
}

async function poll() { if (!D || busy) return; try { D = await api('state'); render(); } catch {} }

function render() {
  const c = D.cohort, r = D.rounds.find(x => x.number === c.current_round);
  if (c.scenario_version !== SCENARIO_VERSION) {
    $('rtitle').textContent = 'This cohort was created with an older version of the game';
    $('rsub').textContent = 'Create a new cohort from the Cohorts menu (top right) and share its code with players.';
    $('rbtns').innerHTML = ''; return;
  }
  const open = r?.status === 'open';
  const cur = chapterOf(c.current_round), nx = chapterOf(c.current_round + 1);
  const humans = D.players.filter(p => !p.npc);
  $('cname').textContent = `${c.name} · code ${c.code} · ${humans.length} players`;
  const mins = open ? Math.round((new Date(r.closes_at) - Date.now()) / 60000) : null;
  $('chip').textContent = open ? `Chapter ${cur.n} open · ${mins} min` : c.current_round ? `Chapter ${cur.n} closed` : 'Lobby';
  $('chip').className = 'chip' + (open ? ' live' : '');
  $('rtitle').textContent = open ? `Chapter ${cur.n} · ${cur.time}: ${cur.title}` : nx ? `Next: Chapter ${nx.n} · ${nx.time}: ${nx.title}` : `All ${CHAPTERS.length} chapters written so far have been played`;
  const resp = D.responders, done = resp.filter(p => p.complete).length;
  $('rsub').textContent = open ? `${done}/${resp.length} players finished · closes ${new Date(r.closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
  $('rbtns').innerHTML = open
    ? `<button data-a="close">Close chapter now</button><button class="secondary" data-a="extend">+10 min</button><button class="secondary" data-a="remind">Nudge</button>`
    : nx ? `<label style="margin:0">Open for</label><input id="mins" type="number" value="40" min="2" max="600"> <span class="small">min</span><button data-a="open">Open chapter ${nx.n}</button>` : '';
  if (c.current_round > 0 && !open) $('rbtns').innerHTML += `<button class="secondary" data-a="restart">Restart cohort</button>`;
  $('rbtns').querySelectorAll('button').forEach(b => b.onclick = () => act(b.dataset.a));

  $('ptable').innerHTML = `<tr><th>Player</th><th>Family</th><th>${open ? 'This chapter' : ''}</th><th>Last seen</th></tr>` +
    humans.map(p => { const rp = resp.find(x => x.id === p.id) || {}; return `<tr><td>${esc(p.name)}</td><td>${esc(PROFILES[p.profile]?.name || p.profile)}</td><td>${open ? (rp.complete ? '<span class="tick">✓ done</span>' : `<span class="cross">${rp.done}/${rp.needed}</span>`) : ''}</td><td class="small muted">${ago(p.last_seen)}</td></tr>`; }).join('');

  const dimKeys = Object.keys(DIMS);
  $('htable').innerHTML = `<tr><th>Family</th><th>Player</th><th>Where</th>${dimKeys.map(k => `<th>${DIMS[k].short}</th>`).join('')}<th>Worst</th><th>Mean</th><th>#4+</th><th>Listed</th><th>Cash</th></tr>` +
    D.players.filter(p => D.households[p.id]).sort((a, b) => a.profile.localeCompare(b.profile)).map(p => {
      const h = D.households[p.id], l = lciOf(h.dims);
      return `<tr><td>${esc(PROFILES[p.profile]?.short || p.profile)}</td><td>${esc(p.name)}</td><td class="small">${esc(GROUPS[h.group] || h.group)}<br><span class="muted">${esc(LOCATIONS[h.loc] || h.loc)} · ${esc(MUNIS[h.muni]?.name || '')}</span></td>
        ${dimKeys.map(k => `<td><span class="ph ph${phaseOf(h.dims[k])}">${phaseOf(h.dims[k])}</span></td>`).join('')}
        <td><span class="ph ph${l.worst}">${l.worst}</span></td><td>${l.mean}</td><td>${l.count4}</td><td>${h.known ? '✓' : '<b style="color:var(--accent)">✗</b>'}</td><td>${Math.round(h.res.cash)}</td></tr>`;
    }).join('');

  const aggRows = (obj, names) => Object.entries(obj || {}).map(([k, v]) => `<tr><td>${esc(names[k] || LOCATIONS[k] || k)}</td><td>${v.n}</td><td><span class="ph ph${v.phase20}">${v.phase20}</span></td><td>${v.meanWorst}</td></tr>`).join('');
  const head = l => `<tr><th>${l}</th><th>HH</th><th>Phase (20%)</th><th>Mean worst</th></tr>`;
  $('gtable').innerHTML = head('Family') + aggRows(D.lci.byFamily, Object.fromEntries(Object.entries(PROFILES).map(([k, v]) => [k, v.name]))) + head('Group') + aggRows(D.lci.byGroup, GROUPS);
  $('ltable').innerHTML = head('Location / pocket') + aggRows(D.lci.byLoc, { ...POCKETS, ...LOCATIONS });
  $('areamap').innerHTML = mapSvg(null, null, { phases: Object.fromEntries(Object.entries(D.lci.byMuni || {}).map(([k, v]) => [k, v.phase20])), orchard: Object.values(D.households).some(h => h.loc === 'orchard') });
  $('provtable').innerHTML = `<table>${head('Province')}${aggRows(D.lci.byProvince, Object.fromEntries(Object.entries(PROVINCES).map(([k, v]) => [k, v.name])))}${head('Municipality')}${aggRows(D.lci.byMuni, Object.fromEntries(Object.entries(MUNIS).map(([k, v]) => [k, v.name])))}</table>`;

  const last = D.world?.stats?.slice(-1)[0];
  if (last) {
    const C = chapterOf(last.chapter);
    const label = key => { const [f, st, id] = key.split(':'); const step = C.steps.find(x => x.id === st); return `${PROFILES[f]?.short}: ${id === 'wait' ? 'Wait and see' : step?.options.find(o => o.id === id)?.label || id}`; };
    $('results').innerHTML = `<p><b>Chapter ${last.chapter} · ${esc(C.title)}</b> · ${last.defaults} decisions defaulted · ${last.known} families on an aid list</p>
      <p><b>Who reached families:</b> ${Object.entries(last.actors).map(([k, v]) => `${esc(k)} ${v}`).join(' · ') || 'nobody'}</p>
      <p><b>Families with someone injured this chapter:</b> ${last.injuries || 0}</p>
      ${last.community ? `<p><b>Communities (20% rule, background population + your families):</b> ${Object.entries(last.community).map(([m, c]) => `${esc(m[0].toUpperCase() + m.slice(1))} <span class="ph ph${c.phase20}">${c.phase20}</span> ${c.p45}% in 4–5`).join(' · ')}</p>` : ''}
      <p>${Object.entries(last.choices).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${esc(label(k))} (${v})`).join('<br>')}</p>`;
  } else $('results').innerHTML = '<p class="muted">No chapter closed yet.</p>';

  $('alerts').innerHTML = D.alerts.length ? D.alerts.map(a => `<div class="alertline ${a.level}">${esc(a.text)}</div>`).join('') : '<p class="small muted">No alerts.</p>';
  const link = `${location.origin}/?c=${c.code}`;
  $('joinLink').textContent = link; $('joinLink').href = link;
  $('qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(link)}`;
  $('bteam').closest('label')?.remove?.(); $('bteam').style.display = 'none';
  $('world').innerHTML = `<p>${D.pushCount} player devices with notifications.</p><p>Chapters available: ${CHAPTERS.length} of 8.</p>`;
}

const ago = t => { const m = Math.round((Date.now() - new Date(t)) / 60000); return m < 1 ? 'now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; };

async function act(a) {
  if (a === 'restart' && !confirm('Restart this cohort? All rounds, decisions and news are cleared and every family goes back to the start. Players stay joined.')) return;
  busy = true; $('rmsg').textContent = 'Working…';
  try {
    const out = await api(a, { minutes: a === 'open' ? Number($('mins').value) : 10 });
    $('rmsg').textContent = a === 'open' ? `Act ${out.act} ${out.block} block opened. ${out.pushed} notifications sent.`
      : a === 'close' ? `Block resolved. ${out.pushed} notifications sent.`
      : a === 'remind' ? `${out.reminded} reminders sent (${out.missing} players outstanding).`
      : a === 'restart' ? `Cohort restarted. ${out.players} players kept; everyone is back at the beginning.` : 'Done.';
    D = await api('state'); render();
  } catch (e) { $('rmsg').textContent = e.message; }
  busy = false;
}

$('bsend').onclick = async () => {
  const text = $('btext').value.trim(); if (!text) return;
  try { const o = await api('broadcast', { text, team: $('bteam').value }); $('btext').value = ''; alert(`Sent. ${o.pushed} notifications delivered.`); } catch (e) { alert(e.message); }
};

$('facPush').onclick = async () => {
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    if (await Notification.requestPermission() !== 'granted') return alert('Notifications were not allowed.');
    const raw = atob((cfg.vapidPublic + '='.repeat((4 - cfg.vapidPublic.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from([...raw].map(c => c.charCodeAt(0))) });
    const r = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/fac_save_push`, { method: 'POST', headers: { apikey: cfg.supabaseKey, Authorization: `Bearer ${cfg.supabaseKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_code: code, p_key: key, p_sub: sub.toJSON() }) });
    if (!r.ok) throw new Error('Could not save subscription');
    const t = await api('testpush');
    alert(t.pushed ? 'Facilitator alerts are on. A test notification was sent.' : 'Saved, but the test notification did not arrive.');
  } catch (e) { alert(e.message); }
};

if (code && key) start(); else showLogin();
setInterval(poll, 10000);

// ---------------------------------------------------------------- cohort management
$('cohortsBtn').onclick = async () => {
  const known = JSON.parse(localStorage.getItem('aftershock_fac_cohorts') || '[]');
  const admin = localStorage.getItem('aftershock_admin');
  let all = null;
  if (admin) { try { const r = await fetch('/api/fac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list', adminKey: admin }) }); if (r.ok) all = await r.json(); } catch {} }
  const rows = (all || known).map(c => `<div class="card" style="${c.code === code ? 'border-color:var(--accent)' : ''}"><a style="display:block;text-decoration:none;color:inherit" href="/facilitator.html?c=${c.code}&k=${c.key}">
      <b>${esc(c.name)}</b> <span class="small muted">· ${c.code}${c.code === code ? ' · open now' : ''}</span>
      ${all ? `<br><span class="small muted">${c.players} players · ${c.current_round ? `Act ${Math.ceil(c.current_round / 2)} ${c.current_round % 2 ? 'family' : 'response'}` : 'not started'} · ${c.scenario} · created ${new Date(c.created_at).toLocaleDateString()}</span>` : ''}</a>
      ${all ? `<button class="secondary small" data-del="${c.code}" data-name="${esc(c.name)}" style="margin-top:8px;padding:6px 10px">Delete</button>` : ''}</div>`).join('');
  $('cohorts').innerHTML = `<div class="wrap"><div class="kicker">Facilitator</div><h1>Cohorts</h1>
    ${rows || '<p class="muted">No cohorts opened on this device yet.</p>'}
    ${all ? '' : `<form id="adminForm" class="card"><label>Admin key (to list every cohort)</label><input id="adminKey"><p><button class="full secondary">Show all cohorts</button></p></form>`}
    <form id="newCohort" class="card"><h2>New cohort</h2><label>Name</label><input id="ncName" required placeholder="e.g. Retreat 23–26 Nov">
      ${admin ? '' : '<label>Admin key</label><input id="ncKey" required>'}<p><button class="full">Create cohort</button></p><p id="ncErr" class="small"></p></form></div>
    <div class="bar2"><div class="row"><button id="cClose">Close</button></div></div>`;
  $('cohorts').classList.remove('hidden');
  $('cClose').onclick = () => $('cohorts').classList.add('hidden');
  $('cohorts').querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    const c = b.dataset.del;
    if (!confirm(`Delete "${b.dataset.name}" (${c})? All its players, decisions and results are permanently removed. This cannot be undone.`)) return;
    const r = await fetch('/api/fac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', adminKey: admin, code: c }) });
    if (!r.ok) return alert((await r.json()).error);
    const left = JSON.parse(localStorage.getItem('aftershock_fac_cohorts') || '[]').filter(x => x.code !== c);
    localStorage.setItem('aftershock_fac_cohorts', JSON.stringify(left));
    if (c === code) { location.href = '/facilitator.html'; return; }
    $('cohortsBtn').click();
  });
  if ($('adminForm')) $('adminForm').onsubmit = e => { e.preventDefault(); localStorage.setItem('aftershock_admin', $('adminKey').value.trim()); $('cohortsBtn').click(); };
  $('newCohort').onsubmit = async e => {
    e.preventDefault();
    const adminKey = admin || $('ncKey').value.trim();
    const r = await fetch('/api/fac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', name: $('ncName').value, adminKey }) });
    const j = await r.json();
    if (!r.ok) { $('ncErr').textContent = j.error; return; }
    localStorage.setItem('aftershock_admin', adminKey);
    location.href = `/facilitator.html?c=${j.code}&k=${j.facilitator_key}`;
  };
};
