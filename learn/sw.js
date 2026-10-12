/* Offline support: the whole app is cached on first visit, so it opens without internet (e.g. in the car).
   Files refresh in the background whenever the network is available. Bump VERSION when releasing. */
const VERSION = 'wb-2';
const FILES = ["./", "index.html", "manifest.webmanifest", "css/app.css", "icons/icon-192.png", "icons/apple-touch-icon.png", "js/config.js", "js/core/util.js", "js/core/registry.js", "js/core/gens.js", "js/core/gens_pl.js", "js/core/store.js", "js/core/cloud.js", "js/core/backup.js", "js/core/speech.js", "js/core/tutor.js", "js/core/ai.js", "js/core/hand.js", "js/core/bridge.js", "js/content/y3/english.js", "js/content/y3/maths.js", "js/content/y3/science.js", "js/content/y3/hass.js", "js/content/y3/hpe.js", "js/content/y3/arts.js", "js/content/y3/tech.js", "js/content/y4/english.js", "js/content/y4/maths.js", "js/content/y4/science.js", "js/content/y4/hass.js", "js/content/y4/hpe.js", "js/content/y4/arts.js", "js/content/y4/tech.js", "js/content/pl3/polski.js", "js/content/pl3/matematyka.js", "js/content/pl3/przyroda.js", "js/content/pl3/spoleczna.js", "js/content/pl3/dodatkowe.js", "js/content/pl4/polski.js", "js/content/pl4/matematyka.js", "js/content/pl4/przyroda.js", "js/content/pl4/historia.js", "js/content/pl4/dodatkowe.js", "js/content/extra/au3.js", "js/content/extra/au4.js", "js/content/adjust.js", "js/ui/icons.js", "js/ui/components.js", "js/ui/views.js", "js/ui/parent.js"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const firebaseLib = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (!sameOrigin && !firebaseLib) return; // cloud data, AI and voices always go straight to the network
  // stale-while-revalidate
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: sameOrigin });
    const fresh = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    return cached || (await fresh) || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
  }));
});
