// public/sw.js
const CACHE = 'balance-v3';
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.claim())));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' || url.pathname.startsWith('/_next/webpack-hmr')) return;
  e.respondWith(
    fetch(req).then((res) => {
      try {
        if (res && res.ok && (url.pathname.startsWith('/_next/static/') || ['/manifest.webmanifest','/favicon.svg','/favicon.ico','/apple-touch-icon.png'].includes(url.pathname))) {
          const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
      } catch (_) {}
      return res;
    }).catch(() => caches.match(req).then((h) => h || Response.error()))
  );
});