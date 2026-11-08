import { rpc, SECRET, send } from '../lib/server.js';
import { tickCohort } from '../lib/ops.js';

// Called every minute by Supabase pg_cron (and opportunistically by the facilitator console).
export default async function handler(req, res) {
  if ((req.headers['x-tick-secret'] || req.query?.s) !== SECRET) return send(res, 403, { error: 'forbidden' });
  try {
    const codes = await rpc('srv_due', { p_secret: SECRET });
    const results = [];
    for (const code of codes || []) results.push(await tickCohort(code).catch(e => ({ code, error: e.message })));
    send(res, 200, { results });
  } catch (e) { send(res, 500, { error: e.message }); }
}
