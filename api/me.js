import { rpc, load, push, body, send } from '../lib/server.js';

// Player self-service: send a test notification to this player's devices.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const { token } = await body(req);
  try {
    const me = await rpc('player_state', { p_token: token });
    const data = await load(me.cohort.code);
    const subs = data.subs.filter(s => s.player_id === me.player.id);
    const sent = await push(subs, { title: 'Aftershock', body: 'Notifications are working. You will be alerted when a decision is due.', url: '/play.html' });
    send(res, 200, { sent, devices: subs.length });
  } catch (e) { send(res, 400, { error: e.message }); }
}
