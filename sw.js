const CACHE_NAME = 'jasmin-c4isr-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './wiki.css',
    './app.js',
    './wiki_data.js',
    './config.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching assets');
            return cache.addAll(ASSETS);
        })
    );
});

// Activate event (clean up old caches)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch event (serve from cache if available)
self.addEventListener('fetch', event => {
    // Skip Supabase API calls from caching to ensure live data
    if (event.request.url.includes('supabase.co')) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});
