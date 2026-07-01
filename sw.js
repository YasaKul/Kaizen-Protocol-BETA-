const CACHE = 'kaizen-v7';
const STATIC = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // HTML altijd vers van het netwerk — updates komen direct door
  if (e.request.destination === 'document' || e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // Overige assets uit cache
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
