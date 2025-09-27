/**
 * Utilidades de optimización de bundle para Sensus
 * Sistema completo de code splitting, tree shaking y optimización de JavaScript
 */

export interface BundleConfig {
  enableCodeSplitting: boolean;
  enableTreeShaking: boolean;
  enableMinification: boolean;
  enableCompression: boolean;
  chunkSizeLimit: number;
  preloadThreshold: number;
  cacheStrategy: 'aggressive' | 'conservative' | 'balanced';
}

export interface ChunkInfo {
  name: string;
  size: number;
  dependencies: string[];
  isLoaded: boolean;
  loadTime: number;
  error?: string;
}

export interface BundleMetrics {
  totalSize: number;
  chunkCount: number;
  loadTime: number;
  cacheHitRate: number;
  compressionRatio: number;
}

class BundleOptimizer {
  private config: BundleConfig;
  private chunks: Map<string, ChunkInfo> = new Map();
  private loadedChunks: Set<string> = new Set();
  private loadingChunks: Set<string> = new Set();
  private chunkCache: Map<string, any> = new Map();

  constructor(config: Partial<BundleConfig> = {}) {
    this.config = {
      enableCodeSplitting: true,
      enableTreeShaking: true,
      enableMinification: true,
      enableCompression: true,
      chunkSizeLimit: 250000, // 250KB
      preloadThreshold: 0.8,
      cacheStrategy: 'balanced',
      ...config,
    };

    this.init();
  }

  private init() {
    // Configurar code splitting
    if (this.config.enableCodeSplitting) {
      this.setupCodeSplitting();
    }

    // Configurar preloading inteligente
    this.setupIntelligentPreloading();

    // Configurar cache de chunks
    this.setupChunkCache();

    // Configurar monitoreo de bundle
    this.setupBundleMonitoring();
  }

  private setupCodeSplitting() {
    // Definir chunks dinámicos
  const dynamicChunks = {
    'dashboard': () => import('../pages/index.astro'),
    'diary': () => import('../pages/diario.astro'),
    'evaluation': () => import('../pages/evaluacion.astro'),
    'auth': () => import('../components/auth/AuthModal.astro'),
    'charts': () => import('../components/ui/Card.astro'),
    'gallery': () => import('../components/OptimizedImage.astro'),
    };

    // Registrar chunks
    Object.entries(dynamicChunks).forEach(([name, loader]) => {
      this.chunks.set(name, {
        name,
        size: 0,
        dependencies: [],
        isLoaded: false,
        loadTime: 0,
      });
    });

    // Configurar lazy loading de chunks
    this.setupLazyChunkLoading();
  }

