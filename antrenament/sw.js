// Doar fișierele aplicației (pagina, iconițe, fonturi, librăria Supabase) se țin în cache.
// Datele de antrenament și login-ul merg MEREU direct la Supabase — nu se cache-uiesc niciodată.
const CACHE = 'sala-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
const CDN = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// network first (ca update-urile să ajungă imediat), cache doar ca rezervă fără internet
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin && !CDN.includes(url.hostname)) return; // Supabase etc.: neatins
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
