// EndoList — service worker: aplikacja działa offline (AI wymaga internetu).
const VERSION = 'endolist-v3';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/ai.js', 'js/data.js', 'js/dx.js', 'js/files.js', 'js/letter.js', 'js/odontogram.js', 'js/pdf.js', 'js/vault.js', 'js/tooth3d.js', 'js/speech.js', 'js/letterview.js',
  'vendor/jspdf.umd.min.js', 'vendor/anthropic-sdk.mjs', 'vendor/three.mjs',
  'fonts/Inter-Regular.woff2', 'fonts/Inter-Medium.woff2', 'fonts/Inter-SemiBold.woff2',
  'fonts/pdf/Inter-Regular.ttf', 'fonts/pdf/Inter-Medium.ttf', 'fonts/pdf/Inter-SemiBold.ttf', 'fonts/pdf/Inter-Italic.ttf', 'fonts/pdf/Inter-Light.ttf',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'brand/centrum-logo.png', 'brand/centrum-logo-light.svg', 'brand/centrum-logo.svg',
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// network first (so updates arrive immediately), cache as offline fallback; only same-origin GETs
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match('index.html'))));
});