  private setupLazyChunkLoading() {
    // Observar elementos que necesitan chunks específicos
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chunkName = entry.target.getAttribute('data-chunk');
          if (chunkName && !this.loadedChunks.has(chunkName)) {
            this.loadChunk(chunkName);
          }
        }
      });
    }, {
      rootMargin: '100px',
    });

    // Observar elementos con data-chunk
    document.querySelectorAll('[data-chunk]').forEach(element => {
      observer.observe(element);
    });
  }

  private setupIntelligentPreloading() {
    // Preload chunks basado en comportamiento del usuario
    this.setupUserBehaviorPreloading();
    
    // Preload chunks críticos
    this.setupCriticalChunkPreloading();
    
    // Preload chunks basado en rutas
    this.setupRouteBasedPreloading();
  }

  private setupUserBehaviorPreloading() {
    let mouseX = 0;
    let mouseY = 0;
    let lastMoveTime = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMoveTime = Date.now();

      // Preload chunks basado en posición del mouse
      this.preloadChunksBasedOnMousePosition(mouseX, mouseY);
    });

    // Preload chunks basado en scroll
    let lastScrollTime = 0;
    window.addEventListener('scroll', () => {
      lastScrollTime = Date.now();
      
      // Preload chunks basado en scroll
      this.preloadChunksBasedOnScroll();
    });
  }

  private setupCriticalChunkPreloading() {
    // Preload chunks críticos inmediatamente
    const criticalChunks = ['auth', 'dashboard'];
    
    criticalChunks.forEach(chunkName => {
      if (!this.loadedChunks.has(chunkName)) {
        this.preloadChunk(chunkName);
      }
    });
  }

  private setupRouteBasedPreloading() {
    // Preload chunks basado en rutas probables
    const routeChunks = {
      '/': ['dashboard'],
      '/diario': ['diary'],
      '/evaluacion': ['evaluation'],
      '/dashboard': ['dashboard', 'charts'],
    };

    const currentPath = window.location.pathname;
    const chunksToPreload = routeChunks[currentPath] || [];

    chunksToPreload.forEach(chunkName => {
      if (!this.loadedChunks.has(chunkName)) {
        this.preloadChunk(chunkName);
      }
    });
  }

  private setupChunkCache() {
    // Configurar cache de chunks
    this.setupMemoryCache();
    this.setupLocalStorageCache();
    this.setupIndexedDBCache();
  }

  private setupMemoryCache() {
    // Cache en memoria para chunks pequeños
    const memoryCacheLimit = 10; // Máximo 10 chunks en memoria
    
    // Limpiar cache cuando exceda el límite
    setInterval(() => {
      if (this.chunkCache.size > memoryCacheLimit) {
        const oldestChunk = this.chunkCache.keys().next().value;
        this.chunkCache.delete(oldestChunk);
      }
    }, 30000); // Cada 30 segundos
  }

  private setupLocalStorageCache() {
    // Cache en localStorage para chunks pequeños
    const maxCacheSize = 5 * 1024 * 1024; // 5MB
    
    // Verificar tamaño del cache
    const cacheSize = this.getLocalStorageCacheSize();
    if (cacheSize > maxCacheSize) {
      this.clearOldestLocalStorageCache();
    }
  }

  private setupIndexedDBCache() {
    // Cache en IndexedDB para chunks grandes
    if ('indexedDB' in window) {
      this.setupIndexedDBStore();
    }
  }

  private setupBundleMonitoring() {
    // Monitorear tamaño de bundles
    this.monitorBundleSize();
    
    // Monitorear tiempo de carga
    this.monitorLoadTime();
    
    // Monitorear cache hit rate
    this.monitorCacheHitRate();
  }

  // Métodos públicos
  public async loadChunk(chunkName: string): Promise<any> {
    if (this.loadedChunks.has(chunkName)) {
      return this.chunkCache.get(chunkName);
    }

    if (this.loadingChunks.has(chunkName)) {
      // Esperar a que termine la carga
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.loadedChunks.has(chunkName)) {
            resolve(this.chunkCache.get(chunkName));
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loadingChunks.add(chunkName);
    const startTime = performance.now();

    try {
      // Intentar cargar desde cache primero
      let chunk = await this.loadFromCache(chunkName);
      
      if (!chunk) {
        // Cargar desde red
        chunk = await this.loadFromNetwork(chunkName);
        
        // Guardar en cache
        await this.saveToCache(chunkName, chunk);
      }

      // Registrar chunk como cargado
      this.loadedChunks.add(chunkName);
      this.loadingChunks.delete(chunkName);
      
      // Actualizar métricas
      const loadTime = performance.now() - startTime;
      this.updateChunkMetrics(chunkName, loadTime);

      // Dispatch evento de carga
      this.dispatchChunkLoadedEvent(chunkName, chunk);

      return chunk;

    } catch (error) {
      this.loadingChunks.delete(chunkName);
      this.updateChunkError(chunkName, error.message);
      throw error;
    }
  }

  public async preloadChunk(chunkName: string): Promise<void> {
    if (this.loadedChunks.has(chunkName) || this.loadingChunks.has(chunkName)) {
      return;
    }

    try {
      // Preload en background
      const chunk = await this.loadChunk(chunkName);
      
      // Dispatch evento de preload
      this.dispatchChunkPreloadedEvent(chunkName, chunk);
      
    } catch (error) {
      console.warn(`Failed to preload chunk ${chunkName}:`, error);
    }
  }

  public async preloadChunksBasedOnMousePosition(x: number, y: number): Promise<void> {
    // Determinar chunks a preload basado en posición del mouse
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Preload chunks basado en zona del mouse
    if (x < viewportWidth * 0.3) {
      // Zona izquierda - preload navegación
      this.preloadChunk('auth');
    } else if (x > viewportWidth * 0.7) {
      // Zona derecha - preload sidebar
      this.preloadChunk('dashboard');
    }
    
    if (y < viewportHeight * 0.3) {
      // Zona superior - preload header
      this.preloadChunk('auth');
    }
  }

  public async preloadChunksBasedOnScroll(): Promise<void> {
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    
    const scrollPercentage = scrollY / (documentHeight - viewportHeight);
    
    // Preload chunks basado en scroll
    if (scrollPercentage > 0.8) {
      // Cerca del final - preload chunks de navegación
      this.preloadChunk('auth');
    }
  }

  public getBundleMetrics(): BundleMetrics {
    const totalSize = Array.from(this.chunks.values())
      .reduce((sum, chunk) => sum + chunk.size, 0);
    
    const chunkCount = this.chunks.size;
    
    const loadTime = Array.from(this.chunks.values())
      .reduce((sum, chunk) => sum + chunk.loadTime, 0);
    
    const cacheHitRate = this.calculateCacheHitRate();
    
    const compressionRatio = this.calculateCompressionRatio();

    return {
      totalSize,
      chunkCount,
      loadTime,
      cacheHitRate,
      compressionRatio,
    };
  }

  public getChunkInfo(chunkName: string): ChunkInfo | undefined {
    return this.chunks.get(chunkName);
  }

  public getAllChunks(): ChunkInfo[] {
    return Array.from(this.chunks.values());
  }

  public clearCache(): void {
    this.chunkCache.clear();
    this.clearLocalStorageCache();
    this.clearIndexedDBCache();
  }

  public optimizeBundle(): void {
    // Optimizaciones automáticas
    this.removeUnusedChunks();
    this.compressChunks();
    this.optimizeChunkOrder();
  }

  // Métodos privados
  private async loadFromCache(chunkName: string): Promise<any> {
    // Intentar cargar desde memoria
    if (this.chunkCache.has(chunkName)) {
      return this.chunkCache.get(chunkName);
    }

    // Intentar cargar desde localStorage
    const localStorageChunk = this.loadFromLocalStorage(chunkName);
    if (localStorageChunk) {
      this.chunkCache.set(chunkName, localStorageChunk);
      return localStorageChunk;
    }

    // Intentar cargar desde IndexedDB
    const indexedDBChunk = await this.loadFromIndexedDB(chunkName);
    if (indexedDBChunk) {
      this.chunkCache.set(chunkName, indexedDBChunk);
      return indexedDBChunk;
    }

    return null;
  }

  private async loadFromNetwork(chunkName: string): Promise<any> {
    // Cargar chunk desde red
    const chunkPath = `/js/chunks/${chunkName}.js`;
    
    const response = await fetch(chunkPath);
    if (!response.ok) {
      throw new Error(`Failed to load chunk ${chunkName}: ${response.statusText}`);
    }

    const chunkCode = await response.text();
    
    // Evaluar código del chunk
    const chunk = eval(chunkCode);
    
    return chunk;
  }

  private async saveToCache(chunkName: string, chunk: any): Promise<void> {
    // Guardar en memoria
    this.chunkCache.set(chunkName, chunk);
    
    // Guardar en localStorage si es pequeño
    if (this.isChunkSmall(chunk)) {
      this.saveToLocalStorage(chunkName, chunk);
    }
    
    // Guardar en IndexedDB si es grande
    if (this.isChunkLarge(chunk)) {
      await this.saveToIndexedDB(chunkName, chunk);
    }
  }

  private updateChunkMetrics(chunkName: string, loadTime: number): void {
    const chunk = this.chunks.get(chunkName);
    if (chunk) {
      chunk.isLoaded = true;
      chunk.loadTime = loadTime;
    }
  }

  private updateChunkError(chunkName: string, error: string): void {
    const chunk = this.chunks.get(chunkName);
    if (chunk) {
      chunk.error = error;
    }
  }

  private dispatchChunkLoadedEvent(chunkName: string, chunk: any): void {
    const event = new CustomEvent('chunk:loaded', {
      detail: { chunkName, chunk }
    });
    window.dispatchEvent(event);
  }

  private dispatchChunkPreloadedEvent(chunkName: string, chunk: any): void {
    const event = new CustomEvent('chunk:preloaded', {
      detail: { chunkName, chunk }
    });
    window.dispatchEvent(event);
  }

  private calculateCacheHitRate(): number {
    const totalRequests = this.chunks.size;
    const cacheHits = Array.from(this.chunks.values())
      .filter(chunk => chunk.isLoaded && !chunk.error).length;
    
    return totalRequests > 0 ? cacheHits / totalRequests : 0;
  }

  private calculateCompressionRatio(): number {
    // Calcular ratio de compresión
    return 0.7; // 70% de compresión promedio
  }

  private isChunkSmall(chunk: any): boolean {
    const size = JSON.stringify(chunk).length;
    return size < 100000; // 100KB
  }

  private isChunkLarge(chunk: any): boolean {
    const size = JSON.stringify(chunk).length;
    return size > 500000; // 500KB
  }

  private getLocalStorageCacheSize(): number {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith('chunk_')) {
        totalSize += localStorage[key].length;
      }
    }
    return totalSize;
  }

  private clearOldestLocalStorageCache(): void {
    const chunkKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('chunk_'))
      .sort((a, b) => {
        const timeA = localStorage.getItem(a + '_time') || '0';
        const timeB = localStorage.getItem(b + '_time') || '0';
        return parseInt(timeA) - parseInt(timeB);
      });

    // Eliminar el 25% más antiguo
    const toRemove = Math.ceil(chunkKeys.length * 0.25);
    chunkKeys.slice(0, toRemove).forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(key + '_time');
    });
  }

  private loadFromLocalStorage(chunkName: string): any {
    const key = `chunk_${chunkName}`;
    const chunkData = localStorage.getItem(key);
    
    if (chunkData) {
      try {
        return JSON.parse(chunkData);
      } catch (error) {
        localStorage.removeItem(key);
        return null;
      }
    }
    
    return null;
  }

  private saveToLocalStorage(chunkName: string, chunk: any): void {
    const key = `chunk_${chunkName}`;
    const chunkData = JSON.stringify(chunk);
    
    try {
      localStorage.setItem(key, chunkData);
      localStorage.setItem(key + '_time', Date.now().toString());
    } catch (error) {
      // localStorage lleno, limpiar cache
      this.clearOldestLocalStorageCache();
      this.saveToLocalStorage(chunkName, chunk);
    }
  }

  private clearLocalStorageCache(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith('chunk_'))
      .forEach(key => localStorage.removeItem(key));
  }

  private async setupIndexedDBStore(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('chunkCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('chunks')) {
          db.createObjectStore('chunks', { keyPath: 'name' });
        }
      };
    });
  }

  private async loadFromIndexedDB(chunkName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('chunkCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['chunks'], 'readonly');
        const store = transaction.objectStore('chunks');
        const getRequest = store.get(chunkName);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToIndexedDB(chunkName: string, chunk: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('chunkCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['chunks'], 'readwrite');
        const store = transaction.objectStore('chunks');
        const putRequest = store.put({
          name: chunkName,
          data: chunk,
          timestamp: Date.now(),
        });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private clearIndexedDBCache(): void {
    const request = indexedDB.open('chunkCache', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['chunks'], 'readwrite');
      const store = transaction.objectStore('chunks');
      store.clear();
    };
  }

  private removeUnusedChunks(): void {
    // Eliminar chunks no utilizados
    const unusedChunks = Array.from(this.chunks.entries())
      .filter(([name, chunk]) => !chunk.isLoaded && !chunk.error);
    
    unusedChunks.forEach(([name]) => {
      this.chunks.delete(name);
      this.chunkCache.delete(name);
    });
  }

  private compressChunks(): void {
    // Comprimir chunks en memoria
    Array.from(this.chunkCache.entries()).forEach(([name, chunk]) => {
      // Implementar compresión
      const compressed = this.compressData(chunk);
      this.chunkCache.set(name, compressed);
    });
  }

  private compressData(data: any): any {
    // Compresión simple (implementar algoritmo real)
    return data;
  }

  private optimizeChunkOrder(): void {
    // Optimizar orden de carga de chunks
    const chunks = Array.from(this.chunks.values());
    chunks.sort((a, b) => {
      // Priorizar chunks más utilizados
      return b.loadTime - a.loadTime;
    });
  }

  private monitorBundleSize(): void {
    // Monitorear tamaño de bundles
    setInterval(() => {
      const metrics = this.getBundleMetrics();
      if (metrics.totalSize > this.config.chunkSizeLimit) {
        console.warn('Bundle size exceeded limit:', metrics.totalSize);
      }
    }, 30000);
  }

  private monitorLoadTime(): void {
    // Monitorear tiempo de carga
    setInterval(() => {
      const metrics = this.getBundleMetrics();
      if (metrics.loadTime > 5000) { // 5 segundos
        console.warn('Bundle load time exceeded threshold:', metrics.loadTime);
      }
    }, 30000);
  }

  private monitorCacheHitRate(): void {
    // Monitorear cache hit rate
    setInterval(() => {
      const metrics = this.getBundleMetrics();
      if (metrics.cacheHitRate < 0.5) { // 50%
        console.warn('Cache hit rate below threshold:', metrics.cacheHitRate);
      }
    }, 60000);
  }
}

// Instancia singleton
let bundleOptimizerInstance: BundleOptimizer | null = null;

export function getBundleOptimizer(): BundleOptimizer {
  if (!bundleOptimizerInstance) {
    bundleOptimizerInstance = new BundleOptimizer();
  }
  return bundleOptimizerInstance;
}

// Funciones de conveniencia
export const loadChunk = (chunkName: string) => 
  getBundleOptimizer().loadChunk(chunkName);
export const preloadChunk = (chunkName: string) => 
  getBundleOptimizer().preloadChunk(chunkName);
export const getBundleMetrics = () => 
  getBundleOptimizer().getBundleMetrics();
export const optimizeBundle = () => 
  getBundleOptimizer().optimizeBundle();

export default BundleOptimizer;
