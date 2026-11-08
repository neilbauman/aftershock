import { ACTS, TOTAL_ROUNDS, roundInfo, DIMS, INSTITUTIONS, INSTITUTION_ORDER, PROFILES, LOCATIONS, GROUPS, POCKETS, MUNIS, STAFF, AGENCIES, phaseOf, lciOf } from '/lib/scenario.js';

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
  const open = r?.status === 'open';
  const cur = c.current_round ? roundInfo(c.current_round) : null;
  const nextN = c.current_round + 1, nx = nextN <= TOTAL_ROUNDS ? roundInfo(nextN) : null;
  const humans = D.players.filter(p => !p.npc);
  $('cname').textContent = `${c.name} · code ${c.code} · ${humans.length} players${D.npcs ? ` + ${D.npcs} computer families` : ''}`;
  const mins = open ? Math.round((new Date(r.closes_at) - Date.now()) / 60000) : null;
  $('chip').textContent = open ? `Act ${cur.act.n} · ${cur.block} block · ${mins} min` : c.current_round ? `Act ${cur.act.n} ${cur.block} resolved` : 'Lobby';
  $('chip').className = 'chip' + (open ? ' live' : '');

  const blockName = i => `Act ${i.act.n} · ${i.act.time} · ${i.block === 'family' ? 'Family block' : 'Response block'}`;
  $('rtitle').textContent = open ? blockName(cur) : nx ? `Next: ${blockName(nx)}` : 'All six acts played';
  const resp = D.responders, done = resp.filter(p => p.complete).length;
  $('rsub').textContent = open ? `${done}/${resp.length} players finished · closes ${new Date(r.closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : nx ? (nx.block === 'family' ? nx.act.family.intro : nx.act.response.intro) : 'Time for the debrief.';
  $('rbtns').innerHTML = open
    ? `<button data-a="close">Close and resolve now</button><button class="secondary" data-a="extend">+10 min</button><button class="secondary" data-a="remind">Nudge</button>`
    : nx ? `<label style="margin:0">Open for</label><input id="mins" type="number" value="${nx.block === 'family' ? 30 : 45}" min="2" max="600"> <span class="small">min</span><button data-a="open">Open ${nx.block === 'family' ? 'family' : 'response'} block</button>` : '';
  if (c.current_round > 0 && !open) $('rbtns').innerHTML += `<button class="secondary" data-a="restart">Restart cohort</button>`;
  $('rbtns').querySelectorAll('button').forEach(b => b.onclick = () => act(b.dataset.a));

  $('ptable').innerHTML = `<tr><th>Player</th><th>Family</th><th>Organisation</th><th>${open ? 'This block' : ''}</th><th>Last seen</th></tr>` +
    humans.map(p => {
      const rp = resp.find(x => x.id === p.id) || {};
      return `<tr><td>${esc(p.name)}</td><td>${p.profile} ${esc(PROFILES[p.profile].name)}</td><td>${esc(INSTITUTIONS[p.institution]?.name || p.institution)}</td>
        <td>${open ? (rp.complete ? '<span class="tick">✓ done</span>' : `<span class="cross">${rp.done}/${rp.needed}</span>`) : ''}</td><td class="small muted">${ago(p.last_seen)}</td></tr>`;
    }).join('');

  const dimKeys = Object.keys(DIMS);
  $('htable').innerHTML = `<tr><th>Household</th><th>Played by</th><th>Where</th>${dimKeys.map(k => `<th>${DIMS[k].short}</th>`).join('')}<th>Worst</th><th>Mean</th><th>#4+</th><th>Listed</th><th>Cash</th></tr>` +
    D.players.filter(p => D.households[p.id]).map(p => {
      const h = D.households[p.id], l = lciOf(h.dims);
      return `<tr><td>${p.profile} ${esc(PROFILES[p.profile].name)}</td><td>${p.npc ? '<i class="muted">computer</i>' : esc(p.name)}</td><td class="small">${esc(GROUPS[h.group] || h.group)}<br><span class="muted">${esc(LOCATIONS[h.loc] || h.loc)}</span></td>
        ${dimKeys.map(k => `<td><span class="ph ph${phaseOf(h.dims[k])}">${phaseOf(h.dims[k])}</span></td>`).join('')}
        <td><span class="ph ph${l.worst}">${l.worst}</span></td><td>${l.mean}</td><td>${l.count4}</td><td>${h.known ? '✓' : '<b style="color:var(--accent)">✗</b>'}</td><td>${Math.round(h.res.cash)}</td></tr>`;
    }).join('');

  const aggRows = (obj, names) => Object.entries(obj || {}).map(([k, v]) => `<tr><td>${esc(names[k] || LOCATIONS[k] || k)}</td><td>${v.n}</td><td><span class="ph ph${v.phase20}">${v.phase20}</span></td><td>${v.meanWorst}</td></tr>`).join('');
  const head = l => `<tr><th>${l}</th><th>HH</th><th>Phase (20%)</th><th>Mean worst</th></tr>`;
  $('gtable').innerHTML = head('Group') + aggRows(D.lci.byGroup, GROUPS) + head('Municipality') + aggRows(D.lci.byMuni, Object.fromEntries(Object.entries(MUNIS).map(([k, v]) => [k, v.name])));
  $('ltable').innerHTML = head('Location / pocket') + aggRows(D.lci.byLoc, POCKETS);

  const last = D.world?.stats?.slice(-1)[0];
  if (last) {
    const A = ACTS[last.act - 1];
    let body = `<p><b>Act ${last.act} · ${last.block} block</b> · ${last.defaults} family steps defaulted · ${last.duplicates} duplicated deliveries · orchard ≈ ${last.orchardFamilies} families</p>`;
    if (last.block === 'family') {
      const label = key => { const [st, id] = key.split(':'); const step = A.family.steps.find(x => x.id === st); return id === 'wait' ? 'Wait and see' : step?.options.find(o => o.id === id)?.label || id; };
      body += `<p>${Object.entries(last.choices).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(label(k))}: ${v}`).join(' · ')}</p>`;
    } else {
      body += `<p>${INSTITUTION_ORDER.map(i => {
        const picks = Object.entries(last.teams).filter(([k]) => k.startsWith(i + ':')).map(([k, v]) => {
          if (!v) return '<i>no decision</i>';
          const id = v.replace('*', ''); const steps = INSTITUTIONS[i].agency ? A.response.steps.agency : A.response.steps[i];
          const lab = steps?.flatMap(x => x.options).find(o => o.id === id)?.label || id;
          return esc(lab) + (v.endsWith('*') ? ' <span class="muted">(computer)</span>' : '');
        });
        return `<b>${esc(INSTITUTIONS[i].name)}</b>: ${picks.join('; ')}${last.reached[i] != null ? ` — reached ${last.reached[i]}${last.gaps[i] ? `, ${last.gaps[i]} not on lists` : ''}${last.blind?.[i] ? ', could not find the orchard' : ''}` : ''}`;
      }).join('<br>')}</p>`;
    }
    $('results').innerHTML = body;
  } else $('results').innerHTML = '<p class="muted">Nothing resolved yet.</p>';

  $('alerts').innerHTML = D.alerts.length ? D.alerts.map(a => `<div class="alertline ${a.level}">${esc(a.text)}</div>`).join('') : '<p class="small muted">No alerts.</p>';
  const link = `${location.origin}/?c=${c.code}`;
  $('joinLink').textContent = link; $('joinLink').href = link;
  $('qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(link)}`;
  if ($('bteam').options.length === 1) INSTITUTION_ORDER.forEach(i => $('bteam').add(new Option(INSTITUTIONS[i].name, i)));
  const w = D.world || {};
  $('world').innerHTML = `<p><b>Orchard near Lissa:</b> ≈ ${w.orchard?.families ?? '?'} families · classified as <b>${w.orchardStatus || 'unknown'}</b> · known to: ${Object.keys(w.orchard?.seenBy || {}).map(k => INSTITUTIONS[k]?.name || k).join(', ') || 'nobody'}</p>
    <p><b>Staff on the ground:</b><br>${AGENCIES.map(i => { const o = w.orgs?.[i]; return o ? `${esc(INSTITUTIONS[i].name)}: ${Object.entries(o.staff).filter(([, v]) => v).map(([k, v]) => `${v} ${STAFF[k].toLowerCase()}`).join(', ') || 'none'} · ${Math.round(o.capacity * 100)}%${o.incoming?.length ? ' · incoming' : ''}${w.partners?.[i] ? ` · partner: ${INSTITUTIONS[w.partners[i]].name}` : ''}` : ''; }).join('<br>')}</p>
    <p>Coordination ${w.coord ?? 0} · Lissa visibility ${w.lissaVisible ?? 0} · Morava road ${w.hillsOpen ? 'open' : 'closed'} · permits ${w.permitsFast ? 'fast' : 'slow'} · reporting ${w.reporting || '—'} · priority rule ${w.rule || '—'}</p>
    <p>Policies: ${[w.sitesOnly && 'Varenna distributions at sites only', w.cashBlocked && 'in-kind only', w.hostFocus && 'host-family focus', w.stadiumFormal && 'stadium formalised', w.stadiumClear && 'stadium to be cleared', w.schoolClosed && 'school closed', w.orchardEvict && 'orchard eviction', w.plannedSite && 'planned site offered', w.hlp && 'eviction protection'].filter(Boolean).join(', ') || 'none yet'}</p>
    <p>3W: ${AGENCIES.map(i => `${INSTITUTIONS[i].name} ${w.reported?.[i] === 1 ? 'full' : w.reported?.[i] === 0.5 ? 'partial' : 'none'}`).join(' · ')} · ${D.pushCount} player devices with notifications</p>`;
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
