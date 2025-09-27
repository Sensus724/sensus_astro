/**
 * Sensus Core Application
 * Sistema principal de la aplicación
 */

class SensusApp {
  constructor() {
    this.isInitialized = false;
    this.modules = new Map();
    this.config = {
      apiBaseUrl: '/api/v1',
      theme: 'light',
      language: 'es',
      debug: false
    };
    
    this.init();
  }

  /**
   * Inicializar la aplicación
   */
  async init() {
    try {
      console.log('🚀 Inicializando Sensus App...');
      
      // Cargar configuración
      await this.loadConfig();
      
      // Inicializar módulos
      await this.initializeModules();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Marcar como inicializado
      this.isInitialized = true;
      
      console.log('✅ Sensus App inicializada correctamente');
      
      // Emitir evento de inicialización
      this.emit('app:initialized');
      
    } catch (error) {
      console.error('❌ Error inicializando Sensus App:', error);
      this.handleError(error);
    }
  }

  /**
   * Cargar configuración
   */
  async loadConfig() {
    // Cargar configuración desde localStorage
    const savedConfig = localStorage.getItem('sensus-config');
    if (savedConfig) {
      this.config = { ...this.config, ...JSON.parse(savedConfig) };
    }
    
    // Aplicar tema
    this.applyTheme(this.config.theme);
    
    // Aplicar idioma
    this.applyLanguage(this.config.language);
  }

  /**
   * Inicializar módulos
   */
  async initializeModules() {
    const modules = [
      'auth',
      'theme',
      'offline',
      'pwa',
      'analytics',
      'performance'
    ];

    for (const moduleName of modules) {
      try {
        const module = await this.loadModule(moduleName);
        if (module) {
          this.modules.set(moduleName, module);
          console.log(`✅ Módulo ${moduleName} cargado`);
        }
      } catch (error) {
        console.warn(`⚠️ Error cargando módulo ${moduleName}:`, error);
      }
    }
  }

  /**
   * Cargar módulo dinámicamente
   */
  async loadModule(moduleName) {
    try {
      const module = await import(`../modules/${moduleName}.js`);
      return module.default;
    } catch (error) {
      console.warn(`Módulo ${moduleName} no encontrado, usando fallback`);
      return null;
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Event listeners globales
    document.addEventListener('DOMContentLoaded', () => {
      this.emit('dom:ready');
    });

    window.addEventListener('load', () => {
      this.emit('window:loaded');
    });

    window.addEventListener('beforeunload', () => {
      this.emit('window:beforeunload');
    });

    // Event listeners de tema
    window.addEventListener('themechange', (event) => {
      this.handleThemeChange(event.detail);
    });

    // Event listeners de autenticación
    window.addEventListener('auth:login', (event) => {
      this.handleAuthLogin(event.detail);
    });

    window.addEventListener('auth:logout', (event) => {
      this.handleAuthLogout(event.detail);
    });
  }

  /**
   * Aplicar tema
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.config.theme = theme;
    this.saveConfig();
  }

  /**
   * Aplicar idioma
   */
  applyLanguage(language) {
    document.documentElement.setAttribute('lang', language);
    this.config.language = language;
    this.saveConfig();
  }

  /**
   * Manejar cambio de tema
   */
  handleThemeChange(detail) {
    this.applyTheme(detail.theme);
    this.emit('theme:changed', detail);
  }

  /**
   * Manejar login
   */
  handleAuthLogin(detail) {
    console.log('🔐 Usuario autenticado:', detail);
    this.emit('auth:success', detail);
  }

  /**
   * Manejar logout
   */
  handleAuthLogout(detail) {
    console.log('🚪 Usuario desautenticado:', detail);
    this.emit('auth:logout', detail);
  }

  /**
   * Guardar configuración
   */
  saveConfig() {
    localStorage.setItem('sensus-config', JSON.stringify(this.config));
  }

  /**
   * Obtener módulo
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Emitir evento personalizado
   */
  emit(eventName, detail = null) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Manejar errores
   */
  handleError(error) {
    console.error('💥 Error en Sensus App:', error);
    
    // Emitir evento de error
    this.emit('app:error', { error });
    
    // Mostrar notificación de error si es necesario
    if (this.config.debug) {
      this.showErrorNotification(error);
    }
  }

  /**
   * Mostrar notificación de error
   */
  showErrorNotification(error) {
    // Implementar notificación de error
    console.warn('Notificación de error no implementada');
  }

  /**
   * Obtener configuración
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.emit('config:updated', this.config);
  }
}

// Inicializar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sensusApp = new SensusApp();
  });
} else {
  window.sensusApp = new SensusApp();
}

// Exportar para uso en otros módulos
export default SensusApp;
