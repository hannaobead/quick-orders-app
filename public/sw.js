const CACHE_PREFIX = 'momento-orders-';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

let CACHE_NAME = CACHE_PREFIX + 'v1';

// On install: fetch the current build version from the server and use it as cache name
self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/api/sw-version')
      .then((r) => r.json())
      .then(({ version }) => {
        CACHE_NAME = CACHE_PREFIX + version;
        return caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS));
      })
      .then(() => self.skipWaiting())
  );
});

// On activate: delete all old caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // API calls — always network, never cache
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
