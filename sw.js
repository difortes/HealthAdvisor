/* Protocolo D.B.A.F · service worker · cache offline */
const CACHE = "dbaf-v5-6";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* cache-first com fallback de rede; guarda no cache tudo que carrega (fontes, imagem da hero) */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match("./index.html"));
    })
  );
});

/* dispara notificação a pedido da página */
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SHOW_NOTIF") {
    self.registration.showNotification(e.data.title, {
      body: e.data.body || "",
      icon: e.data.icon || "./icon-192.png",
      badge: "./icon-192.png",
      vibrate: [200, 100, 200]
    });
  }
});
