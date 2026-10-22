// RadVox Pro: lets Chrome / Edge install the app on the desktop. Nothing is cached: the app always comes from the
// server, so the installed app and the browser version are the same app with the same, synced account data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
