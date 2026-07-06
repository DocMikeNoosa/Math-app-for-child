/* Matematyka Tosi — offline-first service worker. */
const CACHE = "tosia-v5";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "core.js",
  "app.js",
  "manifest.webmanifest",
  "czytanie.html",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
  "fonts/baloo-2-latin-500-normal.woff2",
  "fonts/baloo-2-latin-700-normal.woff2",
  "fonts/baloo-2-latin-800-normal.woff2",
  "fonts/baloo-2-latin-ext-500-normal.woff2",
  "fonts/baloo-2-latin-ext-700-normal.woff2",
  "fonts/baloo-2-latin-ext-800-normal.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(
      (cached) => cached ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
    )
  );
});
