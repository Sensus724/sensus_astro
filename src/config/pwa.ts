/**
 * Configuración PWA para Sensus
 * Centraliza toda la configuración relacionada con Progressive Web App
 */

export const PWA_CONFIG = {
  // Información básica de la app
  APP_INFO: {
    name: 'Sensus - Bienestar Mental',
    shortName: 'Sensus',
    description: 'Tu compañero inteligente para el bienestar mental. Test GAD-7 gratuito, diario emocional encriptado y recursos profesionales.',
    version: '1.0.0',
    author: 'Sensus Team',
    lang: 'es',
  },

  // Configuración de colores
  THEME: {
    primaryColor: '#2563EB',
    backgroundColor: '#ffffff',
    themeColor: '#2563EB',
  },

  // Configuración de iconos
  ICONS: {
    sizes: [72, 96, 128, 144, 152, 192, 384, 512],
    maskable: [192, 512],
    defaultIcon: '/icons/icon-192x192.png',
  },

  // Configuración de caché
  CACHE: {
    name: 'sensus-v1.0.0',
    staticCache: 'sensus-static-v1.0.0',
    dynamicCache: 'sensus-dynamic-v1.0.0',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  },

  // Archivos estáticos para caché
  STATIC_FILES: [
    '/',
    '/index.html',
    '/favicon.svg',
    '/manifest.json',
    '/assets/images/calma.jpeg',
    '/assets/images/ansiedad.jpeg',
    '/assets/images/diario.jpeg',
    '/assets/images/equipo.jpeg',
    '/assets/images/evaluacion.jpeg',
    '/assets/images/planes.jpeg',
    '/assets/images/test.jpeg',
    '/js/firebase-init.js',
    '/js/base/core.js',
    '/js/components/ui.js',
    '/js/modules/auth.js',
    '/js/modules/diary.js',
    '/js/modules/evaluation.js',
    '/js/pages/homepage.js',
    '/js/pages/diary.js',
    '/js/pages/evaluation.js',
    '/js/pages/plans.js',
    '/js/pages/team.js',
    '/js/pages/contact.js',
    '/js/pages/anxiety.js',
    '/js/pages/test.js',
    '/js/pages/privacy.js',
    '/js/pages/terms.js',
    '/js/utils/helpers.js',
    '/js/utils/validation.js',
    '/js/utils/storage.js',
  ],

  // Configuración de notificaciones
  NOTIFICATIONS: {
    defaultTitle: 'Sensus',
    defaultBody: 'Tienes una nueva notificación de Sensus',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'sensus-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir Sensus',
      },
      {
        action: 'dismiss',
        title: 'Cerrar',
      },
    ],
  },

  // Configuración de instalación
  INSTALL: {
    promptDelay: 5000, // 5 segundos
    bannerAutoHide: 10000, // 10 segundos
    showManualInstructions: true,
  },

  // Configuración offline
  OFFLINE: {
    showBanner: true,
    showModal: true,
    modalDelay: 2000, // 2 segundos
    retryInterval: 5000, // 5 segundos
    syncOnReconnect: true,
  },

  // Configuración de sincronización
  SYNC: {
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    batchSize: 10,
    storageKey: 'pendingData',
  },

  // Configuración de actualizaciones
  UPDATES: {
    checkInterval: 24 * 60 * 60 * 1000, // 24 horas
    showUpdateNotification: true,
    autoUpdate: false,
  },

  // Configuración de métricas
  ANALYTICS: {
    trackInstall: true,
    trackOfflineUsage: true,
    trackCacheHit: true,
    trackSyncEvents: true,
  },

  // Configuración de seguridad
  SECURITY: {
    enforceHTTPS: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com;",
  },

  // Configuración de accesibilidad
  ACCESSIBILITY: {
    announceUpdates: true,
    announceOfflineStatus: true,
    announceInstallPrompt: true,
    highContrast: false,
    reducedMotion: false,
  },

  // Configuración de rendimiento
  PERFORMANCE: {
    preloadCriticalResources: true,
    lazyLoadImages: true,
    compressAssets: true,
    minifyCSS: true,
    minifyJS: true,
  },

  // Configuración de debugging
  DEBUG: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: 'info', // 'error', 'warn', 'info', 'debug'
    showConsoleMessages: true,
  },
};

// Configuración específica por entorno
export const PWA_ENV_CONFIG = {
  development: {
    ...PWA_CONFIG,
    DEBUG: {
      ...PWA_CONFIG.DEBUG,
      enabled: true,
      logLevel: 'debug',
    },
    CACHE: {
      ...PWA_CONFIG.CACHE,
      maxAge: 60 * 1000, // 1 minuto en desarrollo
    },
  },
  production: {
    ...PWA_CONFIG,
    DEBUG: {
      ...PWA_CONFIG.DEBUG,
      enabled: false,
      logLevel: 'error',
    },
    CACHE: {
      ...PWA_CONFIG.CACHE,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días en producción
    },
  },
};

// Función para obtener configuración según entorno
export function getPWAConfig() {
  const env = process.env.NODE_ENV || 'development';
  return PWA_ENV_CONFIG[env as keyof typeof PWA_ENV_CONFIG] || PWA_CONFIG;
}

// Función para generar manifest.json dinámicamente
export function generateManifest() {
  const config = getPWAConfig();
  
  return {
    name: config.APP_INFO.name,
    short_name: config.APP_INFO.shortName,
    description: config.APP_INFO.description,
    start_url: '/',
    display: 'standalone',
    background_color: config.THEME.backgroundColor,
    theme_color: config.THEME.themeColor,
    orientation: 'portrait-primary',
    scope: '/',
    lang: config.APP_INFO.lang,
    categories: ['health', 'lifestyle', 'medical'],
    icons: config.ICONS.sizes.map(size => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: config.ICONS.maskable.includes(size) ? 'any maskable' : 'any',
    })),
    shortcuts: [
      {
        name: 'Mi Diario',
        short_name: 'Diario',
        description: 'Acceder a mi diario personal',
        url: '/diario',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Evaluación',
        short_name: 'Test',
        description: 'Realizar evaluación de bienestar',
        url: '/evaluacion',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Planes',
        short_name: 'Planes',
        description: 'Ver mis planes de bienestar',
        url: '/planes',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}

// Función para verificar si la PWA está instalada
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Función para verificar si está en modo offline
export function isOffline(): boolean {
  if (typeof window === 'undefined') return false;
  return !navigator.onLine;
}

// Función para obtener información del Service Worker
export async function getServiceWorkerInfo() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;
    
    return {
      scope: registration.scope,
      state: registration.active?.state || 'unknown',
      scriptURL: registration.active?.scriptURL || 'unknown',
      updateAvailable: registration.waiting !== null,
    };
  } catch (error) {
    console.error('Error getting Service Worker info:', error);
    return null;
  }
}

// Función para limpiar caché
export async function clearCache(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }
  
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
}

// Función para obtener tamaño del caché
export async function getCacheSize(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return 0;
  }
  
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}

export default PWA_CONFIG;
