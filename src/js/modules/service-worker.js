/**
 * Módulo del Service Worker - Sensus
 * Maneja el registro y actualización del service worker
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.init();
  }

  init() {
    if (this.isSupported) {
      this.registerServiceWorker();
      this.setupUpdateHandlers();
    } else {
      console.log('Service Worker no soportado en este navegador');
    }
  }

  /**
   * Registrar service worker
   */
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registrado exitosamente:', this.registration);

      // Verificar si hay actualizaciones
      this.checkForUpdates();

      // Escuchar eventos de actualización
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

    } catch (error) {
      console.error('Error registrando Service Worker:', error);
    }
  }

  /**
   * Verificar actualizaciones
   */
  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.error('Error verificando actualizaciones:', error);
      }
    }
  }

  /**
   * Manejar cuando se encuentra una actualización
   */
  handleUpdateFound() {
    const newWorker = this.registration.installing;
    
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible
            this.showUpdateNotification();
          } else {
            // Primera instalación
            this.showInstallNotification();
          }
        }
      });
    }
  }

  /**
   * Mostrar notificación de actualización
   */
  showUpdateNotification() {
    if (window.uiInteractions) {
      window.uiInteractions.showNotification(
        'Nueva versión disponible. Recarga la página para actualizar.',
        'info',
        5000
      );
    }

    // También mostrar botón de actualización
    this.showUpdateButton();
  }

  /**
   * Mostrar notificación de instalación
   */
  showInstallNotification() {
    if (window.uiInteractions) {
      window.uiInteractions.showNotification(
        '¡Sensus está listo para funcionar offline!',
        'success',
        3000
      );
    }
  }

  /**
   * Mostrar botón de actualización
   */
  showUpdateButton() {
    const updateButton = document.createElement('button');
    updateButton.className = 'update-button';
    updateButton.innerHTML = `
      <i class="fas fa-sync-alt"></i>
      Actualizar
    `;
    updateButton.addEventListener('click', () => {
      this.updateServiceWorker();
    });

    // Añadir al header
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(updateButton);
    }
  }

  /**
   * Actualizar service worker
   */
  updateServiceWorker() {
    if (this.registration && this.registration.waiting) {
      // Enviar mensaje al service worker para que se active
      this.registration.waiting.postMessage({ action: 'skipWaiting' });
    }
  }

  /**
   * Configurar handlers de actualización
   */
  setupUpdateHandlers() {
    // Escuchar cuando el service worker toma control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Recargar página para usar nueva versión
      window.location.reload();
    });

    // Escuchar mensajes del service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { action, data } = event.data;
      
      switch (action) {
        case 'showNotification':
          if (window.uiInteractions) {
            window.uiInteractions.showNotification(data.message, data.type, data.duration);
          }
          break;
        case 'updateAvailable':
          this.showUpdateNotification();
          break;
      }
    });
  }

  /**
   * Verificar estado de conexión
   */
  checkConnectionStatus() {
    if (navigator.onLine) {
      document.body.classList.remove('offline');
      document.body.classList.add('online');
    } else {
      document.body.classList.remove('online');
      document.body.classList.add('offline');
    }
  }

  /**
   * Configurar listeners de conexión
   */
  setupConnectionListeners() {
    window.addEventListener('online', () => {
      this.checkConnectionStatus();
      if (window.uiInteractions) {
        window.uiInteractions.showNotification(
          'Conexión restaurada',
          'success',
          2000
        );
      }
    });

    window.addEventListener('offline', () => {
      this.checkConnectionStatus();
      if (window.uiInteractions) {
        window.uiInteractions.showNotification(
          'Sin conexión. Funcionando en modo offline.',
          'warning',
          3000
        );
      }
    });
  }

  /**
   * Obtener información del service worker
   */
  getServiceWorkerInfo() {
    return {
      isSupported: this.isSupported,
      isRegistered: !!this.registration,
      isControlled: !!navigator.serviceWorker.controller,
      scope: this.registration?.scope,
      state: this.registration?.active?.state
    };
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.serviceWorkerManager = new ServiceWorkerManager();
  window.serviceWorkerManager.setupConnectionListeners();
});

export default ServiceWorkerManager;
