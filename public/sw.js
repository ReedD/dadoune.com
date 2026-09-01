/**
 * Service worker kill switch.
 *
 * The 2018 react-static site registered a Workbox service worker at this path
 * that used a cacheFirst strategy on HTML routes. Every browser that visited
 * www.dadoune.com between 2018 and 2020 still has it installed, and it will
 * keep serving the old cached site indefinitely, ignoring anything we deploy.
 *
 * A registered worker re-fetches its own script on navigation (and at least
 * every 24h) and byte-compares it. Serving this file in its place installs a
 * worker whose only job is to delete every cache and unregister itself, after
 * which those browsers fall through to the network and see the new site.
 *
 * Do not delete this file, and keep it served with `Cache-Control: max-age=0`.
 * Visitors who have not returned since 2020 still need it.
 */

self.addEventListener('install', () => {
  // Take over from the old worker immediately rather than waiting for every
  // old tab to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));

      await self.registration.unregister();

      // Reload open tabs so they re-request everything from the network
      // instead of sitting on whatever the old worker had already served.
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});
