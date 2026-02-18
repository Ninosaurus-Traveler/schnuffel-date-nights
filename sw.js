const CACHE_NAME = "date-app-v1";

const urlsToCache = [
  "/Geburtstag/20-menu.html",
  "/Geburtstag/40-dates/index.html",
  "/Geburtstag/60-css/style.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
