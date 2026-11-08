self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch { d = { title: 'Aftershock', body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Aftershock', { body: d.body, tag: d.tag, renotify: !!d.tag, icon: '/icon-192.png', badge: '/icon-192.png', data: { url: d.url || '/play.html' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/play.html';
  e.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const same = all.find(c => new URL(c.url).pathname === new URL(url, self.location.origin).pathname);
    if (same) { await same.focus(); same.postMessage({ type: 'refresh' }); return; }
    return clients.openWindow(url);
  })());
});
