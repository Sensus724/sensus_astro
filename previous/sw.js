// Service Worker para Sensus
const CACHE_NAME = 'sensus-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/responsive.css',
    '/js/script.js',
    '/js/modules/visitor-counter.js',
    '/data/stats.json',
    '/assets/images/Logo.jpeg',
    '/assets/images/WhatsApp Image 2025-09-08 at 6.04.51 PM.jpeg',
    '/assets/images/WhatsApp Image 2025-09-08 at 6.07.23 PM.jpeg',
    '/assets/images/WhatsApp Image 2025-09-08 at 6.07.33 PM.jpeg',
    '/assets/images/WhatsApp Image 2025-09-08 at 6.11.09 PM.jpeg',
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devolver desde cache si está disponible
                if (response) {
                    return response;
                }
                
                // Clonar el request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Verificar si recibimos una respuesta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar la respuesta
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});
