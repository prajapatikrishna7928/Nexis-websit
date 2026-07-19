const CACHE_NAME = 'nexis-core-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/images/logo.png'
];

// इंस्टॉल इवेंट: फाइलों को लोकल कैशे में सेव करना
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// फेच इवेंट: ऑफलाइन होने पर कैशे से फाइलें लोड करना
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
