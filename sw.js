/* IHK-Trainer – Service Worker
   App-Shell offline verfügbar halten, Lernstand-Sync immer über das Netz. */
const V = 'ihk-v202610141230';
const SHELL = ['./', './app.js?v=202610141230', './data.bin', './manifest.webmanifest', './icon-192.png', './icon-512.png',
               './icon-192-maskable.png', './icon-512-maskable.png',
               './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  

  e.respondWith((async () => {
    const cache = await caches.open(V);
    const hit = await cache.match(req, { ignoreSearch: url.pathname === '/' });
    const net = fetch(req).then(res => {
      // Die Anmeldeseite darf nie als App-Shell im Cache landen
      if (res.ok && res.headers.get('x-ihk-page') !== 'login') cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || new Response('Offline und noch nichts gespeichert.', {
      status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  })());
});
