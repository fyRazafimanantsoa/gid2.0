
const CACHE_NAME = 'gid-cache-v2';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Utility: trim cache entries to a max number
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    for (let i = 0; i < keys.length - maxItems; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()));
      if (self.clients && clients.claim) await clients.claim();
    })()
  );
});

// Network-first for large WASM/CDN assets (don't aggressively cache wasm)
function isLargeWasmOrPyodide(url) {
  return /pyodide|sql-wasm|\.wasm/.test(url);
}

// Stale-while-revalidate for fonts and generic CDNs, with cache trimming
function isFontOrCDN(url) {
  return /fonts.googleapis.com|fonts.gstatic.com|cdn.jsdelivr|cdnjs|tailwindcss.com/.test(url);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = req.url;

  // Navigation (SPA) — serve shell then network update
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('/index.html').then(cached => cached || fetch(req))
    );
    return;
  }

  // Large wasm/pyodide: network-first, fallback to cache but do not cache new large responses
  if (isLargeWasmOrPyodide(url)) {
    e.respondWith(
      fetch(req).then(networkRes => {
        if (networkRes && networkRes.ok) {
          return networkRes;
        }
        return caches.match(req).catch(() => null) || (networkRes && networkRes.ok ? networkRes : null);
      }).catch(err => {
        console.warn('[SW] Fetch error for WASM/Pyodide:', err, 'URL:', url);
        return caches.match(req).catch(() => null);
      })
    );
    return;
  }

  // Fonts and CDN: stale-while-revalidate and keep cache small
  if (isFontOrCDN(url)) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(req);
        const networkPromise = fetch(req).then(networkRes => {
          try {
            if (networkRes && networkRes.ok) {
              cache.put(req, networkRes.clone());
              trimCache(CACHE_NAME, 60);
              return networkRes;
            }
            return cached || networkRes;
          } catch (err) {
            console.warn('[SW] Error caching font/CDN:', err, 'URL:', url);
            return cached;
          }
        }).catch(err => {
          console.warn('[SW] Fetch error for font/CDN:', err, 'URL:', url);
          return cached;
        });
        return cached || networkPromise;
      })
    );
    return;
  }

  // Default: cache-first then network, but only for GETs and http(s)
  if (req.method === 'GET' && url.startsWith('http')) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(networkRes => {
          if (!networkRes || !networkRes.ok) {
            return cached || (networkRes && networkRes.ok ? networkRes : new Response('Offline', { status: 503 }));
          }
          return caches.open(CACHE_NAME).then(cache => {
            try {
              cache.put(req, networkRes.clone());
              trimCache(CACHE_NAME, 200);
            } catch (err) {
              console.warn('[SW] Error caching asset:', err, 'URL:', url);
            }
            return networkRes;
          });
        }).catch(err => {
          console.warn('[SW] Fetch error, serving offline:', err, 'URL:', url);
          return cached || new Response('Offline', { status: 503 });
        });
      })
    );
  }
});
