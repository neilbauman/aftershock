import { rpc, load, save, body, send, push } from '../lib/server.js';
import { advancePlayer } from '../lib/engine.js';
import { chapterOf } from '../lib/chapters.js';

// Self-paced play: a player finishes their current chapter and moves on.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const { token, chapter, picks } = await body(req);
  try {
    const me = await rpc('player_state', { p_token: token });
    const data = await load(me.cohort.code);
    if (data.world?.public?.mode !== 'self') return send(res, 409, { error: 'This cohort is run by the facilitator, chapter by chapter.' });
    const h = data.households[me.player.id];
    const n = (h?.story?.length || 0) + 1;
    if (Number(chapter) !== n) return send(res, 409, { error: 'stale', chapter: n });
    const out = advancePlayer(data, me.player.id, picks || {});
    await save(data.cohort.id, { households: [{ player_id: me.player.id, state: out.state }], world: out.world });
    if (!chapterOf(n + 1)) await push(data.subs.filter(s => s.is_facilitator), { title: `${data.cohort.name}`, body: `${me.player.name} has finished the year.`, url: `/facilitator.html?c=${data.cohort.code}` }).catch(() => {});
    send(res, 200, { ok: true, chapter: n + 1 });
  } catch (e) { send(res, 400, { error: e.message }); }
}
