# Aftershock (prototype v0)

Multiplayer, mobile, notification-driven simulation of the Varenna earthquake response.
Design document: https://claude.ai/artifact/JaJSTXtU3Ff1Gb1s8r5gsP

## Stack
- Static PWA (`index.html`, `play.html`, `facilitator.html`) + Vercel functions in `api/`
- Supabase Postgres (project `aftershock`, eu-central-1). Tables have RLS on and no policies;
  all access goes through SECURITY DEFINER functions (`supabase/002_rpc_functions.sql`).
- Web Push (VAPID) via `web-push`; Supabase pg_cron calls `/api/tick` every minute.

## Content
- `lib/scenario.js` — dimensions, profiles, institutions, rounds 1–6 (options and effects)
- `lib/engine.js` — deterministic round resolver (seeded), LCI aggregation (worst / mean / count of Phase 4+; 20% rule)
- `lib/ops.js` — open, close, extend, remind, broadcast, alerts

## Vercel environment variables
SUPABASE_URL, SUPABASE_ANON_KEY, SERVER_SECRET, VAPID_PUBLIC, VAPID_PRIVATE, ADMIN_KEY
