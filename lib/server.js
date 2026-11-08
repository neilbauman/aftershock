// Server helpers for Vercel functions: Supabase RPC + Web Push.
import webpush from 'web-push';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY;
export const SECRET = process.env.SERVER_SECRET;

webpush.setVapidDetails('mailto:aftershock@example.org', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

export async function rpc(fn, args) {
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${fn}: ${text}`);
  return text ? JSON.parse(text) : null;
}

export const load = code => rpc('srv_load', { p_secret: SECRET, p_code: code });
export const save = (cohortId, patch) => rpc('srv_save', { p_secret: SECRET, p_cohort: cohortId, p_patch: patch });

export async function push(subs, payload) {
  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(subs.map(s => webpush.sendNotification(s.subscription, body, { TTL: 3600, urgency: 'high' })));
  let sent = 0;
  await Promise.all(results.map(async (r, i) => {
    if (r.status === 'fulfilled') sent++;
    else if ([404, 410].includes(r.reason?.statusCode)) await rpc('srv_drop_sub', { p_secret: SECRET, p_endpoint: subs[i].endpoint }).catch(() => {});
  }));
  return sent;
}

export async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { return {}; }
}

export function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
