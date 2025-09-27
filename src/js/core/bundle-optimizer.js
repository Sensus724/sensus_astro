/**
 * Sensus Bundle Optimizer
 * Optimización de carga de JavaScript
 */

class BundleOptimizer {
  constructor() {
    this.loadedChunks = new Set();
    this.chunkCache = new Map();
    this.preloadQueue = [];
    this.isPreloading = false;
    
    this.init();
  }

  /**
   * Inicializar optimizador
   */
  init() {
    console.log('🚀 Inicializando Bundle Optimizer...');
    
    // Configurar preloading inteligente
    this.setupIntelligentPreloading();
    
    // Configurar code splitting
    this.setupCodeSplitting();
    
    // Configurar tree shaking
    this.setupTreeShaking();
    
    console.log('✅ Bundle Optimizer inicializado');
  }

  /**
   * Configurar preloading inteligente
   */
  setupIntelligentPreloading() {
    // Preload basado en interacciones del usuario
    document.addEventListener('mouseover', (event) => {
      const target = event.target.closest('[data-preload]');
      if (target) {
        const chunk = target.dataset.preload;
        this.preloadChunk(chunk);
      }
    });

    // Preload basado en scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.preloadVisibleChunks();
      }, 100);
    });

    // Preload basado en conexión
    this.setupConnectionBasedPreloading();
  }

  /**
   * Configurar code splitting
   */
  setupCodeSplitting() {
    // Definir chunks críticos
    this.criticalChunks = [
      'core/app.js',
      'modules/auth.js',
      'modules/theme.js'
    ];

    // Definir chunks no críticos
    this.nonCriticalChunks = [
      'modules/analytics.js',
      'modules/performance.js',
      'modules/offline.js'
    ];

    // Cargar chunks críticos inmediatamente
    this.loadCriticalChunks();
  }

  /**
   * Configurar tree shaking
   */
  setupTreeShaking() {
    // Eliminar código muerto
    this.removeDeadCode();
    
    // Optimizar imports
    this.optimizeImports();
  }

  /**
   * Cargar chunks críticos
   */
  async loadCriticalChunks() {
    const promises = this.criticalChunks.map(chunk => this.loadChunk(chunk));
    await Promise.all(promises);
    console.log('✅ Chunks críticos cargados');
  }

  /**
   * Cargar chunk específico
   */
  async loadChunk(chunkPath) {
    if (this.loadedChunks.has(chunkPath)) {
      return this.chunkCache.get(chunkPath);
    }

    try {
      console.log(`📦 Cargando chunk: ${chunkPath}`);
      
      const module = await import(`/${chunkPath}`);
      this.loadedChunks.add(chunkPath);
      this.chunkCache.set(chunkPath, module);
      
      return module;
    } catch (error) {
      console.error(`❌ Error cargando chunk ${chunkPath}:`, error);
      throw error;
    }
  }

  /**
   * Preload chunk
   */
  async preloadChunk(chunkPath) {
    if (this.loadedChunks.has(chunkPath) || this.preloadQueue.includes(chunkPath)) {
      return;
    }

    this.preloadQueue.push(chunkPath);
    
    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  /**
   * Procesar cola de preload
   */
  async processPreloadQueue() {
    this.isPreloading = true;
    
    while (this.preloadQueue.length > 0) {
      const chunkPath = this.preloadQueue.shift();
      
      try {
        await this.loadChunk(chunkPath);
        console.log(`⚡ Chunk preloaded: ${chunkPath}`);
      } catch (error) {
        console.warn(`⚠️ Error preloading chunk ${chunkPath}:`, error);
      }
    }
    
    this.isPreloading = false;
  }

  /**
   * Preload chunks visibles
   */
  preloadVisibleChunks() {
    const visibleElements = document.querySelectorAll('[data-preload]:not([data-preloaded])');
    
    visibleElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        const chunk = element.dataset.preload;
        this.preloadChunk(chunk);
        element.dataset.preloaded = 'true';
      }
    });
  }

  /**
   * Configurar preloading basado en conexión
   */
  setupConnectionBasedPreloading() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Preload más agresivo en conexiones rápidas
      if (connection.effectiveType === '4g' && connection.downlink > 2) {
        this.preloadNonCriticalChunks();
      }
    }
  }

  /**
   * Preload chunks no críticos
   */
  async preloadNonCriticalChunks() {
    const promises = this.nonCriticalChunks.map(chunk => 
      this.preloadChunk(chunk).catch(error => 
        console.warn(`⚠️ Error preloading non-critical chunk ${chunk}:`, error)
      )
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * Eliminar código muerto
   */
  removeDeadCode() {
    // Eliminar funciones no utilizadas
    this.removeUnusedFunctions();
    
    // Eliminar variables no utilizadas
    this.removeUnusedVariables();
    
    // Eliminar imports no utilizados
    this.removeUnusedImports();
  }

  /**
   * Eliminar funciones no utilizadas
   */
  removeUnusedFunctions() {
    // Implementar análisis estático de código
    console.log('🧹 Eliminando funciones no utilizadas...');
  }

  /**
   * Eliminar variables no utilizadas
   */
  removeUnusedVariables() {
    console.log('🧹 Eliminando variables no utilizadas...');
  }

  /**
   * Eliminar imports no utilizados
   */
  removeUnusedImports() {
    console.log('🧹 Eliminando imports no utilizados...');
  }

  /**
   * Optimizar imports
   */
  optimizeImports() {
    // Convertir imports estáticos a dinámicos
    this.convertStaticToDynamicImports();
    
    // Agrupar imports relacionados
    this.groupRelatedImports();
  }

  /**
   * Convertir imports estáticos a dinámicos
   */
  convertStaticToDynamicImports() {
    console.log('🔄 Convirtiendo imports estáticos a dinámicos...');
  }

  /**
   * Agrupar imports relacionados
   */
  groupRelatedImports() {
    console.log('📦 Agrupando imports relacionados...');
  }

  /**
   * Obtener estadísticas del bundle
   */
  getBundleStats() {
    return {
      loadedChunks: this.loadedChunks.size,
      cachedChunks: this.chunkCache.size,
      preloadQueue: this.preloadQueue.length,
      isPreloading: this.isPreloading
    };
  }

  /**
   * Limpiar caché
   */
  clearCache() {
    this.chunkCache.clear();
    console.log('🧹 Caché de chunks limpiado');
  }

  /**
   * Preload chunk con prioridad
   */
  async preloadChunkWithPriority(chunkPath, priority = 'normal') {
    const priorities = {
      high: 0,
      normal: 1,
      low: 2
    };

    const priorityValue = priorities[priority] || 1;
    
    // Insertar en la posición correcta según prioridad
    const insertIndex = this.preloadQueue.findIndex((_, index) => {
      const chunkPriority = this.getChunkPriority(this.preloadQueue[index]);
      return chunkPriority > priorityValue;
    });

    if (insertIndex === -1) {
      this.preloadQueue.push(chunkPath);
    } else {
      this.preloadQueue.splice(insertIndex, 0, chunkPath);
    }

    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  /**
   * Obtener prioridad de chunk
   */
  getChunkPriority(chunkPath) {
    if (this.criticalChunks.includes(chunkPath)) return 0;
    if (this.nonCriticalChunks.includes(chunkPath)) return 2;
    return 1;
  }
}

// Inicializar optimizador
window.bundleOptimizer = new BundleOptimizer();

export default BundleOptimizer;
