// Service worker: instalowalność PWA + praca offline.
// HTML (kod aplikacji): network-first — zawsze najnowsza wersja gdy jest zasieg,
// cache tylko jako fallback offline (unika efektu "jedno stare otwarcie po update").
// Pozostale zasoby (ikony, obrazy): stale-while-revalidate — szybki start, cichy update w tle.
const CACHE = 'elektroapp-v12';
const ASSETS = ['.', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'logo-watermark.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  const isHtml = e.request.mode === 'navigate' || e.request.url.endsWith('/') || e.request.url.endsWith('index.html');
  if (isHtml) {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
