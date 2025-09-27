/**
 * Sensus Service Worker
 * Estrategia de caché optimizada
 */

const CACHE_NAME = 'sensus-v1.0.0';
const STATIC_CACHE = 'sensus-static-v1.0.0';
const DYNAMIC_CACHE = 'sensus-dynamic-v1.0.0';
const API_CACHE = 'sensus-api-v1.0.0';

// Recursos críticos para caché inmediato
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/src/js/core/app.js',
  '/src/js/modules/auth.js',
  '/src/js/modules/theme.js',
  '/css/main.css',
  '/manifest.json'
];

// Recursos estáticos para caché
const STATIC_RESOURCES = [
  '/src/js/',
  '/css/',
  '/assets/',
  '/images/',
  '/icons/'
];

// Patrones de API para caché
const API_PATTERNS = [
  '/api/v1/users/profile',
  '/api/v1/diary',
  '/api/v1/evaluations'
];

// Estrategias de caché
const CACHE_STRATEGIES = {
  // Recursos críticos: Cache First
  critical: 'cache-first',
  
  // Recursos estáticos: Stale While Revalidate
  static: 'stale-while-revalidate',
  
  // APIs: Network First con fallback
  api: 'network-first',
  
  // Imágenes: Cache First con validación
  images: 'cache-first-with-validation'
};

/**
 * Instalación del Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('📱 Service Worker instalando...');
  
  event.waitUntil(
    Promise.all([
      // Caché de recursos críticos
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cachéando recursos críticos...');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      
      // Caché de recursos estáticos
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('📦 Cachéando recursos estáticos...');
        return cache.addAll(STATIC_RESOURCES);
      })
    ]).then(() => {
      console.log('✅ Service Worker instalado');
      return self.skipWaiting();
    })
  );
});

/**
 * Activación del Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('📱 Service Worker activando...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      cleanupOldCaches(),
      
      // Tomar control de todas las páginas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado');
    })
  );
});

/**
 * Interceptar requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Determinar estrategia de caché
  const strategy = determineCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

/**
 * Determinar estrategia de caché
 */
function determineCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Recursos críticos
  if (CRITICAL_RESOURCES.some(resource => url.pathname === resource)) {
    return 'critical';
  }
  
  // Recursos estáticos
  if (STATIC_RESOURCES.some(resource => url.pathname.startsWith(resource))) {
    return 'static';
  }
  
  // APIs
  if (API_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
    return 'api';
  }
  
  // Imágenes
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) {
    return 'images';
  }
  
  // Por defecto: Network First
  return 'network-first';
}

/**
 * Manejar request según estrategia
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'critical':
      return cacheFirst(request, STATIC_CACHE);
    
    case 'static':
      return staleWhileRevalidate(request, DYNAMIC_CACHE);
    
    case 'api':
      return networkFirst(request, API_CACHE);
    
    case 'images':
      return cacheFirstWithValidation(request, DYNAMIC_CACHE);
    
    default:
      return networkFirst(request, DYNAMIC_CACHE);
  }
}

/**
 * Estrategia: Cache First
 */
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Sirviendo desde caché:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Error en cache first:', error);
    return new Response('Error de red', { status: 503 });
  }
}

/**
 * Estrategia: Stale While Revalidate
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Actualizar en segundo plano
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Devolver caché si existe, sino esperar red
  return cachedResponse || fetchPromise;
}

/**
 * Estrategia: Network First
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 Red falló, sirviendo desde caché:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para APIs
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sin conexión',
        message: 'No se pudo conectar al servidor'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Sin conexión', { status: 503 });
  }
}

/**
 * Estrategia: Cache First con Validación
 */
async function cacheFirstWithValidation(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Validar en segundo plano
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    });
    
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

/**
 * Limpiar cachés antiguos
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  const deletePromises = cacheNames
    .filter(cacheName => !currentCaches.includes(cacheName))
    .map(cacheName => {
      console.log('🧹 Eliminando caché antiguo:', cacheName);
      return caches.delete(cacheName);
    });
  
  await Promise.all(deletePromises);
}

/**
 * Manejar mensajes del cliente
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      });
      break;
    
    case 'PRELOAD_RESOURCES':
      preloadResources(data.resources);
      break;
  }
});

/**
 * Limpiar todos los cachés
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  await Promise.all(deletePromises);
  console.log('🧹 Todos los cachés limpiados');
}

/**
 * Obtener estadísticas de caché
 */
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}

/**
 * Preload recursos
 */
async function preloadResources(resources) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  const preloadPromises = resources.map(async (resource) => {
    try {
      const response = await fetch(resource);
      if (response.ok) {
        await cache.put(resource, response);
        console.log('⚡ Recurso preloaded:', resource);
      }
    } catch (error) {
      console.warn('⚠️ Error preloading recurso:', resource, error);
    }
  });
  
  await Promise.allSettled(preloadPromises);
}

/**
 * Manejar notificaciones push
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'sensus-notification',
      data: data.data,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

/**
 * Manejar clics en notificaciones
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

console.log('📱 Service Worker cargado');