// Minimalny service worker — wymagany, żeby przeglądarka zaproponowała
// instalację aplikacji (Dodaj do ekranu głównego) i żeby ikona działała jak natywna.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', () => {});
