// Cohorts this device has joined (stored only on this device).
const KEY = 'aftershock_memberships';
export function list() {
  let m = [];
  try { m = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
  const legacy = localStorage.getItem('aftershock_token');
  if (legacy && !m.find(x => x.t === legacy)) { m.push({ t: legacy }); save(m); }
  return m;
}
export function save(m) { localStorage.setItem(KEY, JSON.stringify(m)); }
export function upsert(entry) {
  const m = list(); const i = m.findIndex(x => x.t === entry.t);
  if (i >= 0) m[i] = { ...m[i], ...entry }; else m.push(entry);
  save(m); localStorage.setItem('aftershock_token', entry.t);
}
export function remove(t) { save(list().filter(x => x.t !== t)); if (localStorage.getItem('aftershock_token') === t) localStorage.removeItem('aftershock_token'); }
export const byCode = code => list().find(x => x.code && x.code.toUpperCase() === String(code).toUpperCase());
