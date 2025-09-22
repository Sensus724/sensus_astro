/**
 * Sensus PWA Module
 * Manejo de Progressive Web App
 */

class PWAModule {
  constructor() {
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.deferredPrompt = null;
    this.swRegistration = null;
    
    this.init();
  }

  /**
   * Inicializar módulo PWA
   */
  init() {
    console.log('📱 Inicializando módulo PWA...');
    
    // Verificar si ya está instalado
    this.checkInstallation();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Registrar service worker
    this.registerServiceWorker();
    
    console.log('✅ Módulo PWA inicializado');
  }

  /**
   * Verificar si la app está instalada
   */
  checkInstallation() {
    // Verificar si se está ejecutando en modo standalone
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    
    if (this.isInstalled) {
      console.log('📱 App ya está instalada');
      this.hideInstallPrompt();
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Event listener para beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 beforeinstallprompt disparado');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Event listener para appinstalled
    window.addEventListener('appinstalled', () => {
      console.log('📱 App instalada exitosamente');
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showInstallSuccess();
    });

    // Event listeners para conectividad
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // Event listeners para botones de instalación
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-pwa-install]')) {
        this.installApp();
      } else if (event.target.matches('[data-pwa-dismiss]')) {
        this.dismissInstallPrompt();
      }
    });

    // Event listener para actualizaciones del service worker
    window.addEventListener('sw-update', () => {
      this.showUpdatePrompt();
    });
  }

  /**
   * Registrar service worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('📱 Service Worker registrado:', this.swRegistration.scope);
        
        // Verificar actualizaciones
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate();
        });
        
      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
      }
    }
  }

  /**
   * Manejar actualización del service worker
   */
  handleServiceWorkerUpdate() {
    const newWorker = this.swRegistration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('📱 Nueva versión disponible');
        this.showUpdatePrompt();
      }
    });
  }

  /**
   * Mostrar prompt de instalación
   */
  showInstallPrompt() {
    const installPrompt = document.getElementById('pwa-install-prompt');
    if (installPrompt) {
      installPrompt.classList.add('show');
    }
  }

  /**
   * Ocultar prompt de instalación
   */
  hideInstallPrompt() {
    const installPrompt = document.getElementById('pwa-install-prompt');
    if (installPrompt) {
      installPrompt.classList.remove('show');
    }
  }

  /**
   * Instalar app
   */
  async installApp() {
    if (!this.deferredPrompt) {
      console.warn('⚠️ No hay prompt de instalación disponible');
      return;
    }

    try {
      // Mostrar prompt de instalación
      this.deferredPrompt.prompt();
      
      // Esperar respuesta del usuario
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('📱 Usuario aceptó la instalación');
      } else {
        console.log('📱 Usuario rechazó la instalación');
      }
      
      // Limpiar prompt
      this.deferredPrompt = null;
      this.hideInstallPrompt();
      
    } catch (error) {
      console.error('❌ Error durante la instalación:', error);
    }
  }

  /**
   * Descartar prompt de instalación
   */
  dismissInstallPrompt() {
    this.hideInstallPrompt();
    // Guardar preferencia para no mostrar nuevamente
    localStorage.setItem('pwa-install-dismissed', 'true');
  }

  /**
   * Mostrar prompt de actualización
   */
  showUpdatePrompt() {
    const updatePrompt = document.getElementById('pwa-update-prompt');
    if (updatePrompt) {
      updatePrompt.classList.add('show');
    }
  }

  /**
   * Actualizar app
   */
  async updateApp() {
    if (this.swRegistration && this.swRegistration.waiting) {
      // Enviar mensaje al service worker para activar
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recargar página
      window.location.reload();
    }
  }

  /**
   * Manejar estado online
   */
  handleOnline() {
    console.log('🌐 Conexión restaurada');
    this.showOnlineStatus();
    
    // Sincronizar datos pendientes
    this.syncPendingData();
  }

  /**
   * Manejar estado offline
   */
  handleOffline() {
    console.log('📴 Sin conexión');
    this.showOfflineStatus();
  }

  /**
   * Mostrar estado online
   */
  showOnlineStatus() {
    this.showNotification('Conexión restaurada', 'success');
  }

  /**
   * Mostrar estado offline
   */
  showOfflineStatus() {
    this.showNotification('Sin conexión - Modo offline', 'warning');
  }

  /**
   * Sincronizar datos pendientes
   */
  async syncPendingData() {
    // Implementar lógica de sincronización
    console.log('🔄 Sincronizando datos pendientes...');
  }

  /**
   * Mostrar notificación
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification-${type}`;
    notification.innerHTML = `
      <div class="pwa-notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Mostrar éxito de instalación
   */
  showInstallSuccess() {
    this.showNotification('¡App instalada exitosamente!', 'success');
  }

  /**
   * Verificar si está instalado
   */
  isAppInstalled() {
    return this.isInstalled;
  }

  /**
   * Verificar si está online
   */
  isAppOnline() {
    return this.isOnline;
  }

  /**
   * Obtener información del service worker
   */
  getServiceWorkerInfo() {
    return {
      registered: !!this.swRegistration,
      scope: this.swRegistration?.scope,
      state: this.swRegistration?.active?.state
    };
  }

  /**
   * Obtener información de la app
   */
  getAppInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      canInstall: !!this.deferredPrompt,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }
}

export default PWAModule;
