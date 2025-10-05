// public/sw.js - Service Worker per PWA Offline
const CACHE_NAME = 'memorium-v2.0.0';
const RUNTIME_CACHE = 'memorium-runtime';

// File da cachare all'installazione
const STATIC_ASSETS = [
  '/',
  '/userhome',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Installazione - cacha i file statici
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Forza l'attivazione immediata
  self.skipWaiting();
});

// Attivazione - pulisce vecchie cache
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prendi il controllo immediatamente
  return self.clients.claim();
});

// Fetch - strategia cache-first per risorse statiche, network-first per API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non-GET
  if (request.method !== 'GET') return;

  // Ignora API esterne (OpenAI, etc)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Ignora Next.js data requests
  if (url.pathname.startsWith('/_next/data/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Se è in cache, ritorna subito
      if (cachedResponse) {
        console.log('[SW] Cache hit:', url.pathname);
        return cachedResponse;
      }

      // Altrimenti fetch dalla rete
      return fetch(request)
        .then((response) => {
          // Non cachare risposte non valide
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clona la risposta
          const responseToCache = response.clone();

          // Cacha per uso futuro
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fallback offline
          console.log('[SW] Offline, no cache available for:', url.pathname);
          
          // Puoi ritornare una pagina offline custom qui
          // return caches.match('/offline.html');
        });
    })
  );
});

// Gestisci messaggi dal client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background Sync (opzionale - per salvare dati offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-palaces') {
    event.waitUntil(syncPalaces());
  }
});

async function syncPalaces() {
  console.log('[SW] Syncing palaces...');
  // Implementa qui la logica di sync se necessario
  // Ad esempio, sincronizzare con un server quando torna online
}