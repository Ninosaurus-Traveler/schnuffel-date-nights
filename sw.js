// Kill-Switch: Die App nutzt keinen Service Worker (mehr).
// Falls ein alter SW installiert ist, leert dieser alle Caches,
// meldet sich ab und lädt offene Fenster neu – damit immer die aktuelle Version erscheint.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach(client => client.navigate(client.url));
  })());
});
