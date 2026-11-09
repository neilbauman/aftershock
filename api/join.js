import { rpc, SECRET, body, send } from '../lib/server.js';
import { FAMILY_ORDER } from '../lib/chapters.js';
import { initialHousehold } from '../lib/engine.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const { code, name, email, family } = await body(req);
  if (!code || !name?.trim()) return send(res, 400, { error: 'Cohort code and name are required.' });
  try {
    const chosen = FAMILY_ORDER.includes(family) ? [family] : FAMILY_ORDER; // a chosen family, or the least-played one
    const profiles = Object.fromEntries(chosen.map(p => [p, initialHousehold(p)]));
    const out = await rpc('srv_join', { p_secret: SECRET, p_code: code.trim(), p_name: name.trim().slice(0, 40), p_email: (email || '').trim(), p_profiles: profiles, p_institutions: ['none'] });
    send(res, 200, out);
  } catch (e) {
    send(res, 400, { error: /unknown cohort/.test(e.message) ? 'That cohort code was not found.' : e.message });
  }
}
