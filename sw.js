const CACHE_NAME = 'osis-finance-v1';
const urlsToCache = [
  '/SMPNEGERI48/',
  '/SMPNEGERI48/index.html',
  '/SMPNEGERI48/manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// ══ PUSH NOTIFICATION ══
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'OSIS Finance';
  const options = {
    body: data.body || 'Ada notifikasi baru',
    icon: 'https://via.placeholder.com/192x192/3d5af1/ffffff?text=OSIS',
    badge: 'https://via.placeholder.com/72x72/3d5af1/ffffff?text=OSIS',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'open', title: 'Buka App' },
      { action: 'close', title: 'Tutup' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/SMPNEGERI48/'));
  }
});
