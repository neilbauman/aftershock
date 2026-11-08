import { rpc, SECRET, load, body, send, push } from '../lib/server.js';
import { initialWorld } from '../lib/engine.js';
import * as ops from '../lib/ops.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const b = await body(req);
  try {
    if (b.action === 'create') {
      if (b.adminKey !== process.env.ADMIN_KEY) return send(res, 403, { error: 'Wrong admin key.' });
      const out = await rpc('srv_create_cohort', { p_secret: SECRET, p_name: (b.name || 'Cohort').slice(0, 60), p_world: initialWorld() });
      return send(res, 200, out);
    }
    const ok = await rpc('srv_check_fac', { p_secret: SECRET, p_code: b.code || '', p_key: b.key || '' });
    if (!ok) return send(res, 403, { error: 'Wrong cohort code or facilitator key.' });
    let out;
    switch (b.action) {
      case 'state': await ops.tickCohort(b.code).catch(() => {}); out = ops.facilitatorView(await load(b.code)); break;
      case 'open': out = await ops.openRound(b.code, Number(b.minutes) || 45); break;
      case 'close': out = await ops.closeRound(b.code); break;
      case 'extend': out = await ops.extendRound(b.code, Number(b.minutes) || 10); break;
      case 'remind': out = await ops.remind(b.code, { force: true }); break;
      case 'broadcast': out = await ops.broadcast(b.code, String(b.text || '').slice(0, 300), b.team || null); break;
      case 'takeover': out = await ops.takeover(b.code, b.playerId, b.kind, b.optionId); break;
      case 'testpush': {
        const data = await load(b.code);
        out = { pushed: await push(data.subs.filter(s => s.is_facilitator), { title: 'Aftershock · facilitator', body: 'Facilitator alerts are working on this device.', url: `/facilitator.html?c=${b.code}` }) };
        break;
      }
      default: return send(res, 400, { error: 'Unknown action' });
    }
    send(res, 200, out);
  } catch (e) {
    send(res, 400, { error: e.message });
  }
}
