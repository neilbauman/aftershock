import { ROUNDS, DIMS, INSTITUTIONS, INSTITUTION_ORDER, PROFILES, LOCATIONS, GROUPS, POCKETS, institutionBlock, householdOptions, phaseOf, lciOf } from '/lib/scenario.js';

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
    code = j.code; key = j.facilitator_key; start();
  } catch (err) { $('cerr').textContent = err.message; }
};

async function start() {
  try {
    D = await api('state');
    localStorage.setItem('aftershock_fac_code', code); localStorage.setItem('aftershock_fac_key_' + code, key);
    history.replaceState(null, '', `/facilitator.html?c=${code}&k=${key}`);
    $('login').classList.add('hidden'); $('console').classList.remove('hidden');
    render();
  } catch (e) { alert(e.message); showLogin(); }
}

async function poll() { if (!D || busy) return; try { D = await api('state'); render(); } catch {} }

function render() {
  const c = D.cohort, r = D.rounds.find(x => x.number === c.current_round);
  const R = ROUNDS.find(x => x.n === c.current_round);
  $('cname').textContent = `${c.name} · code ${c.code} · ${D.players.length} players`;
  const open = r?.status === 'open';
  const mins = open ? Math.round((new Date(r.closes_at) - Date.now()) / 60000) : null;
  $('chip').textContent = open ? `Round ${r.number} open · ${mins} min` : c.current_round ? `Round ${c.current_round} resolved` : 'Lobby';
  $('chip').className = 'chip' + (open ? ' live' : '');

  // round control
  const nextR = ROUNDS.find(x => x.n === c.current_round + 1);
  $('rtitle').textContent = open ? `Round ${R.n} · ${R.time}: ${R.title}` : nextR ? `Next: Round ${nextR.n} · ${nextR.time}: ${nextR.title}` : 'All prototype rounds played';
  const resp = D.responders, doneH = resp.filter(p => p.household).length, doneI = resp.filter(p => p.institutionVote).length;
  $('rsub').textContent = open ? `${doneH}/${resp.length} family decisions · ${doneI}/${resp.length} team votes · closes ${new Date(r.closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : (nextR ? nextR.intro : 'Rounds 7–20 and the coordination injects come next.');
  $('rbtns').innerHTML = open
    ? `<button data-a="close">Close and resolve now</button><button class="secondary" data-a="extend">+10 min</button><button class="secondary" data-a="remind">Nudge non-responders</button>`
    : nextR ? `<label style="margin:0">Open for</label><input id="mins" type="number" value="45" min="2" max="600"> <span class="small">min</span><button data-a="open">Open Round ${nextR.n}</button>` : '';
  $('rbtns').querySelectorAll('button').forEach(b => b.onclick = () => act(b.dataset.a));

  // players
  const subsBy = new Set(); // not exposed individually; use alerts
  $('ptable').innerHTML = `<tr><th>Player</th><th>Family</th><th>Team</th><th>Family decision</th><th>Team vote</th><th>Last seen</th></tr>` +
    D.players.map(p => {
      const rp = resp.find(x => x.id === p.id) || {};
      const h = D.households[p.id];
      const hopt = open && h ? householdOptions(R, p.profile, h) : [];
      const dec = D.decisionsNow?.[p.id];
      return `<tr><td>${esc(p.name)}</td><td>${p.profile} ${esc(PROFILES[p.profile].name)}</td><td>${esc(INSTITUTIONS[p.institution].short)}</td>
        <td>${open ? (rp.household ? '<span class="tick">✓</span>' : '<span class="cross">—</span>') : ''}</td>
        <td>${open ? (rp.institutionVote ? `<span class="tick">✓</span> <span class="small muted">${esc(optLabel(R, p.institution, rp.institutionVote))}</span>` : '<span class="cross">—</span>') : ''}</td>
        <td class="small muted">${ago(p.last_seen)}</td></tr>`;
    }).join('');

  // households LCI
  const dimKeys = Object.keys(DIMS);
  $('htable').innerHTML = `<tr><th>Household</th><th>Player</th><th>Where</th>${dimKeys.map(k => `<th>${DIMS[k].short}</th>`).join('')}<th>Worst</th><th>Mean</th><th>#4+</th><th>Known</th><th>Cash</th></tr>` +
    D.players.filter(p => D.households[p.id]).map(p => {
      const h = D.households[p.id], l = lciOf(h.dims);
      return `<tr><td>${p.profile} ${esc(PROFILES[p.profile].name)}</td><td>${esc(p.name)}</td><td class="small">${esc(GROUPS[h.group] || h.group)}<br><span class="muted">${esc(LOCATIONS[h.loc] || h.loc)}</span></td>
        ${dimKeys.map(k => `<td><span class="ph ph${phaseOf(h.dims[k])}">${phaseOf(h.dims[k])}</span></td>`).join('')}
        <td><span class="ph ph${l.worst}">${l.worst}</span></td><td>${l.mean}</td><td>${l.count4}</td><td>${h.known ? '✓' : '<b style="color:var(--accent)">✗</b>'}</td><td>${Math.round(h.res.cash)}</td></tr>`;
    }).join('');

  const aggRows = (obj, names) => Object.entries(obj).map(([k, v]) => `<tr><td>${esc(names[k] || LOCATIONS[k] || k)}</td><td>${v.n}</td><td><span class="ph ph${v.phase20}">${v.phase20}</span></td><td>${v.meanWorst}</td></tr>`).join('');
  $('gtable').innerHTML = `<tr><th>Group</th><th>HH</th><th>Phase (20%)</th><th>Mean worst</th></tr>` + aggRows(D.lci.byGroup, GROUPS);
  $('ltable').innerHTML = `<tr><th>Location</th><th>HH</th><th>Phase (20%)</th><th>Mean worst</th></tr>` + aggRows(D.lci.byLoc, POCKETS);

  // results
  const last = D.world?.stats?.slice(-1)[0];
  if (last) {
    const RR = ROUNDS.find(x => x.n === last.round);
    const hh = Object.entries(last.household).map(([k, v]) => `${esc(hLabel(RR, k))}: ${v}`).join(' · ');
    const teams = INSTITUTION_ORDER.map(i => `<b>${INSTITUTIONS[i].short}</b>: ${last.teams[i] ? esc(optLabel(RR, i, last.teams[i])) : '<i>no decision</i>'}${last.reached[i] != null ? ` (reached ${last.reached[i]}${last.gaps[i] ? `, ${last.gaps[i]} not on lists` : ''})` : ''}`).join('<br>');
    $('results').innerHTML = `<p><b>Round ${last.round}</b> · ${last.defaults} family decisions defaulted to “wait” · ${last.duplicates} duplicated deliveries</p><p>${hh}</p><p>${teams}</p>`;
  } else $('results').innerHTML = '<p class="muted">No rounds resolved yet.</p>';

  // alerts, invite, world
  $('alerts').innerHTML = D.alerts.length ? D.alerts.map(a => `<div class="alertline ${a.level}">${esc(a.text)}</div>`).join('') : '<p class="small muted">No alerts.</p>';
  const link = `${location.origin}/?c=${c.code}`;
  $('joinLink').textContent = link; $('joinLink').href = link;
  $('qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(link)}`;
  if ($('bteam').options.length === 1) INSTITUTION_ORDER.forEach(i => $('bteam').add(new Option(INSTITUTIONS[i].short + ' team', i)));
  const w = D.world || {};
  $('world').innerHTML = `<p>Coordination level: ${w.coord ?? 0} · Authority relationship: ${(w.goodwill ?? 0).toFixed(1)} · Hill road: ${w.hillsOpen ? 'open' : 'closed'}</p>
    <p>Policies: ${[w.sitesOnly && 'distributions at sites only', w.cashBlocked && 'in-kind only', w.hostFocus && 'host-family focus', w.stadiumFormal && 'stadium formalised', w.stadiumClear && 'stadium to be cleared', w.schoolClose && 'schools reopen Month 2'].filter(Boolean).join(', ') || 'none yet'}</p>
    <p>3W: ${INSTITUTION_ORDER.filter(i => INSTITUTIONS[i].agency).map(i => `${INSTITUTIONS[i].short} ${w.reported?.[i] === 1 ? 'full' : w.reported?.[i] === 0.5 ? 'partial' : 'none'}`).join(' · ')}</p>
    <p>${D.pushCount} player devices with notifications.</p>`;
}

const optLabel = (R, inst, id) => institutionBlock(R, inst)?.options.find(o => o.id === id)?.label || id;
const hLabel = (R, id) => id === 'wait' ? 'Wait and see' : R.household.options.find(o => o.id === id)?.label || id;
const ago = t => { const m = Math.round((Date.now() - new Date(t)) / 60000); return m < 1 ? 'now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; };

async function act(a) {
  busy = true; $('rmsg').textContent = 'Working…';
  try {
    const out = await api(a, { minutes: a === 'open' ? Number($('mins').value) : 10 });
    $('rmsg').textContent = a === 'open' ? `Round ${out.opened} opened. ${out.pushed} notifications sent.`
      : a === 'close' ? `Round ${out.resolved} resolved. ${out.pushed} notifications sent.`
      : a === 'remind' ? `${out.reminded} reminders sent (${out.missing} players outstanding).` : 'Done.';
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
