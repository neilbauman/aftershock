export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(`window.AFTERSHOCK = ${JSON.stringify({ supabaseUrl: process.env.SUPABASE_URL, supabaseKey: process.env.SUPABASE_ANON_KEY, vapidPublic: process.env.VAPID_PUBLIC })};`);
}
