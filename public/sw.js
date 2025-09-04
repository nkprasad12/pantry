// Simple service worker for offline support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Save a copy to cache if successful
        const respClone = response.clone();
        if (response.ok && response.type === 'basic') {
          caches.open('pantry-v1').then((cache) => {
            cache.put(event.request, respClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.open('pantry-v1').then((cache) => cache.match(event.request));
      }),
  );
});
